import { Message, Client } from '@open-wa/wa-automate';
import { User, UserLevel, Language } from '../database/models';
import { Command } from '../middlewares/commandParser';
import { getCommandsByCategory, getCommand } from '../handlers/commandHandler';
import { formatHelpCommand } from '../utils/formatter';
import { getText } from '../utils/i18n';
import config from '../utils/config';
import logger from '../utils/logger';

/**
 * Help Command
 * Displays bot commands with user-level filtering and detailed command information
 * Features category organization, permission filtering, and command search
 */
const help: Command = {
  name: 'help',
  aliases: ['menu', 'cmd', 'commands'],
  description: 'Menampilkan daftar perintah bot',
  usage: '!help [nama perintah]',
  example: '!help register',
  category: 'Umum',
  cooldown: 5,

  /**
   * Execute the help command
   * @param message - WhatsApp message object
   * @param args - Command arguments [optional: command_name]
   * @param client - WhatsApp client instance
   * @param user - User database object for permission filtering
   */  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    try {
      
      // Get user information for permission filtering
      const userLevel = user ? user.level : UserLevel.UNREGISTERED;
      const isOwner = String(message.sender.id) === config.ownerNumber;
      const isRegistered = user !== undefined;
      const userLanguage = user?.language || Language.INDONESIAN;
      
      // Handle specific command help request
      if (args.length > 0) {
        await handleSpecificCommandHelp(message, args[0], client, userLevel, isOwner, userLanguage);
        return;
      }
      
      // Generate general help menu
      await generateGeneralHelpMenu(message, client, userLevel, isOwner, isRegistered, userLanguage);
    } catch (error) {
      logger.error('Error in help command:', { 
        error: error instanceof Error ? error.message : error,
        chatId: message.chatId,
        sender: message.sender?.id || 'unknown'
      });
      
      try {
        const userLang = user?.language || Language.INDONESIAN;
        await client.reply(
          message.chatId,
          getText('command.error', userLang),
          message.id
        );
      } catch (replyError) {
        logger.error('Failed to send help error message:', { 
          error: replyError instanceof Error ? replyError.message : replyError,
          chatId: message.chatId 
        });
      }
    }
  },
};

/**
 * Handle help request for a specific command
 * @param message - WhatsApp message object
 * @param commandName - Name of the command to get help for
 * @param client - WhatsApp client instance
 * @param userLevel - User's permission level
 * @param isOwner - Whether user is the bot owner
 * @param userLanguage - User's preferred language
 */
async function handleSpecificCommandHelp(
  message: Message, 
  commandName: string, 
  client: Client, 
  userLevel: UserLevel, 
  isOwner: boolean,  userLanguage: Language = Language.INDONESIAN
): Promise<void> {
  try {
    const command = getCommand(commandName.toLowerCase());
      if (!command) {
      logger.command('Command not found', { 
        commandName, 
        sender: message.sender.id 
      });      await client.reply(
        message.chatId,
        getText('help.command_not_found', userLanguage),
        message.id
      );
      return;
    }
    
    // Check if user has permission to see this command
    const canAccess = checkCommandAccess(command, userLevel, isOwner);
      if (!canAccess) {
      logger.security('Access denied for command', { 
        commandName, 
        userLevel, 
        sender: message.sender.id 
      });      await client.reply(
        message.chatId,
        getText('user.no_permission', userLanguage),
        message.id
      );
      return;
    }
      // Generate detailed command help
    const helpText = formatHelpCommand(command);
    logger.success('Sending detailed help for command', { 
      commandName, 
      sender: message.sender.id 
    });
    
    await client.reply(message.chatId, helpText, message.id);
      } catch (error) {
    logger.error('Error getting help for command', { 
      commandName, 
      error: error instanceof Error ? error.message : error,
      sender: message.sender.id 
    });
    throw error;
  }
}

/**
 * Generate the general help menu with all available commands
 * @param message - WhatsApp message object
 * @param client - WhatsApp client instance
 * @param userLevel - User's permission level
 * @param isOwner - Whether user is the bot owner
 * @param isRegistered - Whether user is registered
 * @param userLanguage - User's preferred language
 */
