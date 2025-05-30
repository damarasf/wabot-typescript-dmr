import { Message, Client } from '@open-wa/wa-automate';
import { User, UserLevel, FeatureType, Language } from '../database/models';
import { Command } from '../middlewares/commandParser';
import * as userManager from '../utils/userManager';
import config from '../utils/config';
import logger from '../utils/logger';
import { getDisplayPhoneNumber, isOwner } from '../utils/phoneUtils';
import { getText, formatDateTime } from '../utils/i18n';

/**
 * Tag All Command
 * Mentions all members in a group with permission and limit checks
 * Features admin-only access, spam prevention, and usage tracking
 */
const tagall: Command = {
  name: 'tagall',
  aliases: ['everyone', 'all', 'semua'],
  description: 'Tag semua member grup',
  usage: '!tagall [pesan]',
  example: '!tagall Ayo kumpul sekarang',
  category: 'Grup',
  cooldown: 60, // 1 minute cooldown to prevent spam
  groupOnly: true,
  minimumLevel: UserLevel.FREE,

  /**
   * Execute the tagall command
   * @param message - WhatsApp message object
   * @param args - Command arguments [optional: custom_message]
   * @param client - WhatsApp client instance
   * @param user - User database object for permission and limit checks
   */
  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    try {
      const language = user?.language || Language.INDONESIAN;
      
      logger.command(`tagall from ${message.sender.id} in group ${message.chatId}`, {
        userId: message.sender.id,
        chatId: message.chatId,
        args
      });
      
      // Validate group context
      if (!message.isGroupMsg) {
        logger.debug('Tagall command used outside group context');
        await client.reply(
          message.chatId,
          getText('tagall.group_only', language),
          message.id
        );
        return;
      }
      
      // Validate user registration
      if (!user) {
        logger.user(`Unregistered user ${message.sender.id} attempted tagall`);
        await client.reply(
          message.chatId,
          getText('not_registered', language),
          message.id
        );
        return;
      }
      
      // Check permissions
      const hasPermission = await checkTagAllPermissions(message, user, client);
      if (!hasPermission) {
        return; // Permission check handles its own error message
      }
        // Check usage limits
      const limitInfo = await userManager.checkLimit(user, FeatureType.TAG_ALL);
      if (limitInfo.hasReachedLimit) {
        logger.user(`User ${message.sender.id} reached tagall limit: ${limitInfo.currentUsage}/${limitInfo.maxUsage}`);
        await client.reply(
          message.chatId,
          getText('tagall.limit_reached', language, undefined, {
            current: limitInfo.currentUsage.toString(),
            max: limitInfo.maxUsage.toString()
          }),
          message.id
        );
        return;      }
      
      // Get group information
      const groupMetadata = message.chat.groupMetadata;
      if (!groupMetadata) {
        logger.error('Could not retrieve group metadata', { chatId: message.chatId });
        await client.reply(
          message.chatId,
          getText('tagall.no_metadata', language),
          message.id
        );
        return;
      }
        
      const groupMembers = groupMetadata.participants || [];
      // Get bot's own number using methods that exist in the library
      
      let botNumber: string;
      try {
        // getMe() is a documented method in @open-wa/wa-automate
        const botInfo = await client.getMe();
        // The bot ID should be in the 'me' field of the returned object
        botNumber = botInfo?.me?.user || botInfo?.wid || config.ownerNumber + '@c.us';
        
        // Ensure it has the correct format
        if (!botNumber.includes('@c.us')) {
          botNumber = botNumber + '@c.us';
        }
      } catch (error) {
        logger.debug('Failed to get bot number with getMe, using owner number as fallback', { error });
        botNumber = config.ownerNumber + '@c.us';
      }
      
      logger.debug(`Bot number identified as: ${botNumber}`, { botNumber });      // Get group name from chat object or use fallback
      let groupName: string;
      try {
        groupName = message.chat.name || message.chat.contact?.name || getText('common.unknown', language);
      } catch {
        groupName = getText('common.unknown', language);
      }
      
      logger.info(`Found ${groupMembers.length} members in group ${groupName}`, {
        groupId: message.chatId,
        memberCount: groupMembers.length,
        groupName
      });
        // Validate group has members
      if (groupMembers.length === 0) {
        await client.reply(
          message.chatId,
          getText('tagall.no_members', language),
          message.id
        );
        return;
      }
      
      // Generate tag message
      const customMessage = args.length > 0 ? args.join(' ') : getText('tagall.default_message', language);
      
      // Log before generating mentions for debugging purposes
      logger.debug('Preparing to tag members', {
        totalMembers: groupMembers.length,
        botNumber: botNumber,
        senderId: message.sender.id
      });
      
      const { mentions, mentionIds } = generateMentions(groupMembers, botNumber, message.sender.id);
      
      // Log after generating mentions
      logger.debug('Generated mentions', {
        mentionCount: mentionIds.length,
        excludedCount: groupMembers.length - mentionIds.length
      });      // Create comprehensive tag message
      const finalMessage = formatTagMessage(
        customMessage, 
        mentions, 
        groupName, 
        message.sender.pushname,
        message.sender.id,
        language
      );
      
      logger.command(`Tagging ${mentionIds.length} members with message: "${customMessage}"`, {
        userId: message.sender.id,
        groupId: message.chatId,
        memberCount: mentionIds.length,
        message: customMessage
      });
      
      // Send message with mentions
      await client.sendTextWithMentions(message.chatId, finalMessage);
      
      // Increment usage count
      await userManager.incrementUsage(user.id, FeatureType.TAG_ALL);
      logger.success(`Successfully tagged all members and incremented usage for user ${user.id}`, {
        userId: user.id,
        groupId: message.chatId,
        memberCount: mentionIds.length
      });
        // Send confirmation message after a short delay
      setTimeout(async () => {
        try {
          await client.reply(
            message.chatId,
            getText('tagall.success', language, undefined, {
              count: mentionIds.length.toString(),
              current: (limitInfo.currentUsage + 1).toString(),
              max: limitInfo.maxUsage.toString(),
              time: new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })
            }),
            message.id
          );} catch (confirmError) {
          logger.error('Failed to send confirmation message', {
            userId: message.sender.id,
            groupId: message.chatId,
            error: confirmError instanceof Error ? confirmError.message : String(confirmError)
          });
          // Don't fail the whole operation
        }
      }, 1000); // 1 second delay
        } catch (error) {
      const language = user?.language || Language.INDONESIAN;
      
      logger.error('Error in tagall command', {
        userId: message.sender.id,
        groupId: message.chatId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      try {
        await client.reply(
          message.chatId,
          getText('tagall.error', language),
          message.id
        );
      } catch (replyError) {
        logger.error('Failed to send tagall error message', {
          userId: message.sender.id,
          groupId: message.chatId,
          error: replyError instanceof Error ? replyError.message : String(replyError)
        });
      }
    }
  },
};

