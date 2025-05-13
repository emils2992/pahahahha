import { 
  MessageEmbed, 
  MessageEmbedOptions 
} from 'discord.js';
import { 
  PressQuestion, 
  DecisionEvent, 
  DecisionOption, 
  GossipItem, 
  Formation,
  Player,
  Team,
  User,
  PressConferenceResult,
  DecisionResult,
  PlayerInteractionResult 
} from '@shared/schema';
import { TeamTraits } from '../data/teamTraits';
import { formatTimestamp } from './helpers';

// Colors
const COLORS = {
  PRIMARY: '#5865F2',    // Discord blue
  SUCCESS: '#57F287',    // Discord green
  WARNING: '#FEE75C',    // Discord yellow
  ERROR: '#ED4245',      // Discord red
  INFO: '#DCDDDE',       // Discord light
  DEFAULT: '#36393F'     // Discord bg
};

// Create embed for press conference
export function createPressEmbed(timing: string, coachName: string, teamName: string): MessageEmbed {
  const title = timing === 'önce' ? 'Maç Öncesi Basın Toplantısı' : 'Maç Sonrası Basın Toplantısı';
  
  return new MessageEmbed()
    .setColor(COLORS.PRIMARY)
    .setTitle(`📢 ${title}`)
    .setDescription(`**${teamName}** teknik direktörü **${coachName}** basın toplantısı başlıyor...`)
    .addField('📸 Canlı Yayın', 'Sorulara vereceğin cevaplar medya tarafından analiz edilecek.')
    .addField('📊 Etki', 'Cevapların taraftar mutluluğunu, medya yorumlarını ve yönetim tepkisini etkileyecek.')
    .setFooter({ text: `Futbol RP Bot • ${formatTimestamp(new Date())}` });
}

// Create embed for press conference question
export function createPressQuestionEmbed(question: PressQuestion, current: number, total: number): MessageEmbed {
  return new MessageEmbed()
    .setColor(COLORS.WARNING)
    .setTitle(`❓ Basın Toplantısı - Soru ${current}/${total}`)
    .setDescription(question.question)
    .addField('📝 Bağlam', question.context)
    .setFooter({ text: 'Cevabını normal mesaj olarak gönder' });
}

// Create embed for press conference result
export function createPressResultEmbed(
  result: PressConferenceResult,
  newFanSupport: number,
  newManagementTrust: number,
  timing: string,
  coachName: string
): MessageEmbed {
  const title = timing === 'önce' ? 'Maç Öncesi Basın Toplantısı' : 'Maç Sonrası Basın Toplantısı';
  
  const embed = new MessageEmbed()
    .setColor(COLORS.SUCCESS)
    .setTitle(`✅ ${title} - Sonuç`)
    .setDescription(`**${coachName}** basın toplantısı tamamlandı!`)
    .addField('📰 Medya Yorumu', result.mediaComment)
    .addField('👥 Taraftar Mutluluğu', `${result.fanSupportChange > 0 ? '📈' : '📉'} ${result.fanSupportChange > 0 ? '+' : ''}${result.fanSupportChange}% (Yeni: ${newFanSupport}%)`, true)
    .addField('🏢 Yönetim Güveni', `${result.managementTrustChange > 0 ? '📈' : '📉'} ${result.managementTrustChange > 0 ? '+' : ''}${result.managementTrustChange}% (Yeni: ${newManagementTrust}%)`, true)
    .addField('💼 Yönetim Tepkisi', result.managementReaction)
    .setFooter({ text: `Futbol RP Bot • ${formatTimestamp(new Date())}` });
  
  if (result.gossip) {
    embed.addField('🔍 Sızıntı', result.gossip);
  }
  
  return embed;
}

// Create embed for decision event
export function createDecisionEmbed(decision: DecisionEvent): MessageEmbed {
  return new MessageEmbed()
    .setColor(COLORS.WARNING)
    .setTitle(`⚖️ ${decision.title}`)
    .setDescription(decision.description)
    .addField('🤔 Seçenekler', decision.options.map((option, index) => 
      `**${index + 1}.** ${option.text}`
    ).join('\n\n'))
    .setFooter({ text: 'Bir seçenek belirlemek için butona tıkla' });
}

