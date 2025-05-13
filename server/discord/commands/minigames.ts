import { 
  Message, 
  MessageEmbed, 
  MessageActionRow, 
  MessageButton,
  MessageSelectMenu 
} from 'discord.js';
import { storage } from '../../storage';
import { checkUserTeam, createTutorialEmbed } from '../utils/helpers';

// Lie detector minigame
export const yalanMakinesiCommand = {
  name: 'yalanmakinesi',
  description: 'Yalan makinesi minigame',
  usage: '.yap yalanmakinesi [ifade]',
  execute: async (message: Message, args: string[]) => {
    try {
      // Get user
      const user = await storage.getUserByDiscordId(message.author.id);
      if (!user) {
        return message.reply('Profil bulunamadı. Lütfen bir takım seçerek başlayın: `.yap takim [takım adı]`');
      }
      
      // Check if user has a team
      const hasTeam = await checkUserTeam(user, message);
      if (!hasTeam) return;
      
      if (!args.length) {
        return message.reply({
          embeds: [
            createTutorialEmbed(
              'Yalan Makinesi Yardımı',
              '**Kullanım:** `.yap yalanmakinesi [ifade]`\n\n' +
              '**Örnek:** `.yap yalanmakinesi Bu takıma tamamen güveniyorum`\n\n' +
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
export const hakemCommand = {
  name: 'hakem',
  description: 'Hakemle tartışma minigame',
  usage: '.yap hakem',
  execute: async (message: Message, args: string[]) => {
    try {
      // Get user
      const user = await storage.getUserByDiscordId(message.author.id);
      if (!user) {
        return message.reply('Profil bulunamadı. Lütfen bir takım seçerek başlayın: `.yap takim [takım adı]`');
      }
      
      // Check if user has a team
      const hasTeam = await checkUserTeam(user, message);
      if (!hasTeam) return;
      
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
export const taraftarCommand = {
  name: 'taraftar',
  description: 'Taraftarla polemik minigame',
  usage: '.yap taraftar',
  execute: async (message: Message, args: string[]) => {
    try {
      // Get user
      const user = await storage.getUserByDiscordId(message.author.id);
      if (!user) {
        return message.reply('Profil bulunamadı. Lütfen bir takım seçerek başlayın: `.yap takim [takım adı]`');
      }
      
      // Check if user has a team
      const hasTeam = await checkUserTeam(user, message);
      if (!hasTeam) return;
      
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
              .setColor('#1DA1F2')
              .setTitle('🐦 Taraftarla Polemik - Sonuç')
              .setDescription(`**Açıklaman:** ${explanation}`)
              .addField('Taraftar Tepkisi', `${impact.fanSupport > 0 ? '👍' : '👎'} ${Math.abs(impact.fanSupport)} puan ${impact.fanSupport > 0 ? 'artış' : 'azalış'}`, true)
              .addField('Yönetim Tepkisi', `${impact.managementTrust > 0 ? '👍' : '👎'} ${Math.abs(impact.managementTrust)} puan ${impact.managementTrust > 0 ? 'artış' : 'azalış'}`, true)
              .addField('Takım Morali', `${impact.teamMorale > 0 ? '👍' : '👎'} ${Math.abs(impact.teamMorale)} puan ${impact.teamMorale > 0 ? 'artış' : 'azalış'}`, true)
              .addField('Sonuç', feedback)
              .setFooter({ text: 'Futbol RP Bot - Taraftar Etkileşimi' });
            
            await message.channel.send({ embeds: [resultEmbed] });
            
            // Award points
            await storage.addUserPoints(user.discordId, 3);
          });
          
          messageCollector.on('end', collected => {
            if (collected.size === 0) {
              message.channel.send('Açıklama yazma süresi doldu.');
            }
          });
        }
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
      console.error('Error in taraftar command:', error);
      message.reply('Taraftarla polemik minigame sırasında bir hata oluştu.');
    }
  }
};

// Championship promise minigame
export const şampiyonlukSozuCommand = {
  name: 'şampiyonluksozu',
  description: 'Şampiyonluk sözü ver/tuttur minigame',
  usage: '.yap şampiyonluksozu',
  execute: async (message: Message, args: string[]) => {
    try {
      // Get user
      const user = await storage.getUserByDiscordId(message.author.id);
      if (!user) {
        return message.reply('Profil bulunamadı. Lütfen bir takım seçerek başlayın: `.yap takim [takım adı]`');
      }
      
      // Check if user has a team
      const hasTeam = await checkUserTeam(user, message);
      if (!hasTeam) return;
      
      // Check if user already made a promise
      const hasPromise = (user.seasonRecords as any)?.şampiyonlukSözü;
      
      if (hasPromise) {
        // User already made a promise, create follow-up
        const previousPromise = (user.seasonRecords as any).şampiyonlukSözü;
        
        // Create embed for following up on the promise
        const followUpEmbed = new MessageEmbed()
          .setColor('#FEE75C')
          .setTitle('🏆 Şampiyonluk Sözü - Hatırlatma')
          .setDescription(`Sezon başında şöyle söz vermiştin:\n\n"${previousPromise}"`)
          .addField('Medya Baskısı', 'Medya verdiğin sözü hatırlatıyor ve nasıl ilerleyeceğini soruyor. Ne dersin?')
          .setFooter({ text: 'Futbol RP Bot - Şampiyonluk Sözü' });
        
        // Create button options for follow-up
        const row = new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setCustomId('promise_confident')
              .setLabel('Hala Arkasındayım')
              .setStyle('SUCCESS'),
            new MessageButton()
              .setCustomId('promise_cautious')
              .setLabel('Temkinli Yaklaş')
              .setStyle('PRIMARY'),
            new MessageButton()
              .setCustomId('promise_avoid')
              .setLabel('Konuyu Değiştir')
              .setStyle('SECONDARY')
          );
        
        // Send the message
        const sentMessage = await message.reply({
          embeds: [followUpEmbed],
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
          
          if (interaction.customId === 'promise_confident') {
            result = {
              text: 'Verdiğin sözün arkasında durman taraftarları etkiledi! Medya senin kararlılığını övdü.',
              fanSupport: 10,
              managementTrust: 5,
              teamMorale: 8
            };
          } else if (interaction.customId === 'promise_cautious') {
            result = {
              text: 'Temkinli yaklaşımın makul bulundu. Gerçekçi olmak bazılarını hayal kırıklığına uğratsa da yönetim takdir etti.',
              fanSupport: -2,
              managementTrust: 8,
              teamMorale: 3
            };
          } else if (interaction.customId === 'promise_avoid') {
            result = {
              text: 'Konuyu değiştirme girişimin medyanın dikkatinden kaçmadı. Taraftarlar sözünü tutamayacağını düşünüyor.',
              fanSupport: -8,
              managementTrust: -5,
              teamMorale: -5
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
            .setColor('#FEE75C')
            .setTitle('🏆 Şampiyonluk Sözü - Sonuç')
            .setDescription(result.text)
            .addField('Taraftar Tepkisi', `${result.fanSupport > 0 ? '📈' : '📉'} ${Math.abs(result.fanSupport)} puan ${result.fanSupport > 0 ? 'artış' : 'azalış'}`, true)
            .addField('Yönetim Tepkisi', `${result.managementTrust > 0 ? '📈' : '📉'} ${Math.abs(result.managementTrust)} puan ${result.managementTrust > 0 ? 'artış' : 'azalış'}`, true)
            .addField('Takım Morali', `${result.teamMorale > 0 ? '📈' : '📉'} ${Math.abs(result.teamMorale)} puan ${result.teamMorale > 0 ? 'artış' : 'azalış'}`, true)
            .setFooter({ text: 'Futbol RP Bot - Şampiyonluk Sözü' });
          
          await interaction.update({
            embeds: [resultEmbed],
            components: []
          });
          
          // Award points
          await storage.addUserPoints(user.discordId, 3);
        });
        
      } else {
        // User hasn't made a promise yet
        // Create the initial embed
        const embed = new MessageEmbed()
          .setColor('#FEE75C')
          .setTitle('🏆 Şampiyonluk Sözü')
          .setDescription('Sezon başındasın ve medya senden sezon hedeflerini açıklamanı istiyor. Şampiyonluk hakkında ne söyleyeceksin?')
          .setFooter({ text: 'Futbol RP Bot - Şampiyonluk Sözü' });
        
        // Create button options
        const row = new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setCustomId('promise_strong')
              .setLabel('Kesin Söz Ver')
              .setStyle('DANGER')
              .setEmoji('🏆'),
            new MessageButton()
              .setCustomId('promise_moderate')
              .setLabel('Umutlu Ol')
              .setStyle('PRIMARY')
              .setEmoji('🤞'),
            new MessageButton()
              .setCustomId('promise_cautious')
              .setLabel('Hedef Belirtme')
              .setStyle('SECONDARY')
              .setEmoji('🤫')
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
          let promise = '';
          let initialImpact = {
            fanSupport: 0,
            managementTrust: 0,
            teamMorale: 0
          };
          
          if (interaction.customId === 'promise_strong') {
            promise = `Bu sezon şampiyonluğu kesinlikle kazanacağız! Taraftarlarımıza söz veriyorum.`;
            initialImpact = {
              fanSupport: 15,
              managementTrust: -5, // Management worried about high expectations
              teamMorale: 10
            };
          } else if (interaction.customId === 'promise_moderate') {
            promise = `Şampiyonluk için elimizden geleni yapacağız, iyi bir kadromuz var ve umutluyuz.`;
            initialImpact = {
              fanSupport: 5,
              managementTrust: 5,
              teamMorale: 5
            };
          } else if (interaction.customId === 'promise_cautious') {
            promise = `Şu anda hedef belirtmek için erken. Maç maç düşünüp elimizden geleni yapacağız.`;
            initialImpact = {
              fanSupport: -5, // Fans disappointed by lack of ambition
              managementTrust: 10, // Management likes the realistic approach
              teamMorale: 0
            };
          }
          
          // Update user stats
          await storage.updateUserStats(
            user.discordId,
            initialImpact.fanSupport,
            initialImpact.managementTrust,
            initialImpact.teamMorale
          );
          
          // Update user records with the promise
          const updatedRecords = {
            ...(user.seasonRecords as any || {}),
            şampiyonlukSözü: promise
          };
          
          await storage.updateUser(user.id, { seasonRecords: updatedRecords });
          
          // Create result embed
          const resultEmbed = new MessageEmbed()
            .setColor('#FEE75C')
            .setTitle('🏆 Şampiyonluk Sözü - Sonuç')
            .setDescription(`**Açıklaman:** "${promise}"`)
            .addField('İlk Tepkiler', 'Açıklaman medyada geniş yankı uyandırdı! Bu sözün ilerleyen haftalarda hatırlanacak.')
            .addField('Taraftar Tepkisi', `${initialImpact.fanSupport > 0 ? '📈' : '📉'} ${Math.abs(initialImpact.fanSupport)} puan ${initialImpact.fanSupport > 0 ? 'artış' : 'azalış'}`, true)
            .addField('Yönetim Tepkisi', `${initialImpact.managementTrust > 0 ? '📈' : '📉'} ${Math.abs(initialImpact.managementTrust)} puan ${initialImpact.managementTrust > 0 ? 'artış' : 'azalış'}`, true)
            .addField('Takım Morali', `${initialImpact.teamMorale > 0 ? '📈' : '📉'} ${Math.abs(initialImpact.teamMorale)} puan ${initialImpact.teamMorale > 0 ? 'artış' : 'azalış'}`, true)
            .setFooter({ text: 'Futbol RP Bot - Şampiyonluk Sözü' });
          
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
              content: 'Söz verme süresi doldu.',
              components: []
            });
          }
        });
      }
      
    } catch (error) {
      console.error('Error in şampiyonluksozu command:', error);
      message.reply('Şampiyonluk sözü minigame sırasında bir hata oluştu.');
    }
  }
};

// Helper function to calculate impact for taraftar command
function calculateTaraftarImpact(tone: string, explanation: string): { fanSupport: number, managementTrust: number, teamMorale: number } {
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
  } else if (explanation.length < 10) {
    impact.fanSupport -= 3;
    impact.managementTrust -= 2;
  }
  
  // Add some randomness
  impact.fanSupport += Math.floor(Math.random() * 7) - 3;  // -3 to +3
  impact.managementTrust += Math.floor(Math.random() * 5) - 2;  // -2 to +2
  impact.teamMorale += Math.floor(Math.random() * 5) - 2;  // -2 to +2
  
  return impact;
}
