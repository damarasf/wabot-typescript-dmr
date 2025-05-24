import { Message, Client } from '@open-wa/wa-automate';
import { User, UserLevel, FeatureType } from '../database/models';
import { Command } from '../middlewares/commandParser';
import * as userManager from '../utils/userManager';
import config from '../utils/config';
import logger from '../utils/logger';

/**
 * Tag All Command
 * Mentions all members in a group with permission and limit checks
 * Features admin-only access, spam prevention, and usage tracking
 */
const tagall: Command = {
  name: 'tagall',
  aliases: ['everyone', 'all', 'semua'],
  description: 'Menandai semua anggota grup',
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
   */  async execute(message: Message, args: string[], client: Client, user?: User): Promise<void> {
    try {
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
          '❌ Perintah ini hanya dapat digunakan di dalam grup.\n\n' +
          '_Silakan gunakan perintah ini dalam grup WhatsApp._',
          message.id
        );
        return;
      }
      
      // Validate user registration
      if (!user) {
        logger.user(`Unregistered user ${message.sender.id} attempted tagall`);
        await client.reply(
          message.chatId,
          '❌ Anda belum terdaftar.\n\n' +
          '*Silakan daftar dengan perintah* `!register` *terlebih dahulu.*',
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
          `⚠️ *Batas Penggunaan Tercapai*\n\n` +
          `📊 *Tag All:* ${limitInfo.currentUsage}/${limitInfo.maxUsage}\n\n` +
          `⏰ *Reset:* Otomatis setiap hari\n` +
          `💎 *Solusi:* Upgrade ke Premium untuk limit lebih tinggi`,
          message.id
        );
        return;
      }
      
      // Get group information
      const groupMetadata = message.chat.groupMetadata;
      if (!groupMetadata) {
        logger.error('Could not retrieve group metadata', { chatId: message.chatId });
        await client.reply(
          message.chatId,
          '❌ Tidak dapat mengambil informasi grup.\n\n' +
          '_Silakan coba lagi nanti._',
          message.id
        );
        return;
      }
        const groupMembers = groupMetadata.participants || [];
      
      // Get group name from chat object or use fallback
      let groupName: string;
      try {
        groupName = message.chat.name || message.chat.contact?.name || 'Unknown Group';
      } catch {
        groupName = 'Unknown Group';      }
      
      logger.info(`Found ${groupMembers.length} members in group ${groupName}`, {
        groupId: message.chatId,
        memberCount: groupMembers.length,
        groupName
      });
      
      // Validate group has members
      if (groupMembers.length === 0) {
        await client.reply(
          message.chatId,
          '⚠️ Tidak ada anggota grup yang ditemukan.',
          message.id
        );
        return;
      }
      
      // Generate tag message
      const customMessage = args.length > 0 ? args.join(' ') : 'Perhatian semua anggota grup!';
      const { mentions, mentionIds } = generateMentions(groupMembers);
      
      // Create comprehensive tag message
      const finalMessage = formatTagMessage(customMessage, mentions, groupName, message.sender.pushname);
      
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
            `✅ *Tag All Berhasil*\n\n` +
            `👥 *Ditag:* ${mentionIds.length} anggota\n` +
            `📊 *Penggunaan:* ${limitInfo.currentUsage + 1}/${limitInfo.maxUsage}\n` +
            `⏰ *Waktu:* ${new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })}`,
            message.id
          );        } catch (confirmError) {
          logger.error('Failed to send confirmation message', {
            userId: message.sender.id,
            groupId: message.chatId,
            error: confirmError instanceof Error ? confirmError.message : String(confirmError)
          });
          // Don't fail the whole operation
        }
      }, 1000); // 1 second delay
      
    } catch (error) {
      logger.error('Error in tagall command', {
        userId: message.sender.id,
        groupId: message.chatId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Enhanced error handling
      let errorMessage = 'Terjadi kesalahan saat menandai semua anggota grup.';
      
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          errorMessage = 'Tidak memiliki izin untuk menandai semua anggota.';
        } else if (error.message.includes('limit')) {
          errorMessage = 'Batas penggunaan fitur tag all telah tercapai.';
        } else if (error.message.includes('group')) {
          errorMessage = 'Terjadi kesalahan saat mengakses informasi grup.';
        }
        logger.debug('TagAll error details', {
          message: error.message,
          userId: message.sender.id
        });
      }
      
      try {
        await client.reply(
          message.chatId,
          `❌ ${errorMessage}\n\n_Silakan coba lagi nanti atau hubungi administrator._`,
          message.id        );
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
  try {
    // Check if user is admin in the group
    const isGroupAdmin = message.chat.groupMetadata?.participants
      ?.filter(p => p.isAdmin)
      .some(admin => String(admin.id) === String(message.sender.id)) || false;
    
    // Check if user is bot owner
    const isOwner = String(message.sender.id) === config.ownerNumber;
    
    // Check if user has Admin level
    const isAdminLevel = user && user.level >= UserLevel.ADMIN;
    
    logger.debug(`Permission check for ${message.sender.id}`, {
      userId: message.sender.id,
      isGroupAdmin,
      isOwner,
      isAdminLevel,
      groupId: message.chatId
    });
    
    // Allow usage by: group admins, bot owner, or users with Admin level
    if (!isGroupAdmin && !isOwner && !isAdminLevel) {
      await client.reply(
        message.chatId,
        '🚫 *Akses Ditolak*\n\n' +
        'Perintah ini hanya dapat digunakan oleh:\n' +
        '• Admin grup\n' +
        '• Owner bot\n' +
        '• Pengguna dengan level Admin\n\n' +
        '_Hubungi administrator untuk upgrade level._',
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
 * @returns Object containing mentions string and mention IDs array
 */
function generateMentions(groupMembers: any[]): { mentions: string; mentionIds: string[] } {
  let mentions = '';
  const mentionIds: string[] = [];
  
  for (const member of groupMembers) {
    const memberId = String(member.id);
    mentions += `@${memberId.replace('@c.us', '')} `;
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
 * @returns Formatted message string
 */
function formatTagMessage(customMessage: string, mentions: string, groupName?: string, senderName?: string): string {
  const timestamp = new Date().toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta'
  });
  
  const sender = senderName || 'Admin';
  const group = groupName || 'Grup ini';
  
  return `📢 *TAG ALL - ${group}*\n\n` +
    `💬 *Pesan:* ${customMessage}\n\n` +
    `👤 *Dari:* ${sender}\n` +
    `🕐 *Waktu:* ${timestamp}\n\n` +
    `👥 *Anggota yang ditag:*\n${mentions}\n\n` +
    `_Pesan ini dikirim menggunakan fitur Tag All_`;
}

export default tagall;
