const { 
  Message, 
  MessageEmbed, 
  MessageActionRow, 
  MessageButton
} = require('discord.js');
const { storage } = require('../../storage');
const { createTutorialEmbed } = require('../utils/helpers');

// Penalty shootout game command
const vsCommand = {
  name: 'vs',
  description: 'Penaltı atış yarışması',
  usage: '.vs @kullanıcı',
  execute: async (message, args) => {
    try {
      // Get the opponent from mentions
      const opponent = message.mentions.users.first();
      
      if (!opponent) {
        return message.reply({
          embeds: [
            createTutorialEmbed(
              'Penaltı Atışı Yardımı',
              '**Kullanım:** `.vs @kullanıcı`\n\n' +
              '**Örnek:** `.vs @EmilSWD`\n\n' +
              '**Açıklama:** Bir başka kullanıcıyla 5 atışlık penaltı yarışması yaparsınız.\n' +
              '10 saniye içinde kaleciyi veya atışı nereye yapacağınızı seçersiniz.\n' +
              'Berabere kalınırsa altın gol kuralı uygulanır.'
            )
          ]
        });
      }
      
      // Cannot challenge yourself
      if (opponent.id === message.author.id) {
        return message.reply('Kendinize karşı penaltı yarışması yapamazsınız!');
      }
      
      // Check if the opponent is a bot
      if (opponent.bot) {
        return message.reply('Botlara karşı penaltı yarışması yapamazsınız!');
      }

      // Get user data
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

      // Start the penalty shootout game
      await startPenaltyShootout(message, message.author, opponent);
      
    } catch (error) {
      console.error('Penaltı yarışması komutu hatası:', error);
      message.reply('Penaltı yarışması başlatılırken bir hata oluştu.');
    }
  }
};

// Function to start the penalty shootout
async function startPenaltyShootout(message, challenger, opponent) {
  // Create the welcome embed
  const welcomeEmbed = new MessageEmbed()
    .setColor('#3498db')
    .setTitle('⚽ Penaltı Yarışması')
    .setDescription(`**${challenger.username}** tarafından **${opponent.username}**'a penaltı yarışması daveti gönderildi!`)
    .addField('Kurallar', 
      '• Her oyuncu 5 penaltı kullanacak\n' +
      '• 10 saniye içinde seçim yapılmalı\n' +
      '• Kaleci, atış yönünü bilemiyor\n' +
      '• Beraberlikte altın gol geçerli')
    .addField('Nasıl Oynanır', 
      '• Penaltı atışı: Sol, Orta veya Sağ seçin\n' +
      '• Kaleci: Kurtarmak için Sol, Orta veya Sağ seçin')
    .setImage('https://media.giphy.com/media/kG8qCFtj61Oi79UW8J/giphy.gif')
    .setFooter({ text: 'Kabul etmek için aşağıdaki butona tıklayın' });
  
  // Create accept/decline buttons
  const actionRow = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId('accept_penalty')
        .setLabel('Kabul Et')
        .setStyle('SUCCESS')
        .setEmoji('⚽'),
      new MessageButton()
        .setCustomId('decline_penalty')
        .setLabel('Reddet')
        .setStyle('DANGER')
        .setEmoji('❌')
    );
  
  // Send the invitation
  const inviteMessage = await message.channel.send({
    embeds: [welcomeEmbed],
    components: [actionRow]
  });
  
  // Create a collector for the buttons
  const collector = inviteMessage.createMessageComponentCollector({
    filter: (interaction) => {
      // Only the opponent can respond to the invitation
      return interaction.user.id === opponent.id;
    },
    time: 60000, // 1 minute timeout
    max: 1
  });
  
  // Handle button interactions
  collector.on('collect', async (interaction) => {
    if (interaction.customId === 'accept_penalty') {
      await interaction.update({
        embeds: [
          new MessageEmbed()
            .setColor('#3498db')
            .setTitle('⚽ Penaltı Yarışması')
            .setDescription(`**${opponent.username}** daveti kabul etti! Penaltı yarışması başlıyor...`)
            .setFooter({ text: 'Oyun hazırlanıyor, lütfen bekleyin...' })
        ],
        components: []
      });
      
      // Start the actual game
      await runPenaltyShootout(message, challenger, opponent);
    } else if (interaction.customId === 'decline_penalty') {
      await interaction.update({
        embeds: [
          new MessageEmbed()
            .setColor('#e74c3c')
            .setTitle('❌ Davet Reddedildi')
            .setDescription(`**${opponent.username}** penaltı yarışması davetini reddetti!`)
        ],
        components: []
      });
    }
  });
  
  // Handle timeout
  collector.on('end', async (collected) => {
    if (collected.size === 0) {
      await inviteMessage.edit({
        embeds: [
          new MessageEmbed()
            .setColor('#e74c3c')
            .setTitle('⏰ Davet Süresi Doldu')
            .setDescription(`**${opponent.username}** penaltı yarışması davetine cevap vermedi!`)
        ],
        components: []
      });
    }
  });
}

