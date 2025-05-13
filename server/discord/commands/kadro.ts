import { 
  Message, 
  MessageEmbed, 
  MessageActionRow, 
  MessageButton,
  MessageSelectMenu
} from 'discord.js';
import { storage } from '../../storage';
import { User, Player, PlayerInteractionResult, Formation } from '@shared/schema';
import { 
  createPlayerInteractionEmbed, 
  createTacticEmbed, 
  createPlayerActionResultEmbed 
} from '../utils/embeds';
import { getRandomReactions, checkUserTeam, createTutorialEmbed } from '../utils/helpers';

// Player interaction command
export const kadroCommand = {
  name: 'kadrodisi',
  description: 'Oyuncu ile etkileşimde bulun',
  usage: '.yap kadrodisi [oyuncu adı]',
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
      
      if (!args.length) {
        return message.reply({
          embeds: [
            createTutorialEmbed(
              'Kadro Dışı Bırakma Yardımı',
              '**Kullanım:** `.yap kadrodisi [oyuncu adı]`\n\n' +
              '**Örnek:** `.yap kadrodisi Mehmet Aydın`\n\n' +
              '**Açıklama:** Belirtilen oyuncuyu kadro dışı bırakır.\n' +
              'Bu, oyuncunun moralini, takım moralini etkileyebilir ve medya tepkisine neden olabilir.'
            )
          ]
        });
      }
      
      // Get player name from arguments
      const playerName = args.join(' ');
      
      // Simulate players for the team
      const teamId = (await storage.getTeamByName(user.currentTeam as string))?.id;
      if (!teamId) {
        return message.reply('Takım bilgisi bulunamadı.');
      }
      
      // Get or create simulated players
      let teamPlayers = await storage.getPlayersByTeamId(teamId);
      if (!teamPlayers.length) {
        teamPlayers = await createSimulatedPlayers(teamId);
      }
      
      // Find the player
      const player = teamPlayers.find(p => 
        p.name.toLowerCase().includes(playerName.toLowerCase())
      );
      
      if (!player) {
        return message.reply(`${playerName} isimli bir oyuncu takımınızda bulunamadı.`);
      }
      
      // Create the player interaction message
      const embed = createPlayerInteractionEmbed(
        player,
        'kadrodisi',
        user.currentTeam as string
      );
      
      // Create action buttons
      const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setCustomId('kadrodisi_confirm')
            .setLabel('Kadro Dışı Bırak')
            .setStyle('DANGER'),
          new MessageButton()
            .setCustomId('kadrodisi_cancel')
            .setLabel('Vazgeç')
            .setStyle('SECONDARY')
        );
      
      const sentMessage = await message.reply({
        embeds: [embed],
        components: [row]
      });
      
      // Create collector for button interactions
      const collector = sentMessage.createMessageComponentCollector({
        filter: i => i.user.id === message.author.id,
        time: 60000 // 1 minute
      });
      
      collector.on('collect', async interaction => {
        if (interaction.customId === 'kadrodisi_cancel') {
          await interaction.update({
            content: 'İşlem iptal edildi.',
            embeds: [],
            components: []
          });
          return;
        }
        
        if (interaction.customId === 'kadrodisi_confirm') {
          // Apply the consequences
          const moodChange = -20; // Player's mood decreases
          const teamMoraleChange = -5; // Team morale decreases slightly
          
          // Update player mood
          await storage.updatePlayerMood(player.id, moodChange);
          
          // Update team morale
          await storage.updateUserStats(
            user.discordId,
            0, // No fan support change
            0, // No management trust change
            teamMoraleChange
          );
          
          // Generate result
          const result: PlayerInteractionResult = {
            playerMoodChange: moodChange,
            teamMoraleChange: teamMoraleChange,
            mediaReaction: getRandomReactions('kadrodisi'),
            message: `${player.name} kadro dışı bırakıldı.`
          };
          
          // Create result embed
          const resultEmbed = createPlayerActionResultEmbed(
            player,
            'kadrodisi',
            result,
            user.currentTeam as string
          );
          
          await interaction.update({
            embeds: [resultEmbed],
            components: []
          });
        }
      });
      
      collector.on('end', async collected => {
        if (collected.size === 0) {
          await sentMessage.edit({
            content: 'İşlem süresi doldu.',
            components: []
          });
        }
      });
      
    } catch (error) {
      console.error('Error in kadrodisi command:', error);
      message.reply('Oyuncu etkileşimi sırasında bir hata oluştu.');
    }
  }
};

