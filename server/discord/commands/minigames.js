const { 
  Message, 
  MessageEmbed, 
  MessageActionRow, 
  MessageButton,
  MessageSelectMenu 
} = require('discord.js');
const { storage } = require('../../storage');
const { checkUserTeam, createTutorialEmbed } = require('../utils/helpers');

// Lie detector minigame
const yalanMakinesiCommand = {
  name: 'yalanmakinesi',
  description: 'Yalan makinesi minigame',
  usage: '.yalanmakinesi [ifade]',
  execute: async (message, args) => {
    try {
      // Get user
      const user = await storage.getUserByDiscordId(message.author.id);
      if (!user) {
        return message.reply('Profil bulunamadı. Lütfen bir takım seçerek başlayın: `.takim [takım adı]`');
      }
      
      // Check if user has a team
      const hasTeam = await checkUserTeam(user, message);
      if (!hasTeam) return;
      
      // Bilgi komutu olduğu için yalanmakinesi her zaman kullanılabilir
      // Zaman kısıtlaması kaldırıldı
      
      if (!args.length) {
        return message.reply({
          embeds: [
            createTutorialEmbed(
              'Yalan Makinesi Yardımı',
              '**Kullanım:** `.yalanmakinesi [ifade]`\n\n' +
              '**Örnek:** `.yalanmakinesi Bu takıma tamamen güveniyorum`\n\n' +
              '**Açıklama:** Söylediğin ifadenin doğru mu yalan mı olduğunu analiz eder.\n' +
              'Sonuç rastgele belirlenir, cevabına medya ve oyuncular tepki verir.'
            )
          ]
        });
      }
      
      // Get statement from args
      const statement = args.join(' ');
      
      // Create initial embed
      const initialEmbed = new MessageEmbed()
        .setColor('#ED4245')
        .setTitle('🔍 Yalan Makinesi')
        .setDescription('İfadeniz analiz ediliyor...')
        .addField('Senin İfaden:', statement)
        .setFooter({ text: 'Futbol RP Bot - Yalan Makinesi' });
      
      const sentMessage = await message.reply({ embeds: [initialEmbed] });
      
      // Wait for "analysis"
      setTimeout(async () => {
        // Randomly determine if it's a lie (70% chance of lie for dramatic effect)
        const isLie = Math.random() < 0.7;
        
        // Prepare responses based on result
        const responses = isLie ? [
          "Dediler ki, oyuncular senin bu sözlerine inanmıyor. Soyunma odası soğumuş durumda.",
          "Medya bu açıklamanın gerçeği yansıtmadığını düşünüyor.",
          "Takım içinde bu açıklamanın doğru olmadığını düşünenler var.",
          "Taraftarlar sosyal medyada bu açıklamaya inanmadıklarını belirtiyorlar."
        ] : [
          "Oyuncular bu açıklamaya tamamen katılıyor. Takım ruhu yükselmiş durumda.",
          "Medya bu açıklamanın içten olduğunu düşünüyor.",
          "Takım içinde bu açıklamanın doğruluğuna olan inanç tam.",
          "Taraftarlar sosyal medyada bu açıklamayı destekliyorlar."
        ];
        
        // Pick a random response
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Update stats based on result
        if (isLie) {
          await storage.updateUserStats(
            user.discordId,
            -5, // Fan support decreases
            -3, // Management trust decreases
            -10 // Team morale significantly decreases
          );
        } else {
          await storage.updateUserStats(
            user.discordId,
            5, // Fan support increases
            3, // Management trust increases
            10 // Team morale significantly increases
          );
        }
        
        // Create result embed
        const resultEmbed = new MessageEmbed()
          .setColor(isLie ? '#ED4245' : '#57F287')
          .setTitle(`🔍 Yalan Makinesi - ${isLie ? 'YALAN' : 'DOĞRU'}`)
          .addField('Senin İfaden:', statement)
          .addField('Sonuç:', isLie ? 'YALAN!' : 'DOĞRU!')
          .addField('Tepki:', randomResponse)
          .setFooter({ text: 'Futbol RP Bot - Yalan Makinesi' });
        
        await sentMessage.edit({ embeds: [resultEmbed] });
        
        // Award points for participating
        await storage.addUserPoints(user.discordId, 1);
      }, 3000); // 3 seconds delay for dramatic effect
      
    } catch (error) {
      console.error('Error in yalanmakinesi command:', error);
      message.reply('Yalan makinesi minigame sırasında bir hata oluştu.');
    }
  }
};

