import { Message, Client } from '@open-wa/wa-automate';
import { User, UserLevel, Reminder, Group, FeatureType, Language } from '../database/models';
import { Command } from '../middlewares/commandParser';
import * as userManager from '../utils/userManager';
import moment from 'moment-timezone';
import config from '../utils/config';
import logger from '../utils/logger';
import { getText, formatDateTime } from '../utils/i18n';

/**
 * Reminder Command
 * Creates personal or group reminders with flexible time scheduling
 * Supports time formats: 30s, 10m, 2h, 1d (seconds, minutes, hours, days)
 */
const reminder: Command = {
  name: 'reminder',
  aliases: ['remind', 'ingatkan'],
  description: 'Buat pengingat otomatis',
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
    const language = user?.language || Language.INDONESIAN;
    
    // Validate user registration
    if (!user) {
      logger.debug('Unregistered user attempted to use reminder', {
        userId: message.sender.id,
        command: 'reminder'
      });
      await client.reply(
        message.chatId,
        getText('not_registered', language),
        message.id
      );
      return;
    }
      try {
      logger.command('Processing reminder command for user', {
        userId: user.id,
        phoneNumber: user.phoneNumber,
        args: args.length
      });
        // Check user limit for Reminder feature
      const limitInfo = await userManager.checkLimit(user, FeatureType.REMINDER);
      if (limitInfo.hasReachedLimit) {
        logger.debug('User has reached reminder limit', {
          userId: user.id,
          phoneNumber: user.phoneNumber,
          currentUsage: limitInfo.currentUsage,
          maxUsage: limitInfo.maxUsage
        });
        await client.reply(
          message.chatId,
          getText('reminder.limit_reached', language, undefined, {
            current: limitInfo.currentUsage.toString(),
            max: limitInfo.maxUsage.toString()
          }),
          message.id
        );
        return;
      }
      
      // Extract and validate time argument
      const timeArg = args[0].toLowerCase();
      const scheduledTime = parseTime(timeArg);      if (!scheduledTime) {
        logger.debug('Invalid time format provided', {
          userId: user.id,
          timeArg: timeArg
        });
        await client.reply(
          message.chatId,
          getText('reminder.invalid_time_format', language),
          message.id
        );
        return;
      }
        // Extract reminder message
      const reminderMessage = args.slice(1).join(' ');
      if (reminderMessage.length > 500) {
        await client.reply(
          message.chatId,
          getText('reminder.message_too_long', language),
          message.id
        );
        return;
      }// Determine group context and get group database ID if applicable
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
          groupDatabaseId = group.id;        } catch (groupError) {
          logger.error('Error handling group record', {
            userId: user.id,
            chatId: message.chatId,
            error: groupError instanceof Error ? groupError.message : String(groupError)
          });
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
      const contextText = isGroup ? 
        getText('reminder.group_context', language) : 
        getText('reminder.personal_context', language);
      
      logger.success('Reminder created successfully', {
        reminderId: reminder.id,
        userId: user.id,
        phoneNumber: user.phoneNumber,
        scheduledTime: formattedTime,
        isGroup: isGroup
      });
      
      await client.reply(
        message.chatId,
        getText('reminder.created', language, undefined, {
          message: reminderMessage,
          time: formattedTime,
          context: contextText,
          id: reminder.id.toString()
        }),
        message.id
      );
    } catch (error) {
      logger.error('Error creating reminder', {
        userId: user.id,
        phoneNumber: user.phoneNumber,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      try {
        await client.reply(
          message.chatId, 
          getText('reminder.error', language), 
          message.id
        );
      } catch (replyError) {
        logger.error('Failed to send reminder error message', {
          userId: user.id,
          originalError: error instanceof Error ? error.message : String(error),
          replyError: replyError instanceof Error ? replyError.message : String(replyError)
        });
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
    logger.debug('Invalid time format in parseTime', {
      timeString: timeString
    });
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
    logger.debug('Time value out of range in parseTime', {
      value: value,
      unit: unit,
      timeString: timeString
    });
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
        return now.add(value, 'days');      default:
        logger.debug('Unsupported time unit in parseTime', {
          unit: unit,
          timeString: timeString
        });
        return null;
    }
  } catch (error) {
    logger.error('Error calculating scheduled time in parseTime', {
      timeString: timeString,
      unit: unit,
      value: value,
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

export default reminder;
