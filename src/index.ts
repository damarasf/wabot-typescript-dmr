import { create, Client, Message } from '@open-wa/wa-automate';
import { initializeDatabase } from './database/config/database';
import messageHandler from './handlers/messageHandler';
import commandHandler from './handlers/commandHandler';
import startScheduler from './utils/scheduler';
import config from './utils/config';

// Main bot initialization
const start = async (client: Client) => {
  console.log('🚀 WhatsApp Bot DMR started successfully!');
  console.log(`📱 Bot Name: ${config.botName}`);
  console.log(`👑 Owner: ${config.ownerNumber}`);
  console.log(`🔧 Prefixes: ${config.prefixes.join(', ')}`);
  
  // Initialize database
  try {
    await initializeDatabase();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
  // Initialize command handler
  await commandHandler.loadCommands();
  console.log('✅ Command handler initialized');

  // Start scheduler for automated tasks
  startScheduler.initScheduler(client);
  console.log('✅ Scheduler started');

  // Handle incoming messages
  client.onMessage(async (message: Message) => {
    try {
      await messageHandler.handleMessage(client, message);
    } catch (error) {
      console.error('❌ Error handling message:', error);
    }
  });
  // Handle call events if anti-call is enabled
  if (config.antiCall) {
    client.onIncomingCall(async (call: any) => {
      try {
        console.log(`📞 Rejecting call from: ${call.peerJid}`);
        
        // Send anti-call message
        const antiCallMessage = `⚠️ *Anti-Call System*\n\nMaaf, bot ini tidak menerima panggilan. Silakan gunakan chat untuk berinteraksi dengan bot.\n\n_Call has been automatically rejected._`;
        await client.sendText(call.peerJid, antiCallMessage);
      } catch (error) {
        console.error('❌ Error handling call:', error);
      }
    });
  }

  // Handle message deletion if anti-delete is enabled
  if (config.antiDelete) {
    client.onAnyMessage(async (message: any) => {
      try {
        if (message.type === 'revoked' && message.body && message.from) {
          const antiDeleteMessage = `🚫 *Anti-Delete System*\n\n👤 *Pengirim:* @${message.sender.id.replace('@c.us', '')}\n📝 *Pesan yang dihapus:* ${message.body}\n⏰ *Waktu:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`;
          
          await client.sendTextWithMentions(message.from, antiDeleteMessage);
        }
      } catch (error) {
        console.error('❌ Error handling deleted message:', error);
      }
    });
  }

  // Auto restart functionality
  if (config.autoRestartTime > 0) {
    setTimeout(async () => {
      console.log('🔄 Auto restart triggered');
      await client.sendText(`${config.ownerNumber}@c.us` as any, '🔄 Bot sedang restart otomatis...');
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
  console.error('❌ Failed to start WhatsApp bot:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Bot is shutting down...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Bot is shutting down...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('⏳ Starting WhatsApp Bot DMR...');
console.log('📱 Please scan the QR code with your WhatsApp to continue...');