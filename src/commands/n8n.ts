import { Message, Client } from '@open-wa/wa-automate';
import { User, UserLevel, FeatureType } from '../database/models';
import { Command } from '../middlewares/commandParser';
import * as userManager from '../utils/userManager';
import * as n8nIntegration from '../utils/n8nIntegration';
import config from '../utils/config';

/**
 * N8N Workflow Command
 * Executes N8N workflows with usage tracking and limits
 * Supports various workflow types and parameter passing
 */
const n8n: Command = {
  name: 'n8n',
  description: 'Menjalankan workflow N8N',
  usage: '!n8n [workflow_id] [parameter]',
  example: '!n8n translate Hello World',
  category: 'N8N',
  cooldown: 5,
  requiredArgs: 1,
  minimumLevel: UserLevel.FREE,
  
  /**
   * Execute the N8N workflow command
   * @param message - WhatsApp message object
   * @param args - Command arguments [workflow_id, ...parameters]
   * @param client - WhatsApp client instance
   * @param user - User database object
   */  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    // Validate user registration
    if (!user) {
      console.log(`❌ Unregistered user attempted to use N8N: ${message.sender.id}`);
      await client.reply(
        message.chatId,
        '❌ Anda belum terdaftar. Silakan daftar dengan perintah *!register* terlebih dahulu.',
        message.id
      );
      return;
    }
    
    try {
      console.log(`🔗 Processing N8N workflow request for user ${user.phoneNumber}`);
      
      // Check user limit for N8N feature
      const limitInfo = await userManager.checkLimit(user, FeatureType.N8N);
      if (limitInfo.hasReachedLimit) {
        console.log(`⚠️ User ${user.phoneNumber} has reached N8N limit: ${limitInfo.currentUsage}/${limitInfo.maxUsage}`);
        await client.reply(
          message.chatId,
          `⚠️ Anda telah mencapai batas penggunaan fitur N8N (${limitInfo.currentUsage}/${limitInfo.maxUsage}).\n\nSilakan tunggu hingga limit direset atau upgrade ke Premium untuk mendapatkan limit lebih tinggi.`,
          message.id
        );
        return;
      }
      
      // Extract and validate workflow ID
      const workflowId = args[0].trim();
      if (!workflowId) {
        await client.reply(
          message.chatId,
          '❌ Workflow ID tidak boleh kosong. Contoh: `!n8n translate Hello World`',
          message.id
        );
        return;
      }
      
      // Extract parameters
      const params = args.slice(1).join(' ');
      
      // Validate N8N configuration
      if (!config.n8nUrl || !config.n8nToken) {
        console.log('❌ N8N configuration missing');
        await client.reply(
          message.chatId,
          '❌ Konfigurasi N8N tidak tersedia. Silakan hubungi administrator.',
          message.id
        );
        return;
      }
      
      // Send processing message
      const processingMsg = await client.reply(
        message.chatId,
        '⌛ Sedang memproses permintaan N8N...',
        message.id
      );
      
      // Prepare workflow data
      const workflowData = {
        message: params,
        sender: message.sender.id,
        senderName: message.sender.pushname || 'Unknown',
        isGroup: message.isGroupMsg,
        groupId: message.isGroupMsg ? String(message.chatId) : null,
        messageId: message.id,
        timestamp: new Date().toISOString(),
        userLevel: user.level,
      };
      
      console.log(`🚀 Executing N8N workflow: ${workflowId} with parameters: ${params}`);
      
      // Execute N8N workflow
      const result = await n8nIntegration.executeWorkflow({
        workflowId,
        data: workflowData,
      });
      
      // Increment usage count
      await userManager.incrementUsage(user.id, FeatureType.N8N);
        // Format and send the result
      let resultText: string;
      if (typeof result === 'object' && result !== null) {
        // Handle different result formats
        if (result.data) {
          resultText = String(result.data);
        } else if (result.error) {
          resultText = String(result.error);
        } else {
          resultText = JSON.stringify(result, null, 2);
        }
      } else {
        resultText = String(result || 'Workflow executed successfully');
      }
      
      // Truncate very long results
      if (resultText.length > 2000) {
        resultText = resultText.substring(0, 1900) + '\n\n_... (hasil dipotong karena terlalu panjang)_';
      }
      
      console.log(`✅ N8N workflow completed successfully for user ${user.phoneNumber}`);
      
      await client.reply(
        message.chatId,
        `✅ *Hasil N8N Workflow*\n\n${resultText}`,
        message.id
      );
      
    } catch (error) {
      console.error('❌ Error executing N8N workflow:', error);
      
      // Enhanced error handling with specific error types
      let errorMessage = 'Terjadi kesalahan saat menjalankan workflow N8N.';
      
      if (error instanceof Error) {
        if (error.message.includes('404') || error.message.includes('not found')) {
          errorMessage = 'Workflow N8N tidak ditemukan. Pastikan ID workflow benar.';
        } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
          errorMessage = 'Token N8N tidak valid. Silakan hubungi administrator.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Workflow N8N timeout. Silakan coba lagi atau gunakan parameter yang lebih sederhana.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Terlalu banyak permintaan ke N8N. Silakan tunggu sebentar dan coba lagi.';
        }
        console.error('Error details:', error.message);
      }
      
      try {
        await client.reply(
          message.chatId, 
          `❌ ${errorMessage}\n\n_Pastikan ID workflow valid dan parameter sesuai._`,
          message.id
        );
      } catch (replyError) {
        console.error('❌ Failed to send error message:', replyError);
      }
    }
  },
};

export default n8n;
