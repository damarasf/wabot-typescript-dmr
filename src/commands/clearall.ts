import { Client, Message } from '@open-wa/wa-automate';
import { Command } from '../middlewares/commandParser';
import { User, Language } from '../database/models';
import config from '../utils/config';
import logger from '../utils/logger';
import { isOwner } from '../utils/phoneUtils';
import { getText } from '../utils/i18n';

/**
 * Clear All Command
 * Clears WhatsApp chat history and media to free up memory - Owner only
 * Features comprehensive chat clearing with safety confirmations
 */
export const clearallCommand: Command = {
  name: 'clearall',
  aliases: ['clearchat', 'cleanchat', 'clearchats'],
  description: 'Hapus semua chat (owner only)',
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
   */    async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    const language = user?.language || Language.INDONESIAN;
    
    try {      
      logger.command('Processing clearall command from owner', {
        userId: message.sender.id,
        command: 'clearall',
        args: args.length
      });

      // Additional owner verification (safety check)
      if (!isOwner(message.sender.id, config.ownerNumber)) {
        logger.security('Unauthorized clearall attempt', {
          userId: message.sender.id,
          command: 'clearall',
          ownerNumber: config.ownerNumber
        });
        await client.reply(
          message.chatId,
          getText('clearall.access_denied', language),
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

        await client.reply(
          message.chatId,
          getText('clearall.help', language),
          message.id
        );
        return;
      }

      logger.user('Clearall confirmed, starting chat clearing process', {
        userId: message.sender.id,
        chatId: message.chatId
      });

      // Send initial warning with countdown
      await client.reply(
        message.chatId,
        getText('clearall.starting', language),
        message.id
      );      // 3 second delay for preparation
      await new Promise(resolve => setTimeout(resolve, 3000));

      logger.info('Starting chat clearing process', {
        userId: message.sender.id
      });

      // Send progress message
      await client.reply(
        message.chatId,
        getText('clearall.processing', language),
        message.id
      );

      let clearedCount = 0;
      let methodUsed = 'Unknown';
      
      try {        
        // Method 1: Try clearAllChats if available
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
        
        const statusMessage = clearedCount === -1 
          ? getText('clearall.status_all', language)
          : getText('clearall.status_count', language, undefined, { count: clearedCount.toString() });

        await client.reply(
          message.chatId,
          getText('clearall.success', language, undefined, {
            statusMessage,
            method: methodUsed,
            timestamp
          }),
          message.id
        );        

        logger.success('Chat clearing completed successfully', {
          userId: message.sender.id,
          method: methodUsed,
          clearedCount: clearedCount,
          timestamp: timestamp
        });      

      } catch (clearError) {
        logger.error('Error during chat clearing', {
          userId: message.sender.id,
          error: clearError instanceof Error ? clearError.message : String(clearError),
          stack: clearError instanceof Error ? clearError.stack : undefined
        });
        
        await client.reply(
          message.chatId,
          getText('clearall.error_cleanup', language),
          message.id
        );
      }    

    } catch (error) {
      const language = user?.language || Language.INDONESIAN;
      
      logger.error('Critical error in clearall command', {
        userId: message.sender.id,
        chatId: message.chatId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      try {
        await client.reply(
          message.chatId,
          getText('clearall.error_critical', language),
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