import { 
  MessageEmbed, 
  MessageActionRow, 
  MessageSelectMenu
} from 'discord.js';
import { storage } from '../../storage.js';
import { createTacticEmbed } from '../utils/embeds.js';
import { checkUserTeam, createTutorialEmbed } from '../utils/helpers.js';

// Tactic command
export const taktikCommand = {
  name: 'taktik',
  description: 'Taktik formasyonu belirle',
  usage: '.taktik [formasyon]',
  execute: async (message, args) => {
    try {
      // Get user
      const user = await storage.getUserByDiscordId(message.author.id);
      if (!user) {
        return message.reply('Profil bulunamadı. Lütfen bir takım seçerek başlayın: `.takim [takım adı]`');
      }
      
      // Check if user has a team
      const hasTeam = await checkUserTeam(user, message);
      if (!hasTeam) return;
      
      if (!args.length) {
        return message.reply({
          embeds: [
            createTutorialEmbed(
              'Taktik Belirleme Yardımı',
              '**Kullanım:** `.taktik [formasyon]` veya `.taktik`\n\n' +
              '**Örnek:** `.taktik 4-3-3`\n\n' +
              '**Açıklama:** Takımınızın taktik formasyonunu belirlersiniz.\n' +
              'Eğer bir formasyon belirtmezseniz, seçim için liste gösterilir.\n\n' +
              '**Formasyonlar:** 4-4-2, 4-3-3, 4-2-3-1, 3-5-2, 3-4-3, 5-3-2'
            )
          ]
        });
      }
      
      // Available formations
      const formations = [
        {
          name: '4-4-2',
          positions: ['GK', 'RB', 'CB', 'CB', 'LB', 'RM', 'CM', 'CM', 'LM', 'ST', 'ST'],
          mediaAnalysis: [
            'Klasik 4-4-2 dizilişine dönüş yapan teknik direktör, dengeyi ön planda tuttu.',
            'Orta sahayı kalabalık tutarak pozisyon futbolu oynamak istiyor.',
            'İki forveti birlikte kullanarak gol yollarında etkili olmak istiyor.'
          ]
        },
        {
          name: '4-3-3',
          positions: ['GK', 'RB', 'CB', 'CB', 'LB', 'CM', 'CM', 'CM', 'RW', 'ST', 'LW'],
          mediaAnalysis: [
            'Hücum odaklı 4-3-3 dizilişi tercih edildi.',
            'Kanatları etkin kullanarak rakip savunmayı açmak istiyor.',
            'Orta üçlü ile hem savunma güvenliğini hem de hücum desteğini sağlamayı hedefliyor.'
          ]
        },
        {
          name: '4-2-3-1',
          positions: ['GK', 'RB', 'CB', 'CB', 'LB', 'CDM', 'CDM', 'RM', 'CAM', 'LM', 'ST'],
          mediaAnalysis: [
            'Modern futbolun popüler dizilişi 4-2-3-1 ile sahaya çıkıyor.',
            'İki ön liberonun savunma güvenliğini sağlaması bekleniyor.',
            'Tek forvet arkasındaki üçlü ile hücumda çeşitlilik yaratmak istiyor.'
          ]
        },
        {
          name: '3-5-2',
          positions: ['GK', 'CB', 'CB', 'CB', 'RM', 'CM', 'CM', 'CM', 'LM', 'ST', 'ST'],
          mediaAnalysis: [
            'Üçlü savunma ve geniş orta saha dizilişi tercih edildi.',
            'Kanat beklerden gelecek katkıyla hücumda sayısal üstünlük hedefleniyor.',
            'İki forveti beslemek için orta sahanın üretkenliği ön plana çıkacak.'
          ]
        },
        {
          name: '3-4-3',
          positions: ['GK', 'CB', 'CB', 'CB', 'RM', 'CM', 'CM', 'LM', 'RW', 'ST', 'LW'],
          mediaAnalysis: [
            'Hücum odaklı 3-4-3 dizilişi benimsendi.',
            'Üçlü savunma arkasında riskli ama gol potansiyeli yüksek bir taktik.',
            'Geniş bir hücum hattıyla rakip savunmayı zorlamak istiyor.'
          ]
        },
        {
          name: '5-3-2',
          positions: ['GK', 'RWB', 'CB', 'CB', 'CB', 'LWB', 'CM', 'CM', 'CM', 'ST', 'ST'],
          mediaAnalysis: [
            'Savunma güvenliğini ön planda tutan 5-3-2 dizilişi tercih edildi.',
            'Kanat beklerden gelecek ofansif katkı önem taşıyacak.',
            'Kontra atakta etkili olmak için iki forvet kullanılacak.'
          ]
        }
      ];
      
      // Check if a specific formation is provided
      let selectedFormation;
      
      if (args.length > 0) {
        const requestedFormation = args[0];
        selectedFormation = formations.find(f => f.name === requestedFormation);
        
        if (!selectedFormation) {
          return message.reply(`"${requestedFormation}" geçerli bir formasyon değil. Geçerli formasyonlar: ${formations.map(f => f.name).join(', ')}`);
        }
        
        // Create the tactic embed
        const embed = createTacticEmbed(
          selectedFormation, 
          user.currentTeam
        );
        
        // Add random analysis from media
        const randomAnalysisIndex = Math.floor(Math.random() * selectedFormation.mediaAnalysis.length);
        const mediaAnalysis = selectedFormation.mediaAnalysis[randomAnalysisIndex];
        
        // Send the message
        return message.reply({
          embeds: [embed],
          content: `**Medya Analizi:** ${mediaAnalysis}`
        });
      }
      
      // If no specific formation, show selection menu
      const row = new MessageActionRow()
        .addComponents(
          new MessageSelectMenu()
            .setCustomId('select_formation')
            .setPlaceholder('Formasyon seçin')
            .addOptions(formations.map(formation => ({
              label: formation.name,
              description: `${formation.name} formasyonu`,
              value: formation.name
            })))
        );
      
      // Send selection menu
      const sentMessage = await message.reply({
        content: 'Uygulamak istediğiniz formasyonu seçin:',
        components: [row]
      });
      
      // Create collector for selection
      const collector = sentMessage.createMessageComponentCollector({
        filter: i => i.user.id === message.author.id,
        time: 30000 // 30 seconds timeout
      });
      
      // Handle collector events
      collector.on('collect', async interaction => {
        if (interaction.isSelectMenu()) {
          const selectedValue = interaction.values[0];
          selectedFormation = formations.find(f => f.name === selectedValue);
          
          if (selectedFormation) {
            // Create the tactic embed
            const embed = createTacticEmbed(
              selectedFormation, 
              user.currentTeam
            );
            
            // Add random analysis from media
            const randomAnalysisIndex = Math.floor(Math.random() * selectedFormation.mediaAnalysis.length);
            const mediaAnalysis = selectedFormation.mediaAnalysis[randomAnalysisIndex];
            
            // Update the message
            await interaction.update({
              embeds: [embed],
              content: `**Medya Analizi:** ${mediaAnalysis}`,
              components: []
            });
            
            // Increment tactical decisions count
            await incrementTacticalDecisions(message.author.id);
          }
        }
      });
      
      collector.on('end', collected => {
        if (collected.size === 0) {
          sentMessage.edit({
            content: 'Zaman aşımı: Formasyon seçimi iptal edildi.',
            components: []
          });
        }
      });
      
    } catch (error) {
      console.error('Taktik komutunda hata:', error);
      message.reply('Taktik belirlerken bir hata oluştu.');
    }
  }
};

