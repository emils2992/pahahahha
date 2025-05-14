// CommonJS versiyonu - Glitch uyumluluğu için
const express = require('express');
const { createServer } = require('http');
const { Client, Collection } = require('discord.js');
const { log, setupServer } = require('./vite.cjs');
const fs = require('fs');
const path = require('path');

// Basic Express server
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Discord client reference
let discordClient = null;

// Main function
async function main() {
  try {
    // Create HTTP server
    const port = process.env.PORT || 5000;
    const server = createServer(app);
    
    // Simple status endpoint
    app.get('/api/status', (req, res) => {
      res.json({ 
        status: 'operational',
        message: 'Discord bot server is running',
        botStatus: discordClient ? 'online' : 'offline',
        botUsername: discordClient?.user?.username || 'Not connected',
        uptime: discordClient ? Math.floor(discordClient.uptime / 1000) + 's' : '0s'
      });
    });
    
    // Setup server with static file serving and default route
    setupServer(app);
    
    // Initialize Discord bot
    try {
      const token = process.env.DISCORD_BOT_TOKEN;
      if (!token) {
        console.warn('Discord bot token is not set in environment variables.');
        console.log('Bot will not be started without a valid token');
      } else {
        // Initialize Discord client
        const client = new Client({
          intents: [
            'GUILDS',
            'GUILD_MESSAGES',
            'GUILD_MEMBERS',
            'DIRECT_MESSAGES'
          ]
        });
        
        // Create a new collection for storing commands
        client.commands = new Collection();
        
        // Check if commands directory exists
        const commandsPath = path.join(__dirname, 'discord', 'commands');
        let commandFiles = [];
        
        try {
          if (fs.existsSync(commandsPath)) {
            // Get all command files
            commandFiles = fs.readdirSync(commandsPath)
              .filter(file => file.endsWith('.js') || file.endsWith('.cjs'))
              .filter(file => file !== 'index.js' && file !== 'index.cjs');
            
            // Load each command
            for (const file of commandFiles) {
              try {
                const commandPath = path.join(commandsPath, file);
                const command = require(commandPath);
                
                // Get all exported commands
                for (const key in command) {
                  if (key.endsWith('Command') && typeof command[key] === 'object' && command[key].name) {
                    const cmd = command[key];
                    client.commands.set(cmd.name, cmd);
                    console.log(`Loaded command: ${cmd.name}`);
                    
                    // Add Turkish alias for help command
                    if (cmd.name === 'help') {
                      client.commands.set('yardım', cmd);
                    }
                  }
                }
              } catch (error) {
                console.error(`Error loading command file ${file}:`, error);
              }
            }
          } else {
            console.warn(`Commands directory not found: ${commandsPath}`);
          }
        } catch (error) {
          console.error('Error loading commands:', error);
        }
        
        // Register bot events
        client.on('ready', () => {
          console.log(`Logged in as ${client.user.tag}!`);
          client.user.setActivity('.h | Futbol Menajerlik', { type: 'PLAYING' });
        });
        
        client.on('messageCreate', async (message) => {
          // Ignore messages from bots
          if (message.author.bot) return;
          
          // Check if the message starts with the prefix
          const prefix = '.';
          if (!message.content.startsWith(prefix)) return;
          
          // Parse the command and arguments
          const args = message.content.slice(prefix.length).trim().split(/ +/);
          const commandName = args.shift().toLowerCase();
          
          // Log the received command
          console.log(`Command received: ${commandName} with args: [${args.join(', ')}]`);
          
          // Check if the command exists
          const command = client.commands.get(commandName);
          
          // If command doesn't exist, handle simple built-in commands
          if (!command) {
            // Simple ping command for testing
            if (commandName === 'ping') {
              return message.reply('Pong! Bot is working.');
            }
            
            // Simple help command if no custom help is loaded
            if (commandName === 'h' || commandName === 'help' || commandName === 'yardım') {
              const helpEmbed = {
                color: 0x0099ff,
                title: 'Teknik Direktör Bot Yardım',
                description: 'Aşağıdaki komutları kullanarak futbol menajerlik simülasyonunu oynayabilirsiniz:',
                fields: [
                  { name: '.takim', value: 'Takım seçimi yapmak için' },
                  { name: '.taktik', value: 'Takım taktiklerini belirlemek için' },
                  { name: '.karar', value: 'Teknik direktör kararları vermek için' },
                  { name: '.basin', value: 'Basın toplantısı düzenlemek için' },
                  { name: '.durum', value: 'Teknik direktör durumunuzu görmek için' }
                ],
                footer: { text: 'Futbol Menajerlik Discord Bot' },
              };
              
              return message.reply({ embeds: [helpEmbed] });
            }
            
            return; // Command doesn't exist
          }
          
          // Execute the command
          try {
            await command.execute(message, args);
          } catch (error) {
            console.error(`Error executing command ${commandName}:`, error);
            message.reply('Bu komut çalıştırılırken bir hata oluştu!');
          }
        });
        
        // Log in to Discord
        await client.login(token);
        discordClient = client;
        console.log('Discord bot initialized successfully');
      }
    } catch (error) {
      console.error('Error initializing Discord bot:', error);
    }
    
    // Start server
    server.listen(port, "0.0.0.0", () => {
      console.log(`Server running on port ${port}`);
      console.log(`Bot web interface available at http://localhost:${port}`);
      
      // Log information about the bot status
      if (!discordClient) {
        console.log("\n⚠️ IMPORTANT: Discord bot is not running!");
        console.log("To use the Discord bot, make sure to set the DISCORD_BOT_TOKEN environment variable.\n");
      } else {
        console.log("\n✅ Discord bot is online and ready to receive commands!\n");
      }
    });
  } catch (error) {
    console.error("Server startup error:", error);
  }
}

// Start the application
main().catch(err => {
  console.error("Application error:", err);
});

// Express ve HTTP sunucusu kapatılırken düzgün şekilde Discord bot'u da kapatın
process.on('SIGINT', () => {
  console.log('Shutting down...');
  if (discordClient) {
    discordClient.destroy();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  if (discordClient) {
    discordClient.destroy();
  }
  process.exit(0);
});