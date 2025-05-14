import { 
  Message, 
  MessageEmbed, 
  MessageActionRow, 
  MessageButton, 
  MessageCollector 
} from 'discord.js';
import { storage } from '../../storage';
import { User, PressConferenceResult } from '@shared/schema';
import { getRandomQuestions } from '../data/questions';
import { 
  createPressEmbed, 
  createPressQuestionEmbed, 
  createPressResultEmbed 
} from '../utils/embeds';
import { 
  calculatePressResult, 
  formatTimestamp,
  checkUserTeam,
  createTutorialEmbed
} from '../utils/helpers';

// Press conference command
export const basinCommand = {
  name: 'basın',
  description: 'Basın toplantısı düzenle',
  usage: '.basın [önce|sonra] [hoca adı]',
  execute: async (message: Message, args: string[]) => {
    try {
      // Get or create user
      const user = await ensureUser(message);
      if (!user) return;
      
      // Check if user has a team
      const hasTeam = await checkUserTeam(user, message);
      if (!hasTeam) return;
      
      // Kullanıcı yetkili mi kontrol et (yetkililerin ID'lerini burada belirle)
      const adminUserIds = ['794205713533894696', '1371879530020737214', '1352647377940512858']; // Yetkili kullanıcı ID'leri
      const isAdmin = adminUserIds.includes(message.author.id);
      
      // 6 saat zaman kısıtlaması kontrol et - yetkili değilse
      const canUseCommand = await storage.checkCommandTimeout(
        user.discordId, 
        "basin_command", 
        360, // 6 saat = 360 dakika
        isAdmin // Yetkili ise zaman kısıtlaması yok
      );
      
      if (!canUseCommand) {
        return message.reply('Basin komutunu kullanmak için 6 saat beklemelisiniz!');
      }
      
      // Parse arguments
      const timing = args[0]?.toLowerCase();
      const coachName = args.slice(1).join(' ') || user.username;
      
      if (!timing || (timing !== 'önce' && timing !== 'sonra')) {
        return message.reply({
          embeds: [
            createTutorialEmbed(
              'Basın Toplantısı Yardımı',
              '**Kullanım:** `.basın [önce|sonra] [hoca adı]`\n\n' +
              '**Örnek:** `.basın önce Fatih Terim`\n\n' +
              '**Açıklama:** Maç öncesi veya sonrası basın toplantısı simüle eder.\n' +
              'Sorulan sorulara verdiğiniz cevaplar; taraftar mutluluğunu, medya yorumlarını ve yönetim tepkisini etkiler.'
            )
          ]
        });
      }
      
      // Check if there's already an active press conference
      const existingSession = await storage.getActiveSessionByUserId(user.id, 'basin');
      if (existingSession) {
        return message.reply('Zaten devam eden bir basın toplantınız var!');
      }
      
      // Create a new press conference session
      const session = await storage.createGameSession({
        userId: user.id,
        sessionType: 'basin',
        sessionData: {
          timing,
          coachName,
          currentQuestion: 0,
          questions: getRandomQuestions(timing, 10),
          answers: [],
        },
        isActive: true,
        createdAt: new Date().toISOString()
      });
      
      // Send initial press conference message
      const pressEmbed = createPressEmbed(timing, coachName, user.currentTeam as string);
      await message.reply({ embeds: [pressEmbed] });
      
      // Start the press conference questions
      await sendNextQuestion(message, user, session.id);
      
    } catch (error) {
      console.error('Error in basin command:', error);
      message.reply('Basın toplantısı sırasında bir hata oluştu.');
    }
  }
};

// Helper function to ensure user exists
async function ensureUser(message: Message): Promise<User | undefined> {
  const discordId = message.author.id;
  let user = await storage.getUserByDiscordId(discordId);
  
  if (!user) {
    user = await storage.createUser({
      discordId,
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
  
  return user;
}

// Function to send the next question
async function sendNextQuestion(message: Message, user: User, sessionId: number) {
  const session = await storage.getGameSession(sessionId);
  if (!session || !session.isActive) return;
  
  const { questions, currentQuestion } = session.sessionData;
  
  // Check if there are more questions
  if (currentQuestion >= questions.length) {
    // End the press conference
    await handlePressConferenceEnd(message, user, sessionId);
    return;
  }
  
  const question = questions[currentQuestion];
  const questionEmbed = createPressQuestionEmbed(question, currentQuestion + 1, questions.length);
  
  const sentMessage = await message.channel.send({ embeds: [questionEmbed] });
  
  // Create message collector to collect user's answer
  const collector = message.channel.createMessageCollector({
    filter: m => m.author.id === message.author.id,
    time: 300000, // 5 minutes
    max: 1
  });
  
  collector.on('collect', async (msg) => {
    const answer = msg.content;
    
    // Update the session with the answer
    await storage.updateGameSession(sessionId, {
      answers: [...session.sessionData.answers, answer],
      currentQuestion: currentQuestion + 1
    });
    
    // Send the next question
    await sendNextQuestion(message, user, sessionId);
  });
  
  collector.on('end', async (collected) => {
    if (collected.size === 0) {
      // User didn't answer in time
      await message.channel.send('Basın toplantısı süresi doldu. Toplantı sonlandırıldı.');
      await storage.endGameSession(sessionId);
    }
  });
}

// Function to handle press conference end
async function handlePressConferenceEnd(message: Message, user: User, sessionId: number) {
  const session = await storage.getGameSession(sessionId);
  if (!session) return;
  
  const { questions, answers, timing, coachName } = session.sessionData;
  
  // Calculate the results
  const result = calculatePressResult(questions, answers);
  
  // Update user stats
  await storage.updateUserStats(
    user.discordId,
    result.fanSupportChange,
    result.managementTrustChange || 0,
    0 // No direct effect on team morale
  );
  
  // Award points based on performance
  const pointsEarned = Math.ceil(result.fanSupportChange / 2);
  if (pointsEarned > 0) {
    await storage.addUserPoints(user.discordId, pointsEarned);
  }
  
  // Check for titles
  if (result.fanSupportChange >= 15) {
    await storage.addUserTitle(user.discordId, "Basın Terörü Kurdu");
  }
  
  // End the session
  await storage.endGameSession(sessionId);
  
  // Send results
  const resultEmbed = createPressResultEmbed(
    result,
    user.fanSupport + result.fanSupportChange,
    user.managementTrust + (result.managementTrustChange || 0),
    timing,
    coachName
  );
  
  await message.channel.send({ embeds: [resultEmbed] });
}
