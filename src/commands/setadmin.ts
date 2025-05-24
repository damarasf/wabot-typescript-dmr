import { Message, Client, ContactId } from '@open-wa/wa-automate';
import { User, UserLevel } from '../database/models';
import { Command } from '../middlewares/commandParser';
import * as userManager from '../utils/userManager';
import config from '../utils/config';

/**
 * Set Admin Command
 * Allows the bot owner to promote users to Admin level
 * Features comprehensive validation, user mention support, and notification system
 */
const setadmin: Command = {
  name: 'setadmin',
  aliases: ['makeadmin', 'admin'],
  description: 'Jadikan pengguna sebagai Admin',
  usage: '!setadmin @user',
  example: '!setadmin @user',
  category: 'Owner',
  cooldown: 5,
  requiredArgs: 1,
  ownerOnly: true,
  
  /**
   * Execute the setadmin command
   * @param message - WhatsApp message object
   * @param args - Command arguments [phone_number or mention]
   * @param client - WhatsApp client instance
   * @param user - Owner user database object
   */
  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    try {
      console.log(`👑 Processing setadmin command from owner ${message.sender.id}`);
      
      // Additional owner verification (safety check)
      if (String(message.sender.id) !== config.ownerNumber) {
        console.log(`❌ Unauthorized setadmin attempt by ${message.sender.id}`);
        await client.reply(
          message.chatId,
          '🚫 *Akses Ditolak*\n\n' +
          'Perintah ini hanya dapat digunakan oleh owner bot.\n\n' +
          '_Hubungi administrator jika Anda merasa ini adalah kesalahan._',
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
        console.log(`🎯 Target user from mention: ${targetUserId}`);
      } else if (args.length > 0) {
        // Try to parse as phone number
        let phoneNumber = args[0].trim();
        
        // Clean and normalize phone number
        phoneNumber = phoneNumber.replace(/[^\d]/g, '');
        if (phoneNumber.startsWith('0')) {
          phoneNumber = '62' + phoneNumber.substring(1);
        }
        if (!phoneNumber.startsWith('62')) {
          phoneNumber = '62' + phoneNumber;
        }
        
        targetUserId = phoneNumber + '@c.us';
        displayMethod = 'phone';
        console.log(`📱 Target user from phone: ${targetUserId}`);
      }
      
      // Validate target user provided
      if (!targetUserId) {
        console.log('❌ No target user specified for setadmin');
        await client.reply(
          message.chatId,
          '❌ *Target Tidak Valid*\n\n' +
          'Cara penggunaan:\n' +
          '• `!setadmin @user` - mention pengguna\n' +
          '• `!setadmin 628123456789` - nomor HP\n\n' +
          '*Contoh:* `!setadmin @user`',
          message.id
        );
        return;
      }

      // Normalize target user ID for database lookup
      const normalizedPhone = targetUserId.replace('@c.us', '');
      
      // Prevent self-promotion (though owner should already have admin privileges)
      if (String(targetUserId) === config.ownerNumber) {
        await client.reply(
          message.chatId,
          '⚠️ *Aksi Tidak Diperlukan*\n\n' +
          'Anda adalah owner bot dan sudah memiliki semua privileges.\n\n' +
          '_Owner tidak perlu di-set sebagai admin._',
          message.id
        );
        return;
      }

      // Check if target user exists in database
      const targetUser = await userManager.getUserByPhone(normalizedPhone);
      
      if (!targetUser) {
        console.log(`❌ Target user ${normalizedPhone} not found in database`);
        await client.reply(
          message.chatId,
          '❌ *Pengguna Tidak Ditemukan*\n\n' +
          'Pengguna belum terdaftar dalam sistem bot.\n\n' +
          '*Solusi:*\n' +
          '• Minta pengguna untuk registrasi dengan `!register`\n' +
          '• Pastikan nomor HP benar\n' +
          '• Gunakan mention untuk akurasi tinggi',
          message.id
        );
        return;
      }

      // Check current user level
      const currentLevelName = UserLevel[targetUser.level] || 'Unknown';
      
      if (targetUser.level >= UserLevel.ADMIN) {
        console.log(`⚠️ User ${normalizedPhone} already has Admin level or higher`);
        
        // Get display name
        let userName = 'Pengguna';
        try {
          const contact = await client.getContact(targetUserId as ContactId);
          userName = contact.pushname || contact.name || contact.shortName || userName;
        } catch {
          userName = targetUser.phoneNumber;
        }
        
        await client.reply(
          message.chatId,
          `⚠️ *Sudah Admin*\n\n` +
          `👤 *Pengguna:* ${userName}\n` +
          `📱 *Phone:* ${targetUser.phoneNumber}\n` +
          `🏆 *Level Saat Ini:* ${currentLevelName}\n\n` +
          '_Pengguna ini sudah memiliki level Admin atau lebih tinggi._',
          message.id
        );
        return;
      }

      console.log(`🔄 Promoting user ${normalizedPhone} from ${currentLevelName} to Admin`);
      
      // Set user as admin
      const updatedUser = await userManager.setUserLevel(targetUser.id, UserLevel.ADMIN);
      
      if (!updatedUser) {
        console.error(`❌ Failed to update user level for ${normalizedPhone}`);
        await client.reply(
          message.chatId,
          '❌ *Gagal Mengatur Admin*\n\n' +
          'Terjadi kesalahan saat memperbarui level pengguna.\n\n' +
          '_Silakan coba lagi atau periksa log untuk detail error._',
          message.id
        );
        return;
      }

      // Get user display name for messages
      let userName = 'Pengguna';
      try {
        const contact = await client.getContact(targetUserId as ContactId);
        userName = contact.pushname || contact.name || contact.shortName || targetUser.phoneNumber;
      } catch (contactError) {
        console.log('ℹ️ Could not fetch contact info, using phone number');
        userName = targetUser.phoneNumber;
      }

      console.log(`✅ Successfully promoted ${normalizedPhone} to Admin level`);

      // Send success message with comprehensive information
      const successMessage = `✅ *Admin Berhasil Ditetapkan*\n\n` +
        `👤 *Pengguna:* ${userName}\n` +
        `📱 *Phone:* ${targetUser.phoneNumber}\n` +
        `🏆 *Level Baru:* Admin\n` +
        `🏆 *Level Sebelumnya:* ${currentLevelName}\n` +
        `⏰ *Waktu:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n\n` +
        `🎯 *Privileges Baru:*\n` +
        `• Akses semua fitur bot\n` +
        `• Tanpa limit penggunaan\n` +
        `• Akses perintah admin\n` +
        `• Dapat menggunakan tagall\n\n` +
        `_Notifikasi telah dikirim ke pengguna._`;

      if (displayMethod === 'mention') {
        await client.sendTextWithMentions(message.chatId, successMessage);
      } else {
        await client.reply(message.chatId, successMessage, message.id);
      }

      // Send notification to the newly promoted admin
      setTimeout(async () => {
        try {
          const adminNotification = `🎉 *Selamat! Anda Diangkat Menjadi Admin*\n\n` +
            `👑 *${config.botName}* telah mengangkat Anda sebagai Admin!\n\n` +
            `🎯 *Privileges Baru:*\n` +
            `• Akses semua fitur tanpa limit\n` +
            `• Dapat menggunakan perintah admin\n` +
            `• Dapat menggunakan tagall di grup\n` +
            `• Prioritas dukungan teknis\n\n` +
            `📚 *Gunakan:* \`!help\` untuk melihat perintah admin\n\n` +
            `_Gunakan privilege ini dengan bijak dan sesuai aturan._`;
          
          await client.sendText(targetUserId as any, adminNotification);
          console.log(`📨 Admin notification sent to ${normalizedPhone}`);
        } catch (notificationError) {
          console.error('❌ Failed to send admin notification:', notificationError);
          // Don't fail the main operation
        }
      }, 1500); // 1.5 second delay

    } catch (error) {
      console.error('❌ Error in setadmin command:', error);
      
      // Enhanced error handling
      let errorMessage = 'Terjadi kesalahan saat mengatur admin.';
      
      if (error instanceof Error) {
        if (error.message.includes('database')) {
          errorMessage = 'Kesalahan database saat memperbarui level pengguna.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'Tidak memiliki izin untuk melakukan operasi ini.';
        } else if (error.message.includes('user')) {
          errorMessage = 'Pengguna tidak ditemukan atau tidak valid.';
        }
        console.error('SetAdmin error details:', error.message);
      }
      
      try {
        await client.reply(
          message.chatId,
          `❌ ${errorMessage}\n\n_Silakan coba lagi atau hubungi support jika masalah berlanjut._`,
          message.id
        );
      } catch (replyError) {
        console.error('❌ Failed to send setadmin error message:', replyError);
      }
    }
  },
};

export default setadmin;