import { commands } from '../commands/index.js';

// Handler for message create event
export function handleMessageCreate(client) {
  client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;
    
    // Komut kanalı kısıtlaması kaldırıldı
    // Her komut her kanalda çalışabilir, ancak bazıları zaman sınırlamalı olacak
    
    // Zaman kısıtlamasız her yerde çalışabilen bilgi komutları
    const alwaysAllowedCommands = [
      'takim', 'bülten', 'durum', 'yalanmakinesi', 'taktik', 'help', 'yardım', 'vs'
    ];
    
    // NOT: Zaman kısıtlaması komutların kendi içinde kontrol ediliyor (storage.checkCommandTimeout ile)
    // Kanal kısıtlaması artık uygulanmıyor
    
    // Command prefixes - both direct commands with "." and full form with ".h" are supported
    const fullPrefix = '.h';
    const directPrefix = '.';
    
    // Check for full prefix (.h command) first - this needs higher priority
    if (message.content.startsWith(fullPrefix)) {
      // Parse command and arguments for full prefix
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
      return; // Important: exit after handling full prefix command
    }
    
    // Check for direct command (like .durum)
    if (message.content.startsWith(directPrefix)) {
      // Get the full command string (e.g., "durum", "hakem", etc.)
      const commandText = message.content.slice(directPrefix.length).split(/ +/)[0].toLowerCase();
      
      // Only match exact commands, not prefix of longer commands
      const restArgs = message.content.slice(directPrefix.length + commandText.length).trim().split(/ +/);
      
      // Get exact command from collection
      const cmdObj = commands.get(commandText);
      if (cmdObj) {
        try {
          await cmdObj.execute(message, restArgs);
        } catch (error) {
          console.error(`Error executing direct command "${commandText}":`, error);
          message.reply({
            content: 'Komut çalıştırılırken bir hata oluştu.'
          });
        }
      }
      return;
    }
  });
}

// Handler for client ready event
export function handleReady(client) {
  client.once('ready', () => {
    console.log(`Bot giriş yaptı: ${client.user?.tag}`);
    
    // Set bot activity
    client.user?.setActivity('Futbol RP | .h', { type: 'PLAYING' });
  });
}

// Initialize all event handlers
export function registerEvents(client) {
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