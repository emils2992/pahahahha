// Command loader for Discord bot
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Collection } from 'discord.js';
import { commands } from './commands/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load all command files
export async function loadCommands() {
  try {
    // Read command directory
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => 
      file.endsWith('.js')
    );

    // Clear existing commands
    commands.clear();

    // Load each command file
    for (const file of commandFiles) {
      if (file === 'index.js') continue; // Skip index files
      
      const filePath = path.join(commandsPath, file);
      
      try {
        // Import the command file
        const commandModule = await import(`./commands/${file}`);
        const command = commandModule.default || commandModule;
        
        // Get commands from the file
        // Each file could export multiple commands
        Object.keys(command).forEach(key => {
          if (key.endsWith('Command') && typeof command[key] === 'object' && command[key].name) {
            const cmd = command[key];
            commands.set(cmd.name, cmd);
            
            // Add aliases if any
            if (cmd.name === 'help') {
              commands.set('yardım', cmd); // Turkish alternative for help
            }
          }
        });
      } catch (error) {
        console.error(`Error loading command file ${file}:`, error);
      }
    }
    
    console.log(`Loaded ${commands.size} commands`);
    
  } catch (error) {
    console.error('Error in loadCommands:', error);
  }
  
  return commands;
}

export function getCommands() {
  return commands;
}