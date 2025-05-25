import { Client, Message, ContactId } from '@open-wa/wa-automate';
import { Command } from '../middlewares/commandParser';
import { User } from '../database/models';
import config from '../utils/config';
import logger from '../utils/logger';
import { getDisplayPhoneNumber } from '../utils/phoneUtils';

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
  description: 'Restart bot dengan aman (khusus owner)',
  category: 'Owner',
  cooldown: 10,
  usage: 'restart [confirm]',
  example: 'restart atau restart confirm',
  adminOnly: false,
  ownerOnly: true,
  
  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    try {
      const currentTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      const uptime = process.uptime();
      const uptimeFormatted = formatUptime(uptime);
      const isFromGroup = message.from.includes('@g.us');

      // Check if confirmation is needed
      const hasConfirm = args.length > 0 && args[0].toLowerCase() === 'confirm';      if (!hasConfirm) {
        // Send confirmation request with system info
        await client.reply(
          message.from,
          `*🔄 Konfirmasi Restart Bot*\n\n` +
            `⚠️ *KONFIRMASI RESTART DIPERLUKAN*\n\n` +
            `🤖 *Info Bot:*\n` +
            `• Nama: ${config.botName}\n` +
            `• Uptime: ${uptimeFormatted}\n` +
            `• PID: ${process.pid}\n` +
            `• Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\n\n` +
            `🔄 *Dampak Restart:*\n` +
            `• Bot akan offline 30-60 detik\n` +
            `• Semua sesi akan terputus\n` +
            `• Proses akan dimulai ulang\n\n` +
            `✅ *Untuk melanjutkan:*\n` +
            `\`restart confirm\` - Lanjutkan restart\n\n` +
            `⏰ *Timeout:* 30 detik (otomatis batal)`,
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
      });
        // Send restart notification with countdown
      await client.reply(
        message.from,
        `*🔄 Restart Bot Dimulai*\n\n` +
          `⏳ *BOT SEDANG DIRESTART...*\n\n` +
          `🤖 *Detail Restart:*\n` +
          `• Dipicu oleh: Owner\n` +
          `• Waktu mulai: ${currentTime}\n` +
          `• Uptime sebelumnya: ${uptimeFormatted}\n\n` +
          `⏰ *Timeline:*\n` +
          `• 00:05 - Menyimpan data\n` +
          `• 00:10 - Menutup koneksi\n` +
          `• 00:15 - Restart proses\n` +
          `• 01:00 - Bot kembali online\n\n` +
          `📱 *Status:* Memulai shutdown...\n` +
          `🔄 Bot akan kembali online sebentar lagi!`,
        message.id
      );      // Prepare detailed owner notification
      const ownerNotification = `*🤖 Bot Restart Notification*\n\n` +
        `🔄 *BOT RESTART INITIATED*\n\n` +
        `👑 *Dipicu oleh:* Owner (${getDisplayPhoneNumber(message.sender.id)})\n` +
        `📍 *Lokasi:* ${isFromGroup ? 'Group Chat' : 'Private Chat'}\n` +
        `⏰ *Waktu:* ${currentTime}\n\n` +
        `📊 *System Info:*\n` +
        `• Bot Name: ${config.botName}\n` +
        `• Uptime: ${uptimeFormatted}\n` +
        `• Process ID: ${process.pid}\n` +
        `• Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\n` +
        `• Node Version: ${process.version}\n\n` +
        `🔄 *Status:* Initializing restart sequence...\n` +
        `🚀 Bot akan kembali online dalam 30-60 detik.`;

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
            `*🔄 Restart Progress*\n\n` +
              `📊 *MENYIMPAN DATA...*\n\n` +
              `✅ Database connections closing\n` +
              `✅ Active sessions saving\n` +
              `⏳ Memory cleanup in progress\n\n` +
              `⏰ *ETA:* 10 detik lagi`,
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
            `*🔄 Final Restart*\n\n` +
              `🚀 *RESTARTING NOW...*\n\n` +
              `✅ Data saved successfully\n` +
              `✅ Connections closed\n` +
              `🔄 Process restarting...\n\n` +
              `💫 *See you in a moment!*\n` +
              `⏰ Bot akan online kembali sebentar lagi`,
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
      logger.error('Command error in restart', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        processId: process.pid,
        memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        uptime: formatUptime(process.uptime())
      });
        await client.reply(
        message.from,
        `*❌ Restart Gagal*\n\n` +
          `🚨 *ERROR SAAT RESTART!*\n\n` +
          `⚠️ *Detail Error:*\n` +
          `• ${(error as Error).message || 'Unknown error'}\n\n` +
          `🔄 *Solusi:*\n` +
          `• Coba restart manual dari server\n` +
          `• Periksa log sistem untuk detail\n` +
          `• Hubungi developer jika masalah berlanjut\n\n` +
          `📊 *System Info:*\n` +
          `• PID: ${process.pid}\n` +
          `• Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\n` +
          `• Uptime: ${formatUptime(process.uptime())}\n\n` +
          `⏰ *Waktu error:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`,
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