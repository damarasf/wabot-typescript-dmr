import { Message, Client, ContactId, ChatId } from '@open-wa/wa-automate';
import { User, UserLevel, Language } from '../database/models';
import { Command } from '../middlewares/commandParser';
import * as userManager from '../utils/userManager';
import config from '../utils/config';
import logger from '../utils/logger';
import { isOwner, getDisplayPhoneNumber } from '../utils/phoneUtils';
import { getText } from '../utils/i18n';

/**
 * Upgrade Command
 * Allows administrators to upgrade user levels to Premium
 * Features comprehensive validation and user mention support
 */
const upgrade: Command = {
  name: 'upgrade',
  aliases: ['premium'],
  description: 'Upgrade level pengguna ke Premium',
  usage: '!upgrade @user',
  example: '!upgrade @user',
  category: 'Admin',
  cooldown: 5,
  requiredArgs: 1,
  adminOnly: true,
    /**
   * Execute the upgrade command
   * @param message - WhatsApp message object
   * @param args - Command arguments [phone_number or mention]
   * @param client - WhatsApp client instance
   * @param user - Admin user database object
   */
  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    const language = user?.language || Language.INDONESIAN;
    
    try {logger.command(`upgrade from ${message.sender.id}`, {
        userId: message.sender.id,
        args,
        chatId: message.chatId
      });
        // Validate admin permissions (redundant check for safety)
      const isOwnerUser = isOwner(message.sender.id, config.ownerNumber);
      const isAdmin = user && user.level >= UserLevel.ADMIN;      if (!isOwnerUser && !isAdmin) {
        logger.user(`Unauthorized upgrade attempt by ${getDisplayPhoneNumber(message.sender.id)}`);
        await client.reply(
          message.chatId,
          getText('upgrade.access_denied', language),
          message.id
        );
        return;
      }
      
      // Extract target user information
      let targetPhoneNumber: string | null = null;
      
      // Check for mentioned users first
      const mentionedUsers = message.mentionedJidList || [];
      
      if (mentionedUsers.length > 0) {
        targetPhoneNumber = mentionedUsers[0];
      } else {
        // Fallback: try to extract phone number from arguments
        const phoneArg = args[0];
        if (phoneArg && phoneArg.match(/^\d+$/)) {
          targetPhoneNumber = phoneArg + '@c.us';
        }
      }
        // Validate target user input
      if (!targetPhoneNumber) {
        await client.reply(
          message.chatId,
          getText('upgrade.invalid_target', language),
          message.id
        );
        return;
      }
      
      logger.debug(`Looking for target user: ${targetPhoneNumber}`, {
        targetPhoneNumber,
        userId: message.sender.id
      });
      
      // Find target user in database
      const targetUser = await userManager.getUserByPhone(targetPhoneNumber);
        if (!targetUser) {
        await client.reply(
          message.chatId,
          getText('upgrade.user_not_found', language),
          message.id
        );
        return;
      }
        // Check if user is already premium or higher
      if (targetUser.level >= UserLevel.PREMIUM) {
        const currentLevelName = targetUser.level === UserLevel.PREMIUM ? 
          getText('common.level_premium', language) : 
          getText('common.level_admin', language);
        await client.reply(
          message.chatId,
          getText('upgrade.already_premium', language, undefined, {
            levelName: currentLevelName
          }),
          message.id
        );
        return;
      }      // Prevent self-upgrade (if not owner)
      if (!isOwnerUser && targetUser.phoneNumber === getDisplayPhoneNumber(message.sender.id)) {
        await client.reply(
          message.chatId,
          getText('upgrade.self_upgrade_denied', language),
          message.id
        );
        return;
      }
        logger.user(`Upgrading user ${targetUser.phoneNumber} to Premium`, {
        requestedBy: getDisplayPhoneNumber(message.sender.id),
        targetLevel: 'Premium'
      });
      
      // Upgrade user to premium
      const updatedUser = await userManager.setUserLevel(targetUser.id, UserLevel.PREMIUM);
        if (!updatedUser) {
        logger.error(`Failed to upgrade user ${targetUser.phoneNumber}`, {
          targetPhone: targetUser.phoneNumber,
          requestedBy: getDisplayPhoneNumber(message.sender.id)
        });
        await client.reply(
          message.chatId,
          getText('upgrade.upgrade_failed', language),
          message.id
        );
        return;
      }
      
      // Get user display names for better messaging
      let adminName = 'Admin';
      let targetName = 'Pengguna';
      
      try {
        adminName = message.sender.pushname || getDisplayPhoneNumber(message.sender.id);        if (mentionedUsers.length > 0) {
          // Try to get contact info for mentioned user
          const contactInfo = await client.getContact(targetPhoneNumber as ContactId);
          targetName = contactInfo.pushname || contactInfo.shortName || getDisplayPhoneNumber(targetPhoneNumber);        }
      } catch (nameError) {
        logger.debug('Could not fetch display names, using fallbacks');
      }
        logger.success(`Successfully upgraded user ${targetUser.phoneNumber} to Premium`, {
        targetPhone: targetUser.phoneNumber,
        requestedBy: getDisplayPhoneNumber(message.sender.id)
      });      // Send success message to current chat
      const currentTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      const successMessage = mentionedUsers.length > 0 ?
        getText('upgrade.success_with_mention', language, undefined, {
          targetPhone: getDisplayPhoneNumber(targetPhoneNumber),
          targetName,
          adminName,
          currentTime
        }) :
        getText('upgrade.success_without_mention', language, undefined, {
          targetPhone: getDisplayPhoneNumber(targetPhoneNumber),
          adminName,
          currentTime
        });
      
      if (mentionedUsers.length > 0) {
        await client.sendTextWithMentions(message.chatId, successMessage);
      } else {
        await client.reply(message.chatId, successMessage, message.id);
      }
        // Notify the target user via private message
      try {
        await client.sendText(
          targetPhoneNumber as ChatId,
          getText('upgrade.user_notification', language, undefined, {
            adminName,
            currentTime
          })
        );
      } catch (notifyError) {
        logger.error('Failed to notify target user', {
          targetPhone: targetPhoneNumber,
          error: notifyError instanceof Error ? notifyError.message : String(notifyError)
        });
        // Don't fail the whole operation if notification fails
      }
      
    } catch (error) {
      logger.error('Error upgrading user', {
        userId: message.sender.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
        // Enhanced error handling with specific error types
      let errorMessage = getText('upgrade.general_error', language);
      
      if (error instanceof Error) {
        if (error.message.includes('database')) {
          errorMessage = getText('upgrade.database_error', language);
        } else if (error.message.includes('validation')) {
          errorMessage = getText('upgrade.validation_error', language);
        } else if (error.message.includes('permission')) {
          errorMessage = getText('upgrade.permission_error', language);
        }
        logger.debug('Upgrade error details', { 
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
        logger.error('Failed to send upgrade error message', {
          userId: message.sender.id,
          error: replyError instanceof Error ? replyError.message : String(replyError)
        });
      }
    }
  },
};

export default upgrade;