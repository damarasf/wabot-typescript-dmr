import { Command } from '../middlewares/commandParser';
import path from 'path';
import fs from 'fs';
import { log } from '../utils/logger';

// Collection of all commands
const commands: Map<string, Command> = new Map();

// Load all commands from commands directory
export async function loadCommands(): Promise<void> {
  const commandFiles = fs
    .readdirSync(path.join(__dirname, '../commands'))
    .filter((file) => file.endsWith('.js') || file.endsWith('.ts'));

  for (const file of commandFiles) {
    try {
      // Import command dynamically
      const commandModule = await import(path.join(__dirname, '../commands', file));
      const command = commandModule.default;
        if (command && command.name) {        // Add command to collection
        commands.set(command.name, command);
        // Only log if debug level is enabled
        if (process.env.LOG_LEVEL === 'debug') {
          log.success(`Loaded command: ${command.name}`);
        }
      } else {
        log.warn(`Invalid command file: ${file}`);
      }
    } catch (error) {
      log.error(`Failed to load command from ${file}`, error);
    }
  }
  
  log.info(`Loaded a total of ${commands.size} commands`);
}

// Get command by name or alias
export function getCommand(name: string): Command | undefined {
  // Check for exact command name
  if (commands.has(name)) {
    return commands.get(name);
  }
  
  // Check for command aliases
  for (const command of commands.values()) {
    if (command.aliases && command.aliases.includes(name)) {
      return command;
    }
  }
  
  return undefined;
}

// Get all commands
export function getAllCommands(): Command[] {
  return Array.from(commands.values());
}

// Get commands by category
export function getCommandsByCategory(): Record<string, Command[]> {
  const categories: Record<string, Command[]> = {};
  
  for (const command of commands.values()) {
    if (!categories[command.category]) {
      categories[command.category] = [];
    }
    
    categories[command.category].push(command);
  }
  
  return categories;
}

export default {
  loadCommands,
  getCommand,
  getAllCommands,
  getCommandsByCategory,
};
