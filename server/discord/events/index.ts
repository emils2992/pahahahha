import { Client, Message } from 'discord.js';
import { commands } from '../commands';

// Handler for message create event
export function handleMessageCreate(client: Client) {
  client.on('messageCreate', async (message: Message) => {
    // Ignore bot messages
    if (message.author.bot) return;
    
    // Command prefix
    const prefix = '.yap';
    
    // Check if message starts with prefix
    if (!message.content.startsWith(prefix)) return;
    
    // Parse command and arguments
    const args = message.content.slice(prefix.length).trim().split(/ +/);
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
        content: `Bilinmeyen komut: ${commandName}. Kullanılabilir komutlar için \`.yap\` yazınız.`
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
    client.user?.setActivity('Futbol RP | .yap', { type: 'PLAYING' });
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
