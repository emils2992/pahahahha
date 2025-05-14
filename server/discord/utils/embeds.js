const { MessageEmbed } = require('discord.js');
const { formatTimestamp } = require('./helpers');

// Colors
const COLORS = {
  PRIMARY: '#5865F2',    // Discord blue
  SUCCESS: '#57F287',    // Discord green
  WARNING: '#FEE75C',    // Discord yellow
  ERROR: '#ED4245',      // Discord red
  INFO: '#DCDDDE',       // Discord light
  DEFAULT: '#36393F'     // Discord bg
};

// Function to create press conference embed
function createPressEmbed(timing, coachName, teamName) {
  return new MessageEmbed()
    .setColor(COLORS.PRIMARY)
    .setTitle(`📰 Basın Toplantısı - ${timing === 'önce' ? 'Maç Öncesi' : 'Maç Sonrası'}`)
    .setDescription(`**${coachName}**, ${teamName} teknik direktörü olarak basın toplantısı düzenliyor.`)
    .addField('📝 Nasıl Oynanır', 'Size sorulacak sorulara cevap verin. Cevaplarınız medya, taraftarlar ve yönetim üzerinde etki yaratacak.')
    .setFooter({ text: `Futbol RP Bot - ${formatTimestamp(new Date())}` });
}

// Function to create press question embed
function createPressQuestionEmbed(question, current, total) {
  return new MessageEmbed()
    .setColor(COLORS.PRIMARY)
    .setTitle(`📰 Basın Toplantısı - Soru ${current}/${total}`)
    .setDescription(question.question)
    .addField('📌 Bağlam', question.context)
    .setFooter({ text: 'Cevabınızı sohbete yazın. Detaylı cevaplar daha iyi sonuç verir.' });
}

// Function to create press result embed
function createPressResultEmbed(
  result,
  updatedFanSupport,
  updatedManagementTrust,
  timing,
  coachName
) {
  const embed = new MessageEmbed()
    .setColor(COLORS.PRIMARY)
    .setTitle(`📰 Basın Toplantısı Sonuçları`)
    .setDescription(`**${coachName}**, ${timing === 'önce' ? 'maç öncesi' : 'maç sonrası'} basın toplantısını tamamladı.`)
    .addField('🗞️ Medya Yorumu', result.mediaComment)
    .addField('👔 Yönetim Tepkisi', result.managementReaction)
    .addField('📊 Değişimler', 
      `👥 Taraftar Desteği: ${result.fanSupportChange >= 0 ? '+' : ''}${result.fanSupportChange} (${updatedFanSupport})\n` +
      `🤝 Yönetim Güveni: ${result.managementTrustChange >= 0 ? '+' : ''}${result.managementTrustChange} (${updatedManagementTrust})`
    )
    .setFooter({ text: `Futbol RP Bot - ${formatTimestamp(new Date())}` });
  
  // Add gossip if any
  if (result.gossip) {
    embed.addField('💬 Dedikodu', result.gossip);
  }
  
  return embed;
}

// Function to create decision embed
function createDecisionEmbed(decision) {
  return new MessageEmbed()
    .setColor(COLORS.WARNING)
    .setTitle(`⚡ Karar Zamanı: ${decision.title}`)
    .setDescription(decision.description)
    .addField('🔄 Seçenekler', decision.options.map((option, index) => 
      `**${index + 1}.** ${option.text}`
    ).join('\n\n'))
    .setFooter({ text: 'Bir seçenek seçin. Her kararın sonuçları olacaktır.' });
}

// Function to create decision result embed
function createDecisionResultEmbed(
  decision,
  selectedOption,
  result,
  updatedFanSupport,
  updatedManagementTrust,
  updatedTeamMorale
) {
  return new MessageEmbed()
    .setColor(COLORS.PRIMARY)
    .setTitle(`⚡ Karar Sonucu: ${decision.title}`)
    .setDescription(`**Seçiminiz:** ${selectedOption.text}`)
    .addField('📝 Sonuç', result.message)
    .addField('📊 Değişimler', 
      `👥 Taraftar Desteği: ${result.fanSupportChange >= 0 ? '+' : ''}${result.fanSupportChange} (${updatedFanSupport})\n` +
      `🤝 Yönetim Güveni: ${result.managementTrustChange >= 0 ? '+' : ''}${result.managementTrustChange} (${updatedManagementTrust})\n` +
      `🔋 Takım Morali: ${result.teamMoraleChange >= 0 ? '+' : ''}${result.teamMoraleChange} (${updatedTeamMorale})`
    )
    .setFooter({ text: `Futbol RP Bot - ${formatTimestamp(new Date())}` });
}

