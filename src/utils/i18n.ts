import { Language } from '../database/models/User';
import logger from './logger';

// Language definitions for multi-language support
interface LanguageData {
  [key: string]: {
    [Language.INDONESIAN]: string;
    [Language.ENGLISH]: string;
  };
}

// Define all translatable strings
const translations: LanguageData = {
  // Common responses
  'command.success': {
    [Language.INDONESIAN]: '✅ Perintah berhasil dijalankan!',
    [Language.ENGLISH]: '✅ Command executed successfully!'
  },
  'command.error': {
    [Language.INDONESIAN]: '❌ Terjadi kesalahan saat menjalankan perintah.',
    [Language.ENGLISH]: '❌ An error occurred while executing the command.'
  },
  'command.not_found': {
    [Language.INDONESIAN]: '❌ Perintah tidak ditemukan. Ketik !help untuk melihat daftar perintah.',
    [Language.ENGLISH]: '❌ Command not found. Type !help to see available commands.'
  },
  'user.not_registered': {
    [Language.INDONESIAN]: '⚠️ Anda belum terdaftar. Ketik !register untuk mendaftar.',
    [Language.ENGLISH]: '⚠️ You are not registered. Type !register to register.'
  },
  'user.no_permission': {
    [Language.INDONESIAN]: '🚫 Anda tidak memiliki izin untuk menggunakan perintah ini.',
    [Language.ENGLISH]: '🚫 You do not have permission to use this command.'
  },
  'user.limit_reached': {
    [Language.INDONESIAN]: '⏰ Anda telah mencapai batas penggunaan untuk fitur ini.',
    [Language.ENGLISH]: '⏰ You have reached the usage limit for this feature.'
  },
  
  // Registration
  'register.already_registered': {
    [Language.INDONESIAN]: 'ℹ️ Anda sudah terdaftar sebagai pengguna bot.',
    [Language.ENGLISH]: 'ℹ️ You are already registered as a bot user.'
  },
  'register.success': {
    [Language.INDONESIAN]: '🎉 Pendaftaran berhasil! Selamat datang di bot WhatsApp kami.',
    [Language.ENGLISH]: '🎉 Registration successful! Welcome to our WhatsApp bot.'
  },
  'register.error': {
    [Language.INDONESIAN]: '❌ Terjadi kesalahan saat mendaftarkan pengguna.',
    [Language.ENGLISH]: '❌ An error occurred while registering user.'
  },
  
  // Language settings
  'language.current': {
    [Language.INDONESIAN]: '🌐 Bahasa saat ini: Bahasa Indonesia',
    [Language.ENGLISH]: '🌐 Current language: English'
  },
  'language.changed.to_id': {
    [Language.INDONESIAN]: '✅ Bahasa berhasil diubah ke Bahasa Indonesia!',
    [Language.ENGLISH]: '✅ Language successfully changed to Indonesian!'
  },
  'language.changed.to_en': {
    [Language.INDONESIAN]: '✅ Bahasa berhasil diubah ke Bahasa Inggris!',
    [Language.ENGLISH]: '✅ Language successfully changed to English!'
  },
  'language.invalid': {
    [Language.INDONESIAN]: '❌ Bahasa tidak valid. Pilihan: id (Indonesia) atau en (English)',
    [Language.ENGLISH]: '❌ Invalid language. Options: id (Indonesian) or en (English)'
  },
  'language.help': {
    [Language.INDONESIAN]: '🌐 Gunakan: !language [id/en]\n• id = Bahasa Indonesia\n• en = English',
    [Language.ENGLISH]: '🌐 Usage: !language [id/en]\n• id = Indonesian\n• en = English'
  },
  
  // Help command
  'help.title': {
    [Language.INDONESIAN]: '🤖 Menu Bantuan',
    [Language.ENGLISH]: '🤖 Help Menu'
  },
  'help.status': {
    [Language.INDONESIAN]: '👤 Status',
    [Language.ENGLISH]: '👤 Status'
  },
  'help.not_registered': {
    [Language.INDONESIAN]: 'Belum Terdaftar',
    [Language.ENGLISH]: 'Not Registered'
  },
  'help.prefix': {
    [Language.INDONESIAN]: '🎯 Prefix',
    [Language.ENGLISH]: '🎯 Prefix'
  },
  'help.register_notice': {
    [Language.INDONESIAN]: '⚠️ Daftar dulu untuk akses penuh!\nKetik `!register` untuk mendaftar.',
    [Language.ENGLISH]: '⚠️ Register first for full access!\nType `!register` to register.'
  },
  'help.total_commands': {
    [Language.INDONESIAN]: '🔢 Total Perintah Tersedia',
    [Language.ENGLISH]: '🔢 Total Available Commands'
  },
  'help.tips': {
    [Language.INDONESIAN]: '💡 Tips',
    [Language.ENGLISH]: '💡 Tips'
  },
  'help.tip_detail': {
    [Language.INDONESIAN]: '• Ketik `!help [nama perintah]` untuk detail\n• Upgrade ke Premium untuk akses lebih banyak\n• Gunakan prefix ! sebelum perintah',
    [Language.ENGLISH]: '• Type `!help [command name]` for details\n• Upgrade to Premium for more access\n• Use prefix ! before commands'
  },
  'help.footer': {
    [Language.INDONESIAN]: '_Developed with ❤️ for better automation_',
    [Language.ENGLISH]: '_Developed with ❤️ for better automation_'
  },
  
  // User levels
  'level.free': {
    [Language.INDONESIAN]: 'Free',
    [Language.ENGLISH]: 'Free'
  },
  'level.premium': {
    [Language.INDONESIAN]: 'Premium',
    [Language.ENGLISH]: 'Premium'
  },
  'level.admin': {
    [Language.INDONESIAN]: 'Admin',
    [Language.ENGLISH]: 'Admin'
  },
  'level.owner': {
    [Language.INDONESIAN]: 'Owner',
    [Language.ENGLISH]: 'Owner'
  },  'level.unregistered': {
    [Language.INDONESIAN]: 'Belum Terdaftar',
    [Language.ENGLISH]: 'Unregistered'
  },

  // Profile command
  'profile.title': {
    [Language.INDONESIAN]: '👤 *PROFIL PENGGUNA*',
    [Language.ENGLISH]: '👤 *USER PROFILE*'
  },
  'profile.name': {
    [Language.INDONESIAN]: '📛 *Nama:*',
    [Language.ENGLISH]: '📛 *Name:*'
  },
  'profile.context_group': {
    [Language.INDONESIAN]: '📍 *Konteks:* Grup',
    [Language.ENGLISH]: '📍 *Context:* Group'
  },
  'profile.context_personal': {
    [Language.INDONESIAN]: '📍 *Konteks:* Chat Personal',
    [Language.ENGLISH]: '📍 *Context:* Personal Chat'
  },
  'profile.access_time': {
    [Language.INDONESIAN]: '🕐 *Waktu Akses:*',
    [Language.ENGLISH]: '🕐 *Access Time:*'
  },
  'profile.owner_status': {
    [Language.INDONESIAN]: '👑 *Status:* Bot Owner',
    [Language.ENGLISH]: '👑 *Status:* Bot Owner'
  },
  'profile.help_footer': {
    [Language.INDONESIAN]: '_Gunakan !help untuk melihat perintah yang tersedia_',
    [Language.ENGLISH]: '_Use !help to see available commands_'
  },
  'profile.error': {
    [Language.INDONESIAN]: 'Terjadi kesalahan saat mendapatkan profil pengguna.',
    [Language.ENGLISH]: 'An error occurred while getting user profile.'
  },
  'profile.database_error': {
    [Language.INDONESIAN]: 'Terjadi kesalahan database saat mengambil profil Anda.',
    [Language.ENGLISH]: 'A database error occurred while retrieving your profile.'
  },
  'profile.format_error': {
    [Language.INDONESIAN]: 'Terjadi kesalahan format data profil.',
    [Language.ENGLISH]: 'A profile data format error occurred.'
  },

  // Help command detailed messages
  'help.command_not_found': {
    [Language.INDONESIAN]: '❌ Perintah tidak ditemukan atau Anda tidak memiliki izin untuk mengaksesnya.',
    [Language.ENGLISH]: '❌ Command not found or you do not have permission to access it.'
  },
  'help.command_detail': {
    [Language.INDONESIAN]: '📋 *DETAIL PERINTAH*',
    [Language.ENGLISH]: '📋 *COMMAND DETAILS*'
  },
  'help.usage': {
    [Language.INDONESIAN]: '📝 *Penggunaan:*',
    [Language.ENGLISH]: '📝 *Usage:*'
  },
  'help.example': {
    [Language.INDONESIAN]: '💡 *Contoh:*',
    [Language.ENGLISH]: '💡 *Example:*'
  },
  'help.aliases': {
    [Language.INDONESIAN]: '🔗 *Alias:*',
    [Language.ENGLISH]: '🔗 *Aliases:*'
  },
  'help.level_required': {
    [Language.INDONESIAN]: '🔒 *Level Minimum:*',
    [Language.ENGLISH]: '🔒 *Minimum Level:*'
  },
  'help.cooldown': {
    [Language.INDONESIAN]: '⏱️ *Cooldown:*',
    [Language.ENGLISH]: '⏱️ *Cooldown:*'
  },
  'help.seconds': {
    [Language.INDONESIAN]: 'detik',
    [Language.ENGLISH]: 'seconds'
  },
  'help.category': {
    [Language.INDONESIAN]: '📂 *Kategori:*',
    [Language.ENGLISH]: '📂 *Category:*'
  },
  'help.commands': {
    [Language.INDONESIAN]: '⚡ *Perintah yang Tersedia:*',
    [Language.ENGLISH]: '⚡ *Available Commands:*'
  },

  // Limit command
  'limit.title': {
    [Language.INDONESIAN]: '📊 *STATUS BATAS PENGGUNAAN*',
    [Language.ENGLISH]: '📊 *USAGE LIMIT STATUS*'
  },
  'limit.daily_usage': {
    [Language.INDONESIAN]: '📈 *Penggunaan Harian:*',
    [Language.ENGLISH]: '📈 *Daily Usage:*'
  },
  'limit.monthly_usage': {
    [Language.INDONESIAN]: '📅 *Penggunaan Bulanan:*',
    [Language.ENGLISH]: '📅 *Monthly Usage:*'
  },
  'limit.next_reset': {
    [Language.INDONESIAN]: '🔄 *Reset Berikutnya:*',
    [Language.ENGLISH]: '🔄 *Next Reset:*'
  },
  'limit.upgrade_suggestion': {
    [Language.INDONESIAN]: '💡 _Upgrade ke Premium untuk limit lebih tinggi!_',
    [Language.ENGLISH]: '💡 _Upgrade to Premium for higher limits!_'
  },

  // Common terms
  'common.unknown': {
    [Language.INDONESIAN]: 'Tidak diketahui',
    [Language.ENGLISH]: 'Unknown'
  },
  'common.name_not_available': {
    [Language.INDONESIAN]: 'Nama tidak tersedia',
    [Language.ENGLISH]: 'Name not available'
  }
};

