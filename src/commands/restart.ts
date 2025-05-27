import { Client, Message, ContactId } from '@open-wa/wa-automate';
import { Command } from '../middlewares/commandParser';
import { User, Language } from '../database/models';
import config from '../utils/config';
import logger from '../utils/logger';
import { getDisplayPhoneNumber } from '../utils/phoneUtils';
import { getText } from '../utils/i18n';

/**
 * Restart Command
 * 
 * Allows the bot owner to restart the bot process safely.
 * Includes proper notifications, confirmation, and graceful shutdown.
 * 
 * Features:
 * - Owner-only access with strict validation
 * - Confirmation system for safety
 * - Detailed restart notifications
 * - Private owner notification for group restarts
 * - Graceful shutdown with proper delays
 * - Comprehensive logging and error handling
 * - System information display
 * 
 * @category Owner Commands
 * @requires Owner level access only
 */
export const restartCommand: Command = {
  name: 'restart',
  aliases: ['reboot', 'reloadbot'],
  description: 'Restart bot (owner only)',
  category: 'Owner',
  cooldown: 10,
  usage: 'restart [confirm]',
  example: 'restart atau restart confirm',
  adminOnly: false,
  ownerOnly: true,
  
  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    try {
      // Detect user language
      const language = user?.language || Language.INDONESIAN;
      
      const currentTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      const uptime = process.uptime();
      const uptimeFormatted = formatUptime(uptime);
      const isFromGroup = message.from.includes('@g.us');

      // Check if confirmation is needed
      const hasConfirm = args.length > 0 && args[0].toLowerCase() === 'confirm';      if (!hasConfirm) {
        // Send confirmation request with system info
        await client.reply(
          message.from,
          getText('restart.help', language, undefined, {
            botName: config.botName,
            uptime: uptimeFormatted,
            processId: process.pid.toString(),
            memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024).toString(),
            nodeVersion: process.version
          }),
          message.id        );

        logger.debug('Restart confirmation requested by owner', {
          userId: message.sender.id,
          command: 'restart'
        });
        return;
      }

      logger.command('Confirmed restart initiated by owner', {
        userId: message.sender.id,
        uptime: uptimeFormatted
      });        // Send restart notification with countdown
      await client.reply(
        message.from,
        getText('restart.starting', language, undefined, {
          currentTime,
          uptime: uptimeFormatted
        }),
        message.id
      );      // Prepare detailed owner notification
      const ownerNotification = getText('restart.owner_notification', language, undefined, {
        ownerPhone: getDisplayPhoneNumber(message.sender.id),
        location: isFromGroup ? 'Group Chat' : 'Private Chat',
        currentTime,
        botName: config.botName,
        uptime: uptimeFormatted,
        processId: process.pid.toString(),
        memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024).toString(),
        nodeVersion: process.version
      });

      // Send private notification to owner if restart is from group
      if (isFromGroup) {        try {
          await client.sendText(`${config.ownerNumber}@c.us` as ContactId, ownerNotification);
          logger.info('Owner notification sent for group restart', {
            ownerNumber: config.ownerNumber,
            fromGroup: isFromGroup
          });
        } catch (notificationError) {
          logger.error('Failed to send owner notification', {
            ownerNumber: config.ownerNumber,
            error: notificationError instanceof Error ? notificationError.message : String(notificationError)
          });
        }
      }      // Progressive status updates
      setTimeout(async () => {
        try {
          await client.reply(
            message.from,
            getText('restart.progress_saving', language),
            message.id
          );} catch (updateError) {
          logger.debug('Restart progress update failed', {
            error: updateError instanceof Error ? updateError.message : 'Unknown error'
          });
        }
      }, 5000);

      setTimeout(async () => {        try {
          await client.reply(
            message.from,
            getText('restart.final', language),
            message.id
          );} catch (finalError) {
          logger.debug('Final restart message failed', {
            error: finalError instanceof Error ? finalError.message : 'Unknown error'
          });
        }
        
        logger.info('Executing restart process', {
          uptime: uptimeFormatted,
          memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          processId: process.pid
        });
        
        // Graceful shutdown
        setTimeout(() => {
          logger.info('Process exiting for restart');
          process.exit(0); // This will trigger PM2 or system restart
        }, 1000);
        
      }, 10000);    } catch (error) {
      // Detect user language for error message
      const language = user?.language || Language.INDONESIAN;
      
      logger.error('Command error in restart', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        processId: process.pid,
        memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        uptime: formatUptime(process.uptime())
      });      await client.reply(
        message.from,
        getText('restart.error', language, undefined, {
          errorMessage: (error as Error).message || 'Unknown error',
          processId: process.pid.toString(),
          memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024).toString(),
          uptime: formatUptime(process.uptime()),
          currentTime: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
        }),
        message.id
      );
    }
  }
};

/**
 * Format uptime duration into human-readable string
 * @param seconds - Uptime in seconds
 * @returns Formatted uptime string
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

export default restartCommand;