// Referee argument minigame
const hakemCommand = {
  name: 'hakem',
  description: 'Hakemle tartışma minigame',
  usage: '.hakem',
  execute: async (message, args) => {
    try {
      // Get user
      const user = await storage.getUserByDiscordId(message.author.id);
      if (!user) {
        return message.reply('Profil bulunamadı. Lütfen bir takım seçerek başlayın: `.takim [takım adı]`');
      }
      
      // Check if user has a team
      const hasTeam = await checkUserTeam(user, message);
      if (!hasTeam) return;
      
      // Kullanıcı yetkili mi kontrol et
      const adminUserIds = ['1371879530020737214', '794205713533894696']; // Yetkili kullanıcı ID'leri
      const isAdmin = adminUserIds.includes(message.author.id);
      
      // 6 saat zaman kısıtlaması kontrol et - yetkili değilse
      const canUseCommand = await storage.checkCommandTimeout(
        user.discordId, 
        "hakem_command", 
        360, // 6 saat = 360 dakika
        isAdmin // Yetkili ise zaman kısıtlaması yok
      );
      
      if (!canUseCommand) {
        return message.reply('Hakem komutunu kullanmak için 6 saat beklemelisiniz!');
      }
      
      // Create the initial embed
      const embed = new MessageEmbed()
        .setColor('#000000')
        .setTitle('🏆 Hakemle Tartışma')
        .setDescription('Maç sonu hakem kararlarına tepki ver, sonucunu gör!')
        .addField('Olay', 'Son maçta hakem takımınız aleyhine kritik bir penaltı verdi ve maçı kaybettiniz. Hakem kararlarına nasıl tepki vereceksiniz?')
        .setFooter({ text: 'Futbol RP Bot - Hakemle Tartışma' });
      
      // Create action buttons
      const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setCustomId('hakem_sert')
            .setLabel('Sert Tepki')
            .setStyle('DANGER')
            .setEmoji('🤬'),
          new MessageButton()
            .setCustomId('hakem_normal')
            .setLabel('Tartışma')
            .setStyle('PRIMARY')
            .setEmoji('🗣️'),
          new MessageButton()
            .setCustomId('hakem_saygili')
            .setLabel('Saygılı Açıklama')
            .setStyle('SUCCESS')
            .setEmoji('🤝')
        );
      
      // Send the message
      const sentMessage = await message.reply({
        embeds: [embed],
        components: [row]
      });
      
      // Create collector for button interactions
      const collector = sentMessage.createMessageComponentCollector({
        filter: i => i.user.id === message.author.id,
        time: 60000 // 1 minute
      });
      
      collector.on('collect', async interaction => {
        let result = {
          text: '',
          fine: 0,
          fanSupport: 0,
          managementTrust: 0
        };
        
        if (interaction.customId === 'hakem_sert') {
          // Sert tepki - yüksek ceza riski
          const isFined = Math.random() < 0.8; // 80% chance of fine
          const fineAmount = isFined ? Math.floor(Math.random() * 4 + 2) * 5000 : 0; // 10000-30000 TL
          
          result = {
            text: isFined 
              ? `Sert tepkiniz nedeniyle ${fineAmount} TL para cezası aldınız! TFF disiplin kurulu sizi kınadı.`
              : 'Sert tepkinize rağmen bu sefer ceza almaktan kurtuldunuz!',
            fine: fineAmount,
            fanSupport: 10, // Fans love when coach defends the team
            managementTrust: -5 // Management doesn't like fines
          };
        } else if (interaction.customId === 'hakem_normal') {
          // Normal tartışma - orta ceza riski
          const isFined = Math.random() < 0.4; // 40% chance of fine
          const fineAmount = isFined ? Math.floor(Math.random() * 2 + 1) * 5000 : 0; // 5000-10000 TL
          
          result = {
            text: isFined 
              ? `Tepkiniz nedeniyle ${fineAmount} TL para cezası aldınız.`
              : 'Tepkiniz makul bulundu ve ceza almadınız.',
            fine: fineAmount,
            fanSupport: 5,
            managementTrust: isFined ? -2 : 2
          };
        } else if (interaction.customId === 'hakem_saygili') {
          // Saygılı açıklama - düşük ceza riski
          const isFined = Math.random() < 0.1; // 10% chance of fine
          const fineAmount = isFined ? 5000 : 0;
          
          result = {
            text: isFined 
              ? `Saygılı açıklamanıza rağmen, bazı ifadeleriniz nedeniyle ${fineAmount} TL para cezası aldınız.`
              : 'Saygılı yaklaşımınız takdir topladı ve profesyonel duruşunuz örnek gösterildi.',
            fine: fineAmount,
            fanSupport: -2, // Fans might see this as weak
            managementTrust: 5 // Management likes professional approach
          };
        }
        
        // Update user stats
        await storage.updateUserStats(
          user.discordId,
          result.fanSupport,
          result.managementTrust,
          0 // No effect on team morale
        );
        
        // Create result embed
        const resultEmbed = new MessageEmbed()
          .setColor(result.fine > 0 ? '#ED4245' : '#57F287')
          .setTitle('🏆 Hakemle Tartışma - Sonuç')
          .setDescription(result.text)
          .addField('Taraftar Tepkisi', result.fanSupport > 0 ? '👍 Olumlu' : '👎 Olumsuz', true)
          .addField('Yönetim Tepkisi', result.managementTrust > 0 ? '👍 Olumlu' : '👎 Olumsuz', true)
          .setFooter({ text: 'Futbol RP Bot - Hakemle Tartışma' });
        
        await interaction.update({
          embeds: [resultEmbed],
          components: []
        });
        
        // Award points
        await storage.addUserPoints(user.discordId, 2);
      });
      
      collector.on('end', async collected => {
        if (collected.size === 0) {
          await sentMessage.edit({
            content: 'Etkileşim süresi doldu.',
            components: []
          });
        }
      });
      
    } catch (error) {
      console.error('Error in hakem command:', error);
      message.reply('Hakemle tartışma minigame sırasında bir hata oluştu.');
    }
  }
};

