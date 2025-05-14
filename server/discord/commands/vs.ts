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
  usage: '.vs @kullanıcı',
  execute: async (message: Message, args: string[]) => {
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
    history: [],
    isProcessing: false // İşlem durumunu takip etmek için flag
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
    time: 15000, // 15 saniye
    max: 1
  });
  
  const goalkeeperCollector = goalkeeperMessage.createMessageComponentCollector({
    filter: (i) => i.user.id === goalkeeper.id,
    time: 15000, // 15 saniye
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
    // Penaltı gol oldu, skoru güncelle
    gameState.scores[shooter.id]++;
    
    // Güvenlik kontrolü - altın gol dışında maksimum 5 gol atılabilir
    if (!gameState.isGoldenGoal && gameState.scores[shooter.id] > 5) {
      console.log(`Tur: ${gameState.currentRound}, Bug önlendi: ${shooter.username} için skor 5'e sabitlendi`);
      gameState.scores[shooter.id] = 5;
    }
  }
  
  // Create result embed for channel (with limited information)
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
    .setImage(isGoal ? 'https://media.giphy.com/media/kGD0eFHPiEPgiGPyDf/giphy.gif' : 'https://media.giphy.com/media/e5amHniqVCLQMHgyef/giphy.gif');
  
  // Create detailed result embed for players (with full information)
  const detailedResultEmbed = new MessageEmbed()
    .setColor(isGoal ? '#2ecc71' : '#e74c3c')
    .setTitle(isGoal ? '⚽ GOL!' : '🧤 KURTARIŞ!')
    .setDescription(
      isGoal 
        ? `**${shooter.username}** topu ${getDirectionEmoji(gameState.shooterChoice)} **${gameState.shooterChoice}**a gönderdi!\n` +
          `**${goalkeeper.username}** ${getDirectionEmoji(gameState.goalkeeperChoice)} **${gameState.goalkeeperChoice}**a atladı fakat kurtaramadı!`
        : `**${shooter.username}** topu ${getDirectionEmoji(gameState.shooterChoice)} **${gameState.shooterChoice}**a gönderdi!\n` +
          `**${goalkeeper.username}** harika bir kurtarış yaptı! ${getDirectionEmoji(gameState.goalkeeperChoice)} **${gameState.goalkeeperChoice}**a atlayarak kurtardı!`
    )
    .addField('Skor', `**${player1.username}** ${gameState.scores[player1.id]} - ${gameState.scores[player2.id]} **${player2.username}**`);
  
  // Send detailed results to players via DM
  shooter.send({ embeds: [detailedResultEmbed] }).catch(() => {});
  goalkeeper.send({ embeds: [detailedResultEmbed] }).catch(() => {});
  
  // Update the main message in channel with limited info
  await waitingMessage.edit({
    embeds: [channelResultEmbed]
  });
  
  // Check if the game should continue
  if (gameState.isGoldenGoal && isGoal) {
    // Game over, golden goal scored
    console.log(`Altın gol: ${shooter.username} tarafından atıldı`);
    await endGame(message, player1, player2, gameState, shooter);
    return;
  }
  
  // Altın gol modundaysa ve çok uzun sürüyorsa (maksimum 5 ekstra tur)
  if (gameState.isGoldenGoal && gameState.currentRound > 10) {
    console.log(`Altın gol fazla uzadı (${gameState.currentRound} tur), oyunu zorla bitiriyorum.`);
    // En son golü atan oyuncu kazanır, eşitse player1 kazanır
    const lastGoalScorer = gameState.history.length > 0 ? 
      gameState.history[gameState.history.length - 1].isGoal ? 
        gameState.history[gameState.history.length - 1].shooter === player1.id ? player1 : player2 
        : null 
      : null;
    
    const winner = lastGoalScorer || player1;
    await endGame(message, player1, player2, gameState, winner);
    return;
  }
  
  // Check if a player has mathematically won (cannot be beaten anymore)
  const remainingKicks = gameState.maxRounds - gameState.currentRound + (gameState.currentShooter === player1.id ? 0 : 1);
  const player1Score = gameState.scores[player1.id];
  const player2Score = gameState.scores[player2.id];
  
  if (player1Score > player2Score + remainingKicks) {
    // Player 1 has already won mathematically
    await message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor('#f39c12')
          .setTitle('🏆 Maç Erken Bitti!')
          .setDescription(
            `**${player1.username}** matematiksel olarak kazandı!\n` +
            `${player1Score} - ${player2Score} sonucunda kalan atışlar oynanmadan sonuç belirlendi.`
          )
      ]
    });
    await endGame(message, player1, player2, gameState, player1);
    return;
  } else if (player2Score > player1Score + remainingKicks) {
    // Player 2 has already won mathematically
    await message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor('#f39c12')
          .setTitle('🏆 Maç Erken Bitti!')
          .setDescription(
            `**${player2.username}** matematiksel olarak kazandı!\n` +
            `${player1Score} - ${player2Score} sonucunda kalan atışlar oynanmadan sonuç belirlendi.`
          )
      ]
    });
    await endGame(message, player1, player2, gameState, player2);
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
    // Güvenlik kontrolü - normal penaltılarda maksimum skor 5-5 olabilir
    // Bu sınırların dışında bir skor varsa, düzelt
    if (gameState.scores[player1.id] > 5) {
      console.log(`Bug tespit edildi: ${player1.username} için skor ${gameState.scores[player1.id]} yerine 5'e düşürüldü`);
      gameState.scores[player1.id] = 5;
    }
    
    if (gameState.scores[player2.id] > 5) {
      console.log(`Bug tespit edildi: ${player2.username} için skor ${gameState.scores[player2.id]} yerine 5'e düşürüldü`);
      gameState.scores[player2.id] = 5;
    }
    
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
// Oyun bitimini izlemek için global değişken
const activeGames = new Set<string>();