async function generateGeneralHelpMenu(
  message: Message, 
  client: Client, 
  userLevel: UserLevel, 
  isOwner: boolean, 
  isRegistered: boolean,
  userLanguage: Language = Language.INDONESIAN
): Promise<void> {
  try {
    // Get all commands organized by category
    const categories = getCommandsByCategory();
      // Create help message header
    let helpMessage = `${getText('help.title', userLanguage)}\n\n`;
    
    // Add user status information
    const levelName = getUserLevelName(userLevel, userLanguage);
    helpMessage += `${getText('help.status', userLanguage)}: ${isRegistered ? `${levelName}` : getText('help.not_registered', userLanguage)}\n`;
    helpMessage += `${getText('help.prefix', userLanguage)}: ${config.prefixes.join(', ')}\n\n`;
    
    // Add registration notice for unregistered users
    if (!isRegistered) {
      helpMessage += `${getText('help.register_notice', userLanguage)}\n\n`;
    }
    
    let totalCommands = 0;
    
    // Process each category
    for (const [category, commands] of Object.entries(categories)) {
      // Filter commands based on user permissions
      const availableCommands = commands.filter(cmd => 
        checkCommandAccess(cmd, userLevel, isOwner)
      );
      
      // Skip empty categories
      if (availableCommands.length === 0) continue;
      
      // Add category header
      helpMessage += `📂 *${category.toUpperCase()}*\n`;
      
      // Add each command with icon
      for (const cmd of availableCommands) {
        const icon = getCommandIcon(cmd.category);
        helpMessage += `${icon} \`${cmd.name}\` - ${cmd.description}\n`;
        totalCommands++;
      }
      
      helpMessage += '\n';
    }
      // Add footer with additional information
    helpMessage += `${getText('help.total_commands', userLanguage)}: ${totalCommands}\n\n`;
    helpMessage += `${getText('help.tips', userLanguage)}:\n`;
    helpMessage += `${getText('help.tip_detail', userLanguage)}\n\n`;
    helpMessage += `${getText('help.footer', userLanguage)}`;
    
    // Send help message
    await client.reply(message.chatId, helpMessage, message.id);
  } catch (error) {
    logger.error('Error generating general help menu:', { 
      error: error instanceof Error ? error.message : error,
      sender: message.sender.id 
    });
    throw error;
  }
}

/**
 * Check if user has access to a specific command
 * @param command - Command object to check
 * @param userLevel - User's permission level
 * @param isOwner - Whether user is the bot owner
 * @returns Boolean indicating access permission
 */
function checkCommandAccess(command: Command, userLevel: UserLevel, isOwner: boolean): boolean {
  // Owner can access all commands
  if (isOwner) return true;
  
  // Check command restrictions
  if (command.ownerOnly) return false;
  if (command.adminOnly && userLevel < UserLevel.ADMIN) return false;
  if (command.minimumLevel && userLevel < command.minimumLevel) return false;
  
  return true;
}

/**
 * Get human-readable name for user level
 * @param level - User level enum value
 * @param userLanguage - User's preferred language
 * @returns Human-readable level name
 */
function getUserLevelName(level: UserLevel, userLanguage: Language = Language.INDONESIAN): string {
  switch (level) {
    case UserLevel.UNREGISTERED:
      return getText('level.unregistered', userLanguage);
    case UserLevel.FREE:
      return getText('level.free', userLanguage);
    case UserLevel.PREMIUM:
      return getText('level.premium', userLanguage);
    case UserLevel.ADMIN:
      return getText('level.admin', userLanguage);
    default:
      return getText('common.unknown', userLanguage);
  }
}

/**
 * Get appropriate icon for command category
 * @param category - Command category name
 * @returns Emoji icon for the category
 */
function getCommandIcon(category: string): string {
  const icons: { [key: string]: string } = {
    'Umum': '🔧',
    'Admin': '⚡',
    'Premium': '💎',
    'Utilitas': '🛠️',
    'Fun': '🎮',
    'Moderation': '🛡️',
    'System': '⚙️',
    'Database': '🗄️'
  };
  
  return icons[category] || '📌';
}

export default help;
