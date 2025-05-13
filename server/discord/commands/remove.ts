import { 
  Message, 
  MessageEmbed, 
  MessageActionRow, 
  MessageButton,
  MessageSelectMenu
} from 'discord.js';
import { storage } from '../../storage';
import { User, Player } from '@shared/schema';
import { checkUserTeam, createTutorialEmbed } from '../utils/helpers';

// Remove player command
export const removeCommand = {
  name: 'remove',
  description: 'Takımınızdan oyuncu çıkarma komutu',
  usage: '.h remove [oyuncu adı/forma numarası]',
  execute: async (message: Message, args: string[]) => {
    try {
      // Get user
      const user = await storage.getUserByDiscordId(message.author.id);
      
      if (!user) {
        return message.reply('Oyunda henüz bir profil oluşturmamışsınız. Takım seçmek için `.h takim` komutunu kullanabilirsiniz.');
      }
      
      // Check if user has a team
      const hasTeam = await checkUserTeam(user, message);
      if (!hasTeam) return;
      
      // Get team
      const team = await storage.getTeamByName(user.currentTeam as string);
      if (!team) {
        return message.reply('Takımınız bulunamadı. Lütfen `.h takim` komutu ile tekrar takım seçiniz.');
      }
      
      // Get players for this team
      const players = await storage.getPlayersByTeamId(team.id);
      
      if (!players || players.length === 0) {
        return message.reply(`${team.name} takımınızda henüz oyuncu bulunmamaktadır.`);
      }
      
      // If no args, show player selection
      if (!args.length || args.length === 0) {
        return showPlayerSelection(message, players, team.name);
      }
      
      // Get player name or jersey number from args
      const playerQuery = args.join(' ').trim();
      let player: Player | undefined;
      
      // Check if the query is a number (jersey number)
      const jerseyNumber = parseInt(playerQuery);
      
      if (!isNaN(jerseyNumber)) {
        player = players.find(p => p.jerseyNumber === jerseyNumber);
      } else {
        player = players.find(p => p.name.toLowerCase().includes(playerQuery.toLowerCase()));
      }
      
      if (!player) {
        return message.reply(`"${playerQuery}" ile eşleşen bir oyuncu bulunamadı. Lütfen doğru oyuncu adı veya forma numarası giriniz.`);
      }
      
      // Confirm removal
      await confirmPlayerRemoval(message, player, team.name);
      
    } catch (error) {
      console.error('Remove komutu hatası:', error);
      message.reply('Oyuncu çıkarma işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.');
    }
  }
};

// Function to show player selection UI
async function showPlayerSelection(message: Message, players: Player[], teamName: string) {
  // Group players by position
  const goalkeepers = players.filter(p => p.position === 'Kaleci');
  const defenders = players.filter(p => p.position === 'Defans');
  const midfielders = players.filter(p => p.position === 'Orta Saha');
  const forwards = players.filter(p => p.position === 'Forvet');
  
  // Create embed
  const selectionEmbed = new MessageEmbed()
    .setColor('#e74c3c')
    .setTitle(`${teamName} - Oyuncu Çıkarma`)
    .setDescription(`Çıkarmak istediğiniz oyuncuyu seçin veya \`.h remove [oyuncu adı/forma numarası]\` komutu ile direkt olarak belirtin.`)
    .setFooter({ text: 'Not: Oyuncuyu çıkardıktan sonra geri getiremezsiniz!' });
    
  // Create select menu options for each position group
  const options: { label: string; value: string; description: string; emoji?: string }[] = [];
  
  // Add players to options
  const addPlayersToOptions = (positionPlayers: Player[], emoji: string) => {
    positionPlayers.forEach(player => {
      options.push({
        label: `${player.name} (${player.jerseyNumber})`,
        value: `${player.id}`,
        description: `${player.position}`,
        emoji: emoji
      });
    });
  };
  
  // Add players from each position
  addPlayersToOptions(goalkeepers, '🧤');
  addPlayersToOptions(defenders, '🛡️');
  addPlayersToOptions(midfielders, '🏃');
  addPlayersToOptions(forwards, '⚽');
  
  // Create select menu
  const selectRow = new MessageActionRow()
    .addComponents(
      new MessageSelectMenu()
        .setCustomId('remove_player_select')
        .setPlaceholder('Çıkarmak istediğiniz oyuncuyu seçin')
        .addOptions(options.slice(0, 25)) // Discord only allows max 25 options
    );
  
  // Send the selection message
  const selectionMessage = await message.reply({
    embeds: [selectionEmbed],
    components: [selectRow]
  });
  
  // Create collector for selection
  const collector = selectionMessage.createMessageComponentCollector({
    filter: i => i.user.id === message.author.id && i.customId === 'remove_player_select',
    time: 60000, // 1 minute timeout
    max: 1
  });
  
  // Handle collector events
  collector.on('collect', async (interaction) => {
    if (interaction.isSelectMenu()) {
      const selectedPlayerId = parseInt(interaction.values[0]);
      const selectedPlayer = players.find(p => p.id === selectedPlayerId);
      
      if (selectedPlayer) {
        await interaction.deferUpdate();
        await confirmPlayerRemoval(message, selectedPlayer, teamName);
      }
    }
  });
  
  collector.on('end', collected => {
    if (collected.size === 0) {
      selectionMessage.edit({
        embeds: [selectionEmbed],
        components: [] // Remove components
      });
    }
  });
}