async function endGame(message: Message, player1: DiscordUser, player2: DiscordUser, gameState: any, winner: DiscordUser) {
  // Benzersiz bir oyun ID'si oluştur
  const gameId = `${player1.id}-${player2.id}-${message.id}`;
  
  // Eğer bu oyun zaten sonlandırılmışsa, tekrar işleme
  if (activeGames.has(gameId)) {
    console.log(`Oyun zaten sonlandırılmış: ${gameId}`);
    return;
  }
  
  // Oyunu aktif oyunlar listesine ekle
  activeGames.add(gameId);
  
  // İşlem bitince oyunu listeden çıkar (10 saniye sonra)
  setTimeout(() => {
    activeGames.delete(gameId);
    console.log(`Oyun listeden temizlendi: ${gameId}`);
  }, 10000);
  const score1 = gameState.scores[player1.id];
  const score2 = gameState.scores[player2.id];
  
  // Create public summary embed (with limited information)
  const publicSummaryEmbed = new MessageEmbed()
    .setColor('#f1c40f')
    .setTitle('🏆 Penaltı Yarışması Sonucu')
    .setDescription(`**${winner.username}** yarışmayı kazandı!`)
    .addField('Final Skor', `**${player1.username}** ${score1} - ${score2} **${player2.username}**`)
    .setFooter({ text: `${gameState.isGoldenGoal ? 'Altın gol kuralıyla kazandı!' : ''}` });
  
  // Add simplified match history for public view
  const publicHistoryText = gameState.history.map((h: any) => {
    const roundShooter = h.shooter === player1.id ? player1.username : player2.username;
    const roundResult = h.isGoal ? '⚽ GOL' : '❌ KAÇIRDI';
    return `**Raund ${h.round}:** ${roundShooter} - ${roundResult}`;
  }).join('\n');
  
  publicSummaryEmbed.addField('Maç Özeti', publicHistoryText);
  
  // Add congratulations image
  publicSummaryEmbed.setImage('https://media.giphy.com/media/26tPgjwtswcdUMrMQ/giphy.gif');
  
  // Create detailed summary embed for private DMs (with full information)
  const privateSummaryEmbed = new MessageEmbed()
    .setColor('#f1c40f')
    .setTitle('🏆 Penaltı Yarışması Detaylı Sonuç')
    .setDescription(`**${winner.username}** yarışmayı kazandı!`)
    .addField('Final Skor', `**${player1.username}** ${score1} - ${score2} **${player2.username}**`)
    .setFooter({ text: `${gameState.isGoldenGoal ? 'Altın gol kuralıyla kazandı!' : ''}` });
  
  // Add detailed match history for private view
  const privateHistoryText = gameState.history.map((h: any) => {
    const roundShooter = h.shooter === player1.id ? player1.username : player2.username;
    const roundKeeper = h.goalkeeper === player1.id ? player1.username : player2.username;
    const roundResult = h.isGoal ? '⚽ GOL' : '❌ KAÇIRDI';
    return `**Raund ${h.round}:** ${roundShooter} - ${roundResult}\n` + 
           `Atış: ${getDirectionEmoji(h.shooterChoice)} **${h.shooterChoice}** | Kaleci: ${getDirectionEmoji(h.goalkeeperChoice)} **${h.goalkeeperChoice}**`;
  }).join('\n\n');
  
  privateSummaryEmbed.addField('Detaylı Maç Özeti', privateHistoryText);
  
  // Send private detailed summary to participants
  player1.send({ embeds: [privateSummaryEmbed] }).catch(() => {});
  player2.send({ embeds: [privateSummaryEmbed] }).catch(() => {});
  
  // Send the public summary
  await message.channel.send({
    embeds: [publicSummaryEmbed]
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