import { Message, Client } from '@open-wa/wa-automate';
import { User, UserLevel, Reminder, Group, FeatureType } from '../database/models';
import { Command } from '../middlewares/commandParser';
import * as userManager from '../utils/userManager';
import moment from 'moment-timezone';
import config from '../utils/config';

/**
 * Reminder Command
 * Creates personal or group reminders with flexible time scheduling
 * Supports time formats: 30s, 10m, 2h, 1d (seconds, minutes, hours, days)
 */
const reminder: Command = {
  name: 'reminder',
  aliases: ['remind', 'ingatkan'],
  description: 'Membuat pengingat personal atau grup',
  usage: '!reminder [waktu] [pesan]',
  example: '!reminder 30m Jangan lupa makan siang',
  category: 'Utilitas',
  cooldown: 5,
  requiredArgs: 2,
  minimumLevel: UserLevel.FREE,
  
  /**
   * Execute the reminder command
   * @param message - WhatsApp message object
   * @param args - Command arguments [time, ...message]
   * @param client - WhatsApp client instance
   * @param user - User database object
   */  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    // Validate user registration
    if (!user) {
      console.log(`❌ Unregistered user attempted to use reminder: ${message.sender.id}`);
      await client.reply(
        message.chatId,
        '❌ Anda belum terdaftar. Silakan daftar dengan perintah *!register* terlebih dahulu.',
        message.id
      );
      return;
    }
    
    try {
      console.log(`📝 Processing reminder command for user ${user.phoneNumber}`);
      
      // Check user limit for Reminder feature
      const limitInfo = await userManager.checkLimit(user, FeatureType.REMINDER);
      if (limitInfo.hasReachedLimit) {
        console.log(`⚠️ User ${user.phoneNumber} has reached reminder limit: ${limitInfo.currentUsage}/${limitInfo.maxUsage}`);
        await client.reply(
          message.chatId,
          `⚠️ Anda telah mencapai batas penggunaan fitur Reminder (${limitInfo.currentUsage}/${limitInfo.maxUsage}).\n\nSilakan tunggu hingga limit direset atau upgrade ke Premium untuk mendapatkan limit lebih tinggi.`,
          message.id
        );
        return;
      }
      
      // Extract and validate time argument
      const timeArg = args[0].toLowerCase();
      const scheduledTime = parseTime(timeArg);
      
      if (!scheduledTime) {
        console.log(`❌ Invalid time format provided: ${timeArg}`);
        await client.reply(
          message.chatId,
          '❌ Format waktu tidak valid. Gunakan format seperti: 30s, 10m, 2h, 1d\n\n' +
          '*Contoh:*\n' +
          '• `30s` = 30 detik\n' +
          '• `10m` = 10 menit\n' +
          '• `2h` = 2 jam\n' +
          '• `1d` = 1 hari',
          message.id
        );
        return;
      }
      
      // Extract reminder message
      const reminderMessage = args.slice(1).join(' ');
      if (reminderMessage.length > 500) {
        await client.reply(
          message.chatId,
          '❌ Pesan reminder terlalu panjang. Maksimal 500 karakter.',
          message.id
        );
        return;
      }      // Determine group context and get group database ID if applicable
      const isGroup = message.isGroupMsg;
      let groupDatabaseId: number | null = null;
      
      if (isGroup) {
        try {
          // Find or create group record in database
          const [group] = await Group.findOrCreate({
            where: { groupId: String(message.chatId) },
            defaults: {
              groupId: String(message.chatId),
              isActive: true,
              joinedAt: new Date(),
            },
          });
          groupDatabaseId = group.id;
        } catch (groupError) {
          console.error('❌ Error handling group record:', groupError);
          // Continue with null groupId for personal reminder fallback
        }
      }
      
      // Create reminder record
      const reminder = await Reminder.create({
        userId: user.id,
        groupId: groupDatabaseId,
        message: reminderMessage,
        scheduledTime: scheduledTime.toDate(),
        isActive: true,
      });
      
      // Increment usage count
      await userManager.incrementUsage(user.id, FeatureType.REMINDER);
      
      // Format success response
      const formattedTime = scheduledTime.format('HH:mm:ss DD/MM/YYYY');
      const contextText = isGroup ? 'grup ini' : 'Anda secara personal';
      
      console.log(`✅ Reminder created successfully - ID: ${reminder.id}, User: ${user.phoneNumber}, Time: ${formattedTime}`);
      
      await client.reply(
        message.chatId,
        `✅ *Reminder berhasil dibuat!*\n\n` +
        `📝 *Pesan:* ${reminderMessage}\n` +
        `⏰ *Waktu:* ${formattedTime}\n` +
        `📍 *Target:* ${contextText}\n\n` +
        `_ID Reminder: ${reminder.id}_`,
        message.id
      );
      
    } catch (error) {
      console.error('❌ Error creating reminder:', error);
      
      // Enhanced error handling with specific error types
      let errorMessage = 'Terjadi kesalahan saat membuat reminder. Silakan coba lagi nanti.';
      
      if (error instanceof Error) {
        if (error.message.includes('validation')) {
          errorMessage = 'Data reminder tidak valid. Periksa format waktu dan pesan Anda.';
        } else if (error.message.includes('database')) {
          errorMessage = 'Terjadi kesalahan database. Silakan coba lagi dalam beberapa saat.';
        }
        console.error('Error details:', error.message);
      }
      
      try {
        await client.reply(message.chatId, `❌ ${errorMessage}`, message.id);
      } catch (replyError) {
        console.error('❌ Failed to send error message:', replyError);
      }
    }
  },
};

/**
 * Parse time string to moment object
 * Supports formats: 30s, 10m, 2h, 1d (seconds, minutes, hours, days)
 * @param timeString - Time string to parse (e.g., "30m", "2h")
 * @returns Moment object representing the scheduled time, or null if invalid
 */
function parseTime(timeString: string): moment.Moment | null {
  // Validate input
  if (!timeString || typeof timeString !== 'string') {
    return null;
  }
  
  // Regex pattern for time format: number + unit (s/m/h/d)
  const timeRegex = /^(\d+)([smhd])$/i;
  const match = timeString.trim().match(timeRegex);
  
  if (!match) {
    console.log(`❌ Invalid time format: ${timeString}`);
    return null;
  }
  
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  
  // Validate reasonable time limits
  const limits = {
    s: { max: 86400, name: 'seconds' }, // Max 24 hours in seconds
    m: { max: 1440, name: 'minutes' },  // Max 24 hours in minutes
    h: { max: 168, name: 'hours' },     // Max 1 week in hours
    d: { max: 30, name: 'days' },       // Max 30 days
  };
  
  if (value <= 0 || value > limits[unit as keyof typeof limits].max) {
    console.log(`❌ Time value out of range: ${value}${unit}`);
    return null;
  }
  // Calculate scheduled time
  const now = moment().tz(config.timezone);
  
  try {
    switch (unit) {
      case 's': // seconds
        return now.add(value, 'seconds');
      case 'm': // minutes
        return now.add(value, 'minutes');
      case 'h': // hours
        return now.add(value, 'hours');
      case 'd': // days
        return now.add(value, 'days');
      default:
        console.log(`❌ Unsupported time unit: ${unit}`);
        return null;
    }
  } catch (error) {
    console.error('❌ Error calculating scheduled time:', error);
    return null;
  }
}

export default reminder;