// Apologize to player command
export const özürCommand = {
  name: 'özür',
  description: 'Oyuncudan özür dile',
  usage: '.yap özür [oyuncu adı]',
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
      
      if (!args.length) {
        return message.reply({
          embeds: [
            createTutorialEmbed(
              'Özür Dileme Yardımı',
              '**Kullanım:** `.yap özür [oyuncu adı]`\n\n' +
              '**Örnek:** `.yap özür Mehmet Aydın`\n\n' +
              '**Açıklama:** Belirtilen oyuncudan özür diler.\n' +
              'Bu, oyuncunun moralini yükseltebilir ve takım moralini iyileştirebilir.'
            )
          ]
        });
      }
      
      // Get player name from arguments
      const playerName = args.join(' ');
      
      // Get team and players
      const teamId = (await storage.getTeamByName(user.currentTeam as string))?.id;
      if (!teamId) {
        return message.reply('Takım bilgisi bulunamadı.');
      }
      
      // Get or create simulated players
      let teamPlayers = await storage.getPlayersByTeamId(teamId);
      if (!teamPlayers.length) {
        teamPlayers = await createSimulatedPlayers(teamId);
      }
      
      // Find the player
      const player = teamPlayers.find(p => 
        p.name.toLowerCase().includes(playerName.toLowerCase())
      );
      
      if (!player) {
        return message.reply(`${playerName} isimli bir oyuncu takımınızda bulunamadı.`);
      }
      
      // Create the player interaction message
      const embed = createPlayerInteractionEmbed(
        player,
        'özür',
        user.currentTeam as string
      );
      
      // Create action buttons
      const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setCustomId('özür_confirm')
            .setLabel('Özür Dile')
            .setStyle('SUCCESS'),
          new MessageButton()
            .setCustomId('özür_cancel')
            .setLabel('Vazgeç')
            .setStyle('SECONDARY')
        );
      
      const sentMessage = await message.reply({
        embeds: [embed],
        components: [row]
      });
      
      // Create collector for button interactions
      const collector = sentMessage.createMessageComponentCollector({
        filter: i => i.user.id === message.author.id,
        time: 60000 // 1 minute
      });
      
      collector.on('collect', async interaction => {
        if (interaction.customId === 'özür_cancel') {
          await interaction.update({
            content: 'İşlem iptal edildi.',
            embeds: [],
            components: []
          });
          return;
        }
        
        if (interaction.customId === 'özür_confirm') {
          // Apply the consequences
          const moodChange = 15; // Player's mood increases
          const teamMoraleChange = 5; // Team morale increases slightly
          
          // Update player mood
          await storage.updatePlayerMood(player.id, moodChange);
          
          // Update team morale
          await storage.updateUserStats(
            user.discordId,
            0, // No fan support change
            0, // No management trust change
            teamMoraleChange
          );
          
          // Generate result
          const result: PlayerInteractionResult = {
            playerMoodChange: moodChange,
            teamMoraleChange: teamMoraleChange,
            mediaReaction: getRandomReactions('özür'),
            message: `${player.name}'dan özür dilenildi.`
          };
          
          // Create result embed
          const resultEmbed = createPlayerActionResultEmbed(
            player,
            'özür',
            result,
            user.currentTeam as string
          );
          
          await interaction.update({
            embeds: [resultEmbed],
            components: []
          });
        }
      });
      
      collector.on('end', async collected => {
        if (collected.size === 0) {
          await sentMessage.edit({
            content: 'İşlem süresi doldu.',
            components: []
          });
        }
      });
      
    } catch (error) {
      console.error('Error in özür command:', error);
      message.reply('Oyuncu etkileşimi sırasında bir hata oluştu.');
    }
  }
};