// Helper function to simulate creating players when database has no players
async function createSimulatedPlayers(teamId) {
  const positions = ['Kaleci', 'Defans', 'Orta Saha', 'Forvet'];
  const names = ['Ali', 'Mehmet', 'Ahmet', 'Mustafa', 'Kemal', 'Ozan', 'Serkan', 'Burak', 'Emre', 'Hakan', 'Mert', 'Can'];
  const lastNames = ['Yılmaz', 'Demir', 'Çelik', 'Kaya', 'Şahin', 'Koç', 'Aydın', 'Yıldız', 'Özdemir', 'Arslan', 'Doğan', 'Özkan'];
  
  const players = [];
  
  // Create some players with different positions
  let jerseyNumber = 1;
  for (let i = 0; i < 11; i++) {
    const nameIndex = Math.floor(Math.random() * names.length);
    const lastNameIndex = Math.floor(Math.random() * lastNames.length);
    const positionIndex = i < 1 ? 0 : i < 5 ? 1 : i < 9 ? 2 : 3; // Distribute positions
    
    const player = {
      id: i + 1,
      name: `${names[nameIndex]} ${lastNames[lastNameIndex]}`,
      position: positions[positionIndex],
      jerseyNumber: jerseyNumber++,
      mood: 70,  // Default mood
      teamId: teamId
    };
    
    players.push(player);
  }
  
  return players;
}

// Helper function to increment tactical decisions
async function incrementTacticalDecisions(discordId) {
  // Update user points for making tactical decisions
  const user = await storage.getUserByDiscordId(discordId);
  if (!user) return 0;
  
  const pointsToAdd = 5; // Points for making tactical decisions
  const updatedUser = await storage.addUserPoints(discordId, pointsToAdd);
  
  return updatedUser?.points || 0;
}

// export statement is at the top of the file