import { Client, Intents } from 'discord.js';
import { registerEvents } from './events';

// Discord client instance
let client: Client | null = null;

// Setup Discord bot
export async function setupDiscordBot(): Promise<void> {
  try {
    // Check for bot token
    const token = process.env.DISCORD_BOT_TOKEN;
    
    if (!token) {
      console.error('Discord bot token is not set in environment variables.');
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
export function getDiscordClient(): Client | null {
  return client;
}

// Stop the Discord bot
export async function stopDiscordBot(): Promise<void> {
  if (client) {
    await client.destroy();
    client = null;
    console.log('Discord bot stopped');
  }
}
