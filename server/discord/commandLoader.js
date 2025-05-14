// Command loader for Discord bot
const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

// Collection to store all commands
const commands = new Collection();

// Load all command files
function loadCommands() {
  try {
    // Read command directory
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => 
      file.endsWith('.js') || file.endsWith('.ts')
    );

    // Clear existing commands
    commands.clear();

    // Load each command file
    for (const file of commandFiles) {
      if (file === 'index.ts' || file === 'index.js') continue; // Skip index files
      
      const filePath = path.join(commandsPath, file);
      
      try {
        // Require the command file
        const command = require(filePath);
        
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

module.exports = {
  loadCommands,
  getCommands: () => commands
};