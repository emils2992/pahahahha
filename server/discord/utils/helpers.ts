import { Message, MessageEmbed } from 'discord.js';
import { PressQuestion, PressConferenceResult, User } from '@shared/schema';

// Function to calculate press conference result
export function calculatePressResult(
  questions: PressQuestion[], 
  answers: string[]
): PressConferenceResult {
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
function evaluateAnswer(question: PressQuestion, answer: string): number {
  let score = 5; // Start with neutral score
  const answerLower = answer.toLowerCase();
  
  // Count positive keywords found in answer
  let positiveCount = 0;
  for (const keyword of question.positiveKeywords) {
    if (answerLower.includes(keyword.toLowerCase())) {
      positiveCount++;
      // Give higher score for more important/longer keywords
      score += keyword.length > 6 ? 1.5 : 1;
    }
  }
  
  // Count negative keywords found in answer  
  let negativeCount = 0;
  for (const keyword of question.negativeKeywords) {
    if (answerLower.includes(keyword.toLowerCase())) {
      negativeCount++;
      // Penalize more for negative keywords
      score -= keyword.length > 6 ? 1.5 : 1;
    }
  }
  
  // Consider category-specific aspects of the answer
  switch (question.category) {
    case 'tactical':
      // Tactical questions reward detailed, specific answers
      if (answerLower.includes('sistem') || answerLower.includes('strateji') || answerLower.includes('analiz')) {
        score += 1;
      }
      break;
    case 'player':
      // Player questions reward supportive responses
      if (answerLower.includes('destek') || answerLower.includes('güven') || answerLower.includes('inanıyorum')) {
        score += 1;
      }
      break;
    case 'rival':
      // Rival questions reward respectful but confident responses
      if ((answerLower.includes('saygı') || answerLower.includes('profesyonel')) && 
          (answerLower.includes('hazır') || answerLower.includes('kendimize'))) {
        score += 1.5;
      }
      break;
  }
  
  // Consider answer length and detail
  if (answer.length < 15) {
    score -= 2; // Significant penalty for very short answers
  } else if (answer.length < 30) {
    score -= 1; // Minor penalty for short answers
  } else if (answer.length > 100) {
    score += 1; // Bonus for detailed answers
  } else if (answer.length > 200) {
    score += 2; // Larger bonus for very detailed answers
  }
  
  // Extra point if using both positive keywords and avoiding negative ones
  if (positiveCount > 1 && negativeCount === 0) {
    score += 1;
  }
  
  // Cap score between 0 and 10
  return Math.max(0, Math.min(10, score));
}

// Function to generate press conference result
function generatePressResult(score: number, maxScore: number): PressConferenceResult {
  // Calculate percentages
  const percentage = Math.round((score / maxScore) * 100);
  
  // Base fan support change based on score
  let fanSupportChange = Math.round(percentage / 5) - 10; // -10 to +10 scale
  
  // Calculate management trust change (less dramatic than fan support)
  const managementTrustChange = Math.round(fanSupportChange / 2);
  
  // Generate media comment based on score
  let mediaComment;
  if (percentage >= 80) {
    mediaComment = "Harika bir basın toplantısı! Medya senin açıklamalarını çok beğendi.";
  } else if (percentage >= 60) {
    mediaComment = "İyi bir basın toplantısı. Açıklamaların genel olarak olumlu karşılandı.";
  } else if (percentage >= 40) {
    mediaComment = "Ortalama bir basın toplantısı. Bazı cevapların tartışma yarattı.";
  } else if (percentage >= 20) {
    mediaComment = "Zayıf bir basın toplantısı. Medya açıklamalarını eleştiriyor.";
  } else {
    mediaComment = "Kötü bir basın toplantısı! Açıklamaların büyük tepki topladı.";
  }
  
  // Generate management reaction
  let managementReaction;
  if (percentage >= 70) {
    managementReaction = "Yönetim mesajlarından memnun";
  } else if (percentage >= 40) {
    managementReaction = "Yönetim karışık sinyaller aldı";
  } else {
    managementReaction = "Yönetim endişeli ve tedirgin";
  }
  
  // Randomly decide if there's a gossip
  const hasGossip = Math.random() < 0.3; // 30% chance
  
  // Generate gossip if needed
  let gossip;
  if (hasGossip) {
    const gossips = [
      "Yıldız oyuncu güldü bu açıklamaya",
      "Takım içinde bu sözlerin tartışma yarattığı söyleniyor",
      "Kaptan, açıklamalarını desteklediğini özel olarak belirtti",
      "Yönetim, gerçekte söylediklerinden farklı düşünüyormuş",
      "Medyaya kulüp içinden farklı bilgiler sızdırılıyor"
    ];
    gossip = gossips[Math.floor(Math.random() * gossips.length)];
  }
  
  return {
    fanSupportChange,
    managementTrustChange,
    mediaComment,
    managementReaction,
    gossip
  };
}

// Get random reactions for player interactions
export function getRandomReactions(action: string): string {
  const reactions = {
    'kadrodisi': [
      "Medya kararını sert eleştirdi",
      "Taraftarlar kararını destekliyor",
      "Diğer oyuncular tedirgin oldu",
      "Oyuncu kararı kabullendi ama mutsuz",
      "Medya bu kararın arkasında başka sebepler arıyor"
    ],
    'özür': [
      "Medya bu yaklaşımını takdir etti",
      "Taraftarlar yumuşak buldu, daha sert olmalıydın",
      "Takım içi hava olumlu yönde değişti",
      "Yönetim bu olumlu yaklaşımından memnun",
      "Oyuncu özrünü kabul etti ve daha motive oldu"
    ]
  };
  
  const relevantReactions = reactions[action as keyof typeof reactions] || reactions['kadrodisi'];
  return relevantReactions[Math.floor(Math.random() * relevantReactions.length)];
}

// Format timestamp
export function formatTimestamp(date: Date, format: 'date' | 'time' | 'datetime' = 'datetime'): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  if (format === 'date') {
    return `${day}.${month}.${year}`;
  } else if (format === 'time') {
    return `${hours}:${minutes}`;
  } else {
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }
}

// Check if a user has a team assigned
export async function checkUserTeam(user: User, message: Message): Promise<boolean> {
  if (!user.currentTeam) {
    await message.reply({
      content: 'Henüz bir takım seçmedin! Teknik direktörü olacağın takımı seçmek için `.yap takim [takım adı]` komutunu kullan.'
    });
    return false;
  }
  return true;
}

// Create tutorial embed
export function createTutorialEmbed(title: string, content: string): MessageEmbed {
  return new MessageEmbed()
    .setColor('#5865F2')
    .setTitle(`📚 ${title}`)
    .setDescription(content)
    .setFooter({ text: 'Futbol RP Bot - Yardım' });
}
