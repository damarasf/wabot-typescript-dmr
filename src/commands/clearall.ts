import { Client, Message } from '@open-wa/wa-automate';
import { Command } from '../middlewares/commandParser';
import { User, Usage, Reminder, Group } from '../database/models';
import { formatBox } from '../utils/formatter';
import config from '../utils/config';

/**
 * Clear All Command
 * Nuclear option to clear all bot data - Owner only
 * Features comprehensive data removal, confirmation system, and detailed logging
 */
export const clearallCommand: Command = {
  name: 'clearall',
  aliases: ['cleardata', 'resetdb', 'nuke'],
  description: 'Hapus semua data pengguna dan reset database (khusus owner)',
  category: 'Owner',
  cooldown: 30,
  usage: '!clearall CONFIRM',
  example: '!clearall CONFIRM',
  adminOnly: false,
  ownerOnly: true,
  
  /**
   * Execute the clearall command
   * @param message - WhatsApp message object
   * @param args - Command arguments [CONFIRM]
   * @param client - WhatsApp client instance
   * @param user - Owner user database object
   */
  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    try {
      console.log(`🧹 Processing clearall command from owner ${message.sender.id}`);
      
      // Additional owner verification (safety check)
      if (String(message.sender.id) !== config.ownerNumber) {
        console.log(`❌ Unauthorized clearall attempt by ${message.sender.id}`);
        await client.reply(
          message.chatId,
          '🚫 *Akses Ditolak*\n\n' +
          'Perintah ini hanya dapat digunakan oleh owner bot.\n\n' +
          '_Ini adalah operasi destruktif yang sangat sensitif._',
          message.id
        );
        return;
      }

      // Check for confirmation
      if (args.length === 0 || args[0] !== 'CONFIRM') {
        console.log('⚠️ Clearall requested without confirmation');
        
        // Get current data counts for information
        let dataCounts = '';
        try {
          const userCount = await User.count();
          const usageCount = await Usage.count();
          const reminderCount = await Reminder.count();
          const groupCount = await Group.count();
          
          dataCounts = `📊 *Data Saat Ini:*\n` +
            `👥 Pengguna: ${userCount}\n` +
            `📈 Usage Data: ${usageCount}\n` +
            `⏰ Reminder: ${reminderCount}\n` +
            `👥 Grup: ${groupCount}\n\n`;
        } catch (countError) {
          console.error('Error counting data:', countError);
          dataCounts = '📊 *Data Saat Ini:* Tidak dapat dihitung\n\n';
        }
        
        const warningMessage = `🚨 *PERINGATAN KRITIS*\n\n` +
          `⚠️ **OPERASI DESTRUKTIF**\n` +
          `Perintah ini akan menghapus SEMUA data bot!\n\n` +
          dataCounts +
          `🗑️ *Yang Akan Dihapus:*\n` +
          `• Semua pengguna terdaftar\n` +
          `• Semua data penggunaan/limit\n` +
          `• Semua reminder aktif\n` +
          `• Semua data grup\n` +
          `• Semua riwayat aktivitas\n\n` +
          `❌ **TINDAKAN INI TIDAK DAPAT DIBATALKAN!**\n\n` +
          `⚡ *Untuk melanjutkan, ketik:*\n` +
          `\`!clearall CONFIRM\`\n\n` +
          `_Pastikan Anda benar-benar yakin sebelum melakukan ini._`;

        await client.reply(
          message.chatId,
          formatBox('⚠️ KONFIRMASI DIPERLUKAN', warningMessage),
          message.id
        );
        return;
      }

      console.log('🔥 Clearall confirmed, starting data destruction process');

      // Send initial warning with countdown
      const initialWarning = `🚨 *PROSES PENGHAPUSAN DIMULAI*\n\n` +
        `⚠️ Menghapus semua data dalam 3 detik...\n` +
        `❌ Ini adalah kesempatan terakhir untuk membatalkan!\n\n` +
        `_Proses akan dimulai dalam beberapa detik._`;
      
      await client.reply(
        message.chatId,
        formatBox('🚨 PERINGATAN', initialWarning),
        message.id
      );

      // 3 second delay for last-chance cancellation
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log('💀 Starting database destruction');

      // Count current data before destruction
      let userCount = 0;
      let usageCount = 0;
      let reminderCount = 0;
      let groupCount = 0;
      
      try {
        userCount = await User.count();
        usageCount = await Usage.count();
        reminderCount = await Reminder.count();
        groupCount = await Group.count();
        
        console.log(`📊 Data to be destroyed: Users(${userCount}), Usage(${usageCount}), Reminders(${reminderCount}), Groups(${groupCount})`);
      } catch (countError) {
        console.error('❌ Error counting data before destruction:', countError);
      }

      // Send progress message
      await client.reply(
        message.chatId,
        '🔄 *Memproses penghapusan data...*\n\n_Harap tunggu, jangan matikan bot._',
        message.id
      );

      // Start destruction process with error handling for each step
      const destructionLog: string[] = [];
      let totalDestroyed = 0;

      try {
        // Step 1: Clear Usage data
        console.log('🗑️ Destroying usage data...');
        const usageDestroyed = await Usage.destroy({ where: {}, force: true });
        destructionLog.push(`✅ Usage data: ${usageDestroyed} records`);
        totalDestroyed += usageDestroyed;
      } catch (error) {
        console.error('❌ Error destroying usage data:', error);
        destructionLog.push(`❌ Usage data: Error occurred`);
      }

      try {
        // Step 2: Clear Reminder data
        console.log('🗑️ Destroying reminder data...');
        const reminderDestroyed = await Reminder.destroy({ where: {}, force: true });
        destructionLog.push(`✅ Reminder data: ${reminderDestroyed} records`);
        totalDestroyed += reminderDestroyed;
      } catch (error) {
        console.error('❌ Error destroying reminder data:', error);
        destructionLog.push(`❌ Reminder data: Error occurred`);
      }

      try {
        // Step 3: Clear Group data
        console.log('🗑️ Destroying group data...');
        const groupDestroyed = await Group.destroy({ where: {}, force: true });
        destructionLog.push(`✅ Group data: ${groupDestroyed} records`);
        totalDestroyed += groupDestroyed;
      } catch (error) {
        console.error('❌ Error destroying group data:', error);
        destructionLog.push(`❌ Group data: Error occurred`);
      }

      try {
        // Step 4: Clear User data (last, as it may have foreign key constraints)
        console.log('🗑️ Destroying user data...');
        const userDestroyed = await User.destroy({ where: {}, force: true });
        destructionLog.push(`✅ User data: ${userDestroyed} records`);
        totalDestroyed += userDestroyed;
      } catch (error) {
        console.error('❌ Error destroying user data:', error);
        destructionLog.push(`❌ User data: Error occurred`);
      }

      // Compile destruction report
      const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      
      const successMessage = `✅ *DATABASE BERHASIL DIRESET*\n\n` +
        `🗑️ *Statistik Penghapusan:*\n` +
        destructionLog.map(log => `${log}`).join('\n') + '\n\n' +
        `📊 *Total Records Dihapus:* ${totalDestroyed}\n` +
        `⏰ *Waktu:* ${timestamp}\n` +
        `👑 *Oleh:* Owner (${message.sender.pushname || config.ownerNumber})\n\n` +
        `🔄 *Status:* Database telah direset sepenuhnya!\n` +
        `⚡ *Bot siap digunakan dengan data kosong.*\n\n` +
        `_Semua pengguna harus registrasi ulang._`;

      await client.reply(
        message.chatId,
        formatBox('✅ PENGHAPUSAN SELESAI', successMessage),
        message.id
      );

      // Log the operation
      console.log(`💀 Database cleared successfully by owner ${message.sender.id}`);
      console.log(`📊 Total records destroyed: ${totalDestroyed}`);
      console.log(`🕐 Operation completed at: ${timestamp}`);

      // Send follow-up information after a delay
      setTimeout(async () => {
        try {
          const followUpMessage = `📋 *Info Pasca Reset*\n\n` +
            `🔧 *Yang Perlu Dilakukan:*\n` +
            `• Restart bot (opsional)\n` +
            `• Informasikan ke pengguna untuk registrasi ulang\n` +
            `• Monitor performa bot\n\n` +
            `📝 *Catatan:*\n` +
            `• Konfigurasi bot tetap utuh\n` +
            `• Database schema tidak berubah\n` +
            `• Bot dapat langsung digunakan\n\n` +
            `_Reset database berhasil diselesaikan._`;
          
          await client.reply(
            message.chatId,
            formatBox('📋 INFORMASI', followUpMessage),
            message.id
          );
        } catch (followUpError) {
          console.error('❌ Failed to send follow-up message:', followUpError);
        }
      }, 5000); // 5 second delay

    } catch (error) {
      console.error('❌ Critical error in clearall command:', error);
      
      // Enhanced error handling for critical operations
      let errorMessage = 'Terjadi kesalahan kritis saat menghapus data.';
      
      if (error instanceof Error) {
        if (error.message.includes('database')) {
          errorMessage = 'Kesalahan database saat menghapus data. Beberapa data mungkin masih tersisa.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'Kesalahan izin saat mengakses database.';
        } else if (error.message.includes('constraint')) {
          errorMessage = 'Kesalahan constraint database. Ada dependensi data yang mencegah penghapusan.';
        }
        console.error('ClearAll error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      try {
        await client.reply(
          message.chatId,
          `❌ *OPERASI GAGAL*\n\n` +
          `${errorMessage}\n\n` +
          `🔧 *Saran:*\n` +
          `• Cek log untuk detail error\n` +
          `• Restart bot jika diperlukan\n` +
          `• Hubungi support teknis\n\n` +
          `_Database mungkin dalam keadaan tidak konsisten._`,
          message.id
        );
      } catch (replyError) {
        console.error('❌ Failed to send clearall error message:', replyError);
      }
    }
  }
};

export default clearallCommand;