// Tactical formation command
export const taktikCommand = {
  name: 'taktik',
  description: 'Taktik formasyonu belirle',
  usage: '.yap taktik [formasyon]',
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
      
      // Define available formations
      const formations: Formation[] = [
        {
          name: '4-3-3',
          positions: ['KL', 'SB', 'STP', 'STP', 'SGB', 'OS', 'OS', 'OS', 'SOF', 'F', 'SAF'],
          mediaAnalysis: [
            'Ofansif bir sistem, kanatlardan etkili olabilirsin.',
            'Orta sahadaki üçlünün uyumu çok önemli olacak.',
            'Kanat oyuncularının defansif katkısı yeterli olacak mı?'
          ]
        },
        {
          name: '4-2-3-1',
          positions: ['KL', 'SB', 'STP', 'STP', 'SGB', 'DOS', 'DOS', 'SOF', 'OS', 'SAF', 'F'],
          mediaAnalysis: [
            'Dengeli bir sistem, defans ve hücum arasında denge sağlayabilir.',
            'İki defansif orta saha takıma güvenlik kazandıracak.',
            'Forvet arkasındaki oyuncunun yaratıcılığı kritik olacak.'
          ]
        },
        {
          name: '3-5-2',
          positions: ['KL', 'STP', 'STP', 'STP', 'SK', 'OS', 'OS', 'OS', 'SK', 'F', 'F'],
          mediaAnalysis: [
            'Üçlü savunma riskli olabilir, kenar oyuncuların defansif görevleri kritik.',
            'İki forvet ile rakip savunmaya baskı yapabilirsin.',
            'Orta sahanın kalabalık olması top kontrolünü artırabilir.'
          ]
        },
        {
          name: '5-3-2',
          positions: ['KL', 'SB', 'STP', 'STP', 'STP', 'SGB', 'OS', 'OS', 'OS', 'F', 'F'],
          mediaAnalysis: [
            'Defansif bir sistem, kanatlardan çıkış yapman gerekecek.',
            'Beşli savunma ile rakibe alan bırakmayabilirsin.',
            'İki forveti beslemek için orta sahanın yaratıcılığı önemli.'
          ]
        },
        {
          name: '4-4-2',
          positions: ['KL', 'SB', 'STP', 'STP', 'SGB', 'SOF', 'OS', 'OS', 'SAF', 'F', 'F'],
          mediaAnalysis: [
            'Klasik ve dengeli bir sistem, her takıma karşı etkili olabilir.',
            'İki forvet ile gol şansların artabilir.',
            'Dörtlü orta saha ile hem defansif hem ofansif denge sağlanabilir.'
          ]
        }
      ];
      
      // If no formation provided, show options
      if (!args.length) {
        const formationOptions = formations.map(f => f.name).join(', ');
        
        return message.reply({
          embeds: [
            createTutorialEmbed(
              'Taktik Sistemi Yardımı',
              `**Kullanım:** \`.yap taktik [formasyon]\`\n\n` +
              `**Örnek:** \`.yap taktik 4-3-3\`\n\n` +
              `**Kullanılabilir Formasyonlar:** ${formationOptions}\n\n` +
              `**Açıklama:** Seçtiğin formasyona göre medya analizi alırsın.`
            )
          ]
        });
      }
      
      // Get the requested formation
      const requestedFormation = args[0];
      const formation = formations.find(f => 
        f.name.toLowerCase() === requestedFormation.toLowerCase()
      );
      
      if (!formation) {
        const formationOptions = formations.map(f => f.name).join(', ');
        return message.reply(`Geçersiz formasyon. Geçerli formasyonlar: ${formationOptions}`);
      }
      
      // Create the tactic embed
      const tacticEmbed = createTacticEmbed(
        formation,
        user.currentTeam as string
      );
      
      // Send the message
      await message.reply({ embeds: [tacticEmbed] });
      
      // Award points for tactical decisions
      await storage.addUserPoints(user.discordId, 2);
      
      // Check for tactical title
      const tacticalDecisions = await incrementTacticalDecisions(user.discordId);
      if (tacticalDecisions >= 5) {
        await storage.addUserTitle(user.discordId, "Taktik Dâhi");
      }
      
    } catch (error) {
      console.error('Error in taktik command:', error);
      message.reply('Taktik belirleme sırasında bir hata oluştu.');
    }
  }
};

// Helper function to create simulated players
async function createSimulatedPlayers(teamId: number): Promise<Player[]> {
  const playerNames = [
    'Ahmet Yılmaz', 'Mehmet Aydın', 'Kerem Aktürk', 'Ali Özdemir', 
    'Emre Yıldız', 'Mustafa Demir', 'Ozan Tufan', 'Burak Yılmaz',
    'Hakan Çalhanoğlu', 'Cengiz Ünder', 'Yusuf Yazıcı', 'Merih Demiral'
  ];
  
  const positions = ['KL', 'SB', 'STP', 'SGB', 'OS', 'DOS', 'SOF', 'SAF', 'F'];
  const players: Player[] = [];
  
  for (let i = 0; i < playerNames.length; i++) {
    const jerseyNumber = i + 1;
    const position = positions[i % positions.length];
    
    const player = await storage.createPlayer({
      name: playerNames[i],
      position,
      jerseyNumber,
      mood: 50 + Math.floor(Math.random() * 30), // Random initial mood 50-80
      teamId
    });
    
    players.push(player);
  }
  
  return players;
}

// Helper to track tactical decisions for title
async function incrementTacticalDecisions(discordId: string): Promise<number> {
  const user = await storage.getUserByDiscordId(discordId);
  if (!user) return 0;
  
  // Get current count or initialize
  const tacticalDecisions = (user.seasonRecords as any)?.tacticalDecisions || 0;
  const updatedRecords = {
    ...(user.seasonRecords as any || {}),
    tacticalDecisions: tacticalDecisions + 1
  };
  
  await storage.updateUser(user.id, { seasonRecords: updatedRecords });
  return tacticalDecisions + 1;
}