// Fan interaction minigame
const taraftarCommand = {
  name: 'taraftar',
  description: 'Taraftarla polemik minigame',
  usage: '.taraftar',
  execute: async (message, args) => {
    try {
      // Get user
      const user = await storage.getUserByDiscordId(message.author.id);
      if (!user) {
        return message.reply('Profil bulunamadı. Lütfen bir takım seçerek başlayın: `.takim [takım adı]`');
      }
      
      // Check if user has a team
      const hasTeam = await checkUserTeam(user, message);
      if (!hasTeam) return;
      
      // Kullanıcı yetkili mi kontrol et
      const adminUserIds = ['1371879530020737214', '794205713533894696']; // Yetkili kullanıcı ID'leri
      const isAdmin = adminUserIds.includes(message.author.id);
      
      // 6 saat zaman kısıtlaması kontrol et - yetkili değilse
      const canUseCommand = await storage.checkCommandTimeout(
        user.discordId, 
        "taraftar_command", 
        360, // 6 saat = 360 dakika
        isAdmin // Yetkili ise zaman kısıtlaması yok
      );
      
      if (!canUseCommand) {
        return message.reply('Taraftar komutunu kullanmak için 6 saat beklemelisiniz!');
      }
      
      // Create the initial embed
      const embed = new MessageEmbed()
        .setColor('#1DA1F2') // Twitter blue
        .setTitle('🐦 Taraftarla Polemik')
        .setDescription('Sosyal medyada taraftarlarla etkileşime geç!')
        .addField('Olay', 'Takımınız son maçta kötü bir performans gösterdi ve taraftarlar sosyal medyada sizi eleştiriyor. Nasıl bir açıklama yapacaksınız?')
        .setFooter({ text: 'Futbol RP Bot - Taraftar Etkileşimi' });
      
      // Create tone selection menu
      const row = new MessageActionRow()
        .addComponents(
          new MessageSelectMenu()
            .setCustomId('taraftar_tone')
            .setPlaceholder('Açıklama tonunu seçin')
            .addOptions([
              {
                label: 'Mizahi Ton',
                description: 'Esprili bir şekilde yaklaş',
                value: 'mizahi',
                emoji: '😄'
              },
              {
                label: 'Ciddi Ton',
                description: 'Profesyonel ve ciddi yaklaş',
                value: 'ciddi',
                emoji: '🧐'
              },
              {
                label: 'Özür Dileyen Ton',
                description: 'Hataları kabul et ve özür dile',
                value: 'özür',
                emoji: '🙏'
              },
              {
                label: 'Savunmacı Ton',
                description: 'Kendini ve takımı savun',
                value: 'savunmacı',
                emoji: '🛡️'
              }
            ])
        );
      
      // Send the message
      const sentMessage = await message.reply({
        embeds: [embed],
        components: [row]
      });
      
      // Create collector for select menu interactions
      const collector = sentMessage.createMessageComponentCollector({
        filter: i => i.user.id === message.author.id,
        time: 60000 // 1 minute
      });
      
      collector.on('collect', async interaction => {
        if (interaction.isSelectMenu() && interaction.customId === 'taraftar_tone') {
          const selectedTone = interaction.values[0];
          
          // Ask user to write their message
          await interaction.update({
            content: `Seçilen ton: **${selectedTone.toUpperCase()}**\nŞimdi açıklamanızı yazın:`,
            components: []
          });
          
          // Create message collector for the explanation
          const messageCollector = message.channel.createMessageCollector({
            filter: m => m.author.id === message.author.id,
            time: 120000, // 2 minutes
            max: 1
          });
          
          messageCollector.on('collect', async m => {
            const explanation = m.content;
            
            // Calculate impact based on tone and explanation
            const impact = calculateTaraftarImpact(selectedTone, explanation);
            
            // Update user stats
            await storage.updateUserStats(
              user.discordId,
              impact.fanSupport,
              impact.managementTrust,
              impact.teamMorale
            );
            
            // Generate feedback based on tone
            let feedback = '';
            switch(selectedTone) {
              case 'mizahi':
                feedback = impact.fanSupport > 0 
                  ? 'Taraftarlar esprili yaklaşımını beğendi. Sosyal medyada paylaşımın viral oldu!'
                  : 'Taraftarlar bu durumda espri yapmanı uygun bulmadı. Daha ciddi olmalıydın.';
                break;
              case 'ciddi':
                feedback = impact.fanSupport > 0
                  ? 'Profesyonel duruşun takdir topladı. Medya senin açıklamanı olumlu karşıladı.'
                  : 'Açıklaman çok soğuk bulundu. Daha samimi olabilirdin.';
                break;
              case 'özür':
                feedback = impact.fanSupport > 0
                  ? 'Samimi özrün taraftarların kalbini kazandı. Sana yeniden şans veriyorlar.'
                  : 'Özrün samimi bulunmadı. Taraftarlar daha fazlasını bekliyor.';
                break;
              case 'savunmacı':
                feedback = impact.fanSupport > 0
                  ? 'Kendini iyi savundun. Taraftarlar bakış açını anladı.'
                  : 'Savunmacı tavrın tepki çekti. Taraftarlar sorumluluğu kabul etmeni bekliyordu.';
                break;
            }
            
            // Create result embed
            const resultEmbed = new MessageEmbed()
              .setColor(impact.fanSupport > 0 ? '#57F287' : '#ED4245')
              .setTitle('🐦 Taraftarla Polemik - Sonuç')
              .setDescription(`**Açıklaman:** ${explanation}`)
              .addField('Taraftar Tepkisi', feedback)
              .addField('Etkiler', 
                `Taraftar Desteği: ${impact.fanSupport > 0 ? '+' : ''}${impact.fanSupport}\n` +
                `Yönetim Güveni: ${impact.managementTrust > 0 ? '+' : ''}${impact.managementTrust}\n` +
                `Takım Morali: ${impact.teamMorale > 0 ? '+' : ''}${impact.teamMorale}`
              )
              .setFooter({ text: 'Futbol RP Bot - Taraftar Etkileşimi' });
              
            await message.channel.send({ embeds: [resultEmbed] });
            
            // Award points
            await storage.addUserPoints(user.discordId, 2);
          });
          
          messageCollector.on('end', collected => {
            if (collected.size === 0) {
              message.channel.send('Açıklama süresi doldu. İşlem iptal edildi.');
            }
          });
        }
      });
      
      collector.on('end', async collected => {
        if (collected.size === 0) {
          await sentMessage.edit({
            content: 'Ton seçim süresi doldu.',
            components: []
          });
        }
      });
      
    } catch (error) {
      console.error('Error in taraftar command:', error);
      message.reply('Taraftar etkileşimi sırasında bir hata oluştu.');
    }
  }
};