// Create embed for decision result
export function createDecisionResultEmbed(
  decision: DecisionEvent,
  selectedOption: DecisionOption,
  result: DecisionResult,
  newFanSupport: number,
  newManagementTrust: number,
  newTeamMorale: number
): MessageEmbed {
  return new MessageEmbed()
    .setColor(COLORS.SUCCESS)
    .setTitle(`⚖️ ${decision.title} - Sonuç`)
    .setDescription(`**Seçimin:** ${selectedOption.text}`)
    .addField('📊 Sonuç', result.message)
    .addField('👥 Taraftar Mutluluğu', `${result.fanSupportChange > 0 ? '📈' : '📉'} ${result.fanSupportChange > 0 ? '+' : ''}${result.fanSupportChange}% (Yeni: ${newFanSupport}%)`, true)
    .addField('🏢 Yönetim Güveni', `${result.managementTrustChange > 0 ? '📈' : '📉'} ${result.managementTrustChange > 0 ? '+' : ''}${result.managementTrustChange}% (Yeni: ${newManagementTrust}%)`, true)
    .addField('🏋️ Takım Morali', `${result.teamMoraleChange > 0 ? '📈' : '📉'} ${result.teamMoraleChange > 0 ? '+' : ''}${result.teamMoraleChange}% (Yeni: ${newTeamMorale}%)`, true)
    .setFooter({ text: `Futbol RP Bot • ${formatTimestamp(new Date())}` });
}

// Create embed for player interaction
export function createPlayerInteractionEmbed(
  player: Player,
  action: string,
  teamName: string
): MessageEmbed {
  const actionTitle = action === 'kadrodisi' ? 'Kadro Dışı Bırakma' : 'Özür Dileme';
  const actionDescription = action === 'kadrodisi' 
    ? `**${player.name}** (#${player.jerseyNumber}) oyuncusunu kadro dışı bırakmak üzeresin.`
    : `**${player.name}** (#${player.jerseyNumber}) oyuncusundan özür dilemek üzeresin.`;
  
  return new MessageEmbed()
    .setColor(action === 'kadrodisi' ? COLORS.ERROR : COLORS.SUCCESS)
    .setTitle(`👤 ${actionTitle} - ${player.name}`)
    .setDescription(actionDescription)
    .addField('🏃 Pozisyon', player.position, true)
    .addField('🔢 Forma No', `#${player.jerseyNumber}`, true)
    .addField('😀 Mevcut Moral', `${player.mood}%`, true)
    .addField('ℹ️ Takım', teamName)
    .addField('⚠️ Uyarı', action === 'kadrodisi' 
      ? 'Bu işlem oyuncunun moralini düşürecek ve takım dinamiklerini etkileyebilir.'
      : 'Bu işlem oyuncunun moralini yükseltebilir ve takım dinamiklerini olumlu etkileyebilir.')
    .setFooter({ text: 'İşlemi onaylamak için butona tıkla' });
}

// Create embed for player action result
export function createPlayerActionResultEmbed(
  player: Player,
  action: string,
  result: PlayerInteractionResult,
  teamName: string
): MessageEmbed {
  const actionTitle = action === 'kadrodisi' ? 'Kadro Dışı Bırakma' : 'Özür Dileme';
  
  return new MessageEmbed()
    .setColor(action === 'kadrodisi' ? COLORS.ERROR : COLORS.SUCCESS)
    .setTitle(`👤 ${actionTitle} - Sonuç`)
    .setDescription(result.message)
    .addField('👤 Oyuncu', `${player.name} (#${player.jerseyNumber})`, true)
    .addField('🏃 Pozisyon', player.position, true)
    .addField('😀 Oyuncu Morali', `${result.playerMoodChange > 0 ? '📈' : '📉'} ${result.playerMoodChange > 0 ? '+' : ''}${result.playerMoodChange}%`, true)
    .addField('🏋️ Takım Morali', `${result.teamMoraleChange > 0 ? '📈' : '📉'} ${result.teamMoraleChange > 0 ? '+' : ''}${result.teamMoraleChange}%`, true)
    .setFooter({ text: `${teamName} • Futbol RP Bot` });
}

// Create embed for tactic formation
export function createTacticEmbed(
  formation: Formation,
  teamName: string
): MessageEmbed {
  return new MessageEmbed()
    .setColor(COLORS.PRIMARY)
    .setTitle(`⚽ Taktik Sistemi - ${formation.name}`)
    .setDescription(`**${teamName}** takımı için **${formation.name}** dizilişi uygulanacak.`)
    .addField('🎮 Pozisyonlar', formation.positions.join(' - '))
    .addField('📰 Medya Analizi', formation.mediaAnalysis.map(analysis => `• ${analysis}`).join('\n'))
    .setFooter({ text: `Futbol RP Bot • ${formatTimestamp(new Date())}` });
}

// Create embed for gossip
export function createGossipEmbed(gossip: GossipItem): MessageEmbed {
  return new MessageEmbed()
    .setColor(COLORS.WARNING)
    .setTitle(`📰 ${gossip.title}`)
    .setDescription(gossip.content)
    .addField('⚠️ Risk Seviyesi', getRiskLevel(gossip.risk), true)
    .addField('📊 Potansiyel Etki', `👥 Taraftar: ${getImpactEmoji(gossip.impact.fanSupport)} | 🏢 Yönetim: ${getImpactEmoji(gossip.impact.managementTrust)} | 🏋️ Takım: ${getImpactEmoji(gossip.impact.teamMorale)}`, true)
    .setFooter({ text: 'Medyaya yanıt vermek için butona tıkla' });
}

