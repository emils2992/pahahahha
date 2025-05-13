import { 
  Message, 
  MessageEmbed, 
  MessageActionRow, 
  MessageButton,
  MessageSelectMenu 
} from 'discord.js';
import { storage } from '../../storage';
import { User, GossipItem } from '@shared/schema';
import { getRandomGossip, getGossipOptions } from '../data/gossips';
import { 
  createGossipEmbed, 
  createLeakOptionsEmbed, 
  createLeakResultEmbed 
} from '../utils/embeds';
import { checkUserTeam, createTutorialEmbed } from '../utils/helpers';

// Gossip command
export const dedikoduCommand = {
  name: 'dedikodu',
  description: 'Medya dedikodularını göster',
  usage: '.yap dedikodu',
  execute: async (message: Message, args: string[]) => {
    try {
      // Get user
      const user = await storage.getUserByDiscordId(message.author.id);
      if (!user) {
        return message.reply('Profil bulunamadı. Lütfen bir takım seçerek başlayın: `.yap takim [takım adı]`');
      }
      
      // Check if user has a team
      const hasTeam = await checkUserTeam(user, message);
      if (!hasTeam) return;
      
      // Get a random gossip
      const gossip = getRandomGossip(user.currentTeam);
      
      // Create gossip embed
      const gossipEmbed = createGossipEmbed(gossip);
      
      // Send the message
      const sentMessage = await message.reply({ embeds: [gossipEmbed] });
      
      // Create row with response buttons
      const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setCustomId('gossip_confirm')
            .setLabel('Yanıtla')
            .setStyle('PRIMARY'),
          new MessageButton()
            .setCustomId('gossip_ignore')
            .setLabel('Görmezden Gel')
            .setStyle('SECONDARY')
        );
        
      await sentMessage.edit({ components: [row] });
      
      // Create collector for button interactions
      const collector = sentMessage.createMessageComponentCollector({
        filter: i => i.user.id === message.author.id,
        time: 60000 // 1 minute
      });
      
      collector.on('collect', async interaction => {
        if (interaction.customId === 'gossip_ignore') {
          await interaction.update({
            content: 'Dedikodu görmezden gelindi.',
            components: []
          });
          return;
        }
        
        if (interaction.customId === 'gossip_confirm') {
          // Create message collector for response
          await interaction.update({
            content: 'Dedikodu hakkında bir yanıt yazın:',
            components: []
          });
          
          const messageCollector = message.channel.createMessageCollector({
            filter: m => m.author.id === message.author.id,
            time: 120000, // 2 minutes
            max: 1
          });
          
          messageCollector.on('collect', async m => {
            const response = m.content;
            
            // Calculate impact based on response length and content
            const impact = calculateResponseImpact(response);
            
            // Update user stats
            await storage.updateUserStats(
              user.discordId,
              impact.fanSupport,
              impact.managementTrust,
              impact.teamMorale
            );
            
            // Send feedback
            const feedbackEmbed = new MessageEmbed()
              .setColor('#5865F2')
              .setTitle('Dedikodu Yanıtı - Medya Tepkisi')
              .setDescription(`**Yanıtınız:** ${response}`)
              .addField('Taraftar Tepkisi', impact.fanSupport > 0 ? '👍 Olumlu' : '👎 Olumsuz', true)
              .addField('Yönetim Tepkisi', impact.managementTrust > 0 ? '👍 Olumlu' : '👎 Olumsuz', true)
              .addField('Takım Morali', impact.teamMorale > 0 ? '👍 Olumlu' : '👎 Olumsuz', true)
              .setFooter({ text: 'Futbol RP Bot' });
              
            await message.channel.send({ embeds: [feedbackEmbed] });
          });
          
          messageCollector.on('end', collected => {
            if (collected.size === 0) {
              message.channel.send('Yanıt süresi doldu.');
            }
          });
        }
      });
      
    } catch (error) {
      console.error('Error in dedikodu command:', error);
      message.reply('Dedikodu gösterme sırasında bir hata oluştu.');
    }
  }
};

