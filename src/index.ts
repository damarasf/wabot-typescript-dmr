import { create, Client, Message } from '@open-wa/wa-automate';
import { initializeDatabase } from './database/config/database';
import messageHandler from './handlers/messageHandler';
import commandHandler from './handlers/commandHandler';
import startScheduler from './utils/scheduler';
import config from './utils/config';
import { log } from './utils/logger';
import { getDisplayPhoneNumber, formatForWhatsApp } from './utils/phoneUtils';

// Main bot initialization
const start = async (client: Client) => {  
  log.system(`Bot: ${config.botName} | Owner: ${config.ownerNumber}`);
  
  // Initialize database
  try {
    await initializeDatabase();
    log.database('Database initialized successfully');
  } catch (error) {
    log.error('Failed to initialize database', error);
    process.exit(1);
  }
  
  // Initialize command handler
  await commandHandler.loadCommands();
  log.success('Command handler initialized');

  // Start scheduler for automated tasks
  startScheduler.initScheduler(client);
  log.success('Scheduler started');

  // Handle incoming messages
  client.onMessage(async (message: Message) => {
    try {
      await messageHandler.handleMessage(client, message);
    } catch (error) {
      log.error('Error handling message', error);
    }
  });  
  
  // Handle call events if anti-call is enabled
  if (config.antiCall) {
    client.onIncomingCall(async (call: any) => {
      try {
        log.security(`Rejecting call from: ${call.peerJid}`);
        
        // Send anti-call message
        const antiCallMessage = `⚠️ *Anti-Call System*\n\nMaaf, bot ini tidak menerima panggilan. Silakan gunakan chat untuk berinteraksi dengan bot.\n\n_Call has been automatically rejected._`;
        await client.sendText(call.peerJid, antiCallMessage);
      } catch (error) {
        log.error('Error handling call', error);
      }
    });
  }
  // Handle message deletion if anti-delete is enabled
  if (config.antiDelete) {
    client.onAnyMessage(async (message: any) => {
      try {
        if (message.type === 'revoked' && message.body && message.from) {
          const antiDeleteMessage = `🚫 *Anti-Delete System*\n\n👤 *Pengirim:* @${getDisplayPhoneNumber(message.sender.id)}\n📝 *Pesan yang dihapus:* ${message.body}\n⏰ *Waktu:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`;
          
          await client.sendTextWithMentions(message.from, antiDeleteMessage);
        }
      } catch (error) {
        log.error('Error handling deleted message', error);
      }
    });
  }  // Auto restart functionality
  if (config.autoRestartTime > 0) {
    setTimeout(async () => {
      log.system('Auto restart triggered');
      await client.sendText(formatForWhatsApp(config.ownerNumber) as any, '🔄 Bot sedang restart otomatis...');
      process.exit(0);
    }, config.autoRestartTime);
  }

};

// Create WhatsApp client
create({
  sessionId: 'dmr-bot',
  multiDevice: true,
  authTimeout: 60,
  blockCrashLogs: true,  disableSpins: true,
  headless: true,
  logConsole: false,
  popup: false,
  qrTimeout: 0,
  restartOnCrash: start,
  throwErrorOnTosBlock: false,
  useChrome: true,
  killProcessOnBrowserClose: true,
  bypassCSP: true,
  chromeInTempUserDir: true,
}).then(start).catch((error) => {
  log.error('Failed to start WhatsApp bot', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', async () => {
  log.system('Bot is shutting down (SIGINT)');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log.system('Bot is shutting down (SIGTERM)');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception', error);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled Rejection', { reason, promise });
});

log.info('Please scan the QR code with your WhatsApp to continue...');