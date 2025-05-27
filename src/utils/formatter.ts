import { UserLevel, Language } from '../database/models';
import { getText, getLevelName, getCommandDescription } from './i18n';
import config from './config';

// Create formatted help message for a command
export function formatHelpCommand(command: any, language: Language = Language.INDONESIAN): string {
  const { name, description, usage, example, minimumLevel, groupOnly, ownerOnly, adminOnly } = command;

  let helpText = `*${name}*\n`;
  helpText += `${getCommandDescription(name, language)}\n\n`;

  helpText += `*${getText('help.usage', language)}*\n${usage}\n\n`;

  if (example) {
    helpText += `*${getText('help.example', language)}*\n${example}\n\n`;
  }
  // Add restrictions
  const restrictions = [];

  if (ownerOnly) {
    restrictions.push(getText('formatter.owner_only', language));
  } else if (adminOnly) {
    restrictions.push(getText('formatter.admin_only', language));
  } else if (minimumLevel) {
    switch (minimumLevel) {
      case UserLevel.FREE:
        restrictions.push(getText('formatter.minimum_free', language));
        break;
      case UserLevel.PREMIUM:
        restrictions.push(getText('formatter.minimum_premium', language));
        break;
      case UserLevel.ADMIN:
        restrictions.push(getText('formatter.minimum_admin', language));
        break;
    }
  }

  if (groupOnly) {
    restrictions.push(getText('formatter.group_only', language));
  }

  if (restrictions.length > 0) {
    const restrictionLabel = getText('formatter.restrictions_label', language);
    helpText += `*${restrictionLabel}:* ${restrictions.join(', ')}\n`;
  }

  return helpText;
}

// Format message with simple header
export function formatBox(title: string, content: string): string {
  return `*${title}*\n\n${content}`;
}

// Format user information
export function formatUserInfo(user: any, language: Language = Language.INDONESIAN): string {
  let levelName = getText('formatter.unknown_level', language);
  
  switch (user.level) {
    case UserLevel.UNREGISTERED:
      levelName = getText('formatter.level_unregistered', language);
      break;
    case UserLevel.FREE:
      levelName = getText('formatter.level_free', language);
      break;
    case UserLevel.PREMIUM:
      levelName = getText('formatter.level_premium', language);
      break;
    case UserLevel.ADMIN:
      levelName = getText('formatter.level_admin', language);
      break;
  }
  
  // Special handling for owner
  if (user.phoneNumber === config.ownerNumber) {
    levelName = getText('formatter.level_owner', language);
  }
  
  // Format registration date
  const registeredDate = new Date(user.registeredAt).toLocaleDateString(
    language === Language.INDONESIAN ? 'id-ID' : 'en-US', 
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );
  
  // Create the formatted user info
  let userInfo = `${getText('formatter.phone_number', language)} ${user.phoneNumber}\n`;
  userInfo += `${getText('formatter.level_label', language)} ${levelName}\n`;
  userInfo += `${getText('formatter.registered_date', language)} ${registeredDate}\n`;
    // Note: Custom limits are now per-feature basis, check usage stats for specific limits
  
  return `*${getText('formatter.user_profile_title', language)}*\n\n${userInfo}`;
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