// Function to confirm player removal with buttons
async function confirmPlayerRemoval(message: Message, player: Player, teamName: string) {
  const confirmEmbed = new MessageEmbed()
    .setColor('#e74c3c')
    .setTitle(`Oyuncu Çıkarma Onayı`)
    .setDescription(`${teamName} takımından **${player.name}** (#${player.jerseyNumber}, ${player.position}) oyuncusunu çıkarmak istediğinize emin misiniz?`)
    .setFooter({ text: 'Bu işlem geri alınamaz!' });
  
  // Create confirm/cancel buttons
  const buttonRow = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId('confirm_remove')
        .setLabel('Çıkar')
        .setStyle('DANGER')
        .setEmoji('❌'),
      new MessageButton()
        .setCustomId('cancel_remove')
        .setLabel('İptal')
        .setStyle('SECONDARY')
        .setEmoji('↩️')
    );
  
  // Send confirmation message
  const confirmMessage = await message.reply({
    embeds: [confirmEmbed],
    components: [buttonRow]
  });
  
  // Create collector for buttons
  const collector = confirmMessage.createMessageComponentCollector({
    filter: i => i.user.id === message.author.id,
    time: 30000, // 30 seconds timeout
    max: 1
  });
  
  // Handle collector events
  collector.on('collect', async (interaction) => {
    if (interaction.isButton()) {
      if (interaction.customId === 'confirm_remove') {
        // Remove the player
        try {
          // Oyuncuyu veritabanından tamamen sil
          await storage.deletePlayer(player.id);
          
          const successEmbed = new MessageEmbed()
            .setColor('#2ecc71')
            .setTitle(`Oyuncu Çıkarıldı`)
            .setDescription(`**${player.name}** (#${player.jerseyNumber}, ${player.position}) ${teamName} takımından başarıyla çıkarıldı.`)
            .setFooter({ text: `Takım kadronuzu görüntülemek için .h takımım komutunu kullanın` });
          
          await interaction.update({
            embeds: [successEmbed],
            components: []
          });
        } catch (error) {
          console.error('Oyuncu çıkarma hatası:', error);
          await interaction.update({
            content: 'Oyuncu çıkarma işlemi sırasında bir hata oluştu.',
            embeds: [],
            components: []
          });
        }
      } else if (interaction.customId === 'cancel_remove') {
        // Cancel the removal
        await interaction.update({
          content: 'Oyuncu çıkarma işlemi iptal edildi.',
          embeds: [],
          components: []
        });
      }
    }
  });
  
  collector.on('end', collected => {
    if (collected.size === 0) {
      confirmMessage.edit({
        content: 'Oyuncu çıkarma işlemi için süre doldu.',
        embeds: [],
        components: []
      });
    }
  });
}