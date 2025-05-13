import { 
  Message, 
  MessageEmbed 
} from 'discord.js';
import { commands } from './index';
import { createTutorialEmbed } from '../utils/helpers';

// Help command
export const helpCommand = {
  name: 'help',
  description: 'Tüm komutları ve açıklamaları göster',
  usage: '.help [komut adı] veya .h help [komut adı]',
  execute: async (message: Message, args: string[]) => {
    try {
      // If a specific command is requested
      if (args.length > 0) {
        const commandName = args[0].toLowerCase();
        const command = commands.get(commandName);
        
        if (!command) {
          return message.reply(`"${commandName}" isminde bir komut bulunamadı.`);
        }
        
        const helpEmbed = createTutorialEmbed(
          `${command.name.toUpperCase()} Komutu Yardımı`,
          `**Açıklama:** ${command.description}\n\n` +
          `**Kullanım:** ${command.usage}\n\n`
        );
        
        return message.reply({ embeds: [helpEmbed] });
      }
      
      // Otherwise, show all commands grouped by category
      const mainCommands = [
        { name: 'basın', category: 'Ana Komutlar' },
        { name: 'karar', category: 'Ana Komutlar' },
        { name: 'kadrodisi', category: 'Ana Komutlar' },
        { name: 'özür', category: 'Ana Komutlar' },
        { name: 'taktik', category: 'Ana Komutlar' },
        { name: 'takim', category: 'Ana Komutlar' },
        { name: 'takımım', category: 'Ana Komutlar' },
        { name: 'bülten', category: 'Ana Komutlar' },
        { name: 'durum', category: 'Ana Komutlar' },
        { name: 'ekle', category: 'Ana Komutlar' }
      ];
      
      const mediaCommands = [
        { name: 'dedikodu', category: 'Medya Komutları' },
        { name: 'sızdır', category: 'Medya Komutları' }
      ];
      
      const minigameCommands = [
        { name: 'yalanmakinesi', category: 'Minigame Komutları' },
        { name: 'hakem', category: 'Minigame Komutları' },
        { name: 'taraftar', category: 'Minigame Komutları' },
        { name: 'şampiyonluksozu', category: 'Minigame Komutları' },
        { name: 'vs', category: 'Minigame Komutları' }
      ];
      
      const helpEmbed = new MessageEmbed()
        .setColor('#5865F2')
        .setTitle('📚 Futbol RP Bot - Komut Listesi')
        .setDescription('Komutlar doğrudan `.` öneki ile kullanılabilir. Örnek: `.durum`\n\n' +
                        'Alternatif olarak `.h` öneki de kullanılabilir. Örnek: `.h durum`\n\n' +
                        'Belirli bir komut hakkında daha fazla bilgi almak için `.help [komut]` veya `.h help [komut]` komutunu kullanabilirsin.')
        .setFooter({ text: 'Futbol RP Bot - Premier League 2025/26' });
      
      // Add command categories
      const addCommandsToEmbed = (commandList: { name: string, category: string }[], embed: MessageEmbed) => {
        const categoryName = commandList[0].category;
        const commandTexts: string[] = [];
        
        commandList.forEach(cmd => {
          const command = commands.get(cmd.name);
          if (command) {
            commandTexts.push(`**${command.name}** - ${command.description}`);
          }
        });
        
        embed.addField(`🔹 ${categoryName}`, commandTexts.join('\n'));
      };
      
      // Add all command categories to the embed
      addCommandsToEmbed(mainCommands, helpEmbed);
      addCommandsToEmbed(mediaCommands, helpEmbed);
      addCommandsToEmbed(minigameCommands, helpEmbed);
      
      return message.reply({ embeds: [helpEmbed] });
      
    } catch (error) {
      console.error('Error in help command:', error);
      message.reply('Yardım gösterimi sırasında bir hata oluştu.');
    }
  }
};