// Championship promise minigame
const şampiyonlukSozuCommand = {
  name: 'şampiyonluksozu',
  description: 'Şampiyonluk sözü ver',
  usage: '.şampiyonluksozu',
  execute: async (message, args) => {
    try {
      // Get user
      const user = await storage.getUserByDiscordId(message.author.id);
      if (!user) {
        return message.reply('Profil bulunamadı. Lütfen bir takım seçerek başlayın: `.takim [takım adı]`');
      }
      
      // Check if user has a team
      const hasTeam = await checkUserTeam(user, message);
      if (!hasTeam) return;
      
      // Kullanıcı yetkili mi kontrol et
      const adminUserIds = ['1371879530020737214', '794205713533894696']; // Yetkili kullanıcı ID'leri
      const isAdmin = adminUserIds.includes(message.author.id);
      
      // 6 saat zaman kısıtlaması kontrol et - yetkili değilse
      const canUseCommand = await storage.checkCommandTimeout(
        user.discordId, 
        "sampiyon_command", 
        360, // 6 saat = 360 dakika
        isAdmin // Yetkili ise zaman kısıtlaması yok
      );
      
      if (!canUseCommand) {
        return message.reply('Şampiyonluk sözü komutunu kullanmak için 6 saat beklemelisiniz!');
      }
      
      // Create the initial embed
      const embed = new MessageEmbed()
        .setColor('#FFD700')
        .setTitle('🏆 Şampiyonluk Sözü')
        .setDescription('Taraftarlar şampiyonluk sözü duymak istiyor!')
        .addField('Durum', `**${user.currentTeam}** taraftarları sosyal medyada şampiyonluk sözü vermeniz için çağrı yapıyor. Bu sezon şampiyonluk sözü verecek misiniz?`)
        .setFooter({ text: 'Futbol RP Bot - Şampiyonluk Sözü' });
      
      // Create action buttons
      const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setCustomId('sampiyon_evet')
            .setLabel('Şampiyonluk Sözü Ver')
            .setStyle('SUCCESS')
            .setEmoji('🏆'),
          new MessageButton()
            .setCustomId('sampiyon_havali')
            .setLabel('Havalı Cevap Ver')
            .setStyle('PRIMARY')
            .setEmoji('😎'),
          new MessageButton()
            .setCustomId('sampiyon_hayir')
            .setLabel('Söz Verme')
            .setStyle('DANGER')
            .setEmoji('❌')
        );
      
      // Send the message
      const sentMessage = await message.reply({
        embeds: [embed],
        components: [row]
      });
      
      // Create collector for button interactions
      const collector = sentMessage.createMessageComponentCollector({
        filter: i => i.user.id === message.author.id,
        time: 60000 // 1 minute
      });
      
      collector.on('collect', async interaction => {
        let result = {
          text: '',
          fanSupport: 0,
          managementTrust: 0,
          teamMorale: 0
        };
        
        if (interaction.customId === 'sampiyon_evet') {
          // Şampiyonluk sözü - yüksek fan desteği, orta risk
          result = {
            text: `**${user.currentTeam}** taraftarlarına şampiyonluk sözü verdiniz! Taraftarlar coşkuyla karşıladı, ama yönetim endişeli. Şimdi bu sözü tutmak için baskı altındasınız.`,
            fanSupport: 15,
            managementTrust: -5,
            teamMorale: 5
          };
          
          // Add title
          await storage.addUserTitle(user.discordId, "Şampiyonluk Avcısı");
          
        } else if (interaction.customId === 'sampiyon_havali') {
          // Havalı cevap - dengeli etki
          const responses = [
            `"Biz her zaman zirveyi hedefleriz. Taraftarlarımız merak etmesin, elimizden gelenin en iyisini yapacağız."`,
            `"Şampiyonluk konuşmak yerine sahada konuşmayı tercih ederiz. Sezon sonunda herkes sonucu görecek."`,
            `"Bizim hedefimiz belli, her zaman en üst sırada olmak. Takımıma güveniyorum."`,
            `"Süreç odaklı çalışıyoruz, sonuçlar kendiliğinden gelecek."`,
            `"Bir maç bir maç düşünüyoruz. Sezon sonunda hep birlikte göreceğiz."`
          ];
          
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          
          result = {
            text: `Havalı bir yanıt verdiniz: ${randomResponse} Bu cevap dengeli bir etki yarattı.`,
            fanSupport: 5,
            managementTrust: 5,
            teamMorale: 3
          };
          
        } else if (interaction.customId === 'sampiyon_hayir') {
          // Söz vermeme - taraftar desteği azalır, yönetim güveni artar
          result = {
            text: `Şampiyonluk sözü vermekten kaçındınız. Taraftarlar hayal kırıklığına uğrasa da, yönetim gerçekçi yaklaşımınızı takdir etti.`,
            fanSupport: -10,
            managementTrust: 10,
            teamMorale: -2
          };
        }
        
        // Update user stats
        await storage.updateUserStats(
          user.discordId,
          result.fanSupport,
          result.managementTrust,
          result.teamMorale
        );
        
        // Create result embed
        const resultEmbed = new MessageEmbed()
          .setColor('#FFD700')
          .setTitle('🏆 Şampiyonluk Sözü - Sonuç')
          .setDescription(result.text)
          .addField('Etkiler', 
            `Taraftar Desteği: ${result.fanSupport > 0 ? '+' : ''}${result.fanSupport}\n` +
            `Yönetim Güveni: ${result.managementTrust > 0 ? '+' : ''}${result.managementTrust}\n` +
            `Takım Morali: ${result.teamMorale > 0 ? '+' : ''}${result.teamMorale}`
          )
          .setFooter({ text: 'Futbol RP Bot - Şampiyonluk Sözü' });
        
        await interaction.update({
          embeds: [resultEmbed],
          components: []
        });
        
        // Award points
        await storage.addUserPoints(user.discordId, 3);
      });
      
      collector.on('end', async collected => {
        if (collected.size === 0) {
          await sentMessage.edit({
            content: 'Etkileşim süresi doldu.',
            components: []
          });
        }
      });
      
    } catch (error) {
      console.error('Error in şampiyonluksozu command:', error);
      message.reply('Şampiyonluk sözü sırasında bir hata oluştu.');
    }
  }
};

