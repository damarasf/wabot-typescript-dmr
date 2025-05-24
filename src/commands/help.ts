import { Message, Client } from '@open-wa/wa-automate';
import { User, UserLevel } from '../database/models';
import { Command } from '../middlewares/commandParser';
import { getCommandsByCategory, getCommand } from '../handlers/commandHandler';
import { formatHelpCommand, formatBox } from '../utils/formatter';
import config from '../utils/config';

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
   */
  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    try {
      console.log(`ℹ️ Processing help command from ${message.sender.id}`);
      
      // Get user information for permission filtering
      const userLevel = user ? user.level : UserLevel.UNREGISTERED;
      const isOwner = String(message.sender.id) === config.ownerNumber;
      const isRegistered = user !== undefined;
      
      console.log(`👤 User level: ${userLevel}, Owner: ${isOwner}, Registered: ${isRegistered}`);
      
      // Handle specific command help request
      if (args.length > 0) {
        await handleSpecificCommandHelp(message, args[0], client, userLevel, isOwner);
        return;
      }
      
      // Generate general help menu
      await generateGeneralHelpMenu(message, client, userLevel, isOwner, isRegistered);
      
    } catch (error) {
      console.error('❌ Error in help command:', error);
      
      try {
        await client.reply(
          message.chatId,
          '❌ Terjadi kesalahan saat menampilkan menu bantuan.\n\n' +
          '_Silakan coba lagi atau hubungi administrator._',
          message.id
        );
      } catch (replyError) {
        console.error('❌ Failed to send help error message:', replyError);
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
 */
async function handleSpecificCommandHelp(
  message: Message, 
  commandName: string, 
  client: Client, 
  userLevel: UserLevel, 
  isOwner: boolean
): Promise<void> {
  try {
    const command = getCommand(commandName.toLowerCase());
    
    if (!command) {
      console.log(`❓ Command not found: ${commandName}`);
      await client.reply(
        message.chatId,
        `❌ Perintah \`${commandName}\` tidak ditemukan.\n\n` +
        '*Gunakan* `!help` *untuk melihat daftar perintah yang tersedia.*',
        message.id
      );
      return;
    }
    
    // Check if user has permission to see this command
    const canAccess = checkCommandAccess(command, userLevel, isOwner);
    
    if (!canAccess) {
      console.log(`🚫 Access denied for command ${commandName} to user level ${userLevel}`);
      await client.reply(
        message.chatId,
        `🚫 Anda tidak memiliki izin untuk mengakses perintah \`${commandName}\`.\n\n` +
        '_Tingkatkan level akun Anda atau hubungi administrator._',
        message.id
      );
      return;
    }
    
    // Generate detailed command help
    const helpText = formatHelpCommand(command);
    console.log(`✅ Sending detailed help for command: ${commandName}`);
    
    await client.reply(message.chatId, helpText, message.id);
    
  } catch (error) {
    console.error(`❌ Error getting help for command ${commandName}:`, error);
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
 */
async function generateGeneralHelpMenu(
  message: Message, 
  client: Client, 
  userLevel: UserLevel, 
  isOwner: boolean, 
  isRegistered: boolean
): Promise<void> {
  try {
    // Get all commands organized by category
    const categories = getCommandsByCategory();
    
    // Create help message header
    let helpMessage = `🤖 *${config.botName} - Menu Bantuan*\n\n`;
    
    // Add user status information
    const levelName = getUserLevelName(userLevel);
    helpMessage += `👤 *Status:* ${isRegistered ? `${levelName}` : 'Belum Terdaftar'}\n`;
    helpMessage += `🎯 *Prefix:* ${config.prefixes.join(', ')}\n\n`;
    
    // Add registration notice for unregistered users
    if (!isRegistered) {
      helpMessage += `⚠️ *Daftar dulu untuk akses penuh!*\n`;
      helpMessage += `Ketik \`!register\` untuk mendaftar.\n\n`;
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
    helpMessage += `🔢 *Total Perintah Tersedia:* ${totalCommands}\n\n`;
    helpMessage += `💡 *Tips:*\n`;
    helpMessage += `• Ketik \`!help [nama perintah]\` untuk detail\n`;
    helpMessage += `• Upgrade ke Premium untuk akses lebih banyak\n`;
    helpMessage += `• Gunakan prefix ${config.prefixes[0]} sebelum perintah\n\n`;
    helpMessage += `_Developed with ❤️ for better automation_`;
    
    console.log(`📋 Generated help menu with ${totalCommands} commands for user level ${userLevel}`);
    
    // Send help message
    await client.reply(message.chatId, helpMessage, message.id);
    
  } catch (error) {
    console.error('❌ Error generating general help menu:', error);
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
 * @returns Human-readable level name
 */
function getUserLevelName(level: UserLevel): string {
  switch (level) {
    case UserLevel.UNREGISTERED:
      return 'Belum Terdaftar';
    case UserLevel.FREE:
      return 'Free';
    case UserLevel.PREMIUM:
      return 'Premium';
    case UserLevel.ADMIN:
      return 'Admin';
    default:
      return 'Unknown';
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
