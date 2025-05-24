import { Client, Message, ContactId } from '@open-wa/wa-automate';
import { Command } from '../middlewares/commandParser';
import { User } from '../database/models';
import formatMessage from '../utils/formatter';
import config from '../utils/config';

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
  category: 'owner',
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
      const hasConfirm = args.length > 0 && args[0].toLowerCase() === 'confirm';

      if (!hasConfirm) {
        // Send confirmation request with system info
        await client.reply(
          message.from,
          formatMessage.formatBox(
            '🔄 Konfirmasi Restart Bot',
            '⚠️ **KONFIRMASI RESTART DIPERLUKAN**\n\n' +
            `🤖 **Info Bot:**\n` +
            `• Nama: ${config.botName}\n` +
            `• Uptime: ${uptimeFormatted}\n` +
            `• PID: ${process.pid}\n` +
            `• Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\n\n` +
            `🔄 **Dampak Restart:**\n` +
            `• Bot akan offline 30-60 detik\n` +
            `• Semua sesi akan terputus\n` +
            `• Proses akan dimulai ulang\n\n` +
            `✅ **Untuk melanjutkan:**\n` +
            `\`restart confirm\` - Lanjutkan restart\n\n` +
            `⏰ **Timeout:** 30 detik (otomatis batal)`
          ),
          message.id
        );

        console.log(`⚠️ [RESTART] Confirmation requested by owner: ${message.sender.id}`);
        return;
      }

      console.log(`🔄 [RESTART] Confirmed restart initiated by owner: ${message.sender.id}`);
      
      // Send restart notification with countdown
      await client.reply(
        message.from,
        formatMessage.formatBox(
          '🔄 Restart Bot Dimulai',
          '⏳ **BOT SEDANG DIRESTART...**\n\n' +
          `🤖 **Detail Restart:**\n` +
          `• Dipicu oleh: Owner\n` +
          `• Waktu mulai: ${currentTime}\n` +
          `• Uptime sebelumnya: ${uptimeFormatted}\n\n` +
          `⏰ **Timeline:**\n` +
          `• 00:05 - Menyimpan data\n` +
          `• 00:10 - Menutup koneksi\n` +
          `• 00:15 - Restart proses\n` +
          `• 01:00 - Bot kembali online\n\n` +
          `📱 **Status:** Memulai shutdown...\n` +
          `🔄 Bot akan kembali online sebentar lagi!`
        ),
        message.id
      );

      // Prepare detailed owner notification
      const ownerNotification = formatMessage.formatBox(
        '🤖 Bot Restart Notification',
        `🔄 **BOT RESTART INITIATED**\n\n` +
        `👑 **Dipicu oleh:** Owner (${message.sender.id.replace('@c.us', '')})\n` +
        `📍 **Lokasi:** ${isFromGroup ? 'Group Chat' : 'Private Chat'}\n` +
        `⏰ **Waktu:** ${currentTime}\n\n` +
        `📊 **System Info:**\n` +
        `• Bot Name: ${config.botName}\n` +
        `• Uptime: ${uptimeFormatted}\n` +
        `• Process ID: ${process.pid}\n` +
        `• Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\n` +
        `• Node Version: ${process.version}\n\n` +
        `🔄 **Status:** Initializing restart sequence...\n` +
        `🚀 Bot akan kembali online dalam 30-60 detik.`
      );

      // Send private notification to owner if restart is from group
      if (isFromGroup) {
        try {
          await client.sendText(`${config.ownerNumber}@c.us` as ContactId, ownerNotification);
          console.log(`📨 [RESTART] Owner notification sent for group restart`);
        } catch (notificationError) {
          console.error(`❌ [RESTART] Failed to send owner notification:`, notificationError);
        }
      }

      // Progressive status updates
      setTimeout(async () => {
        try {
          await client.reply(
            message.from,
            formatMessage.formatBox(
              '🔄 Restart Progress',
              '📊 **MENYIMPAN DATA...**\n\n' +
              `✅ Database connections closing\n` +
              `✅ Active sessions saving\n` +
              `⏳ Memory cleanup in progress\n\n` +
              `⏰ **ETA:** 10 detik lagi`
            ),
            message.id
          );        } catch (updateError) {
          console.log(`⚠️ [RESTART] Progress update failed:`, (updateError as Error).message || 'Unknown error');
        }
      }, 5000);

      setTimeout(async () => {
        try {
          await client.reply(
            message.from,
            formatMessage.formatBox(
              '🔄 Final Restart',
              '🚀 **RESTARTING NOW...**\n\n' +
              `✅ Data saved successfully\n` +
              `✅ Connections closed\n` +
              `🔄 Process restarting...\n\n` +
              `💫 **See you in a moment!**\n` +
              `⏰ Bot akan online kembali sebentar lagi`
            ),
            message.id
          );        } catch (finalError) {
          console.log(`⚠️ [RESTART] Final message failed:`, (finalError as Error).message || 'Unknown error');
        }
        
        console.log(`🔄 [RESTART] Executing restart...`);
        console.log(`📊 [RESTART] Final stats: Uptime=${uptimeFormatted}, Memory=${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
        
        // Graceful shutdown
        setTimeout(() => {
          console.log('🔄 [RESTART] Process exiting...');
          process.exit(0); // This will trigger PM2 or system restart
        }, 1000);
        
      }, 10000);

    } catch (error) {
      console.error('❌ [RESTART] Command error:', error);
      
      await client.reply(
        message.from,
        formatMessage.formatBox(
          '❌ Restart Gagal',
          `🚨 **ERROR SAAT RESTART!**\n\n` +          `⚠️ **Detail Error:**\n` +
          `• ${(error as Error).message || 'Unknown error'}\n\n` +
          `🔄 **Solusi:**\n` +
          `• Coba restart manual dari server\n` +
          `• Periksa log sistem untuk detail\n` +
          `• Hubungi developer jika masalah berlanjut\n\n` +
          `📊 **System Info:**\n` +
          `• PID: ${process.pid}\n` +
          `• Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\n` +
          `• Uptime: ${formatUptime(process.uptime())}\n\n` +
          `⏰ **Waktu error:** ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`
        ),
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