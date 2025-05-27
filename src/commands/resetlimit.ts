import { Client, Message, ContactId } from '@open-wa/wa-automate';
import { Command } from '../middlewares/commandParser';
import { User, Usage, Language } from '../database/models';
import * as userManager from '../utils/userManager';
import { log } from '../utils/logger';
import { normalizePhoneNumber, getDisplayPhoneNumber } from '../utils/phoneUtils';
import { getText } from '../utils/i18n';

/**
 * Reset Limit Command
 * 
 * Allows administrators to reset usage limits for specific users or all users.
 * Supports multiple reset modes: all users, mentioned users, or by phone number.
 * 
 * Features:
 * - Mass reset for all users with confirmation
 * - Individual reset by mention or phone number
 * - Comprehensive error handling and validation
 * - Detailed progress reporting and statistics
 * - Safety checks and confirmations for bulk operations
 * - Contact information fetching with fallbacks
 * 
 * @category Admin Commands
 * @requires Admin level access
 */
export const resetlimitCommand: Command = {
  name: 'resetlimit',
  aliases: ['rl', 'reset'],
  description: 'Reset limit penggunaan user',
  category: 'Admin',
  cooldown: 5,
  usage: 'resetlimit [all/@user/phone]',
  example: 'resetlimit all atau resetlimit @user atau resetlimit 628123456789',
  adminOnly: true,
  ownerOnly: false,
    async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    const language = user?.language || Language.INDONESIAN;
    
    try {
      // Show help if no arguments provided
      if (args.length === 0) {
        await client.reply(
          message.from,
          getText('resetlimit.help', language),
          message.id
        );
        return;
      }

      const startTime = Date.now();
      const currentTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

      // Handle "all" reset with confirmation
      if (args[0].toLowerCase() === 'all') {
        // Only log in debug mode to reduce I/O
        if (process.env.LOG_LEVEL === 'debug') {
          log.info(`Reset all limits initiated by admin: ${message.sender.id}`);
        }
        
        // Get total count before reset
        const totalUsages = await Usage.count();
        const totalUsers = await User.count();
          if (totalUsages === 0) {
          await client.reply(
            message.from,
            getText('resetlimit.no_data', language, undefined, {
              totalUsers: totalUsers.toString(),
              currentTime
            }),
            message.id
          );
          return;
        }        // Send confirmation with detailed info
        await client.reply(
          message.from,
          getText('resetlimit.all_warning', language, undefined, {
            totalUsages: totalUsages.toString(),
            totalUsers: totalUsers.toString()
          }),
          message.id
        );

        // Wait for 10 seconds for potential cancellation
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Proceed with reset
        await client.reply(
          message.from,
          getText('resetlimit.processing_all', language),
          message.id
        );

        // Perform the reset
        const resetCount = await Usage.destroy({ where: {} });
        const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
          await client.reply(
          message.from,
          getText('resetlimit.all_success', language, undefined, {
            resetCount: resetCount.toString(),
            totalUsers: totalUsers.toString(),
            processingTime,
            currentTime,
            adminPhone: getDisplayPhoneNumber(message.sender.id)
          }),
          message.id
        );

        // Only log in debug mode
        if (process.env.LOG_LEVEL === 'debug') {
          log.success(`Reset all completed: ${resetCount} usages reset by ${message.sender.id} in ${processingTime}s`);
        }
        return;
      }

      // Handle mentions (multiple users)
      if (message.mentionedJidList && message.mentionedJidList.length > 0) {
        // Only log in debug mode
        if (process.env.LOG_LEVEL === 'debug') {
          log.info(`Reset mentions processing ${message.mentionedJidList.length} mentions by admin: ${message.sender.id}`);
        }
        
        let resetCount = 0;
        let notFoundCount = 0;
        const resetResults: string[] = [];
        const notFoundUsers: string[] = [];        // Send processing message
        await client.reply(
          message.from,
          getText('resetlimit.processing_mentions', language, undefined, {
            mentionCount: message.mentionedJidList.length.toString()
          }),
          message.id
        );for (const mentionedJid of message.mentionedJidList) {
          try {
            const phoneNumber = getDisplayPhoneNumber(mentionedJid);
              // Find user in database using userManager for consistency
            const targetUser = await userManager.getUserByPhone(mentionedJid);

            if (targetUser) {
              // Get usage count before reset
              const usageCount = await Usage.count({
                where: { userId: targetUser.id }
              });

              // Reset user's usage
              await Usage.destroy({
                where: { userId: targetUser.id }
              });

              // Try to get contact info
              let displayName = phoneNumber;
              try {
                const contact = await client.getContact(mentionedJid as ContactId);
                displayName = contact.name || contact.pushname || phoneNumber;
              } catch (contactError) {
                // Remove debug logging for performance
                // Contact info fetching failures are not critical
              }

              resetResults.push(`✅ ${displayName} (${usageCount} data)`);
              resetCount++;            } else {
              notFoundUsers.push(`❌ ${phoneNumber} (${getText('resetlimit.not_registered', language)})`);
              notFoundCount++;
            }          } catch (error) {
            log.error(`Error processing mention ${mentionedJid}`, error);
            notFoundUsers.push(`❌ ${getDisplayPhoneNumber(mentionedJid)} (${getText('common.error', language)})`);
            notFoundCount++;
          }
        }

        const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);        // Prepare result message
        let resultMessage = getText('resetlimit.mentions_result_header', language) + '\n\n';
        
        if (resetCount > 0) {
          resultMessage += getText('resetlimit.mentions_result_success', language, undefined, {
            resetCount: resetCount.toString(),
            resetResults: resetResults.join('\n')
          }) + '\n\n';
        }
        
        if (notFoundCount > 0) {
          resultMessage += getText('resetlimit.mentions_result_not_found', language, undefined, {
            notFoundCount: notFoundCount.toString(),
            notFoundUsers: notFoundUsers.join('\n')
          }) + '\n\n';
        }
        
        resultMessage += getText('resetlimit.mentions_result_summary', language, undefined, {
          totalProcessed: message.mentionedJidList.length.toString(),
          resetCount: resetCount.toString(),
          notFoundCount: notFoundCount.toString(),
          processingTime,
          currentTime
        });

        await client.reply(
          message.from,
          resultMessage,
          message.id
        );

        log.success(`Reset mentions completed: ${resetCount}/${message.mentionedJidList.length} users reset by ${message.sender.id}`);
        return;
      }      // Handle phone number reset
      const phoneArg = args[0];
      if (phoneArg && phoneArg.length >= 10) {
        log.info(`Reset phone processing ${phoneArg} by admin: ${message.sender.id}`);
          // Normalize phone number using utility function
        const normalizedPhone = normalizePhoneNumber(phoneArg);

        const targetUser = await userManager.getUserByPhone(phoneArg);

        if (targetUser) {
          // Get usage count before reset
          const usageCount = await Usage.count({
            where: { userId: targetUser.id }
          });

          // Reset user's usage
          await Usage.destroy({
            where: { userId: targetUser.id }
          });

          // Try to get contact info
          let displayName = normalizedPhone;
          try {
            const contact = await client.getContact(`${normalizedPhone}@c.us` as ContactId);
            displayName = contact.name || contact.pushname || normalizedPhone;
          } catch (contactError) {
            // Contact info fetching failure is not critical, skip logging
          }

          const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);          await client.reply(
            message.from,
            getText('resetlimit.phone_success', language, undefined, {
              displayName,
              phoneNumber: normalizedPhone,
              usageCount: usageCount.toString(),
              processingTime,
              currentTime
            }),
            message.id
          );

          log.success(`Reset phone completed: ${normalizedPhone} (${usageCount} usages) reset by ${message.sender.id}`);        } else {
          await client.reply(
            message.from,
            getText('resetlimit.phone_not_found', language, undefined, {
              phoneNumber: normalizedPhone
            }),
            message.id
          );

          log.warn(`Reset phone - user not found: ${normalizedPhone} requested by ${message.sender.id}`);
        }
        return;
      }      // Invalid format
      await client.reply(
        message.from,
        getText('resetlimit.invalid_format', language),
        message.id
      );    } catch (error) {
      log.error('Reset limit command error', error);
      
      const currentTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      
      // Send detailed error information
      await client.reply(
        message.from,
        getText('resetlimit.error', language, undefined, {
          errorMessage: (error as Error).message || getText('common.unknown', language),
          currentTime
        }),
        message.id
      );
    }
  }
};

export default resetlimitCommand;
