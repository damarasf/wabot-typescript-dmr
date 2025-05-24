import { Message, Client, ContactId } from '@open-wa/wa-automate';
import { User, UserLevel, FeatureType } from '../database/models';
import { Command } from '../middlewares/commandParser';
import * as userManager from '../utils/userManager';
import { formatNumber } from '../utils/formatter';
import config from '../utils/config';
import logger from '../utils/logger';

/**
 * Set Limit Command
 * Allows administrators to set custom usage limits for specific users and features
 * Features comprehensive validation, feature support, and notification system
 */
const setlimit: Command = {
  name: 'setlimit',
  aliases: ['customlimit', 'limit'],
  description: 'Set limit custom untuk pengguna pada fitur tertentu',
  usage: '!setlimit @user [feature] [jumlah]',
  example: '!setlimit @user n8n 100',
  category: 'Admin',
  cooldown: 5,
  requiredArgs: 3,
  adminOnly: true,
  
  /**
   * Execute the setlimit command
   * @param message - WhatsApp message object
   * @param args - Command arguments [@user, feature, limit_amount]
   * @param client - WhatsApp client instance
   * @param user - Admin user database object
   */  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    try {
      logger.command(`setlimit from ${message.sender.id}`, {
        userId: message.sender.id,
        args,
        chatId: message.chatId
      });
      
      // Additional permission check (safety)
      const isOwner = String(message.sender.id) === config.ownerNumber;
      const isAdmin = user && user.level >= UserLevel.ADMIN;
      
      if (!isOwner && !isAdmin) {
        logger.user(`Unauthorized setlimit attempt by ${message.sender.id}`);
        await client.reply(
          message.chatId,
          '🚫 *Akses Ditolak*\n\n' +
          'Perintah ini hanya dapat digunakan oleh:\n' +
          '• Owner bot\n' +
          '• Pengguna dengan level Admin\n\n' +
          '_Hubungi administrator untuk upgrade level._',
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
        logger.debug(`Target user from mention: ${targetUserId}`, {
          targetUserId,
          userId: message.sender.id
        });
      } else {
        // No mention provided
        await client.reply(
          message.chatId,
          '❌ *Target Tidak Valid*\n\n' +
          'Gunakan mention untuk menentukan pengguna:\n' +
          '`!setlimit @user [feature] [jumlah]`\n\n' +
          '*Contoh:* `!setlimit @user n8n 100`',
          message.id
        );
        return;
      }

      // Validate feature argument
      if (args.length < 2) {
        await client.reply(
          message.chatId,
          '❌ *Feature Tidak Disebutkan*\n\n' +
          'Format: `!setlimit @user [feature] [jumlah]`\n\n' +
          '*Feature yang tersedia:*\n' +
          '• `n8n` - Workflow N8N\n' +
          '• `reminder` - Pengingat\n' +
          '• `tag_all` - Tag All Member\n\n' +
          '*Contoh:* `!setlimit @user n8n 100`',
          message.id
        );
        return;
      }

      // Parse and validate feature type
      const featureArg = args[1].toLowerCase();
      let feature: FeatureType;
      let featureDisplayName: string;
      
      switch (featureArg) {
        case 'n8n':
          feature = FeatureType.N8N;
          featureDisplayName = 'N8N Workflow';
          break;
        case 'reminder':
          feature = FeatureType.REMINDER;
          featureDisplayName = 'Pengingat';
          break;
        case 'tag_all':
        case 'tagall':
          feature = FeatureType.TAG_ALL;
          featureDisplayName = 'Tag All Member';
          break;        default:
          logger.debug(`Invalid feature specified: ${featureArg}`, {
            featureArg,
            userId: message.sender.id
          });
          await client.reply(
            message.chatId,
            `❌ *Feature Tidak Valid*\n\n` +
            `Feature \`${featureArg}\` tidak dikenali.\n\n` +
            '*Feature yang tersedia:*\n' +
            '• `n8n` - Workflow N8N\n' +
            '• `reminder` - Pengingat\n' +
            '• `tag_all` - Tag All Member\n\n' +
            '*Contoh:* `!setlimit @user n8n 100`',
            message.id
          );
          return;
      }

      // Validate limit amount argument
      if (args.length < 3) {
        await client.reply(
          message.chatId,
          '❌ *Jumlah Limit Tidak Disebutkan*\n\n' +
          'Format: `!setlimit @user [feature] [jumlah]`\n\n' +
          '*Contoh:* `!setlimit @user n8n 100`\n\n' +
          '_Gunakan angka positif untuk limit baru._',
          message.id
        );
        return;
      }

      // Parse and validate limit amount
      const limitAmount = parseInt(args[2], 10);
      
      if (isNaN(limitAmount)) {
        await client.reply(
          message.chatId,
          `❌ *Jumlah Tidak Valid*\n\n` +
          `\`${args[2]}\` bukan angka yang valid.\n\n` +
          '*Contoh yang benar:*\n' +
          '• `!setlimit @user n8n 100`\n' +
          '• `!setlimit @user reminder 50`\n' +
          '• `!setlimit @user tag_all 20`',
          message.id
        );
        return;
      }
      
      if (limitAmount < 0) {
        await client.reply(
          message.chatId,
          '❌ *Limit Tidak Valid*\n\n' +
          'Jumlah limit harus berupa angka positif atau nol.\n\n' +
          '*Tips:*\n' +
          '• Gunakan `0` untuk menonaktifkan fitur\n' +
          '• Gunakan angka positif untuk limit baru\n' +
          '• Maksimum yang disarankan: 1000',
          message.id
        );
        return;
      }

      // Warn for very high limits
      if (limitAmount > 1000) {
        await client.reply(
          message.chatId,
          '⚠️ *Limit Sangat Tinggi*\n\n' +
          `Limit ${formatNumber(limitAmount)} untuk ${featureDisplayName} sangat tinggi.\n\n` +
          '*Apakah Anda yakin ingin melanjutkan?*\n' +
          '• Kirim `!setlimit @user ${featureArg} ${limitAmount} CONFIRM`\n' +
          '• Atau gunakan limit yang lebih rendah\n\n' +
          '_Limit tinggi dapat mempengaruhi performa bot._',
          message.id
        );
        
        // Check for confirmation
        if (args.length < 4 || args[3].toUpperCase() !== 'CONFIRM') {
          return;
        }
      }

      // Normalize target user ID for database lookup
      const normalizedPhone = targetUserId.replace('@c.us', '');
      
      // Check if target user exists in database
      const targetUser = await userManager.getUserByPhone(normalizedPhone);
        if (!targetUser) {
        logger.user(`Target user ${normalizedPhone} not found in database`, {
          targetPhone: normalizedPhone,
          userId: message.sender.id
        });
        await client.reply(
          message.chatId,
          '❌ *Pengguna Tidak Ditemukan*\n\n' +
          'Pengguna belum terdaftar dalam sistem bot.\n\n' +
          '*Solusi:*\n' +
          '• Minta pengguna untuk registrasi dengan `!register`\n' +
          '• Pastikan menggunakan mention yang benar\n' +
          '• Periksa apakah nomor HP aktif',
          message.id
        );
        return;
      }      // Get current limit info
      const currentUsage = await userManager.getOrCreateUsage(targetUser.id, feature);
      const oldLimit = currentUsage.customLimit || 'Default';
      
      logger.user(`Setting custom limit for user ${normalizedPhone}, feature ${feature}: ${oldLimit} -> ${limitAmount}`, {
        targetPhone: normalizedPhone,
        feature,
        oldLimit,
        newLimit: limitAmount,
        userId: message.sender.id
      });
      
      // Set custom limit
      const updatedUsage = await userManager.setCustomLimit(targetUser.id, feature, limitAmount);
      
      if (!updatedUsage) {
        logger.error(`Failed to set custom limit for ${normalizedPhone}`, {
          targetPhone: normalizedPhone,
          feature,
          limitAmount,
          userId: message.sender.id
        });
        await client.reply(
          message.chatId,
          '❌ *Gagal Mengatur Limit*\n\n' +
          'Terjadi kesalahan saat memperbarui limit pengguna.\n\n' +
          '_Silakan coba lagi atau periksa log untuk detail error._',
          message.id
        );
        return;
      }      // Get user display name for messages
      let userName = 'Pengguna';
      try {
        const contact = await client.getContact(targetUserId as ContactId);
        userName = contact.pushname || contact.name || contact.shortName || targetUser.phoneNumber;
      } catch (contactError) {
        logger.debug('Could not fetch contact info, using phone number');
        userName = targetUser.phoneNumber;
      }

      logger.success(`Successfully set custom limit for ${normalizedPhone}`, {
        targetPhone: normalizedPhone,
        feature,
        limitAmount,
        oldLimit,
        userId: message.sender.id
      });

      // Send success message with comprehensive information
      const successMessage = `✅ *Limit Custom Berhasil Ditetapkan*\n\n` +
        `👤 *Pengguna:* ${userName}\n` +
        `📱 *Phone:* ${targetUser.phoneNumber}\n` +
        `🔧 *Feature:* ${featureDisplayName}\n` +
        `📊 *Limit Lama:* ${oldLimit}\n` +
        `📊 *Limit Baru:* ${formatNumber(limitAmount)}\n` +
        `📈 *Penggunaan Saat Ini:* ${currentUsage.count}\n` +
        `⏰ *Waktu:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n\n` +
        `${limitAmount === 0 ? '⚠️ *Fitur dinonaktifkan untuk pengguna ini*' : '✨ *Limit akan berlaku untuk penggunaan selanjutnya*'}\n\n` +
        `_Notifikasi telah dikirim ke pengguna._`;

      if (displayMethod === 'mention') {
        await client.sendTextWithMentions(message.chatId, successMessage);
      } else {
        await client.reply(message.chatId, successMessage, message.id);
      }

      // Send notification to the target user
      setTimeout(async () => {
        try {
          const userNotification = `⚙️ *Limit Penggunaan Diperbarui*\n\n` +
            `🔧 *Feature:* ${featureDisplayName}\n` +
            `📊 *Limit Baru:* ${formatNumber(limitAmount)}\n` +
            `📈 *Penggunaan Saat Ini:* ${currentUsage.count}\n\n` +
            `${limitAmount === 0 
              ? '⚠️ *Fitur ini telah dinonaktifkan untuk Anda*\n\n_Hubungi administrator jika ada pertanyaan._'
              : limitAmount > (currentUsage.customLimit || config.freeLimit)
                ? '🎉 *Limit Anda telah ditingkatkan!*\n\n_Nikmati akses yang lebih luas._'
                : '📝 *Limit Anda telah diatur ulang*\n\n_Gunakan dengan bijak._'
            }\n\n` +
            `_Perubahan oleh: Administrator ${config.botName}_`;
            await client.sendText(targetUserId as any, userNotification);
          logger.info(`Limit notification sent to ${normalizedPhone}`, {
            targetPhone: normalizedPhone,
            feature,
            limitAmount
          });
        } catch (notificationError) {
          logger.error('Failed to send limit notification', {
            targetPhone: normalizedPhone,
            error: notificationError instanceof Error ? notificationError.message : String(notificationError)
          });          // Don't fail the main operation
        }
      }, 1500); // 1.5 second delay

    } catch (error) {
      logger.error('Error in setlimit command', {
        userId: message.sender.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Enhanced error handling
      let errorMessage = 'Terjadi kesalahan saat mengatur limit pengguna.';
      
      if (error instanceof Error) {
        if (error.message.includes('database')) {
          errorMessage = 'Kesalahan database saat memperbarui limit pengguna.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'Tidak memiliki izin untuk melakukan operasi ini.';
        } else if (error.message.includes('user')) {
          errorMessage = 'Pengguna tidak ditemukan atau tidak valid.';
        } else if (error.message.includes('feature')) {
          errorMessage = 'Feature yang ditentukan tidak valid atau tidak didukung.';
        }
        logger.debug('SetLimit error details', {
          message: error.message,
          userId: message.sender.id
        });
      }
      
      try {
        await client.reply(
          message.chatId,
          `❌ ${errorMessage}\n\n_Silakan coba lagi atau hubungi support jika masalah berlanjut._`,
          message.id
        );
      } catch (replyError) {
        logger.error('Failed to send setlimit error message', {
          userId: message.sender.id,
          error: replyError instanceof Error ? replyError.message : String(replyError)
        });
      }
    }
  },
};

export default setlimit;