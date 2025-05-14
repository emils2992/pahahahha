const { Client, Intents } = require('discord.js');
const { registerEvents } = require('./events');

// Discord client instance
let client = null;

// Setup Discord bot
async function setupDiscordBot() {
  try {
    // Check for bot token
    const token = process.env.DISCORD_BOT_TOKEN;
    
    if (!token) {
      console.error('Discord bot token is not set in environment variables.');
      // Token olmasa bile devam ediyoruz - bu sayede tokensiz durumda da verileri saklayabiliriz
      console.log('Bot tokenı yok - ancak veriler hala saklanacak ve yüklenecek');
      return;
    }
    
    // Create a new client
    client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGES
      ],
      partials: ['MESSAGE', 'CHANNEL', 'REACTION']
    });
    
    // Register event handlers
    registerEvents(client);
    
    // Login to Discord
    await client.login(token);
    
    console.log('Discord bot setup complete');
    
    // Register process exit events to properly logout
    process.on('SIGINT', () => {
      console.log('SIGINT signal received: logging out Discord bot');
      client?.destroy();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: logging out Discord bot');
      client?.destroy();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error setting up Discord bot:', error);
    throw error;
  }
}

// Get the Discord client instance
function getDiscordClient() {
  return client;
}

// Stop the Discord bot
async function stopDiscordBot() {
  if (client) {
    await client.destroy();
    client = null;
    console.log('Discord bot stopped');
  }
}

module.exports = {
  setupDiscordBot,
  getDiscordClient,
  stopDiscordBot
};