/**
 * Check if user has permission to use tagall command
 * @param message - WhatsApp message object
 * @param user - User database object
 * @param client - WhatsApp client instance
 * @returns Boolean indicating permission status
 */
async function checkTagAllPermissions(message: Message, user: User, client: Client): Promise<boolean> {
  try {    // Check if user is admin in the group
    const isGroupAdmin = message.chat.groupMetadata?.participants
      ?.filter(p => p.isAdmin)
      .some(admin => String(admin.id) === String(message.sender.id)) || false;    // Check if user is bot owner
    const isOwnerFlag = isOwner(message.sender.id, config.ownerNumber);
    
    // Check if user has Admin level
    const isAdminLevel = user && user.level >= UserLevel.ADMIN;
      logger.debug(`Permission check for ${message.sender.id}`, {
      userId: message.sender.id,
      isGroupAdmin,
      isOwner: isOwnerFlag,
      isAdminLevel,
      groupId: message.chatId
    });
      // Allow usage by: group admins, bot owner, or users with Admin level
    if (!isGroupAdmin && !isOwnerFlag && !isAdminLevel) {
      const language = user?.language || Language.INDONESIAN;
      await client.reply(
        message.chatId,
        getText('tagall.admin_only', language),
        message.id
      );
      return false;
    }
      return true;
  } catch (error) {
    logger.error('Error checking tagall permissions', {
      userId: message.sender.id,
      groupId: message.chatId,
      error: error instanceof Error ? error.message : String(error)
    });
    return false;
  }
}

