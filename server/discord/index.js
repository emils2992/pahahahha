import { Client } from 'discord.js';
import { loadCommands } from './commandLoader.js';
import { registerEvents } from './events/index.js';

// Discord client instance
let discordClient = null;

// Set up Discord bot
export async function setupDiscordBot() {
  try {
    // Check if token exists
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) {
      console.warn('Discord bot token is not set in environment variables.');
      console.log('Bot tokenı yok - ancak veriler hala saklanacak ve yüklenecek');
      return;
    }
    
    // Create Discord client with required intents
    const client = new Client({
      intents: [
        'GUILDS',              // For guild info and events
        'GUILD_MESSAGES',      // For message commands
        'GUILD_MEMBERS',       // For member info
        'DIRECT_MESSAGES'      // For DM commands
      ]
    });
    
    // Load all commands
    await loadCommands();
    
    // Register all event handlers
    registerEvents(client);
    
    // Log in to Discord
    await client.login(token);
    
    // Store client for later reference
    discordClient = client;
    
    console.log('Discord bot initialized and connected.');
  } catch (error) {
    console.error('Discord bot initialization error:', error);
    discordClient = null;
  }
}

// Get the Discord client instance
export function getDiscordClient() {
  return discordClient;
}

// Stop the Discord bot
export async function stopDiscordBot() {
  if (discordClient) {
    console.log('Shutting down Discord bot...');
    discordClient.destroy();
    discordClient = null;
    console.log('Discord bot shut down.');
  }
}