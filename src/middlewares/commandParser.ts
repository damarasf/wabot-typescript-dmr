import { Message, Client } from '@open-wa/wa-automate';
import { User, UserLevel } from '../database/models';
import config from '../utils/config';
import * as userManager from '../utils/userManager';
import { isOwner, normalizePhoneNumber } from '../utils/phoneUtils';

// Command interface
export interface Command {
  name: string;
  aliases?: string[];
  description: string;
  usage: string;
  example: string;
  category: string;
  cooldown?: number;
  requiredArgs?: number;
  minimumLevel?: UserLevel;
  groupOnly?: boolean;
  ownerOnly?: boolean;
  adminOnly?: boolean;
  execute: (message: Message, args: string[], client: Client, user?: User) => Promise<void>;
}

// Command with context interface
export interface CommandWithContext {
  command: Command;
  args: string[];
  user?: User;
}

// Last command usage timestamp cache to prevent spam
const cooldowns = new Map<string, Map<string, number>>();

// Parse and validate command
export async function parseCommand(message: Message): Promise<CommandWithContext | null> {
  // Get prefix from message
  const prefix = getPrefix(message.body);
  if (!prefix) return null;
  
  // Split message by spaces
  const args = message.body.slice(prefix.length).trim().split(/\s+/);
  
  // Get command name
  const commandName = args.shift()?.toLowerCase();
  if (!commandName) return null;
  
  // Find command in commands collection
  const command = findCommand(commandName);
  if (!command) return null;  // Get user from database if not owner
  let user: User | undefined;
  if (!isOwner(message.sender.id, config.ownerNumber)) {
    // Normalize phone number before database lookup
    const existingUser = await userManager.getUserByPhone(message.sender.id);
    
    // Check if command requires registration
    if (command.minimumLevel && command.minimumLevel > UserLevel.UNREGISTERED && !existingUser) {
      return null; // User needs to register first
    }
    
    if (existingUser) {
      user = existingUser;
      // Update user's last active timestamp
      await userManager.updateUserActivity(existingUser);
    }
  }
  
  // Validate command usage
  const validationResult = await validateCommandUsage(command, message, user);
  if (!validationResult.valid) {
    return null;
  }
  
  return { command, args, user };
}

// Get prefix from message
function getPrefix(content: string): string | null {
  for (const prefix of config.prefixes) {
    if (content.startsWith(prefix)) {
      return prefix;
    }
  }
  return null;
}

// Find command by name or alias
function findCommand(commandName: string): Command | null {
  // This will be implemented by importing from commandHandler
  const { getCommand } = require('../handlers/commandHandler');
  return getCommand(commandName) || null;
}

// Validate command usage context
async function validateCommandUsage(
  command: Command,
  message: Message,
  user?: User
): Promise<{ valid: boolean; reason?: string }> {  // Check if command is owner-only
  if (command.ownerOnly && !isOwner(message.sender.id, config.ownerNumber)) {
    return { valid: false, reason: 'Perintah ini hanya dapat digunakan oleh owner bot.' };
  }
  
  // Check if command is admin-only
  if (command.adminOnly && (!user || user.level < UserLevel.ADMIN) && !isOwner(message.sender.id, config.ownerNumber)) {
    return { valid: false, reason: 'Perintah ini hanya dapat digunakan oleh admin bot.' };
  }
  
  // Check minimum user level
  if (command.minimumLevel && (!user || user.level < command.minimumLevel) && !isOwner(message.sender.id, config.ownerNumber)) {
    return { valid: false, reason: `Perintah ini memerlukan level minimal ${UserLevel[command.minimumLevel]}.` };
  }
  
  // Check if command is group-only
  if (command.groupOnly && !message.isGroupMsg) {
    return { valid: false, reason: 'Perintah ini hanya dapat digunakan di dalam grup.' };
  }
  
  // Check if command has required number of arguments
  if (command.requiredArgs && command.requiredArgs > 0 && message.body.trim().split(/\s+/).length - 1 < command.requiredArgs) {
    return { valid: false, reason: `Argumen tidak cukup. Penggunaan: ${command.usage}` };
  }
  
  // Check cooldown
  if (command.cooldown) {
    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Map());
    }
    
    const timestamps = cooldowns.get(command.name)!;
    const cooldownAmount = command.cooldown * 1000;
    const now = Date.now();
    
    if (timestamps.has(message.sender.id)) {
      const expirationTime = timestamps.get(message.sender.id)! + cooldownAmount;
      
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return {
          valid: false,
          reason: `Mohon tunggu ${timeLeft.toFixed(1)} detik sebelum menggunakan perintah \`${command.name}\` lagi.`
        };
      }
    }
    
    timestamps.set(message.sender.id, now);
    setTimeout(() => timestamps.delete(message.sender.id), cooldownAmount);
  }
  
  return { valid: true };
}

export default {
  parseCommand,
  getPrefix,
};
