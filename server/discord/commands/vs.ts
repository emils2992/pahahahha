import { 
  Message, 
  MessageEmbed, 
  MessageActionRow, 
  MessageButton,
  MessageComponentInteraction,
  User as DiscordUser
} from 'discord.js';
import { storage } from '../../storage';
import { User } from '@shared/schema';
import { createTutorialEmbed } from '../utils/helpers';

// Penalty shootout game command
export const vsCommand = {
  name: 'vs',
  description: 'Penaltı atış yarışması',
  usage: '.yap vs @kullanıcı',
  execute: async (message: Message, args: string[]) => {
    try {
      // Get the opponent from mentions
      const opponent = message.mentions.users.first();
      
      if (!opponent) {
        return message.reply({
          embeds: [
            createTutorialEmbed(
              'Penaltı Atışı Yardımı',
              '**Kullanım:** `.yap vs @kullanıcı`\n\n' +
              '**Örnek:** `.yap vs @EmilSWD`\n\n' +
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
async function startPenaltyShootout(message: Message, challenger: DiscordUser, opponent: DiscordUser) {
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
async function runPenaltyShootout(message: Message, player1: DiscordUser, player2: DiscordUser) {
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
    history: []
  };
  
  // Start the game loop
  await playRound(message, player1, player2, gameState);
}

// Function to play a single round of penalties
async function playRound(message: Message, player1: DiscordUser, player2: DiscordUser, gameState: any) {
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
    .addField('Süre', '⏱️ Her oyuncunun seçim yapması için 10 saniye vardır!');
  
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
  
  // Send shooter message
  const shooterMessage = await shooter.send({
    embeds: [
      new MessageEmbed()
        .setColor('#3498db')
        .setTitle('⚽ Penaltı Atışı')
        .setDescription('Penaltı atışınızı nereye yapacaksınız?')
        .setFooter({ text: 'Seçiminizi 10 saniye içinde yapın!' })
    ],
    components: [shooterRow]
  }).catch(error => {
    // Handle DM closed error
    console.error('Shooter DM error:', error);
    message.channel.send(`**${shooter.username}** lütfen özel mesajlarınızı açın!`);
    return null;
  });
  
  // Send goalkeeper message
  const goalkeeperMessage = await goalkeeper.send({
    embeds: [
      new MessageEmbed()
        .setColor('#3498db')
        .setTitle('🧤 Kaleci Hamlesi')
        .setDescription('Penaltıyı kurtarmak için hangi yöne atlayacaksınız?')
        .setFooter({ text: 'Seçiminizi 10 saniye içinde yapın!' })
    ],
    components: [goalkeeperRow]
  }).catch(error => {
    // Handle DM closed error
    console.error('Goalkeeper DM error:', error);
    message.channel.send(`**${goalkeeper.username}** lütfen özel mesajlarınızı açın!`);
    return null;
  });
  
  // Abort game if either DM fails
  if (!shooterMessage || !goalkeeperMessage) {
    await message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor('#e74c3c')
          .setTitle('❌ Oyun İptal Edildi')
          .setDescription('Özel mesajlar kapalı olduğu için oyun iptal edildi. Lütfen özel mesajlarınızı açıp tekrar deneyin.')
      ]
    });
    return;
  }
  
  // Send waiting message to main channel
  const waitingMessage = await message.channel.send({
    embeds: [roundEmbed]
  });
  
  // Create collectors for both players
  const shooterCollector = shooterMessage.createMessageComponentCollector({
    filter: (i) => i.user.id === shooter.id,
    time: 10000,
    max: 1
  });
  
  const goalkeeperCollector = goalkeeperMessage.createMessageComponentCollector({
    filter: (i) => i.user.id === goalkeeper.id,
    time: 10000,
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
    
    // Check if we can process the result
    if (gameState.goalkeeperChoice) {
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
    
    // Check if we can process the result
    if (gameState.shooterChoice) {
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
      
      // Check if we can process the result
      if (gameState.goalkeeperChoice) {
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
      
      // Check if we can process the result
      if (gameState.shooterChoice) {
        await processRoundResult(message, player1, player2, gameState, waitingMessage);
      }
    }
  });
}

// Function to process the round result
async function processRoundResult(message: Message, player1: DiscordUser, player2: DiscordUser, gameState: any, waitingMessage: Message) {
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
    gameState.scores[shooter.id]++;
  }
  
  // Create result embed
  const resultEmbed = new MessageEmbed()
    .setColor(isGoal ? '#2ecc71' : '#e74c3c')
    .setTitle(isGoal ? '⚽ GOL!' : '🧤 KURTARIŞ!')
    .setDescription(
      isGoal 
        ? `**${shooter.username}** topu ${getDirectionEmoji(gameState.shooterChoice)} **${gameState.shooterChoice}**a gönderdi!\n` +
          `**${goalkeeper.username}** ${getDirectionEmoji(gameState.goalkeeperChoice)} **${gameState.goalkeeperChoice}**a atladı fakat kurtaramadı!`
        : `**${shooter.username}** topu ${getDirectionEmoji(gameState.shooterChoice)} **${gameState.shooterChoice}**a gönderdi!\n` +
          `**${goalkeeper.username}** harika bir kurtarış yaptı! ${getDirectionEmoji(gameState.goalkeeperChoice)} **${gameState.goalkeeperChoice}**a atlayarak kurtardı!`
    )
    .addField('Skor', `**${player1.username}** ${gameState.scores[player1.id]} - ${gameState.scores[player2.id]} **${player2.username}**`)
    .setImage(isGoal ? 'https://media.giphy.com/media/kGD0eFHPiEPgiGPyDf/giphy.gif' : 'https://media.giphy.com/media/e5amHniqVCLQMHgyef/giphy.gif');
  
  // Update the main message
  await waitingMessage.edit({
    embeds: [resultEmbed]
  });
  
  // Check if the game should continue
  if (gameState.isGoldenGoal && isGoal) {
    // Game over, golden goal scored
    await endGame(message, player1, player2, gameState, shooter);
    return;
  }
  
  // Switch roles for next round
  const tempShooter = gameState.currentShooter;
  gameState.currentShooter = gameState.currentGoalkeeper;
  gameState.currentGoalkeeper = tempShooter;
  
  // Reset choices
  gameState.shooterChoice = '';
  gameState.goalkeeperChoice = '';
  
  // Check if we need to move to the next round
  if (gameState.currentShooter === player1.id) {
    gameState.currentRound++;
  }
  
  // Check if the game should end
  if (gameState.currentRound > gameState.maxRounds) {
    // Check if we have a winner
    if (gameState.scores[player1.id] !== gameState.scores[player2.id]) {
      // We have a winner
      const winner = gameState.scores[player1.id] > gameState.scores[player2.id] ? player1 : player2;
      await endGame(message, player1, player2, gameState, winner);
    } else {
      // It's a tie, go to golden goal
      gameState.isGoldenGoal = true;
      gameState.currentRound = 6; // Just for display
      
      // Send message about golden goal
      await message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor('#f39c12')
            .setTitle('🏆 ALTIN GOL!')
            .setDescription(
              `Beraberlik! Seri 5-5 sonrasında altın gole gidiliyor!\n\n` +
              `İlk golü atan kazanır!`
            )
            .setFooter({ text: 'Hazırlanın...' })
        ]
      });
      
      // Small delay before next round
      setTimeout(async () => {
        await playRound(message, player1, player2, gameState);
      }, 3000);
    }
  } else {
    // Small delay before next round
    setTimeout(async () => {
      await playRound(message, player1, player2, gameState);
    }, 3000);
  }
}

// Function to end the game and announce winner
async function endGame(message: Message, player1: DiscordUser, player2: DiscordUser, gameState: any, winner: DiscordUser) {
  const score1 = gameState.scores[player1.id];
  const score2 = gameState.scores[player2.id];
  
  // Create summary embed
  const summaryEmbed = new MessageEmbed()
    .setColor('#f1c40f')
    .setTitle('🏆 Penaltı Yarışması Sonucu')
    .setDescription(`**${winner.username}** yarışmayı kazandı!`)
    .addField('Final Skor', `**${player1.username}** ${score1} - ${score2} **${player2.username}**`)
    .setFooter({ text: `${gameState.isGoldenGoal ? 'Altın gol kuralıyla kazandı!' : ''}` });
  
  // Add match history
  const historyText = gameState.history.map((h: any) => {
    const roundShooter = h.shooter === player1.id ? player1.username : player2.username;
    const roundResult = h.isGoal ? '⚽ GOL' : '❌ KAÇIRDI';
    return `**Raund ${h.round}:** ${roundShooter} - ${roundResult} (${getDirectionEmoji(h.shooterChoice)} vs ${getDirectionEmoji(h.goalkeeperChoice)})`;
  }).join('\n');
  
  summaryEmbed.addField('Maç Özeti', historyText);
  
  // Add congratulations image
  summaryEmbed.setImage('https://media.giphy.com/media/26tPgjwtswcdUMrMQ/giphy.gif');
  
  // Send the summary
  await message.channel.send({
    embeds: [summaryEmbed]
  });
  
  // Add some points to the winner
  try {
    const user = await storage.getUserByDiscordId(winner.id);
    if (user) {
      await storage.addUserPoints(winner.id, 5);
      await storage.addUserTitle(winner.id, "Penaltı Kralı");
      
      await message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor('#2ecc71')
            .setTitle('🎉 Ödül Kazanıldı')
            .setDescription(`**${winner.username}** penaltı yarışmasını kazandı ve 5 puan kazandı!`)
            .addField('Yeni Unvan', '👑 Penaltı Kralı')
        ]
      });
    }
  } catch (error) {
    console.error('Winner reward error:', error);
  }
}

// Helper functions
function getDirectionEmoji(direction: string) {
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