// Leak information to media command
export const sızdırCommand = {
  name: 'sızdır',
  description: 'Medyaya bilgi sızdır',
  usage: '.yap sızdır',
  execute: async (message: Message, args: string[]) => {
    try {
      // Get user
      const user = await storage.getUserByDiscordId(message.author.id);
      if (!user) {
        return message.reply('Profil bulunamadı. Lütfen bir takım seçerek başlayın: `.yap takim [takım adı]`');
      }
      
      // Check if user has a team
      const hasTeam = await checkUserTeam(user, message);
      if (!hasTeam) return;
      
      // Get gossip options
      const gossipOptions = getGossipOptions();
      
      // Create options embed
      const optionsEmbed = createLeakOptionsEmbed(gossipOptions);
      
      // Create select menu for options
      const row = new MessageActionRow()
        .addComponents(
          new MessageSelectMenu()
            .setCustomId('leak_select')
            .setPlaceholder('Sızdırılacak bilgiyi seçin')
            .addOptions(gossipOptions.map((gossip, index) => ({
              label: gossip.title,
              description: `Risk: ${gossip.risk}`,
              value: `${index}`
            })))
        );
      
      // Send the message with options
      const sentMessage = await message.reply({
        embeds: [optionsEmbed],
        components: [row]
      });
      
      // Create collector for select menu interactions
      const collector = sentMessage.createMessageComponentCollector({
        filter: i => i.user.id === message.author.id,
        time: 60000 // 1 minute
      });
      
      collector.on('collect', async interaction => {
        if (interaction.isSelectMenu() && interaction.customId === 'leak_select') {
          const selectedIndex = parseInt(interaction.values[0]);
          const selectedGossip = gossipOptions[selectedIndex];
          
          // Apply the impact based on the leak risk
          await storage.updateUserStats(
            user.discordId,
            selectedGossip.impact.fanSupport,
            selectedGossip.impact.managementTrust,
            selectedGossip.impact.teamMorale
          );
          
          // Create result embed
          const resultEmbed = createLeakResultEmbed(
            selectedGossip,
            user.fanSupport + selectedGossip.impact.fanSupport,
            user.managementTrust + selectedGossip.impact.managementTrust,
            user.teamMorale + selectedGossip.impact.teamMorale
          );
          
          // Send the result
          await interaction.update({
            embeds: [resultEmbed],
            components: []
          });
          
          // Award points
          const totalImpact = Math.abs(selectedGossip.impact.fanSupport) + 
                            Math.abs(selectedGossip.impact.managementTrust) + 
                            Math.abs(selectedGossip.impact.teamMorale);
          
          const pointsEarned = Math.ceil(totalImpact / 5);
          
          if (pointsEarned > 0) {
            await storage.addUserPoints(user.discordId, pointsEarned);
          }
          
          // Check for title if management trust is severely affected
          if (selectedGossip.impact.managementTrust <= -15) {
            await storage.addUserTitle(user.discordId, "Yönetimle Savaşan");
          }
        }
      });
      
      collector.on('end', async collected => {
        if (collected.size === 0) {
          await sentMessage.edit({
            content: 'Bilgi sızdırma süresi doldu.',
            components: []
          });
        }
      });
      
    } catch (error) {
      console.error('Error in sızdır command:', error);
      message.reply('Bilgi sızdırma sırasında bir hata oluştu.');
    }
  }
};

// Helper function to calculate impact based on response
function calculateResponseImpact(response: string): { fanSupport: number, managementTrust: number, teamMorale: number } {
  // Default values
  let fanSupport = 0;
  let managementTrust = 0;
  let teamMorale = 0;
  
  // Calculate based on response length
  if (response.length > 10) {
    fanSupport += 2;
  }
  
  if (response.length > 50) {
    fanSupport += 3;
    managementTrust += 2;
  }
  
  // Check for positive words
  const positiveWords = ['iyi', 'memnun', 'mutlu', 'başarı', 'destek', 'güven', 'kazanmak'];
  for (const word of positiveWords) {
    if (response.toLowerCase().includes(word)) {
      fanSupport += 1;
      teamMorale += 1;
    }
  }
  
  // Check for negative words
  const negativeWords = ['kötü', 'başarısız', 'kızgın', 'üzgün', 'kaybetmek', 'sorun', 'eleştiri'];
  for (const word of negativeWords) {
    if (response.toLowerCase().includes(word)) {
      fanSupport -= 1;
      teamMorale -= 1;
    }
  }
  
  // Check for professional words - improves management trust
  const professionalWords = ['profesyonel', 'çalışmak', 'plan', 'strateji', 'analiz', 'gelişim'];
  for (const word of professionalWords) {
    if (response.toLowerCase().includes(word)) {
      managementTrust += 1;
    }
  }
  
  // Random element
  const randomFactor = Math.floor(Math.random() * 5) - 2; // -2 to +2
  
  fanSupport += randomFactor;
  managementTrust += randomFactor;
  teamMorale += randomFactor;
  
  return {
    fanSupport: fanSupport,
    managementTrust: managementTrust,
    teamMorale: teamMorale
  };
}
