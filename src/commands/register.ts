import { Message, Client } from '@open-wa/wa-automate';
import { User, UserLevel, Language } from '../database/models';
import * as userManager from '../utils/userManager';
import { Command } from '../middlewares/commandParser';
import { getText, getLevelName } from '../utils/i18n';
import config from '../utils/config';
import logger from '../utils/logger';
import { getDisplayPhoneNumber, isValidWhatsAppFormat } from '../utils/phoneUtils';

/**
 * Register Command
 * Handles user registration for new bot users
 * Features duplicate prevention, welcome message, and system integration
 */
const register: Command = {
  name: 'register',
  aliases: ['daftar', 'signup'],
  description: 'Daftar sebagai user bot',
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
        
        const levelName = getLevelName(user.level, user.language);        const registrationDate = user.createdAt?.toLocaleDateString(
          user.language === Language.INDONESIAN ? 'id-ID' : 'en-US', 
          {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Jakarta'
          }
        ) || getText('register.unknown_date', user.language);
        
        const alreadyRegisteredText = getText('register.already_registered', user.language);
        const levelText = getText('register.level_label', user.language);
        const registeredSinceText = getText('register.registered_since', user.language);
        const tipsText = getText('register.tips_profile', user.language);
        
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
      const displayName = message.sender.pushname || `User-${getDisplayPhoneNumber(phoneNumber).slice(-4)}`;
      
      logger.user('Registering new user', { 
        phoneNumber: getDisplayPhoneNumber(phoneNumber), 
        displayName 
      });      // Validate phone number format
      if (!isValidWhatsAppFormat(phoneNumber)) {
        logger.error('Invalid phone number format', { phoneNumber });
        await client.reply(
          message.chatId,
          `❌ ${getText('register.validation_error', Language.INDONESIAN)}`,
          message.id
        );
        return;
      }
      
      // Create new user
      const newUser = await userManager.createUser(phoneNumber);      if (!newUser) {
        logger.error('Failed to create user in database', { phoneNumber });
        await client.reply(
          message.chatId,
          `❌ ${getText('register.database_error', Language.INDONESIAN)}`,
          message.id
        );
        return;
      }
        logger.success('User registration completed', { 
        phoneNumber: getDisplayPhoneNumber(phoneNumber), 
        userId: newUser.id 
      });
      
      // Generate welcome message
      const welcomeMessage = generateWelcomeMessage(displayName, newUser);
      
      // Send success message
      await client.reply(message.chatId, welcomeMessage, message.id);
        // Send additional help information after a short delay
      setTimeout(async () => {
        try {
          const nextStepsTitle = getText('register.next_steps_title', newUser.language);
          const stepHelp = getText('register.step_help', newUser.language);
          const stepProfile = getText('register.step_profile', newUser.language);
          const stepLimit = getText('register.step_limit', newUser.language);
          const premiumPromotionTitle = getText('register.premium_promotion_title', newUser.language);
          const premiumPromotionText = getText('register.premium_promotion_text', newUser.language);
          const welcomeClosing = getText('register.welcome_closing', newUser.language, '', {
            botName: config.botName
          });
          
          await client.sendText(
            message.chatId,
            `${nextStepsTitle}\n\n` +
            `${stepHelp}\n` +
            `${stepProfile}\n` +
            `${stepLimit}\n\n` +
            `${premiumPromotionTitle}\n` +
            `${premiumPromotionText}\n\n` +
            `${welcomeClosing}`
          );} catch (followUpError) {
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
      let errorMessage = getText('register.general_error', Language.INDONESIAN); // Default to Indonesian for error cases
      
      if (error instanceof Error) {
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          errorMessage = getText('register.duplicate_error', Language.INDONESIAN);
        } else if (error.message.includes('database')) {
          errorMessage = getText('register.database_error', Language.INDONESIAN);
        } else if (error.message.includes('validation')) {
          errorMessage = getText('register.validation_error', Language.INDONESIAN);
        }
        logger.debug('Registration error details', { errorMessage: error.message });
      }
      
      const errorFooter = getText('register.error_footer', Language.INDONESIAN);
      
      try {
        await client.reply(
          message.chatId,
          `❌ ${errorMessage}\n\n${errorFooter}`,
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
  const registrationDate = new Date().toLocaleDateString(
    user.language === Language.INDONESIAN ? 'id-ID' : 'en-US', 
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    }
  );
  
  // Get actual level name from user
  const levelName = user.getLevelName();
  
  const welcomeTitle = getText('register.welcome_title', user.language);
  const welcomeGreeting = getText('register.welcome_greeting', user.language, '', {
    displayName,
    botName: config.botName
  });
  const accountInfoTitle = getText('register.account_info_title', user.language);
  const phoneNumberLabel = getText('register.phone_number_label', user.language);
  const levelInfoLabel = getText('register.level_info_label', user.language);
  const registeredDateLabel = getText('register.registered_date_label', user.language);
  const featuresTitle = getText('register.features_title', user.language);
  const featureBasicCommands = getText('register.feature_basic_commands', user.language);
  const featureN8nIntegration = getText('register.feature_n8n_integration', user.language);
  const featureReminderSettings = getText('register.feature_reminder_settings', user.language);
  const featureMore = getText('register.feature_more', user.language);
  const helpTip = getText('register.help_tip', user.language);
  
  return `${welcomeTitle}\n\n` +
    `${welcomeGreeting}\n\n` +
    `${accountInfoTitle}\n` +
    `${phoneNumberLabel} ${user.phoneNumber}\n` +
    `${levelInfoLabel} ${levelName}\n` +
    `${registeredDateLabel} ${registrationDate}\n\n` +
    `${featuresTitle}\n` +
    `${featureBasicCommands}\n` +
    `${featureN8nIntegration}\n` +
    `${featureReminderSettings}\n` +
    `${featureMore}\n\n` +
    `${helpTip}`;
}

export default register;
