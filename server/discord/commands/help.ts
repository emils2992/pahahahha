import { 
  Message, 
  MessageEmbed 
} from 'discord.js';
import { commands } from './index';
import { createTutorialEmbed } from '../utils/helpers';

// Define a type for our commands to help TypeScript understand their structure
interface DiscordCommand {
  name: string;
  description: string;
  usage: string;
  execute: (message: Message, args: string[]) => Promise<any>;
}

// Interface for command items in category lists
interface CommandItem {
  name: string;
  category: string;
}

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
        const command = commands.get(commandName) as DiscordCommand | undefined;
        
        if (!command) {
          return message.reply(`"${commandName}" isminde bir komut bulunamadı.`);
        }
        
        // Now TypeScript knows the structure of command
        const name = command.name;
        const description = command.description;
        const usage = command.usage;
        
        const helpEmbed = createTutorialEmbed(
          `${name.toUpperCase()} Komutu Yardımı`,
          `**Açıklama:** ${description}\n\n` +
          `**Kullanım:** ${usage}\n\n`
        );
        
        return message.reply({ embeds: [helpEmbed] });
      }
      
      // Otherwise, show all commands grouped by category
      const mainCommands: CommandItem[] = [
        { name: 'basın', category: 'Ana Komutlar' },
        { name: 'karar', category: 'Ana Komutlar' },
        { name: 'özür', category: 'Ana Komutlar' },
        { name: 'taktik', category: 'Ana Komutlar' },
        { name: 'takim', category: 'Ana Komutlar' },
        { name: 'bülten', category: 'Ana Komutlar' },
        { name: 'durum', category: 'Ana Komutlar' }
      ];
      
      const mediaCommands: CommandItem[] = [
        { name: 'dedikodu', category: 'Medya Komutları' },
        { name: 'sızdır', category: 'Medya Komutları' }
      ];
      
      const minigameCommands: CommandItem[] = [
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
      const addCommandsToEmbed = (commandList: CommandItem[], embed: MessageEmbed) => {
        if (commandList.length === 0) return;
        
        const categoryName = commandList[0].category;
        const commandTexts: string[] = [];
        
        commandList.forEach(cmd => {
          const command = commands.get(cmd.name) as DiscordCommand | undefined;
          // Only add commands that exist in the collection
          if (command) {
            commandTexts.push(`**${command.name}** - ${command.description}`);
          }
        });
        
        // Only add the field if there are commands to display
        if (commandTexts.length > 0) {
          embed.addField(`🔹 ${categoryName}`, commandTexts.join('\n'));
        }
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