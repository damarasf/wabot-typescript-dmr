import { Message, Client, ContactId } from '@open-wa/wa-automate';
import { User, UserLevel, FeatureType, Language } from '../database/models';
import { Command } from '../middlewares/commandParser';
import * as userManager from '../utils/userManager';
import { formatNumber } from '../utils/formatter';
import config from '../utils/config';
import logger from '../utils/logger';
import { getDisplayPhoneNumber, isOwner } from '../utils/phoneUtils';
import { getText } from '../utils/i18n';

/**
 * Set Limit Command
 * Allows administrators to set custom usage limits for specific users and features
 * Features comprehensive validation, feature support, and notification system
 */
const setlimit: Command = {
  name: 'setlimit',
  aliases: ['customlimit', 'limit'],
  description: 'Set limit custom untuk pengguna pada fitur tertentu',
  usage: '!setlimit @user [feature] [jumlah]',
  example: '!setlimit @user n8n 100',
  category: 'Admin',
  cooldown: 5,
  requiredArgs: 3,
  adminOnly: true,
  
  /**
   * Execute the setlimit command
   * @param message - WhatsApp message object
   * @param args - Command arguments [@user, feature, limit_amount]
   * @param client - WhatsApp client instance
   * @param user - Admin user database object
   */  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    const language = user?.language || Language.INDONESIAN;
    
    try {
      logger.command(`setlimit from ${message.sender.id}`, {
        userId: message.sender.id,
        args,
        chatId: message.chatId
      });
      
      // Additional permission check (safety)
      const isOwnerFlag = isOwner(message.sender.id, config.ownerNumber);
      const isAdmin = user && user.level >= UserLevel.ADMIN;
      
      if (!isOwnerFlag && !isAdmin) {
        logger.user(`Unauthorized setlimit attempt by ${message.sender.id}`);
        await client.reply(
          message.chatId,
          getText('setlimit.access_denied', language),
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
        });      } else {
        // No mention provided
        await client.reply(
          message.chatId,
          getText('setlimit.invalid_user_format', language),
          message.id
        );
        return;
      }      // Validate feature argument
      if (args.length < 2) {
        await client.reply(
          message.chatId,
          getText('setlimit.feature_missing', language),
          message.id
        );
        return;
      }

      // Parse and validate feature type
      const featureArg = args[1].toLowerCase();
      let feature: FeatureType;
      let featureDisplayName: string;
      
      switch (featureArg) {
        case 'n8n':
          feature = FeatureType.N8N;
          featureDisplayName = 'N8N Workflow';
          break;
        case 'reminder':
          feature = FeatureType.REMINDER;
          featureDisplayName = 'Pengingat';
          break;
        case 'tag_all':
        case 'tagall':
          feature = FeatureType.TAG_ALL;
          featureDisplayName = 'Tag All Member';
          break;        default:
          logger.debug(`Invalid feature specified: ${featureArg}`, {
            featureArg,
            userId: message.sender.id
          });
          await client.reply(
            message.chatId,
            getText('setlimit.invalid_feature', language, undefined, {
              feature: featureArg
            }),
            message.id
          );
          return;
      }      // Validate limit amount argument
      if (args.length < 3) {
        await client.reply(
          message.chatId,
          getText('setlimit.amount_missing', language),
          message.id
        );
        return;
      }

      // Parse and validate limit amount
      const limitAmount = parseInt(args[2], 10);
        if (isNaN(limitAmount)) {
        await client.reply(
          message.chatId,
          getText('setlimit.invalid_amount', language, undefined, {
            amount: args[2]
          }),
          message.id
        );
        return;
      }
        if (limitAmount < 0) {
        await client.reply(
          message.chatId,
          getText('setlimit.negative_limit', language),
          message.id
        );
        return;
      }      // Warn for very high limits
      if (limitAmount > 1000) {
        await client.reply(
          message.chatId,
          getText('setlimit.high_limit_warning', language, undefined, {
            limit: formatNumber(limitAmount),
            feature: featureDisplayName,
            featureArg,
            limitAmount: limitAmount.toString()
          }),
          message.id
        );
        
        // Check for confirmation
        if (args.length < 4 || args[3].toUpperCase() !== 'CONFIRM') {
          return;
        }
      }// Normalize target user ID for database lookup using utility function
      const normalizedPhone = getDisplayPhoneNumber(targetUserId);
      
      // Check if target user exists in database
      const targetUser = await userManager.getUserByPhone(normalizedPhone);      if (!targetUser) {
        logger.user(`Target user ${normalizedPhone} not found in database`, {
          targetPhone: normalizedPhone,
          userId: message.sender.id
        });
        await client.reply(
          message.chatId,
          getText('setlimit.user_not_found', language),
          message.id
        );
        return;
      }// Get current limit info
      const currentUsage = await userManager.getOrCreateUsage(targetUser.id, feature);
      const oldLimit = currentUsage.customLimit || 'Default';
      
      logger.user(`Setting custom limit for user ${normalizedPhone}, feature ${feature}: ${oldLimit} -> ${limitAmount}`, {
        targetPhone: normalizedPhone,
        feature,
        oldLimit,
        newLimit: limitAmount,
        userId: message.sender.id
      });
      
      // Set custom limit
      const updatedUsage = await userManager.setCustomLimit(targetUser.id, feature, limitAmount);
        if (!updatedUsage) {
        logger.error(`Failed to set custom limit for ${normalizedPhone}`, {
          targetPhone: normalizedPhone,
          feature,
          limitAmount,
          userId: message.sender.id
        });
        await client.reply(
          message.chatId,
          getText('setlimit.set_failed', language),
          message.id
        );
        return;
      }// Get user display name for messages
      let userName = 'Pengguna';
      try {
        const contact = await client.getContact(targetUserId as ContactId);
        userName = contact.pushname || contact.name || contact.shortName || targetUser.phoneNumber;
      } catch (contactError) {
        logger.debug('Could not fetch contact info, using phone number');
        userName = targetUser.phoneNumber;
      }

      logger.success(`Successfully set custom limit for ${normalizedPhone}`, {
        targetPhone: normalizedPhone,
        feature,
        limitAmount,
        oldLimit,
        userId: message.sender.id
      });      // Send success message with comprehensive information
      await client.reply(
        message.chatId,
        getText('setlimit.success', language, undefined, {
          userName: userName,
          phoneNumber: targetUser.phoneNumber,
          feature: featureDisplayName,
          limit: formatNumber(limitAmount),
          currentUsage: currentUsage.count.toString()
        }),
        message.id
      );

      // Send notification to the target user
      setTimeout(async () => {        try {
          // Determine status message based on limit change
          let statusMessage: string;
          if (limitAmount === 0) {
            statusMessage = getText('setlimit.disabled_message', language);
          } else if (limitAmount > (currentUsage.customLimit || config.freeLimit)) {
            statusMessage = getText('setlimit.increased_message', language);
          } else {
            statusMessage = getText('setlimit.reset_message', language);
          }

          const userNotification = getText('setlimit.user_notification', language, undefined, {
            feature: featureDisplayName,
            limit: formatNumber(limitAmount),
            currentUsage: currentUsage.count.toString(),
            statusMessage,
            botName: config.botName
          });

          await client.sendText(targetUserId as any, userNotification);
          logger.info(`Limit notification sent to ${normalizedPhone}`, {
            targetPhone: normalizedPhone,
            feature,
            limitAmount
          });
        } catch (notificationError) {
          logger.error('Failed to send limit notification', {
            targetPhone: normalizedPhone,
            error: notificationError instanceof Error ? notificationError.message : String(notificationError)
          });          // Don't fail the main operation
        }      }, 1500); // 1.5 second delay

    } catch (error) {
      logger.error('Error in setlimit command', {
        userId: message.sender.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      try {
        await client.reply(
          message.chatId,
          getText('command.error', language),
          message.id
        );
      } catch (replyError) {
        logger.error('Failed to send setlimit error message', {
          userId: message.sender.id,
          error: replyError instanceof Error ? replyError.message : String(replyError)
        });
      }
    }
  },
};

export default setlimit;