// Helper function to calculate impact for taraftar command
function calculateTaraftarImpact(tone, explanation) {
  let impact = {
    fanSupport: 0,
    managementTrust: 0,
    teamMorale: 0
  };
  
  // Base impact based on tone
  switch(tone) {
    case 'mizahi':
      impact.fanSupport = 5;
      impact.managementTrust = -2;
      impact.teamMorale = 3;
      break;
    case 'ciddi':
      impact.fanSupport = 0;
      impact.managementTrust = 5;
      impact.teamMorale = 0;
      break;
    case 'özür':
      impact.fanSupport = 8;
      impact.managementTrust = 3;
      impact.teamMorale = -2;
      break;
    case 'savunmacı':
      impact.fanSupport = -5;
      impact.managementTrust = 0;
      impact.teamMorale = 5;
      break;
  }
  
  // Adjust based on explanation length
  if (explanation.length > 50) {
    impact.fanSupport += 3;
    impact.managementTrust += 2;
  }
  
  if (explanation.length > 100) {
    impact.fanSupport += 2;
    impact.managementTrust += 3;
  }
  
  // Check for positive and negative words
  const positiveWords = ['teşekkür', 'anlayış', 'gelişim', 'çalışkan', 'sabır', 'özür', 'başarı'];
  const negativeWords = ['kötü', 'zayıf', 'hata', 'yanlış', 'başarısız', 'yetersiz'];
  
  // Adjust impact based on word usage
  for (const word of positiveWords) {
    if (explanation.toLowerCase().includes(word)) {
      impact.fanSupport += 1;
      impact.managementTrust += 1;
    }
  }
  
  for (const word of negativeWords) {
    if (explanation.toLowerCase().includes(word)) {
      impact.teamMorale -= 1;
    }
  }
  
  // Random factor for variability
  const randomFactor = Math.floor(Math.random() * 5) - 2; // -2 to +2
  impact.fanSupport += randomFactor;
  impact.managementTrust += randomFactor;
  
  return impact;
}

module.exports = {
  yalanMakinesiCommand,
  hakemCommand,
  taraftarCommand,
  şampiyonlukSozuCommand
};