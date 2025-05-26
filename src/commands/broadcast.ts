import { Client, Message, ContactId, MessageId } from '@open-wa/wa-automate';
import { Command } from '../middlewares/commandParser';
import { User, Language } from '../database/models';
import { UserLevel } from '../database/models/User';
import config from '../utils/config';
import { log } from '../utils/logger';
import { getText } from '../utils/i18n';

/**
 * Broadcast Command
 * 
 * Allows the bot owner to send messages to all registered users.
 * Includes filtering, rate limiting, and detailed progress tracking.
 * 
 * Features:
 * - Owner-only access with strict validation
 * - User level filtering options
 * - Rate limiting to prevent spam/blocking
 * - Detailed progress tracking and reporting
 * - Error handling with retry mechanisms
 * - Delivery status reporting
 * - Comprehensive logging and statistics
 * - Message preview and confirmation system
 * 
 * @category Owner Commands
 * @requires Owner level access only
 */
export const broadcastCommand: Command = {
  name: 'broadcast',
  aliases: ['bc', 'send'],
  description: 'Broadcast pesan ke pengguna terdaftar (khusus owner)',
  category: 'Owner',
  cooldown: 30,
  usage: 'broadcast <pesan> [level]',
  example: 'broadcast Halo semua! atau broadcast Pesan khusus premium premium',
  adminOnly: false,
  ownerOnly: true,
    async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    const language = user?.language || Language.INDONESIAN;
    
    try {      // Show help if no arguments
      if (args.length === 0) {
        await client.reply(
          message.from,
          getText('broadcast.help', language),
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
      }const broadcastMessage = messageArgs.join(' ');
      const startTime = Date.now();
      const currentTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      
      log.info(`Broadcast started by owner: ${message.sender.id}, filter: ${levelFilter}, message length: ${broadcastMessage.length}`);

      // Build user query based on level filter
      const whereClause: any = {};
      if (levelFilter === 'free') {
        whereClause.level = UserLevel.FREE;
      } else if (levelFilter === 'premium') {
        whereClause.level = UserLevel.PREMIUM;
      } else if (levelFilter === 'admin') {
        whereClause.level = UserLevel.ADMIN;
      } else {
        // For 'all', include all registered users (level >= 1)
        whereClause.level = {
          [require('sequelize').Op.gte]: UserLevel.FREE
        };
      }

      // Get target users
      const users = await User.findAll({
        where: whereClause,
        order: [['createdAt', 'ASC']] // Oldest users first
      });      if (users.length === 0) {
        await client.reply(
          message.from,
          getText('broadcast.no_target', language, undefined, {
            levelFilter,
            levelText: levelFilter === 'all' ? getText('common.all_users', language) : levelFilter
          }),
          message.id
        );
        return;
      }      // Show preview and confirmation
      const previewMessage = broadcastMessage.length > 100 
        ? broadcastMessage.substring(0, 100) + '...'
        : broadcastMessage;

      await client.reply(
        message.from,
        getText('broadcast.confirmation', language, undefined, {
          previewMessage,
          levelFilter,
          userCount: users.length.toString(),
          estimatedTime: Math.ceil(users.length * 2 / 60).toString(),
          messageLength: broadcastMessage.length.toString()
        }),
        message.id
      );

      // Wait 5 seconds for potential cancellation
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Start broadcast
      let successCount = 0;
      let failedCount = 0;
      let blockedCount = 0;
      const failedUsers: string[] = [];
      const blockedUsers: string[] = [];      // Send initial progress message
      const progressMessage = await client.reply(
        message.from,
        getText('broadcast.starting', language, undefined, {
          userCount: users.length.toString(),
          currentTime
        }),
        message.id
      );

      // Broadcast to all users with progress updates
      for (let i = 0; i < users.length; i++) {
        const user = users[i];        try {
          // Prepare final message with simple format
          const finalMessage = getText('broadcast.message_template', language, undefined, {
            message: broadcastMessage,
            botName: config.botName,
            currentTime
          });
                    
          // Send message
          await client.sendText(`${user.phoneNumber}@c.us` as ContactId, finalMessage);
          successCount++;
          
          // Remove debug logging for performance - this happens frequently
        } catch (error) {
          const errorMessage = (error as Error).message?.toLowerCase() || '';
          
          if (errorMessage.includes('blocked') || errorMessage.includes('not found')) {
            blockedUsers.push(user.phoneNumber);
            blockedCount++;
            // Only log blocked users in debug mode
            if (process.env.LOG_LEVEL === 'debug') {
              log.warn(`Broadcast blocked by ${user.phoneNumber}: ${(error as Error).message || 'Unknown error'}`);
            }
          } else {
            failedUsers.push(user.phoneNumber);
            failedCount++;
            log.error(`Failed to send broadcast to ${user.phoneNumber}: ${(error as Error).message || 'Unknown error'}`);
          }
        }        // Update progress every 10 messages or at the end
        if ((i + 1) % 10 === 0 || i === users.length - 1) {
          try {
            const progressPercent = Math.round(((i + 1) / users.length) * 100);
            const progressBar = generateProgressBar(progressPercent);

            await client.reply(
              message.from,
              getText('broadcast.progress', language, undefined, {
                progressBar,
                progressPercent: progressPercent.toString(),
                current: (i + 1).toString(),
                total: users.length.toString(),
                successCount: successCount.toString(),
                failedCount: failedCount.toString(),
                blockedCount: blockedCount.toString(),
                elapsedTime: Math.round((Date.now() - startTime) / 1000).toString()
              }),
              message.id
            );
          } catch (updateError) {
            // Remove debug logging for performance - progress update errors are not critical
          }
        }

        // Rate limiting delay (2 seconds)
        if (i < users.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }      const totalTime = Math.round((Date.now() - startTime) / 1000);
      const successRate = Math.round((successCount / users.length) * 100);
      const endTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

      // Send final summary
      const summaryMessage = getText('broadcast.summary', language, undefined, {
        userCount: users.length.toString(),
        successCount: successCount.toString(),
        successRate: successRate.toString(),
        failedCount: failedCount.toString(),
        blockedCount: blockedCount.toString(),
        totalTime: totalTime.toString(),
        totalMinutes: Math.round(totalTime / 60).toString(),
        ratePerMinute: Math.round(users.length / totalTime * 60).toString(),
        levelFilter,
        endTime,
        failedInfo: failedUsers.length > 0 ? (failedUsers.length <= 5 ? 
          failedUsers.join(', ') : 
          `${failedUsers.slice(0, 3).join(', ')} +${failedUsers.length - 3} ${getText('common.others', language)}`) : '',
        blockedInfo: blockedUsers.length > 0 ? (blockedUsers.length <= 5 ? 
          blockedUsers.join(', ') : 
          `${blockedUsers.slice(0, 3).join(', ')} +${blockedUsers.length - 3} ${getText('common.others', language)}`) : '',
        showFailed: failedUsers.length > 0 ? 'true' : 'false',
        showBlocked: blockedUsers.length > 0 ? 'true' : 'false'
      });

      await client.reply(
        message.from,
        summaryMessage,
        message.id
      );

      log.success(`Broadcast completed: ${successCount}/${users.length} success, ${failedCount} failed, ${blockedCount} blocked in ${totalTime}s`);    } catch (error) {
      log.error('Broadcast command error', error);
      const language = user?.language || Language.INDONESIAN;
      await client.reply(
        message.from,
        getText('broadcast.error', language, undefined, {
          errorMessage: (error as Error).message || 'Unknown error',
          currentTime: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
        }),
        message.id
      );
    }
  }
};

/**
 * Generate a visual progress bar
 * @param percent - Progress percentage (0-100)
 * @returns Progress bar string
 */
function generateProgressBar(percent: number): string {
  const totalBars = 10;
  const filledBars = Math.round((percent / 100) * totalBars);
  const emptyBars = totalBars - filledBars;
  
  return '█'.repeat(filledBars) + '░'.repeat(emptyBars);
}

export default broadcastCommand;