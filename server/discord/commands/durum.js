const { Message, MessageEmbed } = require('discord.js');
const { storage } = require('../../storage');
const { formatTimestamp } = require('../utils/helpers');
const { getTeamTraits } = require('../data/teamTraits');

const durumCommand = {
  name: 'durum',
  description: 'Oyundaki performansınızı ve durumunuzu gösterir',
  usage: '.durum',
  category: 'genel',
  execute: async (message, args) => {
    try {
      // Get user from database
      const user = await storage.getUserByDiscordId(message.author.id);
      
      if (!user) {
        return message.reply('Oyunda henüz bir profil oluşturmamışsınız. Takım seçmek için `.takim` komutunu kullanabilirsiniz.');
      }
      
      // Create the status embed
      const statusEmbed = await createStatusEmbed(user, message);
      message.channel.send({ embeds: [statusEmbed] });
      
    } catch (error) {
      console.error('Durum komutu hatası:', error);
      message.reply('Durum bilgileriniz alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  }
};

async function createStatusEmbed(user, message) {
  // Get user's team
  let team;
  let teamTraits = null;
  
  if (user.currentTeam) {
    team = await storage.getTeamByName(user.currentTeam);
    if (team) {
      teamTraits = getTeamTraits(team.traitType);
    }
  }
  
  // Calculate stats
  const userRank = await calculateUserRank(user);
  const activeSessionCount = await getActiveSessionCount(user.id);
  const totalSessionsCompleted = await getCompletedSessionCount(user.id);
  const statBars = await createStatBars(user);
  
  // Create embed
  const embed = new MessageEmbed()
    .setColor('#3498db')
    .setTitle(`${user.username} | Menajer Durumu`)
    .setDescription(`${user.currentTeam ? `**${user.currentTeam}** takımının teknik direktörü` : 'Henüz bir takım seçmemiş'}`)
    .setThumbnail(message.author.displayAvatarURL())
    .addField('📊 Genel İstatistikler', 
      `🏆 **Puan:** ${user.points || 0}\n` +
      `👑 **Sıralama:** ${userRank}\n` +
      `🕒 **Kayıt Tarihi:** ${formatTimestamp(new Date(user.createdAt), 'date')}\n` +
      `📝 **Tamamlanan Etkinlikler:** ${totalSessionsCompleted}\n` +
      `⚡ **Aktif Oturumlar:** ${activeSessionCount}`
    )
    .addField('📈 Performans Metrikleri', statBars)
    .setFooter({ text: 'Teknik Direktör Kariyer Durumu' })
    .setTimestamp();
    
  // Add earned titles if any
  if (user.titles && Array.isArray(user.titles) && user.titles.length > 0) {
    embed.addField('🏅 Kazanılan Unvanlar', user.titles.join('\n'));
  }
  
  // Add team specifics if available
  if (team && teamTraits) {
    embed.addField(`⚽ ${team.name} Takım Bilgileri`, 
      `**Takım Profili:** ${teamTraits.description}\n` +
      `**Medya Baskısı:** ${getRiskLevel(teamTraits.mediaPressure)}\n` +
      `**Taraftar Beklentisi:** ${getRiskLevel(teamTraits.fanExpectations)}\n` +
      `**Yönetim Sabrı:** ${getRiskLevel(teamTraits.managementPatience)}`
    );
  }
  
  return embed;
}

async function calculateUserRank(user) {
  try {
    const allUsers = await storage.getAllUsers();
    
    // Sort users by points in descending order
    const sortedUsers = allUsers.sort((a, b) => {
      return (b.points || 0) - (a.points || 0);
    });
    
    // Find current user's rank
    const rank = sortedUsers.findIndex(u => u.id === user.id) + 1;
    return `${rank}/${sortedUsers.length}`;
  } catch (error) {
    console.error('Sıralama hesaplanırken hata:', error);
    return 'Hesaplanamadı';
  }
}

async function getActiveSessionCount(userId) {
  try {
    const allSessions = await storage.getAllGameSessions();
    return allSessions.filter((session) => 
      session.userId === userId && session.isActive === true
    ).length;
  } catch (error) {
    console.error('Aktif oturum sayısı hesaplanırken hata:', error);
    return 0;
  }
}

async function getCompletedSessionCount(userId) {
  try {
    const allSessions = await storage.getAllGameSessions();
    return allSessions.filter((session) => 
      session.userId === userId && session.isActive === false
    ).length;
  } catch (error) {
    console.error('Tamamlanan oturum sayısı hesaplanırken hata:', error);
    return 0;
  }
}

async function createStatBars(user) {
  const fanSupport = user.fanSupport || 50;
  const managementTrust = user.managementTrust || 50;  
  const teamMorale = user.teamMorale || 50;
  
  return `**Taraftar Desteği:** ${getStatBar(fanSupport, 100)}\n` +
         `**Yönetim Güveni:** ${getStatBar(managementTrust, 100)}\n` +
         `**Takım Morali:** ${getStatBar(teamMorale, 100)}`;
}

function getStatBar(value, max) {
  if (value === null) return 'Hesaplanamadı';
  
  const filledSquares = Math.round((value / max) * 10);
  const emptySquares = 10 - filledSquares;
  
  const filled = '■'.repeat(filledSquares);
  const empty = '□'.repeat(emptySquares);
  
  let color = '🟨';  // Default yellow
  if (value >= 70) color = '🟩';  // Green for high
  if (value <= 30) color = '🟥';  // Red for low
  
  return `${color} ${filled}${empty} ${value}%`;
}

function getRiskLevel(risk) {
  switch (risk) {
    case 'low': return '🟢 Düşük';
    case 'medium': return '🟠 Orta';
    case 'high': return '🔴 Yüksek';
    default: return '⚪ Belirsiz';
  }
}

module.exports = {
  durumCommand
};