import { Client, Message } from '@open-wa/wa-automate';
import { Command } from '../middlewares/commandParser';
import { User } from '../database/models';
import config from '../utils/config';
import logger from '../utils/logger';

/**
 * Clear All Command
 * Clears WhatsApp chat history and media to free up memory - Owner only
 * Features comprehensive chat clearing with safety confirmations
 */
export const clearallCommand: Command = {
  name: 'clearall',
  aliases: ['clearchat', 'cleanchat', 'clearchats'],
  description: 'Hapus semua riwayat chat WhatsApp (khusus owner)',
  category: 'Owner',
  cooldown: 30,
  usage: '!clearall CONFIRM',
  example: '!clearall CONFIRM',
  adminOnly: false,
  ownerOnly: true,
    
  /**
   * Execute the clearall command
   * @param message - WhatsApp message object
   * @param args - Command arguments [CONFIRM]
   * @param client - WhatsApp client instance
   * @param user - Owner user database object
   */  
  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    try {
      logger.command('Processing clearall command from owner', {
        userId: message.sender.id,
        command: 'clearall',
        args: args.length
      });

      const ownerNumber = config.ownerNumberFormatted;
      const isOwner = String(message.sender.id) === ownerNumber;
      
      // Additional owner verification (safety check)
      if (isOwner) {
        logger.security('Unauthorized clearall attempt', {
          userId: message.sender.id,
          command: 'clearall',
          ownerNumber: ownerNumber
        });
        await client.reply(
          message.chatId,
          '🚫 *Akses Ditolak*\n\n' +
          'Perintah ini hanya dapat digunakan oleh owner bot.\n\n' +
          '_Ini adalah operasi untuk membersihkan riwayat chat._',
          message.id
        );
        return;
      }

      // Check for confirmation
      if (args.length === 0 || args[0] !== 'CONFIRM') {
        logger.debug('Clearall requested without confirmation', {
          userId: message.sender.id,
          argsProvided: args.length,
          firstArg: args[0] || 'none'
        });
          const warningMessage = `🚨 *PERINGATAN*\n\n` +
          `⚠️ *OPERASI PEMBERSIHAN CHAT*\n` +
          `Perintah ini akan menghapus semua riwayat chat WhatsApp!\n\n` +
          `🗑️ *Yang Akan Dihapus:*\n` +
          `• Semua riwayat chat\n` +
          `• Semua media (foto, video, dokumen)\n` +
          `• Pesan yang tersimpan di memori\n\n` +
          `✅ *Yang TIDAK Dihapus:*\n` +
          `• Data pengguna di database\n` +
          `• Konfigurasi bot\n` +
          `• Session WhatsApp\n\n` +
          `⚡ *Untuk melanjutkan, ketik:*\n` +
          `\`!clearall CONFIRM\`\n\n` +
          `_Tujuan: Mengosongkan memory dan mempercepat bot._`;

        await client.reply(
          message.chatId,
          warningMessage,
          message.id
        );
        return;
      }

      logger.user('Clearall confirmed, starting chat clearing process', {
        userId: message.sender.id,
        chatId: message.chatId
      });

      // Send initial warning with countdown
      const initialWarning = `🚨 *PROSES PEMBERSIHAN DIMULAI*\n\n` +
        `⚠️ Menghapus riwayat chat dalam 3 detik...\n` +
        `🔄 Proses ini akan membersihkan memory bot.\n\n` +
        `_Tunggu hingga selesai..._`;
      
      await client.reply(
        message.chatId,
        initialWarning,
        message.id
      );

      // 3 second delay for preparation
      await new Promise(resolve => setTimeout(resolve, 3000));

      logger.info('Starting chat clearing process', {
        userId: message.sender.id
      });

      // Send progress message
      await client.reply(
        message.chatId,
        '🔄 *Membersihkan riwayat chat...*\n\n_Harap tunggu, jangan matikan bot._',
        message.id
      );

      let clearedCount = 0;
      let methodUsed = 'Unknown';
      
      try {        // Method 1: Try clearAllChats if available
        if (typeof client.clearAllChats === 'function') {
          logger.debug('Using clearAllChats method for chat clearing', {
            userId: message.sender.id,
            method: 'clearAllChats'
          });
          await client.clearAllChats();
          methodUsed = 'clearAllChats()';
          clearedCount = -1; // Indicates all chats
        } else {
          // Method 2: Fallback - Get all chats and clear individually  
          logger.debug('Using individual chat clearing method', {
            userId: message.sender.id,
            method: 'clearChat'
          });
          const allChats = await client.getAllChats();
          
          for (const chat of allChats) {
            try {
              if (typeof client.clearChat === 'function') {
                await client.clearChat(chat.id);
                clearedCount++;
              }
            } catch (chatError) {
              logger.debug('Could not clear individual chat', {
                userId: message.sender.id,
                chatId: chat.id,
                error: chatError instanceof Error ? chatError.message : String(chatError)
              });
            }
          }
          methodUsed = 'clearChat() per chat';
        }

        // Success message
        const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        
        let resultMessage = `✅ *RIWAYAT CHAT BERHASIL DIBERSIHKAN*\n\n`;
        
        if (clearedCount === -1) {
          resultMessage += `🧹 *Status:* Semua chat dibersihkan\n`;
        } else {
          resultMessage += `🧹 *Chat Dibersihkan:* ${clearedCount} chat\n`;
        }
        
        resultMessage += `⚙️ *Metode:* ${methodUsed}\n` +
          `⏰ *Waktu:* ${timestamp}\n` +
          `👑 *Oleh:* Owner\n\n` +
          `✨ *Hasil:* Memory bot telah dibersihkan!\n` +
          `🚀 *Bot siap dengan performa optimal.*`;

        await client.reply(
          message.chatId,
          resultMessage,
          message.id
        );        logger.success('Chat clearing completed successfully', {
          userId: message.sender.id,
          method: methodUsed,
          clearedCount: clearedCount,
          timestamp: timestamp
        });      } catch (clearError) {
        logger.error('Error during chat clearing', {
          userId: message.sender.id,
          error: clearError instanceof Error ? clearError.message : String(clearError),
          stack: clearError instanceof Error ? clearError.stack : undefined
        });
        
        await client.reply(
          message.chatId,
          `❌ *OPERASI GAGAL*\n\n` +
          `Terjadi kesalahan saat membersihkan chat.\n\n` +
          `🔧 *Saran:*\n` +
          `• Restart bot dan coba lagi\n` +
          `• Periksa koneksi WhatsApp\n` +
          `• Hapus chat manual jika diperlukan\n\n` +
          `_Coba lagi nanti atau restart bot._`,
          message.id
        );
      }    } catch (error) {
      logger.error('Critical error in clearall command', {
        userId: message.sender.id,
        chatId: message.chatId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      try {
        await client.reply(
          message.chatId,
          `❌ *KESALAHAN SISTEM*\n\n` +
          `Terjadi kesalahan kritis.\n\n` +
          `🔧 *Solusi:*\n` +
          `• Restart bot\n` +
          `• Periksa log error\n` +
          `• Hubungi support jika masalah berlanjut`,
          message.id
        );
      } catch (replyError) {
        logger.error('Failed to send clearall error message', {
          userId: message.sender.id,
          chatId: message.chatId,
          originalError: error instanceof Error ? error.message : String(error),
          replyError: replyError instanceof Error ? replyError.message : String(replyError)
        });
      }
    }
  }
};

export default clearallCommand;