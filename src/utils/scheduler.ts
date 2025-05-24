import { CronJob } from 'cron';
import { Client } from '@open-wa/wa-automate';
import { Reminder } from '../database/models';
import * as userManager from './userManager';
import moment from 'moment-timezone';

// Timezone configuration
const TIMEZONE = 'Asia/Jakarta';

// Initialize scheduler jobs
export function initScheduler(client: Client): void {
  // Schedule daily reset of usage limits at midnight
  const resetLimitsJob = new CronJob(
    '0 0 * * *', // Midnight every day (00:00)
    async function() {
      try {
        console.log('Executing daily reset of usage limits...');
        await userManager.resetAllUsage();
        console.log('Daily reset of usage limits completed.');
      } catch (error) {
        console.error('Error in daily reset job:', error);
      }
    },
    null,
    true,
    TIMEZONE
  );
  
  // Schedule reminder check every minute
  const reminderJob = new CronJob(
    '* * * * *', // Every minute
    async function() {
      try {
        await processReminders(client);
      } catch (error) {
        console.error('Error in reminder job:', error);
      }
    },
    null,
    true,
    TIMEZONE
  );
  
  console.log('Scheduler initialized.');
}

// Process due reminders
async function processReminders(client: Client): Promise<void> {
  try {
    const now = moment.tz(TIMEZONE);
    
    // Find all active reminders due in the current minute
    const dueReminders = await Reminder.findAll({
      where: {
        isActive: true,
        isCompleted: false,
        scheduledTime: {
          // Between now and 1 minute ago
          [Symbol.for('gt')]: moment.tz(TIMEZONE).subtract(1, 'minute').toDate(),
          [Symbol.for('lte')]: now.toDate(),
        },
      },
    });
    
    if (dueReminders.length === 0) return;
    
    console.log(`Processing ${dueReminders.length} due reminders...`);
      // Process each reminder
    for (const reminder of dueReminders) {
      // Prepare the message text
      const reminderText = `⏰ *REMINDER*\n\n${reminder.message}`;
        // Send the message to the appropriate chat
      if (reminder.groupId) {
        // This is a group reminder - send to group
        await client.sendText(String(reminder.groupId) as any, reminderText);
      } else {
        // This is a personal reminder - send to user's phone
        await client.sendText(String(reminder.userId) as any, reminderText);
      }
      
      // Mark the reminder as completed
      reminder.isCompleted = true;
      await reminder.save();
      
      console.log(`✅ Sent reminder #${reminder.id} to ${reminder.groupId ? 'group' : 'user'}`);
    }
  } catch (error) {
    console.error('Error processing reminders:', error);
  }
}

export default {
  initScheduler,
};
