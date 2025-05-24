import { Message, Client } from '@open-wa/wa-automate';
import { User, UserLevel } from '../database/models';
import { Command } from '../middlewares/commandParser';
import { formatUserInfo } from '../utils/formatter';
import { getText } from '../utils/i18n';
import config from '../utils/config';

/**
 * Profile Command
 * Displays comprehensive user profile information including:
 * - Registration status and level
 * - Usage statistics and limits
 * - Account activity information
 */
const profile: Command = {
  name: 'profile',
  aliases: ['profil', 'me', 'user'],
  description: 'Melihat profil pengguna',
  usage: '!profile',
  example: '!profile',
  category: 'Umum',
  cooldown: 5,
  minimumLevel: UserLevel.FREE,
  
  /**
   * Execute the profile command
   * @param message - WhatsApp message object
   * @param args - Command arguments (unused for profile)
   * @param client - WhatsApp client instance
   * @param user - User database object
   */  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    // Validate user registration
    if (!user) {
      console.log(`❌ Unregistered user attempted to view profile: ${message.sender.id}`);
      await client.reply(
        message.chatId,
        getText('user.not_registered'),
        message.id
      );
      return;
    }
    
    try {
      console.log(`👤 Displaying profile for user ${user.phoneNumber}`);
      
      // Get user's display name from WhatsApp if possible
      let displayName = message.sender.pushname || getText('common.unknown', user.language);
      
      try {
        // Try to get display name from user model method
        if (typeof user.getDisplayName === 'function') {
          displayName = await user.getDisplayName(client);
        }
      } catch (nameError) {
        console.log('Could not fetch display name from WhatsApp API, using fallback');
      }
      
      // Format comprehensive user information
      const userInfo = formatUserInfo(user);
      
      // Add current session information
      const isOwner = user.phoneNumber === config.ownerNumber;
      const contextInfo = message.isGroupMsg ? 
        getText('profile.context_group', user.language) : 
        getText('profile.context_personal', user.language);
      
      const enhancedProfile = `${getText('profile.title', user.language)}\n\n` +
        `${getText('profile.name', user.language)} ${displayName}\n` +
        `${userInfo}\n\n` +
        `${contextInfo}\n` +
        `${getText('profile.access_time', user.language)} ${new Date().toLocaleString('id-ID', { 
          timeZone: 'Asia/Jakarta',
          dateStyle: 'full',
          timeStyle: 'short'
        })}\n\n` +
        (isOwner ? `${getText('profile.owner_status', user.language)}\n` : '') +
        `${getText('profile.help_footer', user.language)}`;
      
      console.log(`✅ Profile displayed successfully for user ${user.phoneNumber}`);
      
      // Send the enhanced user profile
      await client.reply(message.chatId, enhancedProfile, message.id);
      
    } catch (error) {
      console.error('❌ Error getting user profile:', error);
      
      // Enhanced error handling with specific error types
      let errorMessage = getText('profile.error', user?.language);
      
      if (error instanceof Error) {
        if (error.message.includes('database')) {
          errorMessage = getText('profile.database_error', user?.language);
        } else if (error.message.includes('format')) {
          errorMessage = getText('profile.format_error', user?.language);
        }
        console.error('Error details:', error.message);
      }
      
      try {        await client.reply(
          message.chatId,
          errorMessage,
          message.id
        );
      } catch (replyError) {
        console.error('❌ Failed to send error message:', replyError);
      }
    }
  },
};

export default profile;
