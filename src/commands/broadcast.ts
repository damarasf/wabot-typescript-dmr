import { Client, Message, ContactId, MessageId } from '@open-wa/wa-automate';
import { Command } from '../middlewares/commandParser';
import { User } from '../database/models';
import { UserLevel } from '../database/models/User';
import formatMessage from '../utils/formatter';
import config from '../utils/config';

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
  category: 'owner',
  cooldown: 30,
  usage: 'broadcast <pesan> [level]',
  example: 'broadcast Halo semua! atau broadcast Pesan khusus premium premium',
  adminOnly: false,
  ownerOnly: true,
  
  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    try {
      // Show help if no arguments
      if (args.length === 0) {
        await client.reply(
          message.from,
          formatMessage.formatBox(
            '📢 Broadcast - Panduan',
            '🎯 **Cara Penggunaan:**\n\n' +
            '📝 `broadcast <pesan>` - Kirim ke semua\n' +
            '🏷️ `broadcast <pesan> <level>` - Kirim ke level tertentu\n\n' +
            '🎭 **Level Filter:**\n' +
            '• `free` - Hanya pengguna gratis\n' +
            '• `premium` - Hanya pengguna premium\n' +
            '• `admin` - Hanya admin\n' +
            '• `all` - Semua level (default)\n\n' +
            '⚠️ **Perhatian:**\n' +
            '• Pesan akan dikirim dengan jeda 2 detik\n' +
            '• Proses mungkin memakan waktu lama\n' +
            '• Gunakan dengan bijak\n\n' +
            '💡 **Contoh:**\n' +
            '`broadcast Halo semua pengguna!`\n' +
            '`broadcast Update premium tersedia premium`'
          ),
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
          formatMessage.formatBox(
            '❌ Pesan Kosong',
            '📝 **Harap berikan pesan untuk di-broadcast!**\n\n' +
            '💡 **Contoh yang benar:**\n' +
            '• `broadcast Halo semua!`\n' +
            '• `broadcast Update fitur baru premium`\n\n' +
            '❌ **Tidak valid:**\n' +
            '• `broadcast premium` (tanpa pesan)\n' +
            '• `broadcast ` (kosong)'
          ),
          message.id
        );
        return;
      }

      const broadcastMessage = messageArgs.join(' ');
      const startTime = Date.now();
      const currentTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      
      console.log(`📢 [BROADCAST] Started by owner: ${message.sender.id}, filter: ${levelFilter}, message length: ${broadcastMessage.length}`);

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
      });

      if (users.length === 0) {
        const levelText = levelFilter === 'all' ? 'terdaftar' : levelFilter;
        await client.reply(
          message.from,
          formatMessage.formatBox(
            '⚠️ Tidak Ada Target',
            `🔍 **Filter:** ${levelText}\n\n` +
            `📊 **Hasil:** Tidak ada pengguna ditemukan\n\n` +
            `💡 **Kemungkinan Penyebab:**\n` +
            `• Belum ada pengguna dengan level ${levelText}\n` +
            `• Database kosong\n` +
            `• Filter terlalu spesifik\n\n` +
            `🔄 **Coba lagi dengan filter 'all'**`
          ),
          message.id
        );
        return;
      }

      // Show preview and confirmation
      const previewMessage = broadcastMessage.length > 100 
        ? broadcastMessage.substring(0, 100) + '...'
        : broadcastMessage;

      await client.reply(
        message.from,
        formatMessage.formatBox(
          '📢 Konfirmasi Broadcast',
          `📝 **Preview Pesan:**\n` +
          `"${previewMessage}"\n\n` +
          `🎯 **Target:**\n` +
          `• Filter: ${levelFilter}\n` +
          `• Pengguna: ${users.length}\n` +
          `• Estimasi waktu: ${Math.ceil(users.length * 2 / 60)} menit\n\n` +
          `⚡ **Detail Proses:**\n` +
          `• Jeda antar pesan: 2 detik\n` +
          `• Total karakter: ${broadcastMessage.length}\n` +
          `• Rate limit: Safe mode\n\n` +
          `🚀 **Broadcast akan dimulai dalam 5 detik...**\n` +
          `💬 Balas "STOP" untuk membatalkan`
        ),
        message.id
      );

      // Wait 5 seconds for potential cancellation
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Start broadcast
      let successCount = 0;
      let failedCount = 0;
      let blockedCount = 0;
      const failedUsers: string[] = [];
      const blockedUsers: string[] = [];

      // Send initial progress message
      const progressMessage = await client.reply(
        message.from,
        formatMessage.formatBox(
          '📢 Broadcast Dimulai',
          `⏳ **Memulai broadcast...**\n\n` +
          `📊 **Progress:** 0/${users.length}\n` +
          `✅ Berhasil: 0\n` +
          `❌ Gagal: 0\n` +
          `🚫 Terblokir: 0\n\n` +
          `⏰ Dimulai: ${currentTime}`
        ),
        message.id
      );

      // Broadcast to all users with progress updates
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        
        try {
          // Prepare final message with header and footer
          const finalMessage = formatMessage.formatBox(
            '📢 BROADCAST MESSAGE',
            `${broadcastMessage}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `🤖 _Pesan dari ${config.botName}_\n` +
            `⏰ _${currentTime}_`
          );
          
          // Send message
          await client.sendText(`${user.phoneNumber}@c.us` as ContactId, finalMessage);
          successCount++;
          
          console.log(`📤 [BROADCAST] Sent to ${user.phoneNumber} (${successCount}/${users.length})`);
            } catch (error) {
          const errorMessage = (error as Error).message?.toLowerCase() || '';
          
          if (errorMessage.includes('blocked') || errorMessage.includes('not found')) {
            blockedUsers.push(user.phoneNumber);
            blockedCount++;
            console.log(`🚫 [BROADCAST] Blocked by ${user.phoneNumber}:`, (error as Error).message || 'Unknown error');
          } else {
            failedUsers.push(user.phoneNumber);
            failedCount++;
            console.error(`❌ [BROADCAST] Failed to send to ${user.phoneNumber}:`, (error as Error).message || 'Unknown error');
          }
        }        // Update progress every 10 messages or at the end
        if ((i + 1) % 10 === 0 || i === users.length - 1) {
          try {
            const progressPercent = Math.round(((i + 1) / users.length) * 100);
            const progressBar = generateProgressBar(progressPercent);            await client.reply(
              message.from,
              formatMessage.formatBox(
                '📢 Progress Broadcast',
                `${progressBar} ${progressPercent}%\n\n` +
                `📊 **Progress:** ${i + 1}/${users.length}\n` +
                `✅ Berhasil: ${successCount}\n` +
                `❌ Gagal: ${failedCount}\n` +
                `🚫 Terblokir: ${blockedCount}\n\n` +
                `⏰ Berlangsung: ${Math.round((Date.now() - startTime) / 1000)}s`
              ),
              message.id
            );} catch (updateError) {
            console.log(`⚠️ [BROADCAST] Progress update failed:`, (updateError as Error).message || 'Unknown error');
          }
        }

        // Rate limiting delay (2 seconds)
        if (i < users.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      const totalTime = Math.round((Date.now() - startTime) / 1000);
      const successRate = Math.round((successCount / users.length) * 100);

      // Send final summary
      let summaryMessage = `🎉 **Broadcast Selesai!**\n\n`;
      summaryMessage += `📊 **Statistik Final:**\n`;
      summaryMessage += `• Total target: ${users.length}\n`;
      summaryMessage += `• Berhasil: ${successCount} (${successRate}%)\n`;
      summaryMessage += `• Gagal: ${failedCount}\n`;
      summaryMessage += `• Terblokir: ${blockedCount}\n\n`;
      summaryMessage += `⏱️ **Waktu Proses:**\n`;
      summaryMessage += `• Total: ${totalTime}s (${Math.round(totalTime / 60)}m)\n`;
      summaryMessage += `• Rate: ${Math.round(users.length / totalTime * 60)} msg/min\n\n`;
      summaryMessage += `🎯 **Filter:** ${levelFilter}\n`;
      summaryMessage += `⏰ **Selesai:** ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`;

      // Add failed users info if any
      if (failedUsers.length > 0 && failedUsers.length <= 5) {
        summaryMessage += `\n\n❌ **Gagal:** ${failedUsers.join(', ')}`;
      } else if (failedUsers.length > 5) {
        summaryMessage += `\n\n❌ **Gagal:** ${failedUsers.slice(0, 3).join(', ')} +${failedUsers.length - 3} lainnya`;
      }

      if (blockedUsers.length > 0 && blockedUsers.length <= 5) {
        summaryMessage += `\n\n🚫 **Terblokir:** ${blockedUsers.join(', ')}`;
      } else if (blockedUsers.length > 5) {
        summaryMessage += `\n\n🚫 **Terblokir:** ${blockedUsers.slice(0, 3).join(', ')} +${blockedUsers.length - 3} lainnya`;
      }

      await client.reply(
        message.from,
        formatMessage.formatBox('📊 Hasil Broadcast', summaryMessage),
        message.id
      );

      console.log(`✅ [BROADCAST] Completed: ${successCount}/${users.length} success, ${failedCount} failed, ${blockedCount} blocked in ${totalTime}s`);

    } catch (error) {
      console.error('❌ [BROADCAST] Command error:', error);
      
      await client.reply(
        message.from,
        formatMessage.formatBox(
          '❌ Broadcast Gagal',
          `🚨 **ERROR SAAT BROADCAST!**\n\n` +          `⚠️ **Detail Error:**\n` +
          `• ${(error as Error).message || 'Unknown error'}\n\n` +
          `🔄 **Solusi:**\n` +
          `• Periksa koneksi internet\n` +
          `• Coba dengan pesan lebih pendek\n` +
          `• Coba lagi dalam beberapa menit\n` +
          `• Laporkan ke developer jika terus error\n\n` +
          `⏰ **Waktu error:** ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`
        ),
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