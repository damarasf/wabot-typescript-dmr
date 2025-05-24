import { Message, Client } from '@open-wa/wa-automate';
import { parseCommand } from '../middlewares/commandParser';
import { getCommand } from './commandHandler';
import { Group } from '../database/models';
import * as userManager from '../utils/userManager';
import config from '../utils/config';

// Handle incoming message
export async function handleMessage(client: Client, message: Message): Promise<void> {
  try {
    // Ignore group messages where bot is mentioned but no command is given
    if (message.isGroupMsg && (message.body === '@bot' || message.body === '@' + config.botName)) {
      return;
    }
    
    // Parse the command
    const parsedCommand = await parseCommand(message);
    if (!parsedCommand) return;
    
    const { command: commandInfo, args, user } = parsedCommand;
    
    // Find the command in the handler
    const command = getCommand(commandInfo.name);
    if (!command) {
      console.warn(`Command not found in handler: ${commandInfo.name}`);
      return;
    }
    
    console.log(`Executing command: ${command.name} by ${message.sender.id}`);
    
    // Execute the command
    await command.execute(message, args, client, user);
  } catch (error) {
    console.error('Error handling message:', error);
    
    try {
      await client.reply(
        message.chatId, 
        '❌ Terjadi kesalahan saat memproses perintah. Silakan coba lagi nanti.', 
        message.id
      );
    } catch (replyError) {
      console.error('Error sending error reply:', replyError);
    }
  }
}

// Handle group join event
export async function handleGroupJoin(client: Client, groupId: string, groupName: string): Promise<void> {
  try {
    // Check if group already exists in database
    const existingGroup = await Group.findOne({ where: { groupId } });
      if (!existingGroup) {
      // Create new group record (removed name field)
      await Group.create({
        groupId,
        joinedAt: new Date(),
        isActive: true,
      });
      
      console.log(`Joined new group: ${groupName} (${groupId})`);
    } else if (!existingGroup.isActive) {      // Update group if it was previously inactive (removed name update)
      existingGroup.isActive = true;
      await existingGroup.save();
      
      console.log(`Rejoined group: ${groupName} (${groupId})`);
    }
      // Send welcome message
    await client.sendText(
      groupId as any,
      `Halo! Saya adalah *${config.botName}*\n\nTerima kasih telah mengundang saya ke grup ini. Untuk melihat daftar perintah, ketik *!help*`
    );
  } catch (error) {
    console.error('Error handling group join:', error);
  }
}

// Handle group leave event
export async function handleGroupLeave(client: Client, groupId: string): Promise<void> {
  try {
    // Update group status in database
    const group = await Group.findOne({ where: { groupId } });
      if (group) {
      group.isActive = false;
      await group.save();
      
      console.log(`Left group: (${groupId})`);
    }
  } catch (error) {
    console.error('Error handling group leave:', error);
  }
}

// Handle call event
export async function handleCall(client: Client, callerId: string): Promise<void> {
  if (!config.antiCall) return;
    try {
    await client.sendText(
      callerId as any, 
      'Maaf, bot tidak dapat menerima panggilan telepon atau video call. Silakan kirim pesan teks saja.'
    );
    
    console.log(`Rejected call from: ${callerId}`);
  } catch (error) {
    console.error('Error handling call:', error);
  }
}

export default {
  handleMessage,
  handleGroupJoin,
  handleGroupLeave,
  handleCall,
};