/**
 * Generate mentions string and IDs array from group members
 * @param groupMembers - Array of group participants
 * @param botNumber - Bot's own number to exclude from mentions
 * @param senderId - Sender's ID to exclude from mentions
 * @returns Object containing mentions string and mention IDs array
 */
function generateMentions(groupMembers: any[], botNumber?: string, senderId?: string): { mentions: string; mentionIds: string[] } {
  let mentions = '';
  const mentionIds: string[] = [];
  
  // Debug info
  logger.debug('Parameters for mention generation', {
    groupMemberCount: groupMembers.length,
    botNumber: botNumber,
    senderId: senderId
  });
  for (const member of groupMembers) {
    const memberId = String(member.id);
    
    // Normalize IDs for comparison using utility function
    const normalizedMemberId = getDisplayPhoneNumber(memberId);
    const normalizedBotNumber = botNumber ? getDisplayPhoneNumber(botNumber) : '';
    const normalizedSenderId = senderId ? getDisplayPhoneNumber(senderId) : '';
    
    // Skip the bot itself if botNumber is provided
    if (botNumber && normalizedMemberId === normalizedBotNumber) {
      logger.debug(`Skipping bot from mentions: ${memberId}`);
      continue;
    }
    
    // Skip the command sender if senderId is provided
    if (senderId && normalizedMemberId === normalizedSenderId) {
      logger.debug(`Skipping sender from mentions: ${memberId}`);
      continue;
    }
    
    mentions += `@${getDisplayPhoneNumber(memberId)} `;
    mentionIds.push(member.id);
  }
  
  return { mentions: mentions.trim(), mentionIds };
}

/**
 * Format the complete tag message with header and footer
 * @param customMessage - User's custom message
 * @param mentions - Generated mentions string
 * @param groupName - Name of the group
 * @param senderName - Name of the sender
 * @param senderId - ID of the sender for tagging
 * @param language - User's preferred language
 * @returns Formatted message string
 */
function formatTagMessage(customMessage: string, mentions: string, groupName?: string, senderName?: string, senderId?: string, language?: Language): string {
  const lang = language || Language.INDONESIAN;
  
  const timestamp = formatDateTime(new Date(), lang);
  const sender = senderName || getText('common.admin', lang);
  const group = groupName || getText('common.this_group', lang);
  
  // Normalize sender ID for tagging using utility function
  const normalizedSenderId = senderId ? getDisplayPhoneNumber(senderId) : null;
  const senderTag = normalizedSenderId ? `@${normalizedSenderId}` : sender;
  
  logger.debug('Formatting tag message', {
    sender,
    senderTag,
    senderId,
    normalizedSenderId,
    language: lang
  });
  
  return getText('tagall.header', lang, undefined, { group }) + '\n\n' +
    getText('tagall.message_label', lang) + ` ${customMessage}\n\n` +
    getText('tagall.from_label', lang) + ` ${sender} - ${senderTag}\n` +
    getText('tagall.time_label', lang) + ` ${timestamp}\n\n` +
    getText('tagall.members_label', lang) + `\n${mentions}\n\n` +
    getText('tagall.footer', lang);
}

export default tagall;