// Function to run the actual penalty shootout game
async function runPenaltyShootout(message, player1, player2) {
  // Game state
  const gameState = {
    currentRound: 1,
    maxRounds: 5,
    isGoldenGoal: false,
    scores: {
      [player1.id]: 0,
      [player2.id]: 0
    },
    currentShooter: player1.id,
    currentGoalkeeper: player2.id,
    shooterChoice: '',
    goalkeeperChoice: '',
    history: [],
    isProcessing: false // İşlem durumunu takip etmek için flag
  };
  
  // Start the game loop
  await playRound(message, player1, player2, gameState);
}

// Function to play a single round of penalties
async function playRound(message, player1, player2, gameState) {
  // Determine current players
  const shooter = gameState.currentShooter === player1.id ? player1 : player2;
  const goalkeeper = gameState.currentGoalkeeper === player1.id ? player1 : player2;
  
  // Create round embed
  const roundTitle = gameState.isGoldenGoal ? '🏆 ALTIN GOL' : `RAUND ${gameState.currentRound}/5`;
  const roundEmbed = new MessageEmbed()
    .setColor('#3498db')
    .setTitle(`⚽ Penaltı Yarışması - ${roundTitle}`)
    .setDescription(
      `**${shooter.username}** penaltı atıyor...\n` +
      `**${goalkeeper.username}** kaleyi koruyor...\n\n` +
      `**Skor:** ${player1.username} ${gameState.scores[player1.id]} - ${gameState.scores[player2.id]} ${player2.username}`
    )
    .setImage('https://media.giphy.com/media/Tcxhx0GJ5DBqYrZgB5/giphy.gif')
    .addField('Süre', '⏱️ Her oyuncunun seçim yapması için 15 saniye vardır!')
    .addField('📱 Özel Mesaj Bilgisi', '⚠️ Lütfen botun size gönderdiği özel mesajlara (DM) bakın! Seçimlerinizi orada yapmalısınız!');
  
  // Create penalty buttons for shooter
  const shooterRow = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId('shoot_left')
        .setLabel('Sol')
        .setStyle('PRIMARY')
        .setEmoji('↖️'),
      new MessageButton()
        .setCustomId('shoot_center')
        .setLabel('Orta')
        .setStyle('PRIMARY')
        .setEmoji('⬆️'),
      new MessageButton()
        .setCustomId('shoot_right')
        .setLabel('Sağ')
        .setStyle('PRIMARY')
        .setEmoji('↗️')
    );
  
  // Create goalkeeper buttons
  const goalkeeperRow = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId('save_left')
        .setLabel('Sol')
        .setStyle('SECONDARY')
        .setEmoji('↖️'),
      new MessageButton()
        .setCustomId('save_center')
        .setLabel('Orta')
        .setStyle('SECONDARY')
        .setEmoji('⬆️'),
      new MessageButton()
        .setCustomId('save_right')
        .setLabel('Sağ')
        .setStyle('SECONDARY')
        .setEmoji('↗️')
    );
  
  // Reply with interaction message to channel, use ephemeral to ensure privacy
  await message.reply({
    content: `⚽ **${shooter.username}** ve **${goalkeeper.username}** arasında penaltı atışları başladı!`,
    components: []
  });
  
  // Send shooter message as a DM (private message)
  const shooterEmbed = new MessageEmbed()
    .setColor('#3498db')
    .setTitle('⚽ Penaltı Atışı')
    .setDescription(`**${shooter.username}**, penaltı atışınızı nereye yapacaksınız?`)
    .setFooter({ text: 'Seçiminizi 10 saniye içinde yapın!' });
  
  const shooterDM = await shooter.send({
    embeds: [shooterEmbed],
    components: [shooterRow]
  }).catch(async (error) => {
    // If DM fails, notify in channel and use a fallback
    await message.channel.send({
      content: `<@${shooter.id}>, özel mesajlarınız kapalı olduğu için size mesaj gönderemiyorum! Lütfen ayarlarınızı değiştirin ve tekrar deneyin.`
    });
    return null;
  });
  
  // Create a fallback message in channel if DM fails
  const shooterMessage = shooterDM || await message.channel.send({
    content: `<@${shooter.id}>`,
    embeds: [shooterEmbed],
    components: [shooterRow]
  });
  
  // Send goalkeeper message as a DM (private message)
  const goalkeeperEmbed = new MessageEmbed()
    .setColor('#3498db')
    .setTitle('🧤 Kaleci Hamlesi')
    .setDescription(`**${goalkeeper.username}**, penaltıyı kurtarmak için hangi yöne atlayacaksınız?`)
    .setFooter({ text: 'Seçiminizi 10 saniye içinde yapın!' });
  
  const goalkeeperDM = await goalkeeper.send({
    embeds: [goalkeeperEmbed],
    components: [goalkeeperRow]
  }).catch(async (error) => {
    // If DM fails, notify in channel and use a fallback
    await message.channel.send({
      content: `<@${goalkeeper.id}>, özel mesajlarınız kapalı olduğu için size mesaj gönderemiyorum! Lütfen ayarlarınızı değiştirin ve tekrar deneyin.`
    });
    return null;
  });
  
  // Create a fallback message in channel if DM fails
  const goalkeeperMessage = goalkeeperDM || await message.channel.send({
    content: `<@${goalkeeper.id}>`,
    embeds: [goalkeeperEmbed],
    components: [goalkeeperRow]
  });
  
  // Send waiting message to main channel
  const waitingMessage = await message.channel.send({
    embeds: [roundEmbed]
  });
  
  // Create collectors for both players with 15 seconds timeout
  const shooterCollector = shooterMessage.createMessageComponentCollector({
    filter: (i) => i.user.id === shooter.id,
    time: 15000, // 15 seconds
    max: 1
  });
  
  const goalkeeperCollector = goalkeeperMessage.createMessageComponentCollector({
    filter: (i) => i.user.id === goalkeeper.id,
    time: 15000, // 15 seconds
    max: 1
  });
  
  // Handle shooter choice
  shooterCollector.on('collect', async (interaction) => {
    const choice = interaction.customId.replace('shoot_', '');
    gameState.shooterChoice = choice;
    
    await interaction.update({
      embeds: [
        new MessageEmbed()
          .setColor('#3498db')
          .setTitle('⚽ Seçim Yapıldı')
          .setDescription(`Penaltıyı ${getDirectionEmoji(choice)} **${choice}**a atmayı seçtiniz.`)
          .setFooter({ text: 'Diğer oyuncunun seçimi bekleniyor...' })
      ],
      components: []
    });
    
    // Check if we can process the result and it's not already being processed
    if (gameState.goalkeeperChoice && !gameState.isProcessing) {
      gameState.isProcessing = true;
      await processRoundResult(message, player1, player2, gameState, waitingMessage);
    }
  });
  
  // Handle goalkeeper choice
  goalkeeperCollector.on('collect', async (interaction) => {
    const choice = interaction.customId.replace('save_', '');
    gameState.goalkeeperChoice = choice;
    
    await interaction.update({
      embeds: [
        new MessageEmbed()
          .setColor('#3498db')
          .setTitle('🧤 Seçim Yapıldı')
          .setDescription(`${getDirectionEmoji(choice)} **${choice}**a atlayarak kurtarmayı seçtiniz.`)
          .setFooter({ text: 'Diğer oyuncunun seçimi bekleniyor...' })
      ],
      components: []
    });
    
    // Check if we can process the result and it's not already being processed
    if (gameState.shooterChoice && !gameState.isProcessing) {
      gameState.isProcessing = true;
      await processRoundResult(message, player1, player2, gameState, waitingMessage);
    }
  });
  
  // Handle timeouts
  shooterCollector.on('end', async (collected) => {
    if (collected.size === 0) {
      gameState.shooterChoice = getRandomDirection();
      await shooterMessage.edit({
        embeds: [
          new MessageEmbed()
            .setColor('#e74c3c')
            .setTitle('⏰ Süre Doldu')
            .setDescription(`Süre dolduğu için rastgele bir seçim yapıldı: ${getDirectionEmoji(gameState.shooterChoice)} **${gameState.shooterChoice}**`)
        ],
        components: []
      });
      
      // Check if we can process the result and it's not already being processed
      if (gameState.goalkeeperChoice && !gameState.isProcessing) {
        gameState.isProcessing = true;
        await processRoundResult(message, player1, player2, gameState, waitingMessage);
      }
    }
  });
  
  goalkeeperCollector.on('end', async (collected) => {
    if (collected.size === 0) {
      gameState.goalkeeperChoice = getRandomDirection();
      await goalkeeperMessage.edit({
        embeds: [
          new MessageEmbed()
            .setColor('#e74c3c')
            .setTitle('⏰ Süre Doldu')
            .setDescription(`Süre dolduğu için rastgele bir seçim yapıldı: ${getDirectionEmoji(gameState.goalkeeperChoice)} **${gameState.goalkeeperChoice}**`)
        ],
        components: []
      });
      
      // Check if we can process the result and it's not already being processed
      if (gameState.shooterChoice && !gameState.isProcessing) {
        gameState.isProcessing = true;
        await processRoundResult(message, player1, player2, gameState, waitingMessage);
      }
    }
  });
}

