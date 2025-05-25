import { Message, Client } from '@open-wa/wa-automate';
import { User, UserLevel, Language } from '../database/models';
import * as userManager from '../utils/userManager';
import { Command } from '../middlewares/commandParser';
import { getText, getLevelName } from '../utils/i18n';
import config from '../utils/config';
import logger from '../utils/logger';

/**
 * Register Command
 * Handles user registration for new bot users
 * Features duplicate prevention, welcome message, and system integration
 */
const register: Command = {
  name: 'register',
  aliases: ['daftar', 'signup'],
  description: 'Mendaftarkan diri sebagai pengguna bot',
  usage: '!register',
  example: '!register',
  category: 'Umum',
  cooldown: 10,

  /**
   * Execute the register command
   * @param message - WhatsApp message object
   * @param args - Command arguments (not used in registration)
   * @param client - WhatsApp client instance
   * @param user - Existing user object (if already registered)
   */
  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {    try {
      logger.command('Processing registration request', { 
        senderId: message.sender.id
      });
        // Check if user is already registered
      if (user) {
        logger.info(`User already registered: ${message.sender.id} with level ${user.level}`);
        
        const levelName = getLevelName(user.level, user.language);
        const registrationDate = user.createdAt?.toLocaleDateString(
          user.language === Language.INDONESIAN ? 'id-ID' : 'en-US', 
          {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Jakarta'
          }
        ) || (user.language === Language.INDONESIAN ? 'Tidak diketahui' : 'Unknown');
        
        const alreadyRegisteredText = getText('register.already_registered', user.language);
        const levelText = user.language === Language.INDONESIAN ? 'Level' : 'Level';
        const registeredSinceText = user.language === Language.INDONESIAN ? 'Terdaftar sejak' : 'Registered since';
        const tipsText = user.language === Language.INDONESIAN 
          ? 'Tips: Gunakan `!profile` untuk melihat informasi lengkap akun Anda.'
          : 'Tips: Use `!profile` to view your complete account information.';
        
        await client.reply(
          message.chatId,
          `${alreadyRegisteredText}\n\n` +
          `👤 *${levelText}:* ${levelName}\n` +
          `📅 *${registeredSinceText}:* ${registrationDate}\n\n` +
          `💡 *${tipsText}`,
          message.id
        );
        return;
      }
      
      // Get user information
      const phoneNumber = message.sender.id;
      const displayName = message.sender.pushname || `User-${phoneNumber.replace('@c.us', '').slice(-4)}`;
      
      logger.user('Registering new user', { 
        phoneNumber: phoneNumber.replace('@c.us', ''), 
        displayName 
      });      // Validate phone number format
      if (!phoneNumber || !phoneNumber.includes('@c.us')) {
        logger.error('Invalid phone number format', { phoneNumber });
        await client.reply(
          message.chatId,
          getText('register.error'),
          message.id
        );
        return;
      }
      
      // Create new user
      const newUser = await userManager.createUser(phoneNumber);
        if (!newUser) {
        logger.error('Failed to create user in database', { phoneNumber });
        await client.reply(
          message.chatId,
          getText('register.error'),
          message.id
        );
        return;
      }
      
      logger.success('User registration completed', { 
        phoneNumber: phoneNumber.replace('@c.us', ''), 
        userId: newUser.id 
      });
      
      // Generate welcome message
      const welcomeMessage = generateWelcomeMessage(displayName, newUser);
      
      // Send success message
      await client.reply(message.chatId, welcomeMessage, message.id);
      
      // Send additional help information after a short delay
      setTimeout(async () => {
        try {
          await client.sendText(
            message.chatId,
            `🎯 *Langkah Selanjutnya:*\n\n` +
            `1️⃣ Ketik \`!help\` untuk melihat semua perintah\n` +
            `2️⃣ Ketik \`!profile\` untuk melihat profil Anda\n` +
            `3️⃣ Ketik \`!limit\` untuk cek batas penggunaan\n\n` +
            `💎 *Ingin upgrade ke Premium?*\n` +
            `Hubungi administrator untuk mendapatkan akses Premium dengan fitur lebih lengkap!\n\n` +
            `_Selamat menggunakan ${config.botName}! 🎉_`
          );        } catch (followUpError) {
          logger.error('Failed to send follow-up message', { 
            error: followUpError instanceof Error ? followUpError.message : followUpError 
          });
        }
      }, 2000); // 2 second delay
      
    } catch (error) {
      logger.error('Registration process failed', { 
        error: error instanceof Error ? error.message : error,
        senderId: message.sender.id
      });
      
      // Enhanced error handling with specific error types
      let errorMessage = 'Terjadi kesalahan saat mendaftarkan pengguna.';
      
      if (error instanceof Error) {
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          errorMessage = 'Anda sudah terdaftar dalam sistem.';
        } else if (error.message.includes('database')) {
          errorMessage = 'Terjadi kesalahan database saat pendaftaran.';
        } else if (error.message.includes('validation')) {
          errorMessage = 'Data pendaftaran tidak valid.';
        }
        logger.debug('Registration error details', { errorMessage: error.message });
      }
      
      try {
        await client.reply(
          message.chatId,
          `❌ ${errorMessage}\n\n_Silakan coba lagi nanti atau hubungi administrator._`,
          message.id
        );
      } catch (replyError) {
        logger.error('Failed to send registration error message', { 
          error: replyError instanceof Error ? replyError.message : replyError 
        });
      }
    }
  },
};

/**
 * Generate a comprehensive welcome message for new users
 * @param displayName - User's display name
 * @param user - Newly created user object
 * @returns Formatted welcome message
 */
function generateWelcomeMessage(displayName: string, user: User): string {
  const registrationDate = new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta'
  });
  
  // Get actual level name from user
  const levelName = user.getLevelName();
  
  return `🎉 *Pendaftaran Berhasil!*\n\n` +
    `Selamat datang *${displayName}*! Anda telah berhasil terdaftar sebagai pengguna ${config.botName}.\n\n` +
    `📋 *Informasi Akun:*\n` +
    `📱 *Nomor:* ${user.phoneNumber.replace('@c.us', '')}\n` +
    `🏷️ *Level:* ${levelName}\n` +
    `📅 *Terdaftar:* ${registrationDate}\n\n` +
    `🚀 *Fitur yang Tersedia:*\n` +
    `• Akses ke semua perintah dasar\n` +
    `• Integrasi dengan N8N workflows\n` +
    `• Pengaturan reminder\n` +
    `• Dan masih banyak lagi!\n\n` +
    `💡 *Tips:* Ketik \`!help\` untuk melihat semua perintah yang tersedia.`;
}

export default register;
