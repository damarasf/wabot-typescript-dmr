import { create, Client, Message, ContactId } from '@open-wa/wa-automate';
import { initializeDatabase } from './database/config/database';
import messageHandler from './handlers/messageHandler';
import commandHandler from './handlers/commandHandler';
import startScheduler from './utils/scheduler';
import config from './utils/config';
import { log } from './utils/logger';
import { getDisplayPhoneNumber, formatForWhatsApp } from './utils/phoneUtils';

// Global client reference for shutdown notifications
let globalClient: Client | null = null;

// Main bot initialization
const start = async (client: Client) => {  
  // Store global client reference
  globalClient = client;
  
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

  // Send startup notification to owner
  try {
    const ownerContact = `${config.ownerNumber}@c.us`;
    const startupDate = new Date();
    const formattedDate = startupDate.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    
    const startupMessage = `🤖 *${config.botName} Status*\n\n` + 
      `✅ Bot telah berhasil diaktifkan\n` +
      `⏰ Waktu: ${formattedDate}\n` +
      `🖥️ Mode: ${process.env.NODE_ENV || 'development'}\n` +
      `📱 WhatsApp: ${client.getHostNumber ? await client.getHostNumber() : 'Unknown'}\n` +
      (config.autoRestartTime > 0 ? `⏳ Auto restart dalam: ${Math.floor(config.autoRestartTime / (60 * 60 * 1000))} jam\n` : '');
      
    await client.sendText(
      ownerContact as any, 
      startupMessage
    );
    log.info('Startup notification sent to owner');
  } catch (error) {
    log.error('Failed to send startup notification to owner', error);
  }

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
  }  
    // Auto restart functionality
  if (config.autoRestartTime > 0) {
    setTimeout(async () => {
      log.system('Auto restart triggered');
      try {
        const ownerContact = `${config.ownerNumber}@c.us`;
        const restartTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        const uptime = Math.floor(process.uptime() / 60); // uptime in minutes
        
        await client.sendText(
          ownerContact as any, 
          `🔄 *${config.botName} Status*\n\n` +
          `⚙️ Bot sedang restart otomatis...\n` +
          `⏰ Waktu: ${restartTime}\n` +
          `⌛ Uptime: ${uptime} menit\n` +
          `🔙 Bot akan kembali online dalam beberapa saat`
        );
        log.info('Auto restart notification sent to owner');
      } catch (error) {
        log.error('Failed to send auto restart notification to owner', error);
      }
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

// Shared function to send shutdown notification to owner
const sendShutdownNotification = async (reason: string) => {
  try {
    const ownerContact = `${config.ownerNumber}@c.us`;
    const message = `🔴 *${config.botName} Status*\n\n❌ Bot telah dimatikan\n📝 Alasan: ${reason}\n⏰ Waktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`;
    
    // Try using the global client first if available
    if (globalClient) {
      try {
        await globalClient.sendText(ownerContact as any, message);
        log.info(`Shutdown notification (${reason}) sent to owner using existing client`);
        return;
      } catch (error) {
        log.warn('Failed to use existing client for shutdown notification, trying with new client');
      }
    }
    
    // Fall back to creating a temporary client
    try {
      const tempClient = await create({
        sessionId: 'dmr-bot',
        multiDevice: true,
        headless: true,
        qrTimeout: 0,
        disableSpins: true,
        logConsole: false
      });
      
      await tempClient.sendText(ownerContact as any, message);
      log.info(`Shutdown notification (${reason}) sent to owner using temporary client`);
      
      // Close the temporary client
      await tempClient.kill();
    } catch (tempError) {
      log.error(`Failed to send shutdown notification with temporary client: ${tempError}`);
    }
  } catch (error) {
    log.error(`Failed to send shutdown notification (${reason}) to owner`, error);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  log.system('Bot is shutting down (SIGINT)');
  await sendShutdownNotification('SIGINT (Manual Shutdown)');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log.system('Bot is shutting down (SIGTERM)');
  await sendShutdownNotification('SIGTERM (System Termination)');
  process.exit(0);
});

process.on('uncaughtException', async (error) => {
  log.error('Uncaught Exception', error);
  const errorDetails = error.stack ? `${error.message}\n${error.stack}` : error.message;
  await sendShutdownNotification(`Uncaught Exception: ${error.message}`);
});

process.on('unhandledRejection', async (reason: any, promise) => {
  log.error('Unhandled Rejection', { reason, promise });
  const errorMessage = reason instanceof Error ? reason.message : String(reason);
  await sendShutdownNotification(`Unhandled Rejection: ${errorMessage}`);
});

// Handle process exit
process.on('exit', (code) => {
  log.system(`Bot is exiting with code: ${code}`);
  // Note: We can't use async functions here as the process is exiting
  // Any async operations registered here won't complete
});

log.info('Please scan the QR code with your WhatsApp to continue...');