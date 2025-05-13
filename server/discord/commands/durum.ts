import { 
  Message, 
  MessageEmbed 
} from 'discord.js';
import { storage } from '../../storage';
import { checkUserTeam } from '../utils/helpers';
import { formatTimestamp } from '../utils/helpers';

// Status command - shows user's current stats and team info
export const durumCommand = {
  name: 'durum',
  description: 'Teknik direktör ve takım durumunu göster',
  usage: '.yap durum',
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
      
      // Get team info
      const team = await storage.getTeamByName(user.currentTeam as string);
      if (!team) {
        return message.reply('Takım bilgisi bulunamadı.');
      }
      
      // Create status embed
      const statusEmbed = new MessageEmbed()
        .setColor('#5865F2')
        .setTitle(`📊 Teknik Direktör ve Takım Durumu`)
        .setDescription(`**${user.username}** - **${team.name}** teknik direktörü`)
        .setFooter({ text: `Son güncelleme: ${formatTimestamp(new Date())}` });
      
      // Add coach stats
      statusEmbed.addField(
        '👔 Teknik Direktör Bilgileri',
        `**İsim:** ${user.username}\n` +
        `**Göreve Başlama:** ${formatTimestamp(new Date(user.createdAt), 'date')}\n` +
        `**Puan:** ${user.points || 0}\n` +
        `**Unvanlar:** ${user.titles ? JSON.stringify(user.titles) : 'Henüz unvan kazanılmadı'}\n`,
        false
      );
      
      // Add team performance
      statusEmbed.addField(
        '⚽ Takım Performansı',
        `**Taraftar Desteği:** ${getStatBar(user.fanSupport, 100)}\n` +
        `**Yönetim Güveni:** ${getStatBar(user.managementTrust, 100)}\n` +
        `**Takım Morali:** ${getStatBar(user.teamMorale, 100)}\n`,
        false
      );
      
      // Add memory stats
      statusEmbed.addField(
        '💾 Hafıza Veritabanı Durumu',
        `**Kullanıcı Sayısı:** ${await getUserCount()}\n` +
        `**Takım Sayısı:** ${await getTeamCount()}\n` +
        `**Oyuncu Sayısı:** ${await getPlayerCount()}\n` +
        `**Aktif Oturum Sayısı:** ${await getActiveSessionCount()}\n`,
        false
      );
      
      // Send the embed
      return message.reply({ embeds: [statusEmbed] });
      
    } catch (error) {
      console.error('Error in durum command:', error);
      message.reply('Durum gösterimi sırasında bir hata oluştu.');
    }
  }
};

// Helper function to generate a stat bar
function getStatBar(value: number | null, max: number): string {
  if (value === null) value = 50; // Default value
  
  const percentage = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  const fullBlocks = Math.floor(percentage / 10);
  
  let bar = '';
  for (let i = 0; i < 10; i++) {
    bar += i < fullBlocks ? '■' : '□';
  }
  
  return `${bar} ${percentage}%`;
}

// Helper functions to get database stats
async function getUserCount(): Promise<number> {
  const allUsers = await storage.getAllUsers();
  return allUsers.length;
}

async function getTeamCount(): Promise<number> {
  const allTeams = await storage.getAllTeams();
  return allTeams.length;
}

async function getPlayerCount(): Promise<number> {
  const allTeams = await storage.getAllTeams();
  let playerCount = 0;
  
  for (const team of allTeams) {
    const players = await storage.getPlayersByTeamId(team.id);
    playerCount += players.length;
  }
  
  return playerCount;
}

async function getActiveSessionCount(): Promise<number> {
  const allSessions = await storage.getAllGameSessions();
  return allSessions.filter(session => session.isActive).length;
}