// Function to create player interaction embed
function createPlayerInteractionEmbed(
  player,
  actionOptions
) {
  const embed = new MessageEmbed()
    .setColor(COLORS.PRIMARY)
    .setTitle(`👤 Oyuncu Etkileşimi: ${player.name}`)
    .setDescription(`**${player.name}** (#${player.jerseyNumber}) ile nasıl bir etkileşimde bulunmak istiyorsunuz?`)
    .addField('📊 Oyuncu Bilgisi', 
      `**Pozisyon:** ${player.position}\n` +
      `**Moral:** ${player.mood}/100`
    );
  
  // Add action options
  if (actionOptions && actionOptions.length > 0) {
    embed.addField('🔄 Etkileşim Seçenekleri', actionOptions.map((option, index) => 
      `**${index + 1}.** ${option.text}`
    ).join('\n'));
  }
  
  embed.setFooter({ text: 'Etkileşiminiz oyuncunun moralini ve takım performansını etkileyecektir.' });
  
  return embed;
}

// Function to create player action result embed
function createPlayerActionResultEmbed(
  player,
  action,
  result,
  updatedMood
) {
  const embed = new MessageEmbed()
    .setColor(result.playerMoodChange >= 0 ? COLORS.SUCCESS : COLORS.ERROR)
    .setTitle(`👤 Oyuncu Etkileşimi Sonucu: ${player.name}`)
    .setDescription(`**Etkileşiminiz:** ${action}`)
    .addField('📝 Sonuç', result.message)
    .addField('📊 Değişimler', 
      `😊 Oyuncu Morali: ${result.playerMoodChange >= 0 ? '+' : ''}${result.playerMoodChange} (${updatedMood})\n` +
      `🔋 Takım Morali: ${result.teamMoraleChange >= 0 ? '+' : ''}${result.teamMoraleChange}`
    );
  
  // Add media reaction if any
  if (result.mediaReaction) {
    embed.addField('🗞️ Medya Tepkisi', result.mediaReaction);
  }
  
  embed.setFooter({ text: `Futbol RP Bot - ${formatTimestamp(new Date())}` });
  
  return embed;
}

// Function to create tactic embed
function createTacticEmbed(formation, teamName) {
  return new MessageEmbed()
    .setColor(COLORS.PRIMARY)
    .setTitle(`⚽ Taktik: ${formation.name}`)
    .setDescription(`**${teamName}** takımı için **${formation.name}** formasyonu uygulanıyor.`)
    .addField('🎮 Diziliş', formation.positions.join(' - '))
    .setImage(`https://football-formation-creator.herokuapp.com/form/${formation.name.replace(/-/g, '')}`)
    .setFooter({ text: 'Futbol RP Bot - Taktik Belirleme' });
}

// Function to create gossip embed
function createGossipEmbed(gossip) {
  return new MessageEmbed()
    .setColor(COLORS.PRIMARY)
    .setTitle(`📰 Dedikodu: ${gossip.title}`)
    .setDescription(gossip.content)
    .addField('⚠️ Risk Derecesi', `${gossip.risk === 'high' ? '🔴 Yüksek' : gossip.risk === 'medium' ? '🟡 Orta' : '🟢 Düşük'}`)
    .setFooter({ text: 'Futbol RP Bot - Dedikodu mekanizması' });
}

// Function to create leak options embed
function createLeakOptionsEmbed(options) {
  return new MessageEmbed()
    .setColor(COLORS.WARNING)
    .setTitle('🔍 Medyaya Bilgi Sızdırma')
    .setDescription('Medyaya hangi bilgiyi sızdırmak istiyorsunuz? Her bilginin farklı etkileri olacaktır.')
    .addField('⚠️ Uyarı', 'Yüksek riskli bilgiler daha büyük etki yaratır, ancak olumsuz sonuçları da olabilir.')
    .setFooter({ text: 'Bilgi sızdırmak için aşağıdaki menüden seçim yapın.' });
}

