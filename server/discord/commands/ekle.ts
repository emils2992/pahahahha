import { Message, MessageEmbed, MessageActionRow, MessageButton } from 'discord.js';
import { storage } from '../../storage';
import { User, Team, Player, InsertPlayer } from '@shared/schema';
import { formatTimestamp } from '../utils/helpers';

// Premier Lig takımları
const premierLeagueTeams = [
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton', 
  'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Leicester', 
  'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle', 
  'Nottingham Forest', 'Southampton', 'Tottenham', 'West Ham', 'Wolves', 'Leeds'
];

// Oyuncu pozisyonları
const positions = ['Kaleci', 'Defans', 'Orta Saha', 'Forvet'];

export const ekleCommand = {
  name: 'ekle',
  description: 'Takıma yeni oyuncu ekler (Sadece Yetkililer)',
  usage: '.ekle [takım adı] [oyuncu adı] [pozisyon/seç]',
  category: 'yönetim',
  execute: async (message: Message, args: string[]) => {
    // Yetki kontrolü
    if (!message.member?.permissions.has('ADMINISTRATOR') && 
        !message.member?.permissions.has('MANAGE_GUILD') &&
        !message.member?.roles.cache.some(role => 
          role.name.toLowerCase().includes('mod') || 
          role.name.toLowerCase().includes('admin') || 
          role.name.toLowerCase().includes('yetkili'))) {
      return message.reply('Bu komutu kullanmak için yönetici yetkisine sahip olmanız gerekiyor!');
    }
    try {
      // Kullanıcı kontrolü
      const user = await storage.getUserByDiscordId(message.author.id);
      if (!user) {
        return message.reply('Önce bir takım seçmelisiniz. `.takim` komutunu kullanın.');
      }
      
      // Argüman kontrolü
      if (args.length === 0) {
        return sendTeamSelectionEmbed(message);
      }
      
      // İki kelimeli takım adlarını işleme (Aston Villa, Manchester United vb.)
      let teamName = args[0];
      let teamSearchIndex = 1;
      let playerNameStartIndex = 1;
      
      // Takım adının Premier League listesinde var olup olmadığını kontrol et
      const exactMatch = premierLeagueTeams.find(team => team.toLowerCase() === teamName.toLowerCase());
      if (!exactMatch) {
        // İki kelimeli takım adı kontrolü
        for (let i = 1; i < args.length && i < 3; i++) { // En fazla 3 kelimeli takım adı kontrolü
          const testName = args.slice(0, i + 1).join(' ');
          const match = premierLeagueTeams.find(team => team.toLowerCase() === testName.toLowerCase());
          if (match) {
            teamName = testName;
            teamSearchIndex = i + 1;
            playerNameStartIndex = i + 1;
            break;
          }
        }
      }
      
      // Takım adı belirtilmişse
      const team = await storage.getTeamByName(teamName);
      
      if (!team) {
        return message.reply(`"${teamName}" adında bir takım bulunamadı. Doğru yazdığınızdan emin olun.`);
      }
      
      if (args.length <= teamSearchIndex) {
        // Sadece takım adı belirtilmiş, oyuncu ekleme formunu göster
        return showPlayerAddForm(message, team);
      }
      
      // Takım ve oyuncu adı belirtilmiş, mevki seçim butonlarını göster
      if (args.length >= playerNameStartIndex + 1) {
        const playerName = args[playerNameStartIndex];
        
        // Oyuncu adı var, pozisyon belirtilmediyse veya kullanıcı butonla seçmek istiyorsa
        if (args.length === playerNameStartIndex + 1 || args[playerNameStartIndex + 1].toLowerCase() === "seç") {
          // Pozisyon seçimi için butonlar göster
          return showPositionSelectionButtons(message, team, playerName);
        }
        
        // Pozisyon metinle belirtilmiş
        const position = determinePosition(args[playerNameStartIndex + 1]);
        const jerseyNumber = Math.floor(Math.random() * 99) + 1; // 1-99 arası rastgele forma numarası
        
        // Oyuncu ekle
        await addPlayerToTeam(message, team, playerName, position, jerseyNumber);
      } else {
        message.reply('Oyuncu eklemek için: `.ekle [takım adı] [oyuncu adı] [pozisyon]` veya `.ekle [takım adı] [oyuncu adı] seç` (mevki butonla seçmek için)');
      }
      
    } catch (error) {
      console.error('Oyuncu ekleme hatası:', error);
      message.reply('Oyuncu eklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  }
};

// Takım seçim ekranı
async function sendTeamSelectionEmbed(message: Message): Promise<void> {
  try {
    const teams = await storage.getAllTeams();
    
    // Takımları 5'li gruplar halinde ayır (Discord'da embed'lerde en fazla 25 alan olabilir)
    const teamGroups = [];
    for (let i = 0; i < teams.length; i += 5) {
      teamGroups.push(teams.slice(i, i + 5));
    }
    
    const embed = new MessageEmbed()
      .setColor('#3498db')
      .setTitle('Oyuncu Eklemek İstediğiniz Takımı Seçin')
      .setDescription('Aşağıdaki takımlardan birine oyuncu eklemek için: `.yap ekle [takım adı]`')
      .setFooter({ text: 'Transfer Penceresi' });
    
    // Takımları ekle
    teamGroups.forEach((group, index) => {
      const teamNames = group.map(team => team.name).join('\n');
      embed.addField(`Takımlar - Grup ${index + 1}`, teamNames, true);
    });
    
    message.channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Takım seçim hatası:', error);
    message.reply('Takım listesi alınırken bir hata oluştu.');
  }
}

// Oyuncu ekleme formu
async function showPlayerAddForm(message: Message, team: Team): Promise<void> {
  const embed = new MessageEmbed()
    .setColor('#2ecc71')
    .setTitle(`${team.name} - Yeni Oyuncu Ekleme`)
    .setDescription('Yeni bir oyuncu eklemek için aşağıdaki komutu kullanın:')
    .addField('Komut (Metin ile Pozisyon)', `\`.ekle ${team.name} [oyuncu adı] [pozisyon]\``)
    .addField('Komut (Buton ile Pozisyon)', `\`.ekle ${team.name} [oyuncu adı] seç\``)
    .addField('Örnek', `\`.ekle ${team.name} Messi Forvet\` veya \`.ekle ${team.name} Messi seç\``)
    .addField('Pozisyonlar', positions.join(', '))
    .addField('Mevcut Oyuncular', await getTeamPlayersList(team.id))
    .setFooter({ text: 'Transfer Penceresi' });
    
  message.channel.send({ embeds: [embed] });
}

// Pozisyon seçim butonları göster
async function showPositionSelectionButtons(message: Message, team: Team, playerName: string): Promise<void> {
  const embed = new MessageEmbed()
    .setColor('#3498db')
    .setTitle(`${team.name} - ${playerName} için Pozisyon Seçimi`)
    .setDescription(`**${playerName}** için bir pozisyon seçin:`)
    .setFooter({ text: 'Transferin tamamlanması için bir pozisyon seçin.' });
  
  // Pozisyon butonları
  const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId(`pos_Kaleci_${team.id}_${playerName}`)
        .setLabel('Kaleci')
        .setStyle('PRIMARY')
        .setEmoji('🧤'),
      new MessageButton()
        .setCustomId(`pos_Defans_${team.id}_${playerName}`)
        .setLabel('Defans')
        .setStyle('PRIMARY')
        .setEmoji('🛡️'),
      new MessageButton()
        .setCustomId(`pos_Orta Saha_${team.id}_${playerName}`)
        .setLabel('Orta Saha')
        .setStyle('PRIMARY')
        .setEmoji('⚙️'),
      new MessageButton()
        .setCustomId(`pos_Forvet_${team.id}_${playerName}`)
        .setLabel('Forvet')
        .setStyle('PRIMARY')
        .setEmoji('⚽')
    );
  
  const sentMessage = await message.channel.send({ embeds: [embed], components: [row] });
  
  // Buton tıklama olayını dinle
  const filter = (i: any) => {
    return i.customId.startsWith('pos_') && i.user.id === message.author.id;
  };
  
  const collector = sentMessage.createMessageComponentCollector({ 
    filter, 
    time: 30000 // 30 saniye süre
  });
  
  collector.on('collect', async (interaction: any) => {
    // Buton verilerini analiz et
    const [prefix, position, teamId, ...playerNameParts] = interaction.customId.split('_');
    const fullPlayerName = playerNameParts.join('_'); // İsimde _ karakteri varsa
    
    // Rastgele forma numarası oluştur
    const jerseyNumber = Math.floor(Math.random() * 99) + 1;
    
    // Oyuncuyu takıma ekle
    await addPlayerToTeam(message, team, playerName, position, jerseyNumber);
    
    // Butonu devre dışı bırak
    await interaction.update({ 
      components: [], 
      embeds: [
        new MessageEmbed()
          .setColor('#2ecc71')
          .setTitle('Pozisyon Seçildi')
          .setDescription(`**${playerName}** için **${position}** pozisyonu seçildi.`)
      ]
    });
  });
  
  // Zaman aşımı
  collector.on('end', async (collected, reason) => {
    if (reason === 'time' && collected.size === 0) {
      await sentMessage.edit({
        components: [],
        embeds: [
          new MessageEmbed()
            .setColor('#e74c3c')
            .setTitle('Zaman Aşımı')
            .setDescription('Pozisyon seçimi için süre doldu. Lütfen tekrar deneyin.')
        ]
      });
    }
  });
}

// Takımın mevcut oyuncularını getir
async function getTeamPlayersList(teamId: number): Promise<string> {
  try {
    const players = await storage.getPlayersByTeamId(teamId);
    
    if (players.length === 0) {
      return "Henüz oyuncu yok";
    }
    
    return players.map(player => 
      `${player.name} (${player.position}) - #${player.jerseyNumber}`
    ).join('\n');
  } catch (error) {
    console.error('Oyuncu listesi hatası:', error);
    return "Oyuncu listesi alınamadı";
  }
}

// Pozisyon belirleme
function determinePosition(positionInput: string): string {
  const input = positionInput.toLowerCase();
  
  if (input.includes('kaleci') || input.includes('keeper') || input.includes('gk')) {
    return 'Kaleci';
  } else if (input.includes('defans') || input.includes('defender') || input.includes('def')) {
    return 'Defans';
  } else if (input.includes('orta') || input.includes('midfielder') || input.includes('mid')) {
    return 'Orta Saha';
  } else if (input.includes('forvet') || input.includes('forward') || input.includes('striker')) {
    return 'Forvet';
  }
  
  // Eşleşme bulunamadıysa, varsayılan olarak 'Orta Saha' döndür
  return 'Orta Saha';
}

// Takıma oyuncu ekleme
async function addPlayerToTeam(
  message: Message, 
  team: Team, 
  playerName: string, 
  position: string, 
  jerseyNumber: number
): Promise<void> {
  try {
    // Yeni oyuncu oluştur
    const newPlayer: InsertPlayer = {
      name: playerName,
      position: position,
      jerseyNumber: jerseyNumber,
      teamId: team.id,
      mood: 70 // Yeni transfer olduğu için morali yüksek
    };
    
    // Oyuncuyu veritabanına ekle
    const player = await storage.createPlayer(newPlayer);
    
    // Başarılı mesajı gönder
    const embed = new MessageEmbed()
      .setColor('#2ecc71')
      .setTitle('Transfer Başarılı!')
      .setDescription(`**${player.name}** artık **${team.name}** kadrosunda!`)
      .addField('Pozisyon', player.position)
      .addField('Forma Numarası', `#${player.jerseyNumber}`)
      .addField('Transfer Tarihi', formatTimestamp(new Date(), 'date'))
      .setFooter({ text: 'Transfer Penceresi' });
      
    message.channel.send({ embeds: [embed] });
    
    // Kullanıcının takımı ise, takım moralini biraz yükselt
    const user = await storage.getUserByDiscordId(message.author.id);
    if (user && user.currentTeam === team.name) {
      await storage.updateUserStats(user.discordId, 0, 0, 5);
      message.channel.send('Başarılı transferden dolayı takım morali yükseldi! 📈');
    }
    
  } catch (error) {
    console.error('Oyuncu ekleme hatası:', error);
    message.reply('Oyuncu eklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
  }
}