/**
 * Get translated text based on user's language preference
 * @param key - Translation key
 * @param language - User's preferred language
 * @param fallback - Fallback text if translation not found
 * @returns Translated text
 */
export function getText(key: string, language: Language = Language.INDONESIAN, fallback?: string): string {
  const translation = translations[key];
  
  if (!translation) {
    logger.warn('Translation key not found', {
      key: key,
      language: language,
      fallbackProvided: !!fallback
    });
    return fallback || key;
  }
  
  return translation[language] || translation[Language.INDONESIAN] || fallback || key;
}

/**
 * Get user level name in user's language
 * @param level - User level number
 * @param language - User's preferred language
 * @returns Translated level name
 */
export function getLevelName(level: number, language: Language = Language.INDONESIAN): string {
  switch (level) {
    case 0: return getText('level.unregistered', language);
    case 1: return getText('level.free', language);
    case 2: return getText('level.premium', language);
    case 3: return getText('level.admin', language);
    default: return getText('level.unregistered', language);
  }
}

/**
 * Check if language code is valid
 * @param lang - Language code to check
 * @returns True if valid
 */
export function isValidLanguage(lang: string): lang is Language {
  return Object.values(Language).includes(lang as Language);
}

/**
 * Get available languages list
 * @returns Array of available language codes
 */
export function getAvailableLanguages(): Language[] {
  return Object.values(Language);
}

export default {
  getText,
  getLevelName,
  isValidLanguage,
  getAvailableLanguages,
  Language
};
