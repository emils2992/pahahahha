import { 
  Message, 
  MessageEmbed, 
  MessageActionRow, 
  MessageButton,
  MessageSelectMenu 
} from 'discord.js';
import { storage } from '../../storage';
import { User } from '@shared/schema';
import { getTeamTraits } from '../data/teamTraits';
import { removeEmojis } from '../utils/stringHelpers';
import { createTeamSelectionEmbed, createTeamInfoEmbed } from '../utils/embeds';
import { createTutorialEmbed } from '../utils/helpers';

// Team selection command
export const takimCommand = {
  name: 'takim',
  description: 'Takım seçme komutu',
  usage: '.takim [takım adı]',
  execute: async (message: Message, args: string[]) => {
    try {
      // Get or create user
      let user = await storage.getUserByDiscordId(message.author.id);
      
      if (!user) {
        user = await storage.createUser({
          discordId: message.author.id,
          username: message.author.username,
          currentTeam: null,
          fanSupport: 50,
          managementTrust: 50,
          teamMorale: 50,
          titles: [],
          points: 0,
          seasonRecords: [],
          createdAt: new Date().toISOString()
        });
      }
      
      // If no args, show help or current team
      if (!args.length) {
        if (user.currentTeam) {
          // Show current team info
          const team = await storage.getTeamByName(user.currentTeam);
          if (team) {
            const teamTraits = getTeamTraits(team.traitType);
            return message.reply({ embeds: [createTeamInfoEmbed(team, teamTraits, user)] });
          }
        }
        
        // Show help
        return message.reply({
          embeds: [
            createTutorialEmbed(
              'Takım Seçme Yardımı',
              '**Kullanım:** `.yap takim [takım adı]`\n\n' +
              '**Örnek:** `.yap takim Galatasaray`\n\n' +
              '**Açıklama:** Teknik direktörü olacağın takımı seçer.\n' +
              'Her takımın kendine özgü mizacı vardır (çalkantılı, kurumsal, sansasyonel).'
            )
          ]
        });
      }
      
      // Get team name from args
      const teamName = args.join(' ');
      
      // Check if team exists
      const team = await storage.getTeamByName(teamName);
      
      if (!team) {
        // If team not found, show available teams
        const allTeams = await storage.getAllTeams();
        
        // Create a list of just the clean team names for easier selection
        const teamOptions = allTeams.map(t => {
          return removeEmojis(t.name);
        }).join(', ');
        
        return message.reply(`"${teamName}" isimli bir takım bulunamadı. Mevcut takımlar: ${teamOptions}`);
      }
      
      // If user already has this team
      if (user.currentTeam === team.name) {
        return message.reply(`Zaten **${team.name}** takımının teknik direktörüsün!`);
      }
      
      // Ask for confirmation if user already has a different team
      if (user.currentTeam && user.currentTeam !== team.name) {
        const confirmRow = new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setCustomId('team_change_confirm')
              .setLabel('Değiştir')
              .setStyle('PRIMARY'),
            new MessageButton()
              .setCustomId('team_change_cancel')
              .setLabel('İptal')
              .setStyle('SECONDARY')
          );
        
        const confirmEmbed = new MessageEmbed()
          .setColor('#5865F2')
          .setTitle('⚠️ Takım Değişikliği')
          .setDescription(`Şu anda **${user.currentTeam}** takımının teknik direktörüsün. **${team.name}** takımına geçmek istediğine emin misin?`)
          .setFooter({ text: 'Futbol RP Bot - Takım Değişikliği' });
        
        const sentMessage = await message.reply({
          embeds: [confirmEmbed],
          components: [confirmRow]
        });
        
        // Create collector for button interactions
        const collector = sentMessage.createMessageComponentCollector({
          filter: i => i.user.id === message.author.id,
          time: 60000 // 1 minute
        });
        
        collector.on('collect', async interaction => {
          if (interaction.customId === 'team_change_cancel') {
            await interaction.update({
              content: 'Takım değişikliği iptal edildi.',
              embeds: [],
              components: []
            });
            return;
          }
          
          if (interaction.customId === 'team_change_confirm') {
            // Update user team
            await storage.updateUser(user.id, { 
              currentTeam: team.name,
              // Reset stats for new team
              fanSupport: 50,
              managementTrust: 50,
              teamMorale: 50,
              seasonRecords: {}
            });
            
            // Get team traits
            const teamTraits = getTeamTraits(team.traitType);
            
            // Create team info embed
            const teamInfoEmbed = createTeamInfoEmbed(team, teamTraits, {
              ...user,
              currentTeam: team.name,
              fanSupport: 50,
              managementTrust: 50,
              teamMorale: 50
            });
            
            await interaction.update({
              embeds: [teamInfoEmbed],
              components: []
            });
          }
        });
        
        collector.on('end', async collected => {
          if (collected.size === 0) {
            await sentMessage.edit({
              content: 'Takım değişikliği süresi doldu.',
              components: []
            });
          }
        });
        
        return;
      }
      
      // Update user team
      await storage.updateUser(user.id, { 
        currentTeam: team.name,
        // Initialize stats
        fanSupport: 50,
        managementTrust: 50,
        teamMorale: 50,
        seasonRecords: {}
      });
      
      // Get team traits
      const teamTraits = getTeamTraits(team.traitType);
      
      // Create team info embed
      const teamInfoEmbed = createTeamInfoEmbed(team, teamTraits, {
        ...user,
        currentTeam: team.name
      });
      
      // Send team selection confirmation
      await message.reply({ embeds: [teamInfoEmbed] });
      
    } catch (error) {
      console.error('Error in takim command:', error);
      message.reply('Takım seçme sırasında bir hata oluştu.');
    }
  }
};
