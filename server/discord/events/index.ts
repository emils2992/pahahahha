import { Client, Message } from 'discord.js';
import { commands } from '../commands';

// Handler for message create event
export function handleMessageCreate(client: Client) {
  client.on('messageCreate', async (message: Message) => {
    // Ignore bot messages
    if (message.author.bot) return;
    
    // Command prefixes - both direct commands with "." and full form with ".h" are supported
    const fullPrefix = '.h';
    const directPrefix = '.';
    
    // Check for direct command (like .durum)
    if (message.content.startsWith(directPrefix)) {
      // Skip the full prefix version to avoid duplicate handling
      if (message.content.startsWith(fullPrefix)) {
        // Handle with full prefix below
      } else {
        // This is a direct command like ".durum"
        const command = message.content.slice(directPrefix.length).split(/ +/)[0].toLowerCase();
        const restArgs = message.content.slice(directPrefix.length + command.length).trim().split(/ +/);
        
        // Get command from collection
        const cmdObj = commands.get(command);
        if (cmdObj) {
          try {
            await cmdObj.execute(message, restArgs);
          } catch (error) {
            console.error(`Error executing direct command "${command}":`, error);
            message.reply({
              content: 'Komut çalıştırılırken bir hata oluştu.'
            });
          }
          return;
        }
      }
    }
    
    // Check for full prefix (.h command)
    if (!message.content.startsWith(fullPrefix)) return;
    
    // Parse command and arguments
    const args = message.content.slice(fullPrefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    
    // If only prefix is given without command, show help
    if (!commandName) {
      // Get help command and execute it
      const helpCommand = commands.get('help');
      if (helpCommand) {
        return helpCommand.execute(message, []);
      }
      return;
    }
    
    // Get command from collection
    const command = commands.get(commandName);
    
    if (!command) {
      // Unknown command
      return message.reply({
        content: `Bilinmeyen komut: ${commandName}. Kullanılabilir komutlar için \`.h\` yazınız.`
      });
    }
    
    // Execute command
    try {
      await command.execute(message, args);
    } catch (error) {
      console.error(`Error executing command "${commandName}":`, error);
      message.reply({
        content: 'Komut çalıştırılırken bir hata oluştu.'
      });
    }
  });
}

// Handler for client ready event
export function handleReady(client: Client) {
  client.once('ready', () => {
    console.log(`Bot giriş yaptı: ${client.user?.tag}`);
    
    // Set bot activity
    client.user?.setActivity('Futbol RP | .h', { type: 'PLAYING' });
  });
}

// Initialize all event handlers
export function registerEvents(client: Client) {
  handleReady(client);
  handleMessageCreate(client);
  
  // Error handling
  client.on('error', (error) => {
    console.error('Discord client error:', error);
  });
  
  client.on('shardError', (error) => {
    console.error('Discord websocket error:', error);
  });
  
  // Process-level error handling
  process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
  });
}