// Function to create leak result embed
function createLeakResultEmbed(
  gossip,
  updatedFanSupport,
  updatedManagementTrust,
  updatedTeamMorale
) {
  return new MessageEmbed()
    .setColor(gossip.risk === 'high' ? COLORS.ERROR : gossip.risk === 'medium' ? COLORS.WARNING : COLORS.SUCCESS)
    .setTitle(`🔍 Bilgi Sızdırma Sonucu: ${gossip.title}`)
    .setDescription(gossip.content)
    .addField('📊 Etkiler', 
      `👥 Taraftar Desteği: ${gossip.impact.fanSupport >= 0 ? '+' : ''}${gossip.impact.fanSupport} (${updatedFanSupport})\n` +
      `🤝 Yönetim Güveni: ${gossip.impact.managementTrust >= 0 ? '+' : ''}${gossip.impact.managementTrust} (${updatedManagementTrust})\n` +
      `🔋 Takım Morali: ${gossip.impact.teamMorale >= 0 ? '+' : ''}${gossip.impact.teamMorale} (${updatedTeamMorale})`
    )
    .setFooter({ text: `Futbol RP Bot - ${formatTimestamp(new Date())}` });
}

// Function to create team selection embed
function createTeamSelectionEmbed(teams) {
  return new MessageEmbed()
    .setColor(COLORS.PRIMARY)
    .setTitle('⚽ Takım Seçimi')
    .setDescription('Teknik direktörü olmak istediğiniz takımı seçin.')
    .addField('📋 Mevcut Takımlar', teams.map(t => t.name).join(', '))
    .setFooter({ text: 'Futbol RP Bot - Takım Seçimi' });
}

// Function to create team info embed
function createTeamInfoEmbed(
  team,
  teamTraits,
  user
) {
  const embed = new MessageEmbed()
    .setColor(COLORS.PRIMARY)
    .setTitle(`⚽ ${team.name}`)
    .setDescription(`**${team.name}** takımının teknik direktörü **${user.username}**`)
    .addField('📊 Takım Profili', 
      `**Tarz:** ${teamTraits.description}\n` +
      `**Medya Baskısı:** ${teamTraits.mediaPressure === 'high' ? '🔴 Yüksek' : teamTraits.mediaPressure === 'medium' ? '🟡 Orta' : '🟢 Düşük'}\n` +
      `**Taraftar Beklentisi:** ${teamTraits.fanExpectations === 'high' ? '🔴 Yüksek' : teamTraits.fanExpectations === 'medium' ? '🟡 Orta' : '🟢 Düşük'}\n` +
      `**Yönetim Sabrı:** ${teamTraits.managementPatience === 'high' ? '🟢 Yüksek' : teamTraits.managementPatience === 'medium' ? '🟡 Orta' : '🔴 Düşük'}\n` +
      `**Mali Güç:** ${teamTraits.financialPower === 'high' ? '💰💰💰' : teamTraits.financialPower === 'medium' ? '💰💰' : '💰'}\n` +
      `**Altyapı Odağı:** ${teamTraits.youthFocus === 'high' ? '⭐⭐⭐' : teamTraits.youthFocus === 'medium' ? '⭐⭐' : '⭐'}`
    )
    .addField('🔑 Anahtar Özellikler', teamTraits.keyAttributes.join(', '))
    .setFooter({ text: `Futbol RP Bot - ${formatTimestamp(new Date())}` });
  
  // Add user stats if available
  if (user.fanSupport !== undefined && user.managementTrust !== undefined && user.teamMorale !== undefined) {
    embed.addField('📈 Mevcut Durum', 
      `👥 Taraftar Desteği: ${user.fanSupport}/100\n` +
      `🤝 Yönetim Güveni: ${user.managementTrust}/100\n` +
      `🔋 Takım Morali: ${user.teamMorale}/100`
    );
  }
  
  return embed;
}

module.exports = {
  createPressEmbed,
  createPressQuestionEmbed,
  createPressResultEmbed,
  createDecisionEmbed,
  createDecisionResultEmbed,
  createPlayerInteractionEmbed,
  createPlayerActionResultEmbed,
  createTacticEmbed,
  createGossipEmbed,
  createLeakOptionsEmbed,
  createLeakResultEmbed,
  createTeamSelectionEmbed,
  createTeamInfoEmbed
};