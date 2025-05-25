import { UserLevel } from '../database/models';
import config from './config';

// Create formatted help message for a command
export function formatHelpCommand(command: any): string {
  const { name, description, usage, example, minimumLevel, groupOnly, ownerOnly, adminOnly } = command;
  
  let helpText = `*${name}*\n`;
  helpText += `${description}\n\n`;
  
  helpText += `*Penggunaan:*\n${usage}\n\n`;
  
  if (example) {
    helpText += `*Contoh:*\n${example}\n\n`;
  }
  
  // Add restrictions
  const restrictions = [];
  
  if (ownerOnly) {
    restrictions.push('Hanya Owner');
  } else if (adminOnly) {
    restrictions.push('Hanya Admin');
  } else if (minimumLevel) {
    switch (minimumLevel) {
      case UserLevel.FREE:
        restrictions.push('Minimal Free User');
        break;
      case UserLevel.PREMIUM:
        restrictions.push('Minimal Premium User');
        break;
      case UserLevel.ADMIN:
        restrictions.push('Minimal Admin');
        break;
    }
  }
  
  if (groupOnly) {
    restrictions.push('Hanya dalam Group');
  }
  
  if (restrictions.length > 0) {
    helpText += `*Batasan:* ${restrictions.join(', ')}\n`;
  }
  
  return helpText;
}

// Format message with simple header
export function formatBox(title: string, content: string): string {
  return `*${title}*\n\n${content}`;
}

// Format user information
export function formatUserInfo(user: any): string {
  let levelName = 'Unknown';
  
  switch (user.level) {
    case UserLevel.UNREGISTERED:
      levelName = 'Belum Terdaftar';
      break;
    case UserLevel.FREE:
      levelName = 'Free User';
      break;
    case UserLevel.PREMIUM:
      levelName = 'Premium User';
      break;
    case UserLevel.ADMIN:
      levelName = 'Admin';
      break;
  }
  
  // Special handling for owner
  if (user.phoneNumber === config.ownerNumber) {
    levelName = 'Owner';
  }
  
  // Format registration date
  const registeredDate = new Date(user.registeredAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  // Create the formatted user info
  let userInfo = `📱 *Nomor:* ${user.phoneNumber}\n`;
  userInfo += `🏅 *Level:* ${levelName}\n`;
  userInfo += `📆 *Terdaftar Pada:* ${registeredDate}\n`;
    // Note: Custom limits are now per-feature basis, check usage stats for specific limits
  
  return `*📋 Profil Pengguna*\n\n${userInfo}`;
}

// Format number with thousand separator
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export default {
  formatHelpCommand,
  formatBox,
  formatUserInfo,
  formatNumber,
};
