import { Message, Client, ContactId, ChatId } from '@open-wa/wa-automate';
import { User, UserLevel } from '../database/models';
import { Command } from '../middlewares/commandParser';
import * as userManager from '../utils/userManager';
import config from '../utils/config';
import logger from '../utils/logger';

/**
 * Upgrade Command
 * Allows administrators to upgrade user levels to Premium
 * Features comprehensive validation and user mention support
 */
const upgrade: Command = {
  name: 'upgrade',
  aliases: ['premium'],
  description: 'Upgrade level pengguna ke Premium',
  usage: '!upgrade @user',
  example: '!upgrade @user',
  category: 'Admin',
  cooldown: 5,
  requiredArgs: 1,
  adminOnly: true,
  
  /**
   * Execute the upgrade command
   * @param message - WhatsApp message object
   * @param args - Command arguments [phone_number or mention]
   * @param client - WhatsApp client instance
   * @param user - Admin user database object
   */  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    try {      logger.command(`upgrade from ${message.sender.id}`, {
        userId: message.sender.id,
        args,
        chatId: message.chatId
      });
      
      // Validate admin permissions (redundant check for safety)
      const isOwner = String(message.sender.id) === config.ownerNumber;
      const isAdmin = user && user.level >= UserLevel.ADMIN;
        if (!isOwner && !isAdmin) {
        logger.user(`Unauthorized upgrade attempt by ${message.sender.id}`);
        await client.reply(
          message.chatId,
          '❌ Anda tidak memiliki izin untuk menggunakan perintah ini.\n\n' +
          '_Hanya admin dan owner yang dapat mengupgrade pengguna._',
          message.id
        );
        return;
      }
      
      // Extract target user information
      let targetPhoneNumber: string | null = null;
      
      // Check for mentioned users first
      const mentionedUsers = message.mentionedJidList || [];
      
      if (mentionedUsers.length > 0) {
        targetPhoneNumber = mentionedUsers[0];
      } else {
        // Fallback: try to extract phone number from arguments
        const phoneArg = args[0];
        if (phoneArg && phoneArg.match(/^\d+$/)) {
          targetPhoneNumber = phoneArg + '@c.us';
        }
      }
      
      // Validate target user input
      if (!targetPhoneNumber) {
        await client.reply(
          message.chatId,
          '❌ Silakan tag pengguna yang ingin di-upgrade atau masukkan nomor telepon.\n\n' +
          '*Cara penggunaan:*\n' +
          '• `!upgrade @user` (tag pengguna)\n' +
          '• `!upgrade 6281234567890` (nomor telepon)',
          message.id
        );        return;
      }
      
      logger.debug(`Looking for target user: ${targetPhoneNumber}`, {
        targetPhoneNumber,
        userId: message.sender.id
      });
      
      // Find target user in database
      const targetUser = await userManager.getUserByPhone(targetPhoneNumber);
      
      if (!targetUser) {
        await client.reply(
          message.chatId,
          '❌ Pengguna belum terdaftar dalam sistem.\n\n' +
          '_Pengguna harus melakukan registrasi terlebih dahulu dengan perintah !register_',
          message.id
        );
        return;
      }
      
      // Check if user is already premium or higher
      if (targetUser.level >= UserLevel.PREMIUM) {
        const currentLevelName = targetUser.level === UserLevel.PREMIUM ? 'Premium' : 'Admin';
        await client.reply(
          message.chatId,
          `⚠️ Pengguna ini sudah memiliki level ${currentLevelName} atau lebih tinggi.\n\n` +
          `📊 *Level saat ini:* ${currentLevelName}`,
          message.id
        );
        return;
      }
      
      // Prevent self-upgrade (if not owner)
      if (!isOwner && targetUser.phoneNumber === message.sender.id) {
        await client.reply(
          message.chatId,
          '❌ Anda tidak dapat mengupgrade level diri sendiri.',
          message.id
        );
        return;      }
      
      logger.user(`Upgrading user ${targetUser.phoneNumber} to Premium`, {
        requestedBy: message.sender.id,
        targetLevel: 'Premium'
      });
      
      // Upgrade user to premium
      const updatedUser = await userManager.setUserLevel(targetUser.id, UserLevel.PREMIUM);
      
      if (!updatedUser) {
        logger.error(`Failed to upgrade user ${targetUser.phoneNumber}`, {
          targetPhone: targetUser.phoneNumber,
          requestedBy: message.sender.id
        });
        await client.reply(
          message.chatId,
          '❌ Terjadi kesalahan saat mengupgrade pengguna.\n\n' +
          '_Silakan coba lagi atau hubungi administrator sistem._',
          message.id
        );
        return;
      }
      
      // Get user display names for better messaging
      let adminName = 'Admin';
      let targetName = 'Pengguna';
      
      try {
        adminName = message.sender.pushname || `${message.sender.id.replace('@c.us', '')}`;        if (mentionedUsers.length > 0) {
          // Try to get contact info for mentioned user
          const contactInfo = await client.getContact(targetPhoneNumber as ContactId);
          targetName = contactInfo.pushname || contactInfo.shortName || targetPhoneNumber.replace('@c.us', '');        }
      } catch (nameError) {
        logger.debug('Could not fetch display names, using fallbacks');
      }
      
      logger.success(`Successfully upgraded user ${targetUser.phoneNumber} to Premium`, {
        targetPhone: targetUser.phoneNumber,
        requestedBy: message.sender.id
      });
      
      // Send success message to current chat
      const successMessage = mentionedUsers.length > 0 ?
        `✅ Berhasil mengupgrade @${targetPhoneNumber.replace('@c.us', '')} ke level Premium!\n\n` +
        `👤 *Target:* ${targetName}\n` +
        `👑 *Diupgrade oleh:* ${adminName}\n` +
        `🕐 *Waktu:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}` :
        `✅ Berhasil mengupgrade pengguna ${targetPhoneNumber.replace('@c.us', '')} ke level Premium!\n\n` +
        `👑 *Diupgrade oleh:* ${adminName}\n` +
        `🕐 *Waktu:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`;
      
      if (mentionedUsers.length > 0) {
        await client.sendTextWithMentions(message.chatId, successMessage);
      } else {
        await client.reply(message.chatId, successMessage, message.id);
      }
      
      // Notify the target user via private message
      try {        await client.sendText(
          targetPhoneNumber as ChatId,
          `🎉 *Selamat! Level Akun Upgraded!*\n\n` +
          `📈 Level akun Anda telah diupgrade menjadi *Premium*!\n\n` +
          `✨ *Keuntungan Premium:*\n` +
          `• Limit penggunaan lebih tinggi untuk semua fitur\n` +
          `• Akses prioritas ke fitur baru\n` +
          `• Dukungan teknis yang lebih baik\n\n` +
          `👑 *Diupgrade oleh:* ${adminName}\n` +
          `🕐 *Waktu:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n\n` +
          `_Terima kasih telah menggunakan bot kami!_`        );
      } catch (notifyError) {
        logger.error('Failed to notify target user', {
          targetPhone: targetPhoneNumber,
          error: notifyError instanceof Error ? notifyError.message : String(notifyError)
        });
        // Don't fail the whole operation if notification fails
      }
      
    } catch (error) {
      logger.error('Error upgrading user', {
        userId: message.sender.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Enhanced error handling with specific error types
      let errorMessage = 'Terjadi kesalahan saat mengupgrade pengguna.';
      
      if (error instanceof Error) {
        if (error.message.includes('database')) {
          errorMessage = 'Terjadi kesalahan database saat mengupgrade pengguna.';
        } else if (error.message.includes('validation')) {
          errorMessage = 'Data pengguna tidak valid untuk diupgrade.';        } else if (error.message.includes('permission')) {
          errorMessage = 'Tidak memiliki izin untuk mengupgrade pengguna ini.';
        }
        logger.debug('Upgrade error details', { 
          message: error.message,
          userId: message.sender.id
        });
      }
      
      try {
        await client.reply(
          message.chatId,
          `❌ ${errorMessage}\n\n_Silakan coba lagi nanti atau hubungi administrator._`,
          message.id
        );
      } catch (replyError) {
        logger.error('Failed to send upgrade error message', {
          userId: message.sender.id,
          error: replyError instanceof Error ? replyError.message : String(replyError)
        });
      }
    }
  },
};

export default upgrade;