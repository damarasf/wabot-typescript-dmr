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
    try {      if (!user) {
        await client.reply(
          message.chatId,
          getText('user.not_registered', Language.INDONESIAN) + '\n' + getText('user.not_registered', Language.ENGLISH),
          message.id
        );
        return;
      }      // If no argument provided, show current language and help
      if (args.length === 0) {
        const currentLangText = getText('language.current', user.language);
        const helpText = getText('language.help', user.language);
        
        await client.reply(
          message.chatId,
          `*🌐 Language Settings*\n\n${currentLangText}\n\n${helpText}`,
          message.id
        );
        return;
      }

      const newLanguage = args[0].toLowerCase();      // Validate language code
      if (!isValidLanguage(newLanguage)) {
        const errorText = getText('language.invalid', user.language);
        
        await client.reply(
          message.chatId,
          errorText,
          message.id
        );
        return;
      }      // Check if user is trying to set the same language
      if (user.language === newLanguage) {
        const sameLanguageText = newLanguage === Language.INDONESIAN
          ? getText('language.changed.to_id', Language.INDONESIAN)
          : getText('language.changed.to_en', Language.ENGLISH);
        
        await client.reply(
          message.chatId,
          sameLanguageText,
          message.id
        );
        return;
      }

      // Update user's language preference
      await user.update({ language: newLanguage as Language });      // Send confirmation in the NEW language
      const successText = newLanguage === Language.INDONESIAN
        ? getText('language.changed.to_id', Language.INDONESIAN)
        : getText('language.changed.to_en', Language.ENGLISH);

      const infoText = getText('language.info_text', newLanguage as Language);
      const titleText = getText('language.settings_title', newLanguage as Language);

      await client.reply(
        message.chatId,
        `*${titleText}*\n\n${successText}\n\n${infoText}`,
        message.id
      );

      logger.success(`Language changed for user ${user.phoneNumber}: ${user.language} -> ${newLanguage}`);

    } catch (error) {
      logger.error('Error in language command:', {
        error: error instanceof Error ? error.message : error,
        chatId: message.chatId,
        sender: message.sender?.id || 'unknown'
      });      // Send error message in user's current language (if user exists)
      const errorText = getText('language.error', user?.language || Language.INDONESIAN);

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
