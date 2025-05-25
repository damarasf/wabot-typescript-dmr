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
   */
  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    const userIsOwner = message.sender.id.replace('@c.us', '') === config.ownerNumber;
    
    // Validate user registration (except for owner who can always view profile)
    if (!user && !userIsOwner) {
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
    
    // Create virtual user object for owner if not in database
    let profileUser = user;
    if (!user && userIsOwner) {
      // Create a temporary user object for owner
      profileUser = {
        id: 0,
        phoneNumber: config.ownerNumber,
        level: UserLevel.ADMIN,
        language: 'id' as any, // Default to Indonesian
        registeredAt: new Date(),
        lastActivity: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isOwner: () => true,
        getLevelName: () => 'Owner',
        getDisplayName: async (client?: Client) => {
          if (!client) return config.ownerNumber;
          try {
            const contactId = `${config.ownerNumber}@c.us` as any;
            const contact = await client.getContact(contactId);
            return contact?.name || contact?.pushname || config.ownerNumber;
          } catch (error) {
            return config.ownerNumber;
          }
        }
      } as User;
    }      
    
    try {
      logger.user('Displaying profile for user', {
        userId: message.sender.id,
        phoneNumber: profileUser!.phoneNumber,
        userLevel: profileUser!.level
      });
      
      // Get user's display name from WhatsApp if possible
      let displayName = message.sender.pushname || getText('common.unknown', profileUser!.language);
      
      try {
        // Try to get display name from user model method
        if (typeof profileUser!.getDisplayName === 'function') {
          displayName = await profileUser!.getDisplayName(client);
        }
      } catch (nameError) {
        logger.debug('Could not fetch display name from WhatsApp API, using fallback', {
          userId: message.sender.id,
          error: nameError instanceof Error ? nameError.message : String(nameError)
        });
      }
      
      // Format comprehensive user information
      const userInfo = formatUserInfo(profileUser!);
      
      // Add current session information
      const isOwner = profileUser!.phoneNumber === config.ownerNumber;
      const contextInfo = message.isGroupMsg ? 
        getText('profile.context_group', profileUser!.language) : 
        getText('profile.context_personal', profileUser!.language);
      
      const enhancedProfile = `${getText('profile.title', profileUser!.language)}\n\n` +
        `${getText('profile.name', profileUser!.language)} ${displayName}\n` +
        `${userInfo}\n\n` +
        `${contextInfo}\n` +
        `${getText('profile.access_time', profileUser!.language)} ${new Date().toLocaleString('id-ID', {
          timeZone: 'Asia/Jakarta',
          dateStyle: 'full',
          timeStyle: 'short'
        })}\n\n` +
        (isOwner ? `${getText('profile.owner_status', profileUser!.language)}\n` : '') +
        `${getText('profile.help_footer', profileUser!.language)}`;
        
      logger.success('Profile displayed successfully for user', {
        userId: message.sender.id,
        phoneNumber: profileUser!.phoneNumber,
        displayName: displayName
      });
      
      // Send the enhanced user profile
      await client.reply(message.chatId, enhancedProfile, message.id);
        } catch (error) {
      logger.error('Error getting user profile', {
        userId: message.sender.id,
        phoneNumber: profileUser?.phoneNumber,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Enhanced error handling with specific error types
      let errorMessage = getText('profile.error', profileUser?.language);
      
      if (error instanceof Error) {
        if (error.message.includes('database')) {
          errorMessage = getText('profile.database_error', profileUser?.language);
        } else if (error.message.includes('format')) {
          errorMessage = getText('profile.format_error', profileUser?.language);
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
