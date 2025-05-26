import { Message, Client } from '@open-wa/wa-automate';
import { User, UserLevel, Language } from '../database/models';
import config from '../utils/config';
import * as userManager from '../utils/userManager';
import { isOwner, normalizePhoneNumber } from '../utils/phoneUtils';
import { formatHelpCommand } from '../utils/formatter';
import { getText } from '../utils/i18n';

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

// Check if user needs usage hint for multi-word commands
export async function checkAndSendUsageHint(message: Message, client: Client): Promise<boolean> {
  // Get prefix from message
  const prefix = getPrefix(message.body);
  if (!prefix) return false;

  // Split message by spaces
  const args = message.body.slice(prefix.length).trim().split(/\s+/);

  // Get command name
  const commandName = args.shift()?.toLowerCase();
  if (!commandName) return false;

  // Find command in commands collection
  const command = findCommand(commandName);
  if (!command) return false;

  // Check if command requires more than 1 argument and user provided insufficient args
  if (command.requiredArgs && command.requiredArgs > 1 && args.length < command.requiredArgs) {
    try {
      // Get user for language preference
      const user = await userManager.getUserByPhone(message.sender.id);
      const userLanguage = user?.language || Language.INDONESIAN;
      
      // Send usage hint with formatted command help
      const usageHint = getText('validation.usage_hint', userLanguage, undefined, {
        commandHelp: formatHelpCommand(command)
      });
      
      await client.reply(message.chatId, usageHint, message.id);
      return true; // Indicates that usage hint was sent
    } catch (error) {
      console.error('Error sending usage hint:', error);
    }
  }

  return false; // No usage hint needed or sent
}

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
  if (!command) return null;  // Get user from database - always lookup user object, even for owner
  let user: User | undefined;
  const userIsOwner = isOwner(message.sender.id, config.ownerNumber);
  
  // Always get user from database for consistency
  const existingUser = await userManager.getUserByPhone(message.sender.id);
  
  // For non-owners, check if command requires registration
  if (!userIsOwner && command.minimumLevel && command.minimumLevel > UserLevel.UNREGISTERED && !existingUser) {
    return null; // User needs to register first
  }
  
  if (existingUser) {
    user = existingUser;
    // Update user's last active timestamp
    await userManager.updateUserActivity(existingUser);
  }
  
  // For owners without database record, they can still access owner-only commands
  // but commands that require user data will need to handle undefined user gracefully
  
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
): Promise<{ valid: boolean; reason?: string }> {
  const userIsOwner = isOwner(message.sender.id, config.ownerNumber);
  const userLanguage = user?.language || Language.INDONESIAN;

  // Check if command is owner-only
  if (command.ownerOnly && !userIsOwner) {
    return { 
      valid: false, 
      reason: getText('validation.owner_only', userLanguage) 
    };
  }

  // Check if command is admin-only
  if (command.adminOnly && (!user || user.level < UserLevel.ADMIN) && !userIsOwner) {
    return { 
      valid: false, 
      reason: getText('validation.admin_only', userLanguage) 
    };
  }

  // Check minimum user level
  if (command.minimumLevel && (!user || user.level < command.minimumLevel) && !userIsOwner) {
    return { 
      valid: false, 
      reason: getText('validation.minimum_level', userLanguage, undefined, {
        level: UserLevel[command.minimumLevel]
      })
    };
  }

  // Check if command is group-only
  if (command.groupOnly && !message.isGroupMsg) {
    return { 
      valid: false, 
      reason: getText('validation.group_only', userLanguage) 
    };
  }

  // Check if command has required number of arguments
  if (command.requiredArgs && command.requiredArgs > 0 && message.body.trim().split(/\s+/).length - 1 < command.requiredArgs) {
    return { 
      valid: false, 
      reason: getText('validation.insufficient_args', userLanguage, undefined, {
        usage: command.usage
      })
    };
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
          reason: getText('validation.cooldown', userLanguage, undefined, {
            timeLeft: timeLeft.toFixed(1),
            commandName: command.name
          })
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
  checkAndSendUsageHint,
};
