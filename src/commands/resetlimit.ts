import { Client, Message, ContactId } from '@open-wa/wa-automate';
import { Command } from '../middlewares/commandParser';
import { User, Usage } from '../database/models';
import formatMessage from '../utils/formatter';

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
  description: 'Reset limit penggunaan fitur untuk pengguna tertentu atau semua pengguna',
  category: 'admin',
  cooldown: 5,
  usage: 'resetlimit [all/@user/phone]',
  example: 'resetlimit all atau resetlimit @user atau resetlimit 628123456789',
  adminOnly: true,
  ownerOnly: false,
  
  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    try {
      // Show help if no arguments provided
      if (args.length === 0) {
        await client.reply(
          message.from,
          formatMessage.formatBox(
            '📋 Reset Limit - Panduan',
            '🎯 **Pilih Mode Reset:**\n\n' +
            '🌍 `resetlimit all` - Reset semua pengguna\n' +
            '👤 `resetlimit @user` - Reset pengguna ter-mention\n' +
            '📱 `resetlimit 628123456789` - Reset dengan nomor\n\n' +
            '⚠️ **Perhatian:**\n' +
            '• Mode "all" akan reset SEMUA pengguna\n' +
            '• Operasi ini tidak dapat dibatalkan\n' +
            '• Gunakan dengan hati-hati\n\n' +
            '💡 **Tips:** Mention pengguna untuk reset individual'
          ),
          message.id
        );
        return;
      }

      const startTime = Date.now();
      const currentTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      
      // Handle "all" reset with confirmation
      if (args[0].toLowerCase() === 'all') {
        console.log(`🔄 [RESET-ALL] Initiated by admin: ${message.sender.id}`);
        
        // Get total count before reset
        const totalUsages = await Usage.count();
        const totalUsers = await User.count();
        
        if (totalUsages === 0) {
          await client.reply(
            message.from,
            formatMessage.formatBox(
              '📊 Reset Info',
              '🔍 **Status Database:**\n\n' +
              '✨ Tidak ada data usage untuk direset\n' +
              '📈 Database sudah bersih\n\n' +
              `👥 Total pengguna: ${totalUsers}\n` +
              `⏰ Waktu cek: ${currentTime}`
            ),
            message.id
          );
          return;
        }

        // Send confirmation with detailed info
        await client.reply(
          message.from,
          formatMessage.formatBox(
            '⚠️ Konfirmasi Reset ALL',
            '🚨 **PERINGATAN PENTING!**\n\n' +
            `📊 **Data yang akan dihapus:**\n` +
            `• ${totalUsages} data usage\n` +
            `• Dari ${totalUsers} pengguna terdaftar\n\n` +
            '❌ **Operasi ini TIDAK DAPAT dibatalkan!**\n\n' +
            '⏰ Proses reset akan dimulai dalam 10 detik...\n' +
            '💬 Balas "CANCEL" untuk membatalkan'
          ),
          message.id
        );

        // Wait for 10 seconds for potential cancellation
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Proceed with reset
        await client.reply(
          message.from,
          formatMessage.formatBox(
            '🔄 Memproses Reset',
            '⏳ **Sedang mereset semua data...**\n\n' +
            '🔄 Menghapus data usage...\n' +
            '📊 Memperbarui statistik...\n\n' +
            '⏰ Mohon tunggu sebentar...'
          ),
          message.id
        );

        // Perform the reset
        const resetCount = await Usage.destroy({ where: {} });
        const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
        
        await client.reply(
          message.from,
          formatMessage.formatBox(
            '✅ Reset Berhasil',
            `🎉 **Reset ALL Selesai!**\n\n` +
            `📊 **Statistik Reset:**\n` +
            `• Data usage dihapus: ${resetCount}\n` +
            `• Pengguna terpengaruh: ${totalUsers}\n` +
            `• Waktu proses: ${processingTime}s\n\n` +
            `⏰ **Waktu reset:** ${currentTime}\n` +
            `👑 **Admin:** @${message.sender.id.replace('@c.us', '')}\n\n` +
            `✨ Semua pengguna kini dapat menggunakan fitur kembali!`
          ),
          message.id
        );

        console.log(`✅ [RESET-ALL] Completed: ${resetCount} usages reset by ${message.sender.id} in ${processingTime}s`);
        return;
      }      // Handle mentions (multiple users)
      if (message.mentionedJidList && message.mentionedJidList.length > 0) {
        console.log(`🔄 [RESET-MENTIONS] Processing ${message.mentionedJidList.length} mentions by admin: ${message.sender.id}`);
        
        let resetCount = 0;
        let notFoundCount = 0;
        const resetResults: string[] = [];
        const notFoundUsers: string[] = [];

        // Send processing message
        await client.reply(
          message.from,
          formatMessage.formatBox(
            '🔄 Memproses Reset',
            `⏳ **Sedang memproses ${message.mentionedJidList.length} pengguna...**\n\n` +
            '🔍 Mencari data pengguna...\n' +
            '🗑️ Menghapus data usage...\n\n' +
            '⏰ Mohon tunggu sebentar...'
          ),
          message.id
        );

        for (const mentionedJid of message.mentionedJidList) {
          try {
            const phoneNumber = mentionedJid.replace('@c.us', '');
            
            // Find user in database
            const targetUser = await User.findOne({
              where: { phoneNumber }
            });

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
                displayName = contact.name || contact.pushname || phoneNumber;              } catch (contactError) {
                console.log(`⚠️ Could not fetch contact info for ${phoneNumber}:`, (contactError as Error).message || 'Unknown error');
              }

              resetResults.push(`✅ ${displayName} (${usageCount} data)`);
              resetCount++;
            } else {
              notFoundUsers.push(`❌ ${phoneNumber} (tidak terdaftar)`);
              notFoundCount++;
            }
          } catch (error) {
            console.error(`❌ Error processing mention ${mentionedJid}:`, error);
            notFoundUsers.push(`❌ ${mentionedJid.replace('@c.us', '')} (error)`);
            notFoundCount++;
          }
        }

        const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);

        // Prepare result message
        let resultMessage = `🎉 **Reset Selesai!**\n\n`;
        
        if (resetCount > 0) {
          resultMessage += `✅ **Berhasil Reset (${resetCount}):**\n`;
          resultMessage += resetResults.join('\n') + '\n\n';
        }
        
        if (notFoundCount > 0) {
          resultMessage += `⚠️ **Tidak Ditemukan (${notFoundCount}):**\n`;
          resultMessage += notFoundUsers.join('\n') + '\n\n';
        }

        resultMessage += `📊 **Ringkasan:**\n`;
        resultMessage += `• Total diproses: ${message.mentionedJidList.length}\n`;
        resultMessage += `• Berhasil: ${resetCount}\n`;
        resultMessage += `• Gagal: ${notFoundCount}\n`;
        resultMessage += `• Waktu proses: ${processingTime}s\n\n`;
        resultMessage += `⏰ **Waktu:** ${currentTime}`;

        await client.reply(
          message.from,
          formatMessage.formatBox('📊 Hasil Reset Mention', resultMessage),
          message.id
        );

        console.log(`✅ [RESET-MENTIONS] Completed: ${resetCount}/${message.mentionedJidList.length} users reset by ${message.sender.id}`);
        return;
      }

      // Handle phone number reset
      const phoneArg = args[0].replace(/[^0-9]/g, '');
      if (phoneArg.length >= 10) {
        console.log(`🔄 [RESET-PHONE] Processing phone ${phoneArg} by admin: ${message.sender.id}`);
        
        // Normalize phone number
        let normalizedPhone = phoneArg;
        if (phoneArg.startsWith('0')) {
          normalizedPhone = '62' + phoneArg.substring(1);
        } else if (!phoneArg.startsWith('62')) {
          normalizedPhone = '62' + phoneArg;
        }

        const targetUser = await User.findOne({
          where: { phoneNumber: normalizedPhone }
        });

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
            displayName = contact.name || contact.pushname || normalizedPhone;          } catch (contactError) {
            console.log(`⚠️ Could not fetch contact info for ${normalizedPhone}:`, (contactError as Error).message || 'Unknown error');
          }

          const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);

          await client.reply(
            message.from,
            formatMessage.formatBox(
              '✅ Reset Berhasil',
              `🎉 **Reset Selesai!**\n\n` +
              `👤 **Pengguna:** ${displayName}\n` +
              `📱 **Nomor:** ${normalizedPhone}\n` +
              `🗑️ **Data dihapus:** ${usageCount} usage\n\n` +
              `📊 **Detail:**\n` +
              `• Waktu proses: ${processingTime}s\n` +
              `• Status: Limit direset\n\n` +
              `⏰ **Waktu:** ${currentTime}\n\n` +
              `✨ Pengguna dapat menggunakan fitur kembali!`
            ),
            message.id
          );

          console.log(`✅ [RESET-PHONE] Completed: ${normalizedPhone} (${usageCount} usages) reset by ${message.sender.id}`);
        } else {
          await client.reply(
            message.from,
            formatMessage.formatBox(
              '❌ Pengguna Tidak Ditemukan',
              `🔍 **Nomor:** ${normalizedPhone}\n\n` +
              `⚠️ **Kemungkinan Penyebab:**\n` +
              `• Nomor belum terdaftar di bot\n` +
              `• Format nomor tidak valid\n` +
              `• Pengguna belum pernah menggunakan bot\n\n` +
              `💡 **Tips:**\n` +
              `• Pastikan nomor benar: ${normalizedPhone}\n` +
              `• Pengguna harus register terlebih dahulu\n` +
              `• Gunakan format: resetlimit @user untuk mention`
            ),
            message.id
          );

          console.log(`❌ [RESET-PHONE] User not found: ${normalizedPhone} requested by ${message.sender.id}`);
        }
        return;
      }

      // Invalid format
      await client.reply(
        message.from,
        formatMessage.formatBox(
          '❌ Format Tidak Valid',
          '📋 **Format yang benar:**\n\n' +
          '🌍 `resetlimit all` - Reset semua pengguna\n' +
          '👤 `resetlimit @user` - Reset dengan mention\n' +
          '📱 `resetlimit 628123456789` - Reset dengan nomor\n\n' +
          '⚠️ **Contoh Nomor:**\n' +
          '• 628123456789 (dengan kode negara)\n' +
          '• 08123456789 (akan otomatis dikonversi)\n\n' +
          '💡 **Tips:**\n' +
          '• Mention lebih akurat daripada nomor\n' +
          '• Pastikan pengguna sudah terdaftar\n' +
          '• Gunakan "all" dengan hati-hati'
        ),
        message.id
      );

    } catch (error) {
      console.error('❌ [RESET-LIMIT] Command error:', error);
      
      // Send detailed error information
      await client.reply(
        message.from,
        formatMessage.formatBox(
          '❌ Terjadi Kesalahan',
          '🚨 **Error saat reset limit!**\n\n' +          `⚠️ **Detail Error:**\n` +
          `• ${(error as Error).message || 'Unknown error'}\n\n` +
          `🔄 **Solusi:**\n` +
          `• Coba lagi dalam beberapa saat\n` +
          `• Pastikan format command benar\n` +
          `• Laporkan ke owner jika terus error\n\n` +
          `⏰ **Waktu error:** ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`
        ),
        message.id
      );
    }
  }
};

export default resetlimitCommand;