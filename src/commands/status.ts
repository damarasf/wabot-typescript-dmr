import { Client, Message } from '@open-wa/wa-automate';
import { Command } from '../middlewares/commandParser';
import { User, Language } from '../database/models';
import config from '../utils/config';
import { getText } from '../utils/i18n';
import { formatUptime } from '../utils/formatter';

/**
 * Status Command
 * 
 * Displays comprehensive bot status information including:
 * - Bot configuration and settings
 * - System information and uptime
 * - Auto restart status and timing
 * - Memory usage and performance metrics
 * 
 * Features:
 * - System diagnostics display
 * - Auto restart configuration status
 * - Performance metrics
 * - Multi-language support
 * 
 * @category General Commands
 * @requires Free level access or higher
 */
const status: Command = {
  name: 'status',
  aliases: ['info', 'botstatus', 'sysinfo'],
  description: 'Tampilkan status bot dan sistem',
  category: 'Umum',
  cooldown: 10,
  usage: 'status',
  example: 'status',
  adminOnly: false,
  ownerOnly: false,
  
  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    try {
      // Detect user language
      const language = user?.language || Language.INDONESIAN;
      
      // Calculate system metrics
      const currentTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      const uptime = process.uptime();
      const uptimeFormatted = formatUptime(uptime);
      const memoryUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
      const totalMemory = Math.round(process.memoryUsage().rss / 1024 / 1024);
      
      // Auto restart status
      const autoRestartStatus = config.autoRestartEnabled && config.autoRestartTime > 0;
      const autoRestartHours = autoRestartStatus ? Math.floor(config.autoRestartTime / (60 * 60 * 1000)) : 0;
      
      // Environment info
      const nodeVersion = process.version;
      const processId = process.pid;
      const environment = process.env.NODE_ENV || 'development';
      
      // Create status message
      const statusMessage = getText('status.info', language, undefined, {
        botName: config.botName,
        currentTime,
        uptime: uptimeFormatted,
        memoryUsage: memoryUsage.toString(),
        totalMemory: totalMemory.toString(),
        nodeVersion,
        processId: processId.toString(),
        environment,
        autoRestartEnabled: autoRestartStatus ? 
          (language === Language.ENGLISH ? 'Enabled' : 'Aktif') : 
          (language === Language.ENGLISH ? 'Disabled' : 'Nonaktif'),
        autoRestartTime: autoRestartStatus ? 
          `${autoRestartHours} ${language === Language.ENGLISH ? 'hours' : 'jam'}` : 
          '-',
        antiCallStatus: config.antiCall ? 
          (language === Language.ENGLISH ? 'Enabled' : 'Aktif') : 
          (language === Language.ENGLISH ? 'Disabled' : 'Nonaktif'),
        antiDeleteStatus: config.antiDelete ? 
          (language === Language.ENGLISH ? 'Enabled' : 'Aktif') : 
          (language === Language.ENGLISH ? 'Disabled' : 'Nonaktif'),
        timezone: config.timezone
      });
      
      await client.reply(
        message.from,
        statusMessage,
        message.id
      );
      
    } catch (error) {
      // Detect user language for error message
      const language = user?.language || Language.INDONESIAN;
      
      await client.reply(
        message.from,
        getText('common.error', language, undefined, {
          errorMessage: (error as Error).message || 'Unknown error'
        }),
        message.id
      );
    }
  }
};

export default status;
