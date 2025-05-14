const { MessageEmbed } = require('discord.js');

// Function to calculate press conference result
function calculatePressResult(questions, answers) {
  let totalScore = 0;
  const maxScorePerQuestion = 10;
  
  // Evaluate each answer against its question
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const answer = answers[i] || '';
    const score = evaluateAnswer(question, answer);
    totalScore += score;
  }
  
  // Calculate average score
  const averageScore = totalScore / questions.length;
  
  // Generate result based on score
  return generatePressResult(averageScore, maxScorePerQuestion);
}

// Function to evaluate a single answer
function evaluateAnswer(question, answer) {
  let score = 5; // Start with neutral score
  const answerLower = answer.toLowerCase();
  
  // Check for positive keywords
  for (const keyword of question.positiveKeywords) {
    if (answerLower.includes(keyword.toLowerCase())) {
      score += 1;
    }
  }
  
  // Check for negative keywords
  for (const keyword of question.negativeKeywords) {
    if (answerLower.includes(keyword.toLowerCase())) {
      score -= 1;
    }
  }
  
  // Adjust score based on answer length (penalize too short answers)
  if (answer.length < 20) {
    score -= 2;
  } else if (answer.length > 100) {
    score += 2;
  }
  
  // Clamp score between 0 and 10
  return Math.max(0, Math.min(10, score));
}

// Function to generate press conference result
function generatePressResult(score, maxScore) {
  // Map score to fan support change
  const fanSupportChange = Math.floor((score / maxScore) * 20) - 10;
  
  // Map score to management trust change
  const managementTrustChange = Math.floor((score / maxScore) * 16) - 8;
  
  // Generate media comment
  let mediaComment = '';
  if (score >= 8) {
    mediaComment = 'Basın açıklamanız büyük beğeni topladı. Medya size övgüler yağdırıyor.';
  } else if (score >= 6) {
    mediaComment = 'Açıklamanız genel olarak olumlu karşılandı.';
  } else if (score >= 4) {
    mediaComment = 'Açıklamanız nötr tepkiler aldı.';
  } else if (score >= 2) {
    mediaComment = 'Basın mensupları açıklamanızı tatmin edici bulmadı.';
  } else {
    mediaComment = 'Açıklamanız tamamen olumsuz karşılandı. Medya sizi sert bir şekilde eleştiriyor.';
  }
  
  // Generate management reaction
  let managementReaction = '';
  if (score >= 7) {
    managementReaction = 'Yönetim kurulu bu basın toplantısından memnun kaldı.';
  } else if (score >= 4) {
    managementReaction = 'Yönetim henüz bir tepki vermedi.';
  } else {
    managementReaction = 'Yönetim kurulu başkanı, bu tür açıklamalara dikkat edilmesi gerektiğini belirtti.';
  }
  
  // Randomly decide if there's gossip (30% chance)
  const hasGossip = Math.random() < 0.3;
  let gossip = undefined;
  
  if (hasGossip) {
    const gossipOptions = [
      'Kulüp içinden bir kaynak, açıklamanızın stratejik olarak planlandığını iddia ediyor.',
      'Bazı oyuncular açıklamanızı özel olarak desteklediklerini belirtti.',
      'İddiaya göre, bazı taraftarlar açıklamanızdan sonra sosyal medyada kampanya başlattı.',
      'Kulüp yönetiminde, basın stratejisi konusunda görüş ayrılığı olduğu söyleniyor.'
    ];
    gossip = gossipOptions[Math.floor(Math.random() * gossipOptions.length)];
  }
  
  return {
    fanSupportChange,
    managementTrustChange,
    mediaComment,
    managementReaction,
    gossip
  };
}

// Function to format timestamp
function formatTimestamp(date, type = 'full') {
  try {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    if (type === 'date') {
      delete options.hour;
      delete options.minute;
    } else if (type === 'time') {
      delete options.weekday;
      delete options.year;
      delete options.month;
      delete options.day;
    }
    
    return new Date(date).toLocaleDateString('tr-TR', options);
  } catch (error) {
    console.error('formatTimestamp error:', error);
    return date.toString();
  }
}

// Function to check if user has team
async function checkUserTeam(user, message) {
  if (!user.currentTeam) {
    await message.reply('Henüz bir takım seçmemişsiniz! Lütfen `.takim [takım adı]` komutu ile bir takım seçin.');
    return false;
  }
  return true;
}

// Function to create tutorial embed
function createTutorialEmbed(title, description) {
  return new MessageEmbed()
    .setColor('#5865F2')
    .setTitle(`📚 ${title}`)
    .setDescription(description)
    .setFooter({ text: 'Futbol RP Bot - Yardım' });
}

module.exports = {
  calculatePressResult,
  formatTimestamp,
  checkUserTeam,
  createTutorialEmbed
};