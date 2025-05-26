import { Message, Client } from '@open-wa/wa-automate';
import { User, UserLevel, FeatureType } from '../database/models';
import { Command } from '../middlewares/commandParser';
import * as userManager from '../utils/userManager';
import * as n8nIntegration from '../utils/n8nIntegration';
import { getText } from '../utils/i18n';
import config from '../utils/config';
import logger from '../utils/logger';

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
      logger.debug('Unregistered user attempted to use N8N', {
        userId: message.sender.id,
        command: 'n8n'
      });
      await client.reply(
        message.chatId,
        getText('n8n.not_registered'),
        message.id
      );
      return;
    }

    try {
      logger.command('Processing N8N workflow request for user', {
        userId: user.id,
        phoneNumber: user.phoneNumber,
        args: args.length
      });
      
      // Check user limit for N8N feature
      const limitInfo = await userManager.checkLimit(user, FeatureType.N8N);
      if (limitInfo.hasReachedLimit) {
        logger.debug('User has reached N8N limit', {
          userId: user.id,
          phoneNumber: user.phoneNumber,
          currentUsage: limitInfo.currentUsage,
          maxUsage: limitInfo.maxUsage
        });
        await client.reply(
          message.chatId,
          getText('n8n.limit_reached', user.language, undefined, {
            currentUsage: limitInfo.currentUsage.toString(),
            maxUsage: limitInfo.maxUsage.toString()
          }),
          message.id
        );
        return;
      }
      
      // Extract and validate workflow ID
      const workflowId = args[0].trim();
      if (!workflowId) {
        await client.reply(
          message.chatId,
          getText('n8n.workflow_id_empty', user.language),
          message.id
        );
        return;
      }
      
      // Extract parameters
      const params = args.slice(1).join(' ');

      // Validate N8N configuration
      if (!config.n8nUrl || !config.n8nToken) {
        logger.debug('N8N configuration missing', {
          hasUrl: !!config.n8nUrl,
          hasToken: !!config.n8nToken
        });
        await client.reply(
          message.chatId,
          getText('n8n.config_missing', user.language),
          message.id
        );
        return;
      }
      
      // Send processing message
      const processingMsg = await client.reply(
        message.chatId,
        getText('n8n.executing', user.language),
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
      
      logger.info('Executing N8N workflow', {
        workflowId: workflowId,
        userId: user.id,
        phoneNumber: user.phoneNumber,
        params: params,
        isGroup: message.isGroupMsg
      });
      
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
        const truncateText = user.language === 'id' 
          ? '_... (hasil dipotong karena terlalu panjang)_'
          : '_... (result truncated because it\'s too long)_';
        resultText = resultText.substring(0, 1900) + '\n\n' + truncateText;
      }
      
      logger.success('N8N workflow completed successfully for user', {
        workflowId: workflowId,
        userId: user.id,
        phoneNumber: user.phoneNumber,
        resultLength: resultText.length
      });
      
      await client.reply(
        message.chatId,
        getText('n8n.success', user.language, undefined, {
          result: resultText
        }),
        message.id
      );

    } catch (error) {
      logger.error('Error executing N8N workflow', {
        workflowId: args[0],
        userId: user.id,
        phoneNumber: user.phoneNumber,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      await client.reply(
        message.chatId,
        getText('n8n.error', user.language, undefined, {
          error: error instanceof Error ? error.message : String(error)
        }),
        message.id
      );
    }
  },
};

export default n8n;
