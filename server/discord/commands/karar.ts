import { 
  Message, 
  MessageEmbed, 
  MessageActionRow, 
  MessageButton 
} from 'discord.js';
import { storage } from '../../storage';
import { User, DecisionResult } from '@shared/schema';
import { getRandomDecision } from '../data/decisions';
import { createDecisionEmbed, createDecisionResultEmbed } from '../utils/embeds';
import { checkUserTeam, createTutorialEmbed } from '../utils/helpers';

// Decision command
export const kararCommand = {
  name: 'karar',
  description: 'Karar verme senaryosu',
  usage: '.karar',
  execute: async (message: Message, args: string[]) => {
    try {
      // Get user
      const user = await storage.getUserByDiscordId(message.author.id);
      if (!user) {
        return message.reply('Profil bulunamadı. Lütfen bir takım seçerek başlayın: `.takim [takım adı]`');
      }
      
      // Check if user has a team
      const hasTeam = await checkUserTeam(user, message);
      if (!hasTeam) return;
      
      // Kullanıcı yetkili mi kontrol et
      const adminUserIds = ['1371879530020737214', '794205713533894696']; // Yetkili kullanıcı ID'leri
      const isAdmin = adminUserIds.includes(message.author.id);
      
      // 6 saat zaman kısıtlaması kontrol et - yetkili değilse
      const canUseCommand = await storage.checkCommandTimeout(
        user.discordId, 
        "karar_command", 
        360, // 6 saat = 360 dakika
        isAdmin // Yetkili ise zaman kısıtlaması yok
      );
      
      if (!canUseCommand) {
        return message.reply('Karar komutunu kullanmak için 6 saat beklemelisiniz!');
      }
      
      // Check if there's already an active decision session
      const existingSession = await storage.getActiveSessionByUserId(user.id, 'karar');
      if (existingSession) {
        return message.reply('Zaten devam eden bir karar senaryonuz var!');
      }
      
      // Get a random decision
      const decision = getRandomDecision();
      
      // Create a new decision session
      const session = await storage.createGameSession({
        userId: user.id,
        sessionType: 'karar',
        sessionData: {
          decision,
          selectedOption: null
        },
        isActive: true,
        createdAt: new Date().toISOString()
      });
      
      // Create the decision embed
      const decisionEmbed = createDecisionEmbed(decision);
      
      // Create buttons for options
      const row = new MessageActionRow();
      
      decision.options.forEach((option, index) => {
        row.addComponents(
          new MessageButton()
            .setCustomId(`decision_${session.id}_${index}`)
            .setLabel(`Seçenek ${index + 1}`)
            .setStyle('PRIMARY')
        );
      });
      
      // Send the message with options
      const sentMessage = await message.reply({
        embeds: [decisionEmbed],
        components: [row]
      });
      
      // Create collector for button interactions
      const collector = sentMessage.createMessageComponentCollector({
        filter: i => i.user.id === message.author.id,
        time: 300000 // 5 minutes
      });
      
      collector.on('collect', async interaction => {
        const customId = interaction.customId;
        const [type, sessionId, optionIndex] = customId.split('_');
        
        if (type !== 'decision' || Number(sessionId) !== session.id) {
          return;
        }
        
        // Get the selected option
        const selectedOption = decision.options[Number(optionIndex)];
        
        // Update the session
        await storage.updateGameSession(session.id, {
          selectedOption: {
            index: Number(optionIndex),
            text: selectedOption.text
          }
        });
        
        // Apply the consequences
        const result = selectedOption.consequences;
        
        // Update user stats
        await storage.updateUserStats(
          user.discordId,
          result.fanSupportChange,
          result.managementTrustChange,
          result.teamMoraleChange
        );
        
        // Award points
        const totalImpact = Math.abs(result.fanSupportChange) + 
                           Math.abs(result.managementTrustChange) + 
                           Math.abs(result.teamMoraleChange);
        
        const pointsEarned = Math.ceil(totalImpact / 5);
        if (pointsEarned > 0) {
          await storage.addUserPoints(user.discordId, pointsEarned);
        }
        
        // Check for titles
        if (result.title) {
          await storage.addUserTitle(user.discordId, result.title);
        }
        
        // End the session
        await storage.endGameSession(session.id);
        
        // Show result
        const resultEmbed = createDecisionResultEmbed(
          decision,
          selectedOption,
          result,
          (user.fanSupport || 0) + result.fanSupportChange,
          (user.managementTrust || 0) + result.managementTrustChange,
          (user.teamMorale || 0) + result.teamMoraleChange
        );
        
        await interaction.update({
          embeds: [resultEmbed],
          components: []
        });
      });
      
      collector.on('end', async collected => {
        if (collected.size === 0) {
          // User didn't make a choice
          await sentMessage.edit({
            content: 'Karar verme süresi doldu. Senaryo sonlandırıldı.',
            components: []
          });
          
          await storage.endGameSession(session.id);
        }
      });
      
    } catch (error) {
      console.error('Error in karar command:', error);
      message.reply('Karar senaryosu sırasında bir hata oluştu.');
    }
  }
};
