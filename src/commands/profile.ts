import { Message, Client } from '@open-wa/wa-automate';
import { User, UserLevel } from '../database/models';
import { Command } from '../middlewares/commandParser';
import { formatUserInfo } from '../utils/formatter';
import { getText } from '../utils/i18n';
import config from '../utils/config';
import logger from '../utils/logger';

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
      logger.debug('Unregistered user attempted to view profile', {
        userId: message.sender.id,
        command: 'profile'
      });
      await client.reply(
        message.chatId,
        getText('user.not_registered'),
        message.id
      );
      return;
    }
      try {
      logger.user('Displaying profile for user', {
        userId: message.sender.id,
        phoneNumber: user.phoneNumber,
        userLevel: user.level
      });
      
      // Get user's display name from WhatsApp if possible
      let displayName = message.sender.pushname || getText('common.unknown', user.language);
      
      try {
        // Try to get display name from user model method
        if (typeof user.getDisplayName === 'function') {
          displayName = await user.getDisplayName(client);
        }
      } catch (nameError) {
        logger.debug('Could not fetch display name from WhatsApp API, using fallback', {
          userId: message.sender.id,
          error: nameError instanceof Error ? nameError.message : String(nameError)
        });
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
        logger.success('Profile displayed successfully for user', {
        userId: message.sender.id,
        phoneNumber: user.phoneNumber,
        displayName: displayName
      });
      
      // Send the enhanced user profile
      await client.reply(message.chatId, enhancedProfile, message.id);
      
    } catch (error) {
      logger.error('Error getting user profile', {
        userId: message.sender.id,
        phoneNumber: user?.phoneNumber,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Enhanced error handling with specific error types
      let errorMessage = getText('profile.error', user?.language);
      
      if (error instanceof Error) {
        if (error.message.includes('database')) {
          errorMessage = getText('profile.database_error', user?.language);        } else if (error.message.includes('format')) {
          errorMessage = getText('profile.format_error', user?.language);
        }
        logger.debug('Profile error details', {
          userId: message.sender.id,
          errorMessage: error.message,
          errorType: error.constructor.name
        });
      }
      
      try {
        await client.reply(
          message.chatId,
          errorMessage,
          message.id
        );
      } catch (replyError) {
        logger.error('Failed to send profile error message', {
          userId: message.sender.id,
          originalError: error instanceof Error ? error.message : String(error),
          replyError: replyError instanceof Error ? replyError.message : String(replyError)
        });
      }
    }
  },
};

export default profile;