// Create embed for leak options
export function createLeakOptionsEmbed(options: GossipItem[]): MessageEmbed {
  return new MessageEmbed()
    .setColor(COLORS.WARNING)
    .setTitle('🔍 Bilgi Sızdırma')
    .setDescription('Medyaya stratejik bilgi sızdırarak gündem oluşturabilir ve rakiplerini etkileyebilirsin. Ancak bu risklidir.')
    .addField('⚠️ Uyarı', 'Sızdırdığın bilgiler takımını, yönetimi ve taraftarları farklı şekillerde etkileyebilir. Seçimini dikkatli yap.')
    .addField('🔍 Sızdırılabilir Bilgiler', options.map((option, index) => 
      `**${index + 1}.** ${option.title} (Risk: ${getRiskLevel(option.risk)})`
    ).join('\n'))
    .setFooter({ text: 'Sızdırmak istediğin bilgiyi seçeneklerden seç' });
}

// Create embed for leak result
export function createLeakResultEmbed(
  gossip: GossipItem,
  newFanSupport: number,
  newManagementTrust: number,
  newTeamMorale: number
): MessageEmbed {
  return new MessageEmbed()
    .setColor(gossip.impact.managementTrust < 0 ? COLORS.ERROR : COLORS.SUCCESS)
    .setTitle(`🔍 Bilgi Sızdırma - ${gossip.title}`)
    .setDescription(gossip.content)
    .addField('📰 Medya Tepkisi', 'Bilgin medyada büyük yankı uyandırdı! Herkes bundan bahsediyor.')
    .addField('👥 Taraftar Tepkisi', `${gossip.impact.fanSupport > 0 ? '📈' : '📉'} ${gossip.impact.fanSupport > 0 ? '+' : ''}${gossip.impact.fanSupport}% (Yeni: ${newFanSupport}%)`, true)
    .addField('🏢 Yönetim Tepkisi', `${gossip.impact.managementTrust > 0 ? '📈' : '📉'} ${gossip.impact.managementTrust > 0 ? '+' : ''}${gossip.impact.managementTrust}% (Yeni: ${newManagementTrust}%)`, true)
    .addField('🏋️ Takım Morali', `${gossip.impact.teamMorale > 0 ? '📈' : '📉'} ${gossip.impact.teamMorale > 0 ? '+' : ''}${gossip.impact.teamMorale}% (Yeni: ${newTeamMorale}%)`, true)
    .setFooter({ text: `Futbol RP Bot • ${formatTimestamp(new Date())}` });
}

// Create embed for team selection
export function createTeamSelectionEmbed(teams: Team[]): MessageEmbed {
  return new MessageEmbed()
    .setColor(COLORS.PRIMARY)
    .setTitle('⚽ Takım Seçimi')
    .setDescription('Teknik direktörü olacağın takımı seç. Her takımın kendine özgü mizacı vardır.')
    .addField('📋 Kullanılabilir Takımlar', teams.map(team => 
      `**${team.name}** - ${team.traitType}`
    ).join('\n'))
    .setFooter({ text: 'Takım seçmek için .yap takim [takım adı] komutunu kullan' });
}

// Create embed for team info
export function createTeamInfoEmbed(
  team: Team,
  traits: TeamTraits,
  user: User
): MessageEmbed {
  return new MessageEmbed()
    .setColor(COLORS.PRIMARY)
    .setTitle(`⚽ ${team.name}`)
    .setDescription(`**${user.username}**, artık **${team.name}** takımının teknik direktörüsün!`)
    .addField('🏢 Kulüp Yapısı', `**${team.traitType}** - ${traits.description}`)
    .addField('📊 Kulüp Özellikleri', traits.keyAttributes.map(attr => `• ${attr}`).join('\n'))
    .addField('👥 Taraftar Mutluluğu', `${user.fanSupport}%`, true)
    .addField('🏢 Yönetim Güveni', `${user.managementTrust}%`, true)
    .addField('🏋️ Takım Morali', `${user.teamMorale}%`, true)
    .setFooter({ text: 'Kolay gelsin, hocam!' });
}

// Helper function for risk level string
function getRiskLevel(risk: 'low' | 'medium' | 'high'): string {
  switch(risk) {
    case 'low': return '🟢 Düşük';
    case 'medium': return '🟡 Orta';
    case 'high': return '🔴 Yüksek';
    default: return '⚪ Bilinmiyor';
  }
}

// Helper function for impact emoji
function getImpactEmoji(impact: number): string {
  if (impact > 5) return '📈 Çok Olumlu';
  if (impact > 0) return '⬆️ Olumlu';
  if (impact === 0) return '➡️ Nötr';
  if (impact > -5) return '⬇️ Olumsuz';
  return '📉 Çok Olumsuz';
}
