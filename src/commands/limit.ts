import { Message, Client } from '@open-wa/wa-automate';
import { User, UserLevel, Usage, FeatureType, Language } from '../database/models';
import { Command } from '../middlewares/commandParser';
import * as userManager from '../utils/userManager';
import { formatNumber } from '../utils/formatter';
import { getText } from '../utils/i18n';
import config from '../utils/config';
import logger from '../utils/logger';
import { isOwner } from '../utils/phoneUtils';

/**
 * Limit Command
 * Displays current usage statistics and limits for all bot features
 * Features comprehensive usage tracking, limit information, and progress indicators
 */
const limit: Command = {
  name: 'limit',
  aliases: ['limits', 'usage', 'stat'],
  description: 'Cek limit penggunaan',
  usage: '!limit',
  example: '!limit',
  category: 'Umum',
  cooldown: 5,
  minimumLevel: UserLevel.FREE,
    /**
   * Execute the limit command
   * @param message - WhatsApp message object
   * @param args - Command arguments (unused for limit)
   * @param client - WhatsApp client instance
   * @param user - User database object
   */  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    try {
      logger.command('Processing limit command', {
        userId: message.sender.id,
        command: 'limit'
      });      // Validate user registration
      if (!user) {
        logger.debug('Unregistered user attempted to check limits', {
          userId: message.sender.id,
          command: 'limit'
        });
        await client.reply(
          message.chatId,
          getText('user.not_registered', Language.INDONESIAN),
          message.id
        );
        return;
      }// Check if user is owner (special case)
      const isOwnerFlag = isOwner(message.sender.id, config.ownerNumber);
      const isAdmin = user.level >= UserLevel.ADMIN;
      
      logger.info('Fetching usage data for user', {
        userId: user.id,
        userLevel: UserLevel[user.level],
        isOwner: isOwnerFlag,
        isAdmin
      });

      // Get all usage records for the user
      const usages = await Usage.findAll({ 
        where: { userId: user.id },
        order: [['feature', 'ASC']]
      });
      
      // Create usage map for easier access
      const usageMap = new Map<string, Usage>();
      usages.forEach(usage => {
        usageMap.set(usage.feature, usage);
      });

      // Generate user information header
      let userInfo = `${getText('limit.user_label', user.language)} ${user.phoneNumber}\n`;
      userInfo += `${getText('limit.level_label', user.language)} ${UserLevel[user.level]}`;
        if (isOwnerFlag) {
        userInfo += getText('limit.owner_suffix', user.language);
      } else if (isAdmin) {
        userInfo += getText('limit.admin_suffix', user.language);
      }
      
      const registeredDate = user.language === 'en' 
        ? user.registeredAt.toLocaleDateString('en-US')
        : user.registeredAt.toLocaleDateString('id-ID');
      
      userInfo += `\n${getText('limit.registered_label', user.language)} ${registeredDate}\n`;
      
      // Generate feature limits section
      let limitText = getText('limit.usage_section_title', user.language);
      
      // Define all features with their display information
      const features = [
        { type: FeatureType.N8N, nameKey: 'limit.feature_n8n', icon: '🔧' },
        { type: FeatureType.REMINDER, nameKey: 'limit.feature_reminder', icon: '⏰' },
        { type: FeatureType.TAG_ALL, nameKey: 'limit.feature_tag_all', icon: '👥' }
      ];

      // Process each feature
      for (const feature of features) {
        const usage = usageMap.get(feature.type) || null;
        const currentCount = usage?.count || 0;
        
        let maxLimit: number;
        let limitTypeKey: string;
        let progressBar = '';
          // Determine limit based on user level and custom settings
        if (isOwnerFlag || isAdmin) {
          maxLimit = Infinity;
          limitTypeKey = isOwnerFlag ? 'limit.type_owner' : 'limit.type_admin';
          progressBar = '∞';
        } else if (usage?.customLimit !== null && usage?.customLimit !== undefined) {
          maxLimit = usage.customLimit;
          limitTypeKey = 'limit.type_custom';
          progressBar = generateProgressBar(currentCount, maxLimit);
        } else if (user.level === UserLevel.PREMIUM) {
          maxLimit = config.premiumLimit;
          limitTypeKey = 'limit.type_premium';
          progressBar = generateProgressBar(currentCount, maxLimit);
        } else {
          maxLimit = config.freeLimit;
          limitTypeKey = 'limit.type_free';
          progressBar = generateProgressBar(currentCount, maxLimit);
        }

        // Format limit display
        const limitDisplay = maxLimit === Infinity ? '∞' : formatNumber(maxLimit);
        const statusIcon = getUsageStatusIcon(currentCount, maxLimit);
        const featureName = getText(feature.nameKey, user.language);
        const limitType = getText(limitTypeKey, user.language);
        
        limitText += `${feature.icon} *${featureName}*\n`;
        limitText += `   ${statusIcon} ${currentCount}/${limitDisplay} (${limitType})\n`;
        
        if (progressBar && maxLimit !== Infinity) {
          limitText += `   ${progressBar}\n`;
        }
        
        limitText += '\n';
      }

      // Add reset information
      const now = new Date();
      const nextReset = new Date(now);
      nextReset.setDate(nextReset.getDate() + 1);
      nextReset.setHours(0, 0, 0, 0);
      
      const hoursUntilReset = Math.ceil((nextReset.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      limitText += getText('limit.reset_auto_label', user.language) + ' ' + 
                   getText('limit.reset_time_format', user.language).replace('{hours}', hoursUntilReset.toString()) + '\n';
        // Add upgrade information for non-premium users
      if (user.level < UserLevel.PREMIUM && !isOwnerFlag) {
        limitText += getText('limit.upgrade_title', user.language);
        limitText += getText('limit.upgrade_text', user.language);
      }

      // Add usage tips
      if (user.level === UserLevel.FREE) {
        limitText += getText('limit.tips_title', user.language);
        limitText += getText('limit.tip_use_wisely', user.language);
        limitText += getText('limit.tip_daily_reset', user.language);
        limitText += getText('limit.tip_upgrade', user.language);
      }      // Format the complete message
      const completeMessage = userInfo + limitText;
      const formattedMessage = `${getText('limit.info_title', user.language)}\n\n${completeMessage}`;

      logger.success('Sending limit information to user', {
        userId: user.id,
        phoneNumber: user.phoneNumber,
        userLevel: UserLevel[user.level]
      });
      
      // Send the limit information
      await client.reply(message.chatId, formattedMessage, message.id);

      // Log usage statistics for monitoring
      const totalUsage = usages.reduce((sum, usage) => sum + usage.count, 0);
      logger.debug('User usage statistics', {
        userId: user.id,
        totalUsage,
        userLevel: UserLevel[user.level],
        usageCount: usages.length
      });

    } catch (error) {
      logger.error('Error in limit command', {
        userId: message.sender.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Enhanced error handling
      let errorMessageKey = 'limit.error_general';
        if (error instanceof Error) {
        if (error.message.includes('database')) {
          errorMessageKey = 'limit.error_database';
        } else if (error.message.includes('user')) {
          errorMessageKey = 'limit.error_user';
        }
        logger.debug('Limit error details', {
          userId: message.sender.id,
          errorMessage: error.message,
          errorType: error.constructor.name
        });
      }
      
      try {
        const errorMessage = getText(errorMessageKey, user?.language);
        const errorFooter = getText('limit.error_footer', user?.language);
        await client.reply(
          message.chatId,
          `❌ ${errorMessage}${errorFooter}`,
          message.id
        );
      } catch (replyError) {
        logger.error('Failed to send limit error message', {
          userId: message.sender.id,
          originalError: error instanceof Error ? error.message : String(error),
          replyError: replyError instanceof Error ? replyError.message : String(replyError)
        });
      }
    }
  },
};

/**
 * Generate progress bar for usage visualization
 * @param current - Current usage count
 * @param max - Maximum limit
 * @returns Progress bar string
 */
function generateProgressBar(current: number, max: number): string {
  if (max === Infinity || max === 0) return '';
  
  const percentage = Math.min((current / max) * 100, 100);
  const filledBars = Math.round((percentage / 100) * 10);
  const emptyBars = 10 - filledBars;
  
  const filled = '█'.repeat(filledBars);
  const empty = '░'.repeat(emptyBars);
  
  return `[${filled}${empty}] ${percentage.toFixed(0)}%`;
}

/**
 * Get status icon based on usage level
 * @param current - Current usage count
 * @param max - Maximum limit
 * @returns Status icon string
 */
function getUsageStatusIcon(current: number, max: number): string {
  if (max === Infinity) return '🟢';
  if (current === 0) return '⚪';
  if (current >= max) return '🔴';
  if (current >= max * 0.8) return '🟡';
  if (current >= max * 0.5) return '🟠';
  return '🟢';
}

export default limit;
