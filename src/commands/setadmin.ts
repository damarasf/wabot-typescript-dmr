import { Message, Client, ContactId } from '@open-wa/wa-automate';
import { User, UserLevel, Language } from '../database/models';
import { Command } from '../middlewares/commandParser';
import * as userManager from '../utils/userManager';
import config from '../utils/config';
import logger from '../utils/logger';
import { normalizePhoneNumber, formatForWhatsApp, getDisplayPhoneNumber, isOwner } from '../utils/phoneUtils';
import { getText } from '../utils/i18n';

/**
 * Set Admin Command
 * Allows the bot owner to promote users to Admin level
 * Features comprehensive validation, user mention support, and notification system
 */
const setadmin: Command = {
  name: 'setadmin',
  aliases: ['makeadmin', 'admin'],
  description: 'Jadikan pengguna sebagai Admin',
  usage: '!setadmin @user',
  example: '!setadmin @user',
  category: 'Owner',
  cooldown: 5,
  requiredArgs: 1,
  ownerOnly: true,
    /**
   * Execute the setadmin command
   * @param message - WhatsApp message object
   * @param args - Command arguments [phone_number or mention]
   * @param client - WhatsApp client instance
   * @param user - Owner user database object
   */
  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    const language = user?.language || Language.INDONESIAN;
    
    try {
      logger.command(`setadmin from owner ${message.sender.id}`, {
        userId: message.sender.id,
        args,
        chatId: message.chatId
      });      // Additional owner verification (safety check)
      if (!isOwner(message.sender.id, config.ownerNumber)) {
        logger.security(`Unauthorized setadmin attempt by ${getDisplayPhoneNumber(message.sender.id)}`);
        await client.reply(
          message.chatId,
          getText('setadmin.access_denied', language),
          message.id
        );
        return;
      }

      // Parse target user from mentions or phone number
      let targetUserId: string | null = null;
      let displayMethod = '';
        // Check for mentioned users first
      const mentionedIds = message.mentionedJidList || [];
      if (mentionedIds.length > 0) {
        targetUserId = mentionedIds[0];
        displayMethod = 'mention';
        logger.debug(`Target user from mention: ${targetUserId}`, {
          targetUserId,
          userId: message.sender.id
        });      } else if (args.length > 0) {
        // Try to parse as phone number using utility function
        const phoneNumber = normalizePhoneNumber(args[0].trim());
        targetUserId = formatForWhatsApp(phoneNumber);
        displayMethod = 'phone';
        logger.debug(`Target user from phone: ${targetUserId}`, {
          targetUserId,
          phoneNumber,
          userId: message.sender.id
        });
      }
        // Validate target user provided
      if (!targetUserId) {
        logger.debug('No target user specified for setadmin');
        await client.reply(
          message.chatId,
          getText('setadmin.invalid_target', language),
          message.id
        );
        return;
      }// Normalize target user ID for database lookup using utility function
      const normalizedPhone = getDisplayPhoneNumber(targetUserId);
        // Prevent self-promotion (though owner should already have admin privileges)
      if (isOwner(targetUserId, config.ownerNumber)) {
        await client.reply(
          message.chatId,
          getText('setadmin.owner_already_admin', language),
          message.id
        );
        return;
      }

      // Check if target user exists in database
      const targetUser = await userManager.getUserByPhone(normalizedPhone);      if (!targetUser) {
        logger.user(`Target user ${normalizedPhone} not found in database`, {
          targetPhone: normalizedPhone,
          userId: message.sender.id
        });
        await client.reply(
          message.chatId,
          getText('setadmin.user_not_found', language),
          message.id
        );
        return;
      }

      // Check current user level
      const currentLevelName = UserLevel[targetUser.level] || 'Unknown';      if (targetUser.level >= UserLevel.ADMIN) {
        logger.user(`User ${normalizedPhone} already has Admin level or higher`, {
          targetPhone: normalizedPhone,
          currentLevel: currentLevelName,
          userId: message.sender.id
        });
        
        // Get display name
        let userName = 'Pengguna';
        try {
          const contact = await client.getContact(targetUserId as ContactId);
          userName = contact.pushname || contact.name || contact.shortName || userName;
        } catch {
          userName = targetUser.phoneNumber;
        }
        
        await client.reply(
          message.chatId,
          getText('setadmin.already_admin', language, undefined, {
            userName,
            phoneNumber: targetUser.phoneNumber,
            currentLevel: currentLevelName
          }),
          message.id
        );
        return;
      }

      logger.user(`Promoting user ${normalizedPhone} from ${currentLevelName} to Admin`, {
        targetPhone: normalizedPhone,
        fromLevel: currentLevelName,
        toLevel: 'Admin',
        userId: message.sender.id
      });
      
      // Set user as admin
      const updatedUser = await userManager.setUserLevel(targetUser.id, UserLevel.ADMIN);
        if (!updatedUser) {
        logger.error(`Failed to update user level for ${normalizedPhone}`, {
          targetPhone: normalizedPhone,
          targetLevel: 'Admin',
          userId: message.sender.id
        });
        await client.reply(
          message.chatId,
          getText('setadmin.update_failed', language),
          message.id
        );
        return;
      }

      // Get user display name for messages
      let userName = 'Pengguna';
      try {
        const contact = await client.getContact(targetUserId as ContactId);
        userName = contact.pushname || contact.name || contact.shortName || targetUser.phoneNumber;
      } catch (contactError) {
        logger.debug('Could not fetch contact info, using phone number');
        userName = targetUser.phoneNumber;      }

      logger.success(`Successfully promoted ${normalizedPhone} to Admin level`, {
        targetPhone: normalizedPhone,
        fromLevel: currentLevelName,
        toLevel: 'Admin',
        userId: message.sender.id
      });      // Send success message with comprehensive information
      const currentTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      const successMessage = getText('setadmin.success', language, undefined, {
        userName,
        phoneNumber: targetUser.phoneNumber,
        previousLevel: currentLevelName,
        currentTime
      });

      if (displayMethod === 'mention') {
        await client.sendTextWithMentions(message.chatId, successMessage);
      } else {
        await client.reply(message.chatId, successMessage, message.id);
      }      // Send notification to the newly promoted admin
      setTimeout(async () => {
        try {
          const adminNotification = getText('setadmin.user_notification', language, undefined, {
            botName: config.botName
          });
          
          await client.sendText(targetUserId as any, adminNotification);
          logger.info(`Admin notification sent to ${normalizedPhone}`, {
            targetPhone: normalizedPhone,
            userId: message.sender.id
          });
        } catch (notificationError) {
          logger.error('Failed to send admin notification', {
            targetPhone: normalizedPhone,
            error: notificationError instanceof Error ? notificationError.message : String(notificationError)
          });
          // Don't fail the main operation
        }
      }, 1500); // 1.5 second delay

    } catch (error) {
      logger.error('Error in setadmin command', {
        userId: message.sender.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
        // Enhanced error handling
      let errorMessage = getText('setadmin.general_error', language);
      
      if (error instanceof Error) {
        if (error.message.includes('database')) {
          errorMessage = getText('setadmin.database_error', language);
        } else if (error.message.includes('permission')) {
          errorMessage = getText('setadmin.permission_error', language);
        } else if (error.message.includes('user')) {
          errorMessage = getText('setadmin.user_error', language);
        }
        logger.debug('SetAdmin error details', {
          message: error.message,
          userId: message.sender.id
        });
      }
      
      try {
        await client.reply(
          message.chatId,
          errorMessage,
          message.id
        );
      } catch (replyError) {
        logger.error('Failed to send setadmin error message', {
          userId: message.sender.id,
          error: replyError instanceof Error ? replyError.message : String(replyError)
        });
      }
    }
  },
};

export default setadmin;