// Function to process the round result
async function processRoundResult(message, player1, player2, gameState, waitingMessage) {
  // Determine if it's a goal or save
  const isGoal = gameState.shooterChoice !== gameState.goalkeeperChoice;
  
  // Update game state
  const shooter = gameState.currentShooter === player1.id ? player1 : player2;
  const goalkeeper = gameState.currentGoalkeeper === player1.id ? player1 : player2;
  
  // Record history
  gameState.history.push({
    round: gameState.currentRound,
    shooter: shooter.id,
    goalkeeper: goalkeeper.id,
    shooterChoice: gameState.shooterChoice,
    goalkeeperChoice: gameState.goalkeeperChoice,
    isGoal: isGoal
  });
  
  // Update score
  if (isGoal) {
    // Penaltı gol oldu, skoru güncelle
    gameState.scores[shooter.id]++;
    
    // Güvenlik kontrolü - altın gol dışında maksimum 5 gol atılabilir
    if (!gameState.isGoldenGoal && gameState.scores[shooter.id] > 5) {
      console.log(`Tur: ${gameState.currentRound}, Bug önlendi: ${shooter.username} için skor 5'e sabitlendi`);
      gameState.scores[shooter.id] = 5;
    }
  }
  
  // Create result embed for channel
  const channelResultEmbed = new MessageEmbed()
    .setColor(isGoal ? '#2ecc71' : '#e74c3c')
    .setTitle(isGoal ? '⚽ GOL!' : '🧤 KURTARIŞ!')
    .setDescription(
      isGoal 
        ? `**${shooter.username}** penaltıyı gole çevirdi!\n` +
          `**${goalkeeper.username}** kurtarış yapamadı!`
        : `**${shooter.username}** penaltıyı kaçırdı!\n` +
          `**${goalkeeper.username}** harika bir kurtarış yaptı!`
    )
    .addField('Skor', `**${player1.username}** ${gameState.scores[player1.id]} - ${gameState.scores[player2.id]} **${player2.username}**`)
    .addField('Detaylar', 
      `Atış: ${getDirectionEmoji(gameState.shooterChoice)} **${gameState.shooterChoice}**\n` +
      `Kaleci: ${getDirectionEmoji(gameState.goalkeeperChoice)} **${gameState.goalkeeperChoice}**`
    );
  
  // Update the waiting message with result
  await waitingMessage.edit({ embeds: [channelResultEmbed] });
  
  // Wait 3 seconds before continuing
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Check if the game is over
  if (gameState.isGoldenGoal && isGoal) {
    // Altın golde, gol atan kazanır
    const winner = shooter;
    await endGame(message, player1, player2, gameState, winner);
    return;
  }
  
  // Check if regular rounds are finished
  if (gameState.currentRound >= gameState.maxRounds) {
    // Switch shooter and goalkeeper for next round
    const temp = gameState.currentShooter;
    gameState.currentShooter = gameState.currentGoalkeeper;
    gameState.currentGoalkeeper = temp;
    
    // Both players completed their 5 shots
    if (gameState.currentShooter === player1.id) {
      // All rounds completed, check winner
      if (gameState.scores[player1.id] > gameState.scores[player2.id]) {
        await endGame(message, player1, player2, gameState, player1);
      } else if (gameState.scores[player2.id] > gameState.scores[player1.id]) {
        await endGame(message, player1, player2, gameState, player2);
      } else {
        // Scores are tied, go to golden goal
        gameState.isGoldenGoal = true;
        gameState.currentRound = 1; // Reset for golden goal
        
        // Send golden goal announcement
        await message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor('#FFD700')
              .setTitle('🏆 BERABERLIK - ALTIN GOL BAŞLIYOR!')
              .setDescription(
                `Skor eşit! **${gameState.scores[player1.id]}-${gameState.scores[player2.id]}**\n\n` +
                `Altın gol kuralı başlıyor. İlk gol atan kazanır!`
              )
          ]
        });
        
        // Wait 2 seconds before starting golden goal
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Start next round (golden goal)
        await playRound(message, player1, player2, gameState);
      }
    } else {
      // Player 2 just completed their 5th shot, player 1 still needs to complete theirs
      gameState.currentRound++;
      
      // Reset choices for next round
      gameState.shooterChoice = '';
      gameState.goalkeeperChoice = '';
      gameState.isProcessing = false;
      
      // Start next round
      await playRound(message, player1, player2, gameState);
    }
  } else {
    // Regular progression - switch shooter and goalkeeper
    const temp = gameState.currentShooter;
    gameState.currentShooter = gameState.currentGoalkeeper;
    gameState.currentGoalkeeper = temp;
    
    // Only increment round when back to first player
    if (gameState.currentShooter === player1.id) {
      gameState.currentRound++;
    }
    
    // Reset choices for next round
    gameState.shooterChoice = '';
    gameState.goalkeeperChoice = '';
    gameState.isProcessing = false;
    
    // Start next round
    await playRound(message, player1, player2, gameState);
  }
}

