import { Message, Client } from '@open-wa/wa-automate';
import { User, UserLevel, Language } from '../database/models';
import { Command } from '../middlewares/commandParser';
import { getText, isValidLanguage } from '../utils/i18n';
import logger from '../utils/logger';

/**
 * Language Command
 * Allows users to change their preferred language for bot responses
 * Supports Indonesian (id) and English (en)
 */
const language: Command = {
  name: 'language',
  aliases: ['lang', 'bahasa'],
  description: 'Mengubah bahasa bot / Change bot language',
  usage: '!language [id/en]',
  example: '!language en',
  category: 'Umum',
  cooldown: 5,
  minimumLevel: UserLevel.FREE,

  /**
   * Execute the language command
   * @param message - WhatsApp message object
   * @param args - Command arguments [language_code]
   * @param client - WhatsApp client instance
   * @param user - User database object
   */
  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    try {
      if (!user) {
        await client.reply(
          message.chatId,
          '⚠️ Anda belum terdaftar. Ketik !register untuk mendaftar.\n⚠️ You are not registered. Type !register to register.',
          message.id
        );
        return;
      }

      // If no argument provided, show current language and help
      if (args.length === 0) {
        const currentLangText = user.language === Language.INDONESIAN 
          ? '🌐 Bahasa saat ini: Bahasa Indonesia' 
          : '🌐 Current language: English';
        
        const helpText = user.language === Language.INDONESIAN
          ? '🌐 Gunakan: !language [id/en]\n• id = Bahasa Indonesia\n• en = English'
          : '🌐 Usage: !language [id/en]\n• id = Indonesian\n• en = English';        await client.reply(
          message.chatId,
          `*🌐 Language Settings*\n\n${currentLangText}\n\n${helpText}`,
          message.id
        );
        return;
      }

      const newLanguage = args[0].toLowerCase();

      // Validate language code
      if (!isValidLanguage(newLanguage)) {
        const errorText = user.language === Language.INDONESIAN
          ? '❌ Bahasa tidak valid. Pilihan: id (Indonesia) atau en (English)'
          : '❌ Invalid language. Options: id (Indonesian) or en (English)';
        
        await client.reply(
          message.chatId,
          errorText,
          message.id
        );
        return;
      }

      // Check if user is trying to set the same language
      if (user.language === newLanguage) {
        const sameLanguageText = newLanguage === Language.INDONESIAN
          ? '✅ Bahasa Anda sudah diatur ke Bahasa Indonesia!'
          : '✅ Your language is already set to English!';
        
        await client.reply(
          message.chatId,
          sameLanguageText,
          message.id
        );
        return;
      }

      // Update user's language preference
      await user.update({ language: newLanguage as Language });

      // Send confirmation in the NEW language
      const successText = newLanguage === Language.INDONESIAN
        ? '✅ Bahasa berhasil diubah ke Bahasa Indonesia!'
        : '✅ Language successfully changed to English!';

      const infoText = newLanguage === Language.INDONESIAN
        ? '📱 Semua respon bot sekarang akan menggunakan Bahasa Indonesia.\n💡 Ketik !help untuk melihat menu dalam bahasa baru.'
        : '📱 All bot responses will now use English.\n💡 Type !help to see the menu in your new language.';      await client.reply(
        message.chatId,
        `*${newLanguage === Language.INDONESIAN ? '🌐 Pengaturan Bahasa' : '🌐 Language Settings'}*\n\n${successText}\n\n${infoText}`,
        message.id
      );

      logger.success(`Language changed for user ${user.phoneNumber}: ${user.language} -> ${newLanguage}`);

    } catch (error) {
      logger.error('Error in language command:', {
        error: error instanceof Error ? error.message : error,
        chatId: message.chatId,
        sender: message.sender?.id || 'unknown'
      });

      // Send error message in user's current language (if user exists)
      const errorText = user?.language === Language.ENGLISH
        ? '❌ An error occurred while changing language. Please try again later.'
        : '❌ Terjadi kesalahan saat mengubah bahasa. Silakan coba lagi nanti.';

      try {
        await client.reply(
          message.chatId,
          errorText,
          message.id
        );
      } catch (replyError) {
        logger.error('Failed to send error reply in language command', replyError);
      }
    }
  }
};

export default language;
