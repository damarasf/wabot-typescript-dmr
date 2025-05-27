import { Client, Message, ContactId } from '@open-wa/wa-automate';
import { Command } from '../middlewares/commandParser';
import { User, Language } from '../database/models';
import { UserLevel } from '../database/models/User';
import config from '../utils/config';
import { log } from '../utils/logger';
import { getText } from '../utils/i18n';
import { 
  messageTracker, 
  isSpamContent, 
  validateRecipient, 
  getSmartDelay, 
  getAccountLimits,
  handleSendingError,
  createSafeBatches,
  safeDelay
} from '../utils/antiSpam';

/**
 * Enhanced Safe Broadcast Command
 * 
 * Includes comprehensive anti-spam protection:
 * - Smart rate limiting with account age consideration
 * - Spam content detection
 * - Recipient validation
 * - Batch processing with delays
 * - Error handling with automatic throttling
 * - Real-time monitoring and alerts
 * 
 * @category Owner Commands
 * @requires Owner level access only
 */
export const safeBroadcastCommand: Command = {
  name: 'safebroadcast',
  aliases: ['sbc', 'safesend'],
  description: 'Enhanced broadcast dengan anti-spam protection',
  category: 'Owner',
  cooldown: 60, // Increased cooldown
  usage: 'safebroadcast <pesan> [level]',
  example: 'safebroadcast Halo semua! atau safebroadcast Pesan khusus premium premium',
  adminOnly: false,
  ownerOnly: true,

  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    const language = user?.language || Language.INDONESIAN;
    
    try {      // Show help if no arguments
      if (args.length === 0) {
        await client.reply(
          message.from,
          getText('safebroadcast.help', language),
          message.id
        );
        return;
      }

      // Parse arguments
      const lastArg = args[args.length - 1].toLowerCase();
      const levelFilter = ['free', 'premium', 'admin', 'all'].includes(lastArg) ? lastArg : 'all';
      const messageArgs = levelFilter !== 'all' && ['free', 'premium', 'admin'].includes(lastArg) 
        ? args.slice(0, -1) 
        : args;
        
      if (messageArgs.length === 0) {
        await client.reply(
          message.from,
          getText('broadcast.empty_message', language),
          message.id
        );
        return;
      }

      const broadcastMessage = messageArgs.join(' ');
        // Enhanced spam detection
      if (isSpamContent(broadcastMessage)) {
        await client.reply(
          message.from,
          getText('safebroadcast.spam_detected', language),
          message.id
        );
        return;
      }

      const startTime = Date.now();
      const currentTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      
      log.info(`Safe broadcast started by owner: ${message.sender.id}, filter: ${levelFilter}, message length: ${broadcastMessage.length}`);

      // Build user query based on level filter
      const whereClause: any = {};
      if (levelFilter === 'free') {
        whereClause.level = UserLevel.FREE;
      } else if (levelFilter === 'premium') {
        whereClause.level = UserLevel.PREMIUM;
      } else if (levelFilter === 'admin') {
        whereClause.level = UserLevel.ADMIN;
      } else {
        whereClause.level = {
          [require('sequelize').Op.gte]: UserLevel.FREE
        };
      }

      // Get target users
      const users = await User.findAll({
        where: whereClause,
        order: [['createdAt', 'ASC']]
      });

      if (users.length === 0) {
        await client.reply(
          message.from,
          getText('broadcast.no_target', language, undefined, {
            levelFilter,
            levelText: levelFilter === 'all' ? getText('common.all_users', language) : levelFilter
          }),
          message.id
        );
        return;
      }

      // Get account limits based on account age (assuming 30+ days for established)
      const accountLimits = getAccountLimits(30); // You can make this dynamic
      
      // Create safe batches
      const batches = createSafeBatches(users, accountLimits);
      const estimatedTime = Math.ceil(
        (batches.length * accountLimits.delayBetweenMessages * batches[0]?.length || 0) / 60000
      );      // Enhanced confirmation with safety info
      const previewMessage = broadcastMessage.length > 100 
        ? broadcastMessage.substring(0, 100) + '...'
        : broadcastMessage;

      await client.reply(
        message.from,
        getText('safebroadcast.confirmation', language, undefined, {
          previewMessage,
          levelFilter,
          userCount: users.length.toString(),
          batches: batches.length.toString(),
          batchSize: accountLimits.maxBatchSize.toString(),
          estimatedTime: estimatedTime.toString(),
          delay: (accountLimits.delayBetweenMessages/1000).toString(),
          messageLength: broadcastMessage.length.toString()
        }),
        message.id
      );

      // Wait 10 seconds for cancellation
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Start safe broadcast
      let successCount = 0;
      let failedCount = 0;
      let blockedCount = 0;
      let skippedCount = 0;
      const failedUsers: string[] = [];
      const blockedUsers: string[] = [];
      const skippedUsers: string[] = [];      // Send initial progress
      await client.reply(
        message.from,
        getText('safebroadcast.starting', language, undefined, {
          userCount: users.length.toString(),
          batches: batches.length.toString(),
          currentTime
        }),
        message.id
      );

      // Process each batch
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        log.info(`Processing batch ${batchIndex + 1}/${batches.length} with ${batch.length} users`);
        
        // Process each user in batch
        for (const user of batch) {
          try {
            // Check if we can send (rate limiting)
            if (!messageTracker.canSend(accountLimits)) {
              log.warn(`Rate limit reached, skipping user ${user.phoneNumber}`);
              skippedUsers.push(user.phoneNumber);
              skippedCount++;
              continue;
            }
            
            // Validate recipient
            const isValidRecipient = await validateRecipient(client, user.phoneNumber);
            if (!isValidRecipient) {
              log.debug(`Skipping invalid recipient: ${user.phoneNumber}`);
              skippedUsers.push(user.phoneNumber);
              skippedCount++;
              continue;
            }
            
            // Prepare final message
            const finalMessage = getText('broadcast.message_template', language, undefined, {
              message: broadcastMessage,
              botName: config.botName,
              currentTime
            });
            
            // Send message with error handling
            await client.sendText(`${user.phoneNumber}@c.us` as ContactId, finalMessage);
            
            // Record successful send
            messageTracker.recordSent();
            successCount++;
            
            log.debug(`Message sent successfully to ${user.phoneNumber}`);
            
          } catch (error) {
            const errorMessage = (error as Error).message?.toLowerCase() || '';
            
            if (errorMessage.includes('blocked') || errorMessage.includes('spam')) {
              blockedUsers.push(user.phoneNumber);
              blockedCount++;
                // Handle critical spam detection
              await handleSendingError(error, user.phoneNumber, async () => {
                await client.reply(
                  message.from,
                  getText('safebroadcast.spam_alert', language, undefined, {
                    successCount: successCount.toString(),
                    failedCount: failedCount.toString(),
                    blockedCount: blockedCount.toString(),
                    currentTime: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
                  }),
                  message.id
                );
              });
                // Stop broadcast if too many blocks
              if (blockedCount >= 3) {
                log.error('Too many blocked messages, stopping broadcast');
                break;
              }
              
            } else {
              failedUsers.push(user.phoneNumber);
              failedCount++;
              await handleSendingError(error, user.phoneNumber);
            }
          }
          
          // Smart delay between messages
          const delay = getSmartDelay(accountLimits.delayBetweenMessages);
          await safeDelay(delay);
        }
          // Update progress after each batch
        const progressPercent = Math.round(((batchIndex + 1) / batches.length) * 100);
        const nextBatchMessage = batchIndex + 1 < batches.length ? 
          getText('common.waiting_next_batch', language) || '⏳ Menunggu batch berikutnya...' : 
          getText('common.almost_finished', language) || '🏁 Mendekati selesai...';
        
        await client.reply(
          message.from,
          getText('safebroadcast.batch_progress', language, undefined, {
            currentBatch: (batchIndex + 1).toString(),
            totalBatches: batches.length.toString(),
            progressPercent: progressPercent.toString(),
            successCount: successCount.toString(),
            failedCount: failedCount.toString(),
            blockedCount: blockedCount.toString(),
            skippedCount: skippedCount.toString(),
            elapsedTime: Math.round((Date.now() - startTime) / 1000).toString(),
            nextBatchMessage
          }),
          message.id
        );
        
        // Delay between batches (except last batch)
        if (batchIndex < batches.length - 1) {
          await safeDelay(accountLimits.delayBetweenMessages * 2); // Double delay between batches
        }
        
        // Break if too many blocked messages
        if (blockedCount >= 3) {
          break;
        }
      }      const totalTime = Math.round((Date.now() - startTime) / 1000);
      const successRate = Math.round((successCount / users.length) * 100);
      const endTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

      // Prepare safety status
      const safetyStatus = blockedCount === 0 ? 
        getText('common.safe_status', language) || '✅ AMAN' : 
        blockedCount < 3 ? 
          getText('common.warning_status', language) || '⚠️ PERHATIAN' : 
          getText('common.danger_status', language) || '🚨 BERBAHAYA';

      // Prepare failure information
      const failedInfo = failedCount > 0 ? 
        `❌ *${getText('common.failed', language) || 'Gagal'}:* ${failedUsers.slice(0, 3).join(', ')}${failedUsers.length > 3 ? ` +${failedUsers.length - 3} ${getText('common.others', language) || 'lainnya'}` : ''}\n` : '';
      
      const blockedInfo = blockedCount > 0 ? 
        `🚫 *${getText('common.blocked', language) || 'Diblokir'}:* ${blockedUsers.slice(0, 3).join(', ')}${blockedUsers.length > 3 ? ` +${blockedUsers.length - 3} ${getText('common.others', language) || 'lainnya'}` : ''}\n` : '';
      
      const skippedInfo = skippedCount > 0 ? 
        `⏭️ *${getText('common.skipped', language) || 'Dilewati'}:* ${skippedUsers.slice(0, 3).join(', ')}${skippedUsers.length > 3 ? ` +${skippedUsers.length - 3} ${getText('common.others', language) || 'lainnya'}` : ''}\n` : '';

      // Prepare recommendations
      const recommendations = blockedCount > 0 ? 
        getText('safebroadcast.recommendations_warning', language) || '• ⚠️ Kurangi frekuensi broadcast\n• 🛡️ Periksa konten pesan\n• ⏰ Tunggu lebih lama sebelum broadcast berikutnya' :
        getText('safebroadcast.recommendations_safe', language) || '• ✅ Broadcast berhasil dengan aman\n• 📈 Rate limit dalam batas normal\n• 🚀 Aman untuk broadcast berikutnya';

      // Send comprehensive final summary
      await client.reply(
        message.from,
        getText('safebroadcast.summary', language, undefined, {
          levelFilter,
          userCount: users.length.toString(),
          successCount: successCount.toString(),
          successRate: successRate.toString(),
          failedCount: failedCount.toString(),
          blockedCount: blockedCount.toString(),
          skippedCount: skippedCount.toString(),
          totalTime: totalTime.toString(),
          totalMinutes: Math.round(totalTime / 60).toString(),
          messageRate: Math.round(successCount / totalTime * 60).toString(),
          safetyStatus,
          endTime,
          failedInfo,
          blockedInfo,
          skippedInfo,
          recommendations
        }),
        message.id
      );

      // Get tracker stats for monitoring
      const trackerStats = messageTracker.getStats();
      log.success(`Safe broadcast completed: ${successCount}/${users.length} success, ${failedCount} failed, ${blockedCount} blocked, ${skippedCount} skipped in ${totalTime}s`);
      log.info(`Message tracker stats:`, trackerStats);    } catch (error) {
      log.error('Safe broadcast command error', error);
      const language = user?.language || Language.INDONESIAN;
      await client.reply(
        message.from,
        getText('safebroadcast.error', language, undefined, {
          errorMessage: (error as Error).message || 'Unknown error',
          currentTime: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
        }),
        message.id
      );
    }
  }
};

export default safeBroadcastCommand;
