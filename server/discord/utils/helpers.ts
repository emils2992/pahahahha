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
  
  // Check for positive and negative keywords
  for (const keyword of question.positiveKeywords) {
    if (answer.toLowerCase().includes(keyword.toLowerCase())) {
      score += 1;
    }
  }
  
  for (const keyword of question.negativeKeywords) {
    if (answer.toLowerCase().includes(keyword.toLowerCase())) {
      score -= 1;
    }
  }
  
  // Consider answer length
  if (answer.length < 10) {
    score -= 2; // Penalty for very short answers
  } else if (answer.length > 100) {
    score += 1; // Bonus for detailed answers
  }
  
  // Cap score
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
