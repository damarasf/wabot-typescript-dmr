import { Message, Client } from '@open-wa/wa-automate';
import { User, UserLevel, Usage, FeatureType } from '../database/models';
import { Command } from '../middlewares/commandParser';
import * as userManager from '../utils/userManager';
import { formatBox, formatNumber } from '../utils/formatter';
import config from '../utils/config';

/**
 * Limit Command
 * Displays current usage statistics and limits for all bot features
 * Features comprehensive usage tracking, limit information, and progress indicators
 */
const limit: Command = {
  name: 'limit',
  aliases: ['limits', 'usage', 'stat'],
  description: 'Melihat limit penggunaan fitur',
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
   */
  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    try {
      console.log(`📊 Processing limit command from ${message.sender.id}`);
      
      // Validate user registration
      if (!user) {
        console.log(`❌ Unregistered user ${message.sender.id} attempted to check limits`);
        await client.reply(
          message.chatId,
          '❌ *Belum Terdaftar*\n\n' +
          'Anda belum terdaftar dalam sistem bot.\n\n' +
          '*Silakan daftar terlebih dahulu:*\n' +
          '`!register`\n\n' +
          '_Setelah registrasi, Anda dapat melihat limit penggunaan._',
          message.id
        );
        return;
      }

      // Check if user is owner (special case)
      const isOwner = String(message.sender.id) === config.ownerNumber;
      const isAdmin = user.level >= UserLevel.ADMIN;
      
      console.log(`📈 Fetching usage data for user ${user.id} (${UserLevel[user.level]})`);

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
      let userInfo = `👤 *Pengguna:* ${user.phoneNumber}\n`;
      userInfo += `🏆 *Level:* ${UserLevel[user.level]}`;
      
      if (isOwner) {
        userInfo += ' (Owner)';
      } else if (isAdmin) {
        userInfo += ' (Unlimited)';
      }
      
      userInfo += `\n📅 *Terdaftar:* ${user.registeredAt.toLocaleDateString('id-ID')}\n`;
      
      // Generate feature limits section
      let limitText = '\n📊 *LIMIT PENGGUNAAN*\n\n';
      
      // Define all features with their display information
      const features = [
        { type: FeatureType.N8N, name: 'N8N Workflow', icon: '🔧' },
        { type: FeatureType.REMINDER, name: 'Pengingat', icon: '⏰' },
        { type: FeatureType.TAG_ALL, name: 'Tag All Member', icon: '👥' }
      ];

      // Process each feature
      for (const feature of features) {
        const usage = usageMap.get(feature.type) || null;
        const currentCount = usage?.count || 0;
        
        let maxLimit: number;
        let limitType: string;
        let progressBar = '';
        
        // Determine limit based on user level and custom settings
        if (isOwner || isAdmin) {
          maxLimit = Infinity;
          limitType = isOwner ? 'Owner' : 'Admin';
          progressBar = '∞';
        } else if (usage?.customLimit !== null && usage?.customLimit !== undefined) {
          maxLimit = usage.customLimit;
          limitType = 'Custom';
          progressBar = generateProgressBar(currentCount, maxLimit);
        } else if (user.level === UserLevel.PREMIUM) {
          maxLimit = config.premiumLimit;
          limitType = 'Premium';
          progressBar = generateProgressBar(currentCount, maxLimit);
        } else {
          maxLimit = config.freeLimit;
          limitType = 'Free';
          progressBar = generateProgressBar(currentCount, maxLimit);
        }

        // Format limit display
        const limitDisplay = maxLimit === Infinity ? '∞' : formatNumber(maxLimit);
        const statusIcon = getUsageStatusIcon(currentCount, maxLimit);
        
        limitText += `${feature.icon} *${feature.name}*\n`;
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
      
      limitText += `⏱️ *Reset Otomatis:* ${hoursUntilReset}h lagi (00:00 WIB)\n`;
      
      // Add upgrade information for non-premium users
      if (user.level < UserLevel.PREMIUM && !isOwner) {
        limitText += '\n💎 *Ingin limit lebih tinggi?*\n';
        limitText += 'Hubungi admin untuk upgrade ke Premium!';
      }

      // Add usage tips
      if (user.level === UserLevel.FREE) {
        limitText += '\n\n💡 *Tips:*\n';
        limitText += '• Gunakan fitur secara bijak\n';
        limitText += '• Limit direset setiap hari\n';
        limitText += '• Upgrade untuk akses lebih luas';
      }

      // Format the complete message
      const completeMessage = userInfo + limitText;
      const formattedMessage = formatBox('INFORMASI LIMIT', completeMessage);

      console.log(`✅ Sending limit information to user ${user.id}`);
      
      // Send the limit information
      await client.reply(message.chatId, formattedMessage, message.id);

      // Log usage statistics for monitoring
      const totalUsage = usages.reduce((sum, usage) => sum + usage.count, 0);
      console.log(`📊 User ${user.id} total usage: ${totalUsage}, level: ${UserLevel[user.level]}`);

    } catch (error) {
      console.error('❌ Error in limit command:', error);
      
      // Enhanced error handling
      let errorMessage = 'Terjadi kesalahan saat mendapatkan informasi limit.';
      
      if (error instanceof Error) {
        if (error.message.includes('database')) {
          errorMessage = 'Kesalahan database saat mengambil data penggunaan.';
        } else if (error.message.includes('user')) {
          errorMessage = 'Data pengguna tidak valid atau tidak ditemukan.';
        }
        console.error('Limit error details:', error.message);
      }
      
      try {
        await client.reply(
          message.chatId,
          `❌ ${errorMessage}\n\n_Silakan coba lagi nanti atau hubungi administrator._`,
          message.id
        );
      } catch (replyError) {
        console.error('❌ Failed to send limit error message:', replyError);
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
