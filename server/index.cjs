// CommonJS versiyonu - Glitch uyumluluğu için
const express = require('express');
const { createServer } = require('http');
const { Client } = require('discord.js');

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
        botStatus: discordClient ? 'online' : 'offline'
      });
    });
    
    // Handle root path
    app.get('/', (req, res) => {
      const botStatus = discordClient ? '✅ Online' : '❌ Offline (token missing)';
      
      res.send(`
        <html>
          <head>
            <title>Football Manager Discord Bot</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              h1 { color: #333; }
              .status { padding: 10px; background: #e8f5e9; border-radius: 4px; margin: 20px 0; }
              .offline { background: #ffebee; }
              code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
            </style>
          </head>
          <body>
            <h1>Football Manager Discord Bot</h1>
            <div class="status ${discordClient ? '' : 'offline'}">
              <h3>Discord Bot Status: ${botStatus}</h3>
              <p>${discordClient 
                 ? 'Bot is ready to receive commands.' 
                 : 'Bot is not connected. Make sure DISCORD_BOT_TOKEN is set in your environment variables.'}</p>
            </div>
            <p>This is a simple web interface for the Discord bot. The actual bot functionality runs through Discord commands.</p>
            <p>Commands available:</p>
            <ul>
              <li><code>.takim</code> - Takım seçimi yapmak için</li>
              <li><code>.karar</code> - Teknik direktör kararları vermek için</li>
              <li><code>.taktik</code> - Taktik ayarları için</li>
              <li><code>.basin</code> - Basın toplantısı düzenlemek için</li>
              <li><code>.durum</code> - Teknik direktör durumunu görmek için</li>
              <li><code>.h</code> - Yardım menüsü için</li>
            </ul>
          </body>
        </html>
      `);
    });
    
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
        
        // Register bot events
        client.on('ready', () => {
          console.log(`Logged in as ${client.user.tag}!`);
        });
        
        client.on('messageCreate', async (message) => {
          // Ignore messages from bots or messages that don't start with the prefix
          if (message.author.bot || !message.content.startsWith('.')) return;
          
          console.log(`Message received: ${message.content}`);
          
          // Simple ping command for testing
          if (message.content === '.ping') {
            message.reply('Pong! Bot is working.');
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