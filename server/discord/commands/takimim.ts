import { Message, MessageEmbed } from 'discord.js';
import { storage } from '../../storage';
import { User, Player } from '@shared/schema';
import { createTutorialEmbed } from '../utils/helpers';

// Team info command to show the user's current team players
export const takimimCommand = {
  name: 'takımım',
  description: 'Takımınızdaki tüm oyuncuları görüntüler',
  usage: '.yap takımım',
  execute: async (message: Message, args: string[]) => {
    try {
      // Get user
      const user = await storage.getUserByDiscordId(message.author.id);
      
      if (!user) {
        return message.reply('Oyunda henüz bir profil oluşturmamışsınız. Takım seçmek için `.yap takim` komutunu kullanabilirsiniz.');
      }
      
      // Check if user has a team
      if (!user.currentTeam) {
        return message.reply('Henüz bir takım seçmemişsiniz. Takım seçmek için `.yap takim` komutunu kullanabilirsiniz.');
      }
      
      // Get team
      const team = await storage.getTeamByName(user.currentTeam);
      if (!team) {
        return message.reply('Takımınız bulunamadı. Lütfen `.yap takim` komutu ile tekrar takım seçiniz.');
      }
      
      // Get players for this team
      const players = await storage.getPlayersByTeamId(team.id);
      
      if (!players || players.length === 0) {
        return message.reply(`${team.name} takımınızda henüz oyuncu bulunmamaktadır.`);
      }
      
      // Group players by position
      const goalkeepers = players.filter(p => p.position === 'Kaleci');
      const defenders = players.filter(p => p.position === 'Defans');
      const midfielders = players.filter(p => p.position === 'Orta Saha');
      const forwards = players.filter(p => p.position === 'Forvet');
      
      // Create embed
      const squadEmbed = new MessageEmbed()
        .setColor('#3498db')
        .setTitle(`${team.name} - Takım Kadrosu`)
        .setDescription(`**Teknik Direktör:** ${user.username}\n\n` +
                        `Toplam ${players.length} oyuncu bulunmaktadır. 2025/26 sezonu kadrosu.`)
        .setTimestamp()
        .setFooter({ text: 'Futbol RP Bot - Takım Kadrosu', iconURL: message.guild?.iconURL() || undefined });
      
      // Add player sections by position
      const formatPlayers = (players: Player[]): string => {
        return players
          .sort((a, b) => a.jerseyNumber - b.jerseyNumber)
          .map(p => {
            // Show mood emoji
            let moodEmoji = '😐';
            const mood = p.mood || 70; // Default to 70 if mood is null
            if (mood >= 80) moodEmoji = '😄';
            else if (mood >= 60) moodEmoji = '🙂';
            else if (mood <= 30) moodEmoji = '😠';
            else if (mood <= 50) moodEmoji = '😒';
            
            return `**${p.jerseyNumber}** - ${p.name} ${moodEmoji}`;
          })
          .join('\n');
      };
      
      if (goalkeepers.length > 0) {
        squadEmbed.addField('🧤 Kaleciler', formatPlayers(goalkeepers));
      }
      
      if (defenders.length > 0) {
        squadEmbed.addField('🛡️ Defans Oyuncuları', formatPlayers(defenders));
      }
      
      if (midfielders.length > 0) {
        squadEmbed.addField('🏃 Orta Saha Oyuncuları', formatPlayers(midfielders));
      }
      
      if (forwards.length > 0) {
        squadEmbed.addField('⚽ Forvet Oyuncuları', formatPlayers(forwards));
      }
      
      // Send the embed
      await message.reply({ embeds: [squadEmbed] });
      
    } catch (error) {
      console.error('Takımım komutu hatası:', error);
      message.reply('Takım bilgileri alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  }
};