// Function to end the game and declare winner
async function endGame(message, player1, player2, gameState, winner) {
  try {
    // End of game embed
    const endEmbed = new MessageEmbed()
      .setColor('#FFD700')
      .setTitle('🏆 PENALTI YARIŞMASI SONA ERDİ')
      .setDescription(`**${winner.username}** yarışmayı kazandı!`)
      .addField('Son Skor', `**${player1.username}** ${gameState.scores[player1.id]} - ${gameState.scores[player2.id]} **${player2.username}**`)
      .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDhicTVuOTJwanByajVtdWY2b2h3MHdwNXIyMHNtbGdzNW5weWd3eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/YQADjCnf7TKWIxOxHH/giphy.gif')
      .setFooter({ text: 'Futbol RP Bot - Penaltı Yarışması' });
    
    // Send end message
    await message.channel.send({ embeds: [endEmbed] });
    
    // Award points to winner
    // First get user data from storage
    const userData = await storage.getUserByDiscordId(winner.id);
    
    if (userData) {
      // Add delay for experience
      setTimeout(async () => {
        // Give points to winner
        await storage.addUserPoints(winner.id, 5);
        
        // Send reward message with delay
        setTimeout(async () => {
          await message.channel.send({
            content: `🏆 **${winner.username}** penaltı yarışmasını kazandığı için **5 puan** kazandı!`
          });
        }, 2000); // 2 second delay for points message
      }, 2000); // 2 second delay before giving points
    }
  } catch (error) {
    console.error('Winner reward error:', error);
  }
}

// Helper functions
function getDirectionEmoji(direction) {
  switch(direction) {
    case 'left': return '↖️';
    case 'center': return '⬆️';
    case 'right': return '↗️';
    default: return '❓';
  }
}

function getRandomDirection() {
  const directions = ['left', 'center', 'right'];
  return directions[Math.floor(Math.random() * directions.length)];
}

module.exports = {
  vsCommand
};