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
  // Formatter translations for help command restrictions
  'formatter.owner_only': {
    [Language.INDONESIAN]: 'Hanya Owner',
    [Language.ENGLISH]: 'Owner Only'
  },
  'formatter.admin_only': {
    [Language.INDONESIAN]: 'Hanya Admin',
    [Language.ENGLISH]: 'Admin Only'
  },
  'formatter.minimum_free': {
    [Language.INDONESIAN]: 'Minimal Free User',
    [Language.ENGLISH]: 'Minimum Free User'
  },
  'formatter.minimum_premium': {
    [Language.INDONESIAN]: 'Minimal Premium User',
    [Language.ENGLISH]: 'Minimum Premium User'
  },
  'formatter.minimum_admin': {
    [Language.INDONESIAN]: 'Minimal Admin',
    [Language.ENGLISH]: 'Minimum Admin'
  },
  'formatter.group_only': {
    [Language.INDONESIAN]: 'Hanya dalam Group',
    [Language.ENGLISH]: 'Group Only'
  },
  'formatter.restrictions_label': {
    [Language.INDONESIAN]: 'Batasan',
    [Language.ENGLISH]: 'Restrictions'
  },

  // Formatter translations for user info
  'formatter.user_profile_title': {
    [Language.INDONESIAN]: '📋 Profil Pengguna',
    [Language.ENGLISH]: '📋 User Profile'
  },
  'formatter.phone_number': {
    [Language.INDONESIAN]: '📱 *Nomor:*',
    [Language.ENGLISH]: '📱 *Number:*'
  },
  'formatter.level_label': {
    [Language.INDONESIAN]: '🏅 *Level:*',
    [Language.ENGLISH]: '🏅 *Level:*'
  },
  'formatter.registered_date': {
    [Language.INDONESIAN]: '📆 *Terdaftar Pada:*',
    [Language.ENGLISH]: '📆 *Registered On:*'
  },
  'formatter.level_unregistered': {
    [Language.INDONESIAN]: 'Belum Terdaftar',
    [Language.ENGLISH]: 'Unregistered'
  },
  'formatter.level_free': {
    [Language.INDONESIAN]: 'Free User',
    [Language.ENGLISH]: 'Free User'
  },
  'formatter.level_premium': {
    [Language.INDONESIAN]: 'Premium User',
    [Language.ENGLISH]: 'Premium User'
  },
  'formatter.level_admin': {
    [Language.INDONESIAN]: 'Admin',
    [Language.ENGLISH]: 'Admin'
  },
  'formatter.level_owner': {
    [Language.INDONESIAN]: 'Owner',
    [Language.ENGLISH]: 'Owner'
  },
  'formatter.unknown_level': {
    [Language.INDONESIAN]: 'Unknown',
    [Language.ENGLISH]: 'Unknown'
  },

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
  
  // Register command additional translations
  'register.unknown_date': {
    [Language.INDONESIAN]: 'Tidak diketahui',
    [Language.ENGLISH]: 'Unknown'
  },
  'register.level_label': {
    [Language.INDONESIAN]: 'Level',
    [Language.ENGLISH]: 'Level'
  },
  'register.registered_since': {
    [Language.INDONESIAN]: 'Terdaftar sejak',
    [Language.ENGLISH]: 'Registered since'
  },
  'register.tips_profile': {
    [Language.INDONESIAN]: 'Tips: Gunakan `!profile` untuk melihat informasi lengkap akun Anda.',
    [Language.ENGLISH]: 'Tips: Use `!profile` to view your complete account information.'
  },

  // Register welcome message
  'register.welcome_title': {
    [Language.INDONESIAN]: '🎉 *Pendaftaran Berhasil!*',
    [Language.ENGLISH]: '🎉 *Registration Successful!*'
  },
  'register.welcome_greeting': {
    [Language.INDONESIAN]: 'Selamat datang *{displayName}*! Anda telah berhasil terdaftar sebagai pengguna {botName}.',
    [Language.ENGLISH]: 'Welcome *{displayName}*! You have been successfully registered as a user of {botName}.'
  },
  'register.account_info_title': {
    [Language.INDONESIAN]: '📋 *Informasi Akun:*',
    [Language.ENGLISH]: '📋 *Account Information:*'
  },
  'register.phone_number_label': {
    [Language.INDONESIAN]: '📱 *Nomor:*',
    [Language.ENGLISH]: '📱 *Number:*'
  },
  'register.level_info_label': {
    [Language.INDONESIAN]: '🏷️ *Level:*',
    [Language.ENGLISH]: '🏷️ *Level:*'
  },
  'register.registered_date_label': {
    [Language.INDONESIAN]: '📅 *Terdaftar:*',
    [Language.ENGLISH]: '📅 *Registered:*'
  },
  'register.features_title': {
    [Language.INDONESIAN]: '🚀 *Fitur yang Tersedia:*',
    [Language.ENGLISH]: '🚀 *Available Features:*'
  },
  'register.feature_basic_commands': {
    [Language.INDONESIAN]: '• Akses ke semua perintah dasar',
    [Language.ENGLISH]: '• Access to all basic commands'
  },
  'register.feature_n8n_integration': {
    [Language.INDONESIAN]: '• Integrasi dengan N8N workflows',
    [Language.ENGLISH]: '• Integration with N8N workflows'
  },
  'register.feature_reminder_settings': {
    [Language.INDONESIAN]: '• Pengaturan reminder',
    [Language.ENGLISH]: '• Reminder settings'
  },
  'register.feature_more': {
    [Language.INDONESIAN]: '• Dan masih banyak lagi!',
    [Language.ENGLISH]: '• And much more!'
  },
  'register.help_tip': {
    [Language.INDONESIAN]: '💡 *Tips:* Ketik `!help` untuk melihat semua perintah yang tersedia.',
    [Language.ENGLISH]: '💡 *Tips:* Type `!help` to see all available commands.'
  },

  // Register follow-up message
  'register.next_steps_title': {
    [Language.INDONESIAN]: '🎯 *Langkah Selanjutnya:*',
    [Language.ENGLISH]: '🎯 *Next Steps:*'
  },
  'register.step_help': {
    [Language.INDONESIAN]: '1️⃣ Ketik `!help` untuk melihat semua perintah',
    [Language.ENGLISH]: '1️⃣ Type `!help` to see all commands'
  },
  'register.step_profile': {
    [Language.INDONESIAN]: '2️⃣ Ketik `!profile` untuk melihat profil Anda',
    [Language.ENGLISH]: '2️⃣ Type `!profile` to see your profile'
  },
  'register.step_limit': {
    [Language.INDONESIAN]: '3️⃣ Ketik `!limit` untuk cek batas penggunaan',
    [Language.ENGLISH]: '3️⃣ Type `!limit` to check usage limits'
  },
  'register.premium_promotion_title': {
    [Language.INDONESIAN]: '💎 *Ingin upgrade ke Premium?*',
    [Language.ENGLISH]: '💎 *Want to upgrade to Premium?*'
  },
  'register.premium_promotion_text': {
    [Language.INDONESIAN]: 'Hubungi administrator untuk mendapatkan akses Premium dengan fitur lebih lengkap!',
    [Language.ENGLISH]: 'Contact administrator to get Premium access with more complete features!'
  },
  'register.welcome_closing': {
    [Language.INDONESIAN]: '_Selamat menggunakan {botName}! 🎉_',
    [Language.ENGLISH]: '_Welcome to {botName}! 🎉_'
  },

  // Register error messages
  'register.general_error': {
    [Language.INDONESIAN]: 'Terjadi kesalahan saat mendaftarkan pengguna.',
    [Language.ENGLISH]: 'An error occurred while registering user.'
  },
  'register.duplicate_error': {
    [Language.INDONESIAN]: 'Anda sudah terdaftar dalam sistem.',
    [Language.ENGLISH]: 'You are already registered in the system.'
  },
  'register.database_error': {
    [Language.INDONESIAN]: 'Terjadi kesalahan database saat pendaftaran.',
    [Language.ENGLISH]: 'A database error occurred during registration.'
  },
  'register.validation_error': {
    [Language.INDONESIAN]: 'Data pendaftaran tidak valid.',
    [Language.ENGLISH]: 'Registration data is not valid.'
  },
  'register.error_footer': {
    [Language.INDONESIAN]: '_Silakan coba lagi nanti atau hubungi administrator._',
    [Language.ENGLISH]: '_Please try again later or contact administrator._'
  },
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
  },  'language.help': {
    [Language.INDONESIAN]: '🌐 Gunakan: !language [id/en]\n• id = Bahasa Indonesia\n• en = English',
    [Language.ENGLISH]: '🌐 Usage: !language [id/en]\n• id = Indonesian\n• en = English'
  },
  'language.info_text': {
    [Language.INDONESIAN]: '📱 Semua respon bot sekarang akan menggunakan Bahasa Indonesia.\n💡 Ketik !help untuk melihat menu dalam bahasa baru.',
    [Language.ENGLISH]: '📱 All bot responses will now use English.\n💡 Type !help to see the menu in your new language.'
  },
  'language.settings_title': {
    [Language.INDONESIAN]: '🌐 Pengaturan Bahasa',
    [Language.ENGLISH]: '🌐 Language Settings'
  },
  'language.error': {
    [Language.INDONESIAN]: '❌ Terjadi kesalahan saat mengubah bahasa. Silakan coba lagi nanti.',
    [Language.ENGLISH]: '❌ An error occurred while changing language. Please try again later.'
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
  'limit.info_title': {
    [Language.INDONESIAN]: '*📊 INFORMASI LIMIT*',
    [Language.ENGLISH]: '*📊 LIMIT INFORMATION*'
  },
  'limit.user_label': {
    [Language.INDONESIAN]: '👤 *Pengguna:*',
    [Language.ENGLISH]: '👤 *User:*'
  },
  'limit.level_label': {
    [Language.INDONESIAN]: '🏆 *Level:*',
    [Language.ENGLISH]: '🏆 *Level:*'
  },
  'limit.owner_suffix': {
    [Language.INDONESIAN]: ' (Owner)',
    [Language.ENGLISH]: ' (Owner)'
  },
  'limit.admin_suffix': {
    [Language.INDONESIAN]: ' (Unlimited)',
    [Language.ENGLISH]: ' (Unlimited)'
  },
  'limit.registered_label': {
    [Language.INDONESIAN]: '📅 *Terdaftar:*',
    [Language.ENGLISH]: '📅 *Registered:*'
  },
  'limit.usage_section_title': {
    [Language.INDONESIAN]: '\n📊 *LIMIT PENGGUNAAN*\n\n',
    [Language.ENGLISH]: '\n📊 *USAGE LIMITS*\n\n'
  },
  'limit.feature_n8n': {
    [Language.INDONESIAN]: 'N8N Workflow',
    [Language.ENGLISH]: 'N8N Workflow'
  },
  'limit.feature_reminder': {
    [Language.INDONESIAN]: 'Pengingat',
    [Language.ENGLISH]: 'Reminder'
  },
  'limit.feature_tag_all': {
    [Language.INDONESIAN]: 'Tag All Member',
    [Language.ENGLISH]: 'Tag All Members'
  },
  'limit.type_owner': {
    [Language.INDONESIAN]: 'Owner',
    [Language.ENGLISH]: 'Owner'
  },
  'limit.type_admin': {
    [Language.INDONESIAN]: 'Admin',
    [Language.ENGLISH]: 'Admin'
  },
  'limit.type_custom': {
    [Language.INDONESIAN]: 'Custom',
    [Language.ENGLISH]: 'Custom'
  },
  'limit.type_premium': {
    [Language.INDONESIAN]: 'Premium',
    [Language.ENGLISH]: 'Premium'
  },
  'limit.type_free': {
    [Language.INDONESIAN]: 'Free',
    [Language.ENGLISH]: 'Free'
  },
  'limit.reset_auto_label': {
    [Language.INDONESIAN]: '⏱️ *Reset Otomatis:*',
    [Language.ENGLISH]: '⏱️ *Auto Reset:*'
  },
  'limit.reset_time_format': {
    [Language.INDONESIAN]: '{hours}h lagi (00:00 WIB)',
    [Language.ENGLISH]: '{hours}h remaining (00:00 WIB)'
  },
  'limit.upgrade_title': {
    [Language.INDONESIAN]: '\n💎 *Ingin limit lebih tinggi?*\n',
    [Language.ENGLISH]: '\n💎 *Want higher limits?*\n'
  },
  'limit.upgrade_text': {
    [Language.INDONESIAN]: 'Hubungi admin untuk upgrade ke Premium!',
    [Language.ENGLISH]: 'Contact admin to upgrade to Premium!'
  },
  'limit.tips_title': {
    [Language.INDONESIAN]: '\n\n💡 *Tips:*\n',
    [Language.ENGLISH]: '\n\n💡 *Tips:*\n'
  },
  'limit.tip_use_wisely': {
    [Language.INDONESIAN]: '• Gunakan fitur secara bijak\n',
    [Language.ENGLISH]: '• Use features wisely\n'
  },
  'limit.tip_daily_reset': {
    [Language.INDONESIAN]: '• Limit direset setiap hari\n',
    [Language.ENGLISH]: '• Limits reset daily\n'
  },
  'limit.tip_upgrade': {
    [Language.INDONESIAN]: '• Upgrade untuk akses lebih luas',
    [Language.ENGLISH]: '• Upgrade for broader access'
  },
  'limit.error_general': {
    [Language.INDONESIAN]: 'Terjadi kesalahan saat mendapatkan informasi limit.',
    [Language.ENGLISH]: 'An error occurred while getting limit information.'
  },
  'limit.error_database': {
    [Language.INDONESIAN]: 'Kesalahan database saat mengambil data penggunaan.',
    [Language.ENGLISH]: 'Database error while retrieving usage data.'
  },
  'limit.error_user': {
    [Language.INDONESIAN]: 'Data pengguna tidak valid atau tidak ditemukan.',
    [Language.ENGLISH]: 'User data is invalid or not found.'
  },
  'limit.error_footer': {
    [Language.INDONESIAN]: '\n\n_Silakan coba lagi nanti atau hubungi administrator._',
    [Language.ENGLISH]: '\n\n_Please try again later or contact administrator._'
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
  // N8N command
  'n8n.not_registered': {
    [Language.INDONESIAN]: '❌ Anda belum terdaftar. Silakan daftar dengan perintah *!register* terlebih dahulu.',
    [Language.ENGLISH]: '❌ You are not registered yet. Please register with the command *!register* first.'
  },
  'n8n.limit_reached': {
    [Language.INDONESIAN]: '⚠️ Anda telah mencapai batas penggunaan fitur N8N ({currentUsage}/{maxUsage}).\n\nSilakan tunggu hingga limit direset atau upgrade ke Premium untuk mendapatkan limit lebih tinggi.',
    [Language.ENGLISH]: '⚠️ You have reached the N8N feature usage limit ({currentUsage}/{maxUsage}).\n\nPlease wait until the limit resets or upgrade to Premium for higher limits.'
  },
  'n8n.workflow_id_empty': {
    [Language.INDONESIAN]: '❌ Workflow ID tidak boleh kosong. Contoh: `!n8n translate Hello World`',
    [Language.ENGLISH]: '❌ Workflow ID cannot be empty. Example: `!n8n translate Hello World`'
  },
  'n8n.config_missing': {
    [Language.INDONESIAN]: '❌ Konfigurasi N8N belum lengkap. Hubungi administrator.',
    [Language.ENGLISH]: '❌ N8N configuration is incomplete. Contact administrator.'
  },
  'n8n.executing': {
    [Language.INDONESIAN]: '🔄 Menjalankan workflow N8N...',
    [Language.ENGLISH]: '🔄 Executing N8N workflow...'
  },
  'n8n.success': {
    [Language.INDONESIAN]: '✅ *Workflow N8N Berhasil*\n\n📋 *Hasil:*\n{result}',
    [Language.ENGLISH]: '✅ *N8N Workflow Success*\n\n📋 *Result:*\n{result}'
  },
  'n8n.error': {
    [Language.INDONESIAN]: '❌ Terjadi kesalahan saat menjalankan workflow N8N:\n{error}',
    [Language.ENGLISH]: '❌ An error occurred while executing N8N workflow:\n{error}'
  },

  // Reminder command
  'reminder.not_registered': {
    [Language.INDONESIAN]: '❌ Anda belum terdaftar. Silakan daftar dengan perintah *!register* terlebih dahulu.',
    [Language.ENGLISH]: '❌ You are not registered yet. Please register with the command *!register* first.'
  },
  'reminder.limit_reached': {
    [Language.INDONESIAN]: '⚠️ Anda telah mencapai batas pembuatan pengingat ({currentUsage}/{maxUsage}).\n\nSilakan tunggu hingga limit direset atau upgrade ke Premium.',
    [Language.ENGLISH]: '⚠️ You have reached the reminder creation limit ({currentUsage}/{maxUsage}).\n\nPlease wait until the limit resets or upgrade to Premium.'
  },
  'reminder.invalid_time_format': {
    [Language.INDONESIAN]: '❌ Format waktu tidak valid.\n\n*Format yang didukung:*\n• `30s` = 30 detik\n• `10m` = 10 menit\n• `2h` = 2 jam\n• `1d` = 1 hari\n\n*Contoh:* `!reminder 30m Jangan lupa makan siang`',
    [Language.ENGLISH]: '❌ Invalid time format.\n\n*Supported formats:*\n• `30s` = 30 seconds\n• `10m` = 10 minutes\n• `2h` = 2 hours\n• `1d` = 1 day\n\n*Example:* `!reminder 30m Don\'t forget lunch`'
  },
  'reminder.time_too_short': {
    [Language.INDONESIAN]: '❌ Waktu pengingat terlalu singkat. Minimal 30 detik.',
    [Language.ENGLISH]: '❌ Reminder time is too short. Minimum 30 seconds.'
  },
  'reminder.time_too_long': {
    [Language.INDONESIAN]: '❌ Waktu pengingat terlalu lama. Maksimal 30 hari.',
    [Language.ENGLISH]: '❌ Reminder time is too long. Maximum 30 days.'
  },
  'reminder.created': {
    [Language.INDONESIAN]: '✅ *Pengingat Berhasil Dibuat*\n\n📝 *Pesan:* {message}\n⏰ *Waktu:* {time}\n📍 *Konteks:* {context}',
    [Language.ENGLISH]: '✅ *Reminder Successfully Created*\n\n📝 *Message:* {message}\n⏰ *Time:* {time}\n📍 *Context:* {context}'
  },  'reminder.error': {
    [Language.INDONESIAN]: '❌ Terjadi kesalahan saat membuat pengingat.',
    [Language.ENGLISH]: '❌ An error occurred while creating reminder.'
  },
  'reminder.message_too_long': {
    [Language.INDONESIAN]: '❌ Pesan pengingat terlalu panjang. Maksimal 500 karakter.',
    [Language.ENGLISH]: '❌ Reminder message is too long. Maximum 500 characters.'
  },
  'reminder.group_context': {
    [Language.INDONESIAN]: 'grup ini',
    [Language.ENGLISH]: 'this group'
  },
  'reminder.personal_context': {
    [Language.INDONESIAN]: 'Anda secara personal',
    [Language.ENGLISH]: 'you personally'
  },

  // TagAll command
  'tagall.not_registered': {
    [Language.INDONESIAN]: '❌ Anda belum terdaftar. Silakan daftar dengan perintah *!register* terlebih dahulu.',
    [Language.ENGLISH]: '❌ You are not registered yet. Please register with the command *!register* first.'
  },
  'tagall.limit_reached': {
    [Language.INDONESIAN]: '⚠️ Anda telah mencapai batas penggunaan tag all ({currentUsage}/{maxUsage}).\n\nSilakan tunggu hingga limit direset atau upgrade ke Premium.',
    [Language.ENGLISH]: '⚠️ You have reached the tag all usage limit ({currentUsage}/{maxUsage}).\n\nPlease wait until the limit resets or upgrade to Premium.'
  },
  'tagall.admin_only': {
    [Language.INDONESIAN]: '🚫 Perintah ini hanya dapat digunakan oleh admin grup atau level Admin bot ke atas.',
    [Language.ENGLISH]: '🚫 This command can only be used by group admins or bot Admin level and above.'
  },
  'tagall.no_message': {
    [Language.INDONESIAN]: '👥 *Tag All Members*\n\n_Semua anggota grup telah ditandai_',
    [Language.ENGLISH]: '👥 *Tag All Members*\n\n_All group members have been tagged_'
  },
  'tagall.with_message': {
    [Language.INDONESIAN]: '👥 *Tag All Members*\n\n📢 *Pesan:* {message}\n\n_Semua anggota grup telah ditandai_',
    [Language.ENGLISH]: '👥 *Tag All Members*\n\n📢 *Message:* {message}\n\n_All group members have been tagged_'
  },  'tagall.error': {
    [Language.INDONESIAN]: '❌ Terjadi kesalahan saat melakukan tag all.',
    [Language.ENGLISH]: '❌ An error occurred while performing tag all.'
  },
  'tagall.group_only': {
    [Language.INDONESIAN]: '❌ Perintah ini hanya dapat digunakan di grup.',
    [Language.ENGLISH]: '❌ This command can only be used in groups.'
  },
  'tagall.no_metadata': {
    [Language.INDONESIAN]: '❌ Tidak dapat mengambil informasi grup.',
    [Language.ENGLISH]: '❌ Could not retrieve group information.'
  },
  'tagall.no_members': {
    [Language.INDONESIAN]: '❌ Grup ini tidak memiliki anggota.',
    [Language.ENGLISH]: '❌ This group has no members.'
  },
  'tagall.default_message': {
    [Language.INDONESIAN]: 'Perhatian untuk semua anggota grup!',
    [Language.ENGLISH]: 'Attention to all group members!'
  },
  'tagall.success': {
    [Language.INDONESIAN]: '✅ Berhasil menandai {count} anggota grup.\n\n📊 Penggunaan: {current}/{max}\n🕐 Waktu: {time}',
    [Language.ENGLISH]: '✅ Successfully tagged {count} group members.\n\n📊 Usage: {current}/{max}\n🕐 Time: {time}'
  },
  'tagall.header': {
    [Language.INDONESIAN]: '📢 *TAG ALL - {group}*',
    [Language.ENGLISH]: '📢 *TAG ALL - {group}*'
  },
  'tagall.message_label': {
    [Language.INDONESIAN]: '💬 *Pesan:*',
    [Language.ENGLISH]: '💬 *Message:*'
  },
  'tagall.from_label': {
    [Language.INDONESIAN]: '👤 *Dari:*',
    [Language.ENGLISH]: '👤 *From:*'
  },
  'tagall.time_label': {
    [Language.INDONESIAN]: '🕐 *Waktu:*',
    [Language.ENGLISH]: '🕐 *Time:*'
  },
  'tagall.members_label': {
    [Language.INDONESIAN]: '👥 *Anggota yang ditag:*',
    [Language.ENGLISH]: '👥 *Tagged members:*'
  },
  'tagall.footer': {
    [Language.INDONESIAN]: '_Pesan ini dikirim menggunakan fitur Tag All_',
    [Language.ENGLISH]: '_This message was sent using the Tag All feature_'
  },

  // SetLimit command
  'setlimit.access_denied': {
    [Language.INDONESIAN]: '🚫 *Akses Ditolak*\n\nPerintah ini hanya dapat digunakan oleh:\n• Owner bot\n• Pengguna dengan level Admin\n\n_Hubungi administrator untuk upgrade level._',
    [Language.ENGLISH]: '🚫 *Access Denied*\n\nThis command can only be used by:\n• Bot owner\n• Users with Admin level\n\n_Contact administrator for level upgrade._'
  },
  'setlimit.invalid_user_format': {
    [Language.INDONESIAN]: '❌ *Format Pengguna Tidak Valid*\n\nGunakan salah satu format berikut:\n• Tag pengguna: `@628123456789`\n• Nomor telepon: `628123456789`\n• Reply pesan pengguna target\n\n*Contoh:* `!setlimit @628123456789 n8n 100`',
    [Language.ENGLISH]: '❌ *Invalid User Format*\n\nUse one of the following formats:\n• Tag user: `@628123456789`\n• Phone number: `628123456789`\n• Reply to target user message\n\n*Example:* `!setlimit @628123456789 n8n 100`'
  },
  'setlimit.user_not_found': {
    [Language.INDONESIAN]: '❌ *Pengguna Tidak Ditemukan*\n\nPengguna dengan nomor `{phoneNumber}` tidak terdaftar dalam sistem bot.\n\n💡 *Tip:* Pastikan pengguna sudah melakukan registrasi dengan perintah `!register`',
    [Language.ENGLISH]: '❌ *User Not Found*\n\nUser with number `{phoneNumber}` is not registered in the bot system.\n\n💡 *Tip:* Make sure the user has registered with the `!register` command'
  },
  'setlimit.feature_missing': {
    [Language.INDONESIAN]: '❌ *Feature Tidak Disebutkan*\n\nFormat: `!setlimit @user [feature] [jumlah]`\n\n*Feature yang tersedia:*\n• `n8n` - Workflow N8N\n• `reminder` - Pengingat\n• `tag_all` - Tag All Member\n\n*Contoh:* `!setlimit @user n8n 100`',
    [Language.ENGLISH]: '❌ *Feature Not Specified*\n\nFormat: `!setlimit @user [feature] [amount]`\n\n*Available features:*\n• `n8n` - N8N Workflow\n• `reminder` - Reminders\n• `tag_all` - Tag All Members\n\n*Example:* `!setlimit @user n8n 100`'
  },
  'setlimit.invalid_feature': {
    [Language.INDONESIAN]: '❌ *Fitur Tidak Valid*\n\nFitur `{feature}` tidak tersedia.\n\n*Fitur yang didukung:*\n• `n8n` - Workflow N8N\n• `reminder` - Pengingat\n• `tag_all` - Tag All Member\n\n*Contoh:* `!setlimit @user n8n 100`',
    [Language.ENGLISH]: '❌ *Invalid Feature*\n\nFeature `{feature}` is not available.\n\n*Supported features:*\n• `n8n` - N8N Workflow\n• `reminder` - Reminders\n• `tag_all` - Tag All Members\n\n*Example:* `!setlimit @user n8n 100`'
  },
  'setlimit.amount_missing': {
    [Language.INDONESIAN]: '❌ *Jumlah Limit Tidak Disebutkan*\n\nFormat: `!setlimit @user [feature] [jumlah]`\n\n*Contoh:* `!setlimit @user n8n 100`\n\n_Gunakan angka positif untuk limit baru._',
    [Language.ENGLISH]: '❌ *Limit Amount Not Specified*\n\nFormat: `!setlimit @user [feature] [amount]`\n\n*Example:* `!setlimit @user n8n 100`\n\n_Use positive numbers for new limit._'
  },
  'setlimit.invalid_amount': {
    [Language.INDONESIAN]: '❌ *Jumlah Tidak Valid*\n\n`{amount}` bukan angka yang valid.\n\n*Contoh yang benar:*\n• `!setlimit @user n8n 100`\n• `!setlimit @user reminder 50`\n• `!setlimit @user tag_all 20`',
    [Language.ENGLISH]: '❌ *Invalid Amount*\n\n`{amount}` is not a valid number.\n\n*Correct examples:*\n• `!setlimit @user n8n 100`\n• `!setlimit @user reminder 50`\n• `!setlimit @user tag_all 20`'
  },
  'setlimit.negative_limit': {
    [Language.INDONESIAN]: '❌ *Limit Tidak Valid*\n\nJumlah limit harus berupa angka positif atau nol.\n\n*Tips:*\n• Gunakan `0` untuk menonaktifkan fitur\n• Gunakan angka positif untuk limit baru\n• Maksimum yang disarankan: 1000',
    [Language.ENGLISH]: '❌ *Invalid Limit*\n\nLimit amount must be a positive number or zero.\n\n*Tips:*\n• Use `0` to disable feature\n• Use positive numbers for new limit\n• Recommended maximum: 1000'
  },
  'setlimit.high_limit_warning': {
    [Language.INDONESIAN]: '⚠️ *Limit Sangat Tinggi*\n\nLimit {limit} untuk {feature} sangat tinggi.\n\n*Apakah Anda yakin ingin melanjutkan?*\n• Kirim `!setlimit @user {featureArg} {limit} CONFIRM`\n• Atau gunakan limit yang lebih rendah\n\n_Limit tinggi dapat mempengaruhi performa bot._',
    [Language.ENGLISH]: '⚠️ *Very High Limit*\n\nLimit {limit} for {feature} is very high.\n\n*Are you sure you want to continue?*\n• Send `!setlimit @user {featureArg} {limit} CONFIRM`\n• Or use a lower limit\n\n_High limits may affect bot performance._'
  },
  'setlimit.set_failed': {
    [Language.INDONESIAN]: '❌ *Gagal Mengatur Limit*\n\nTerjadi kesalahan saat memperbarui limit pengguna.\n\n_Silakan coba lagi atau periksa log untuk detail error._',
    [Language.ENGLISH]: '❌ *Failed to Set Limit*\n\nAn error occurred while updating user limit.\n\n_Please try again or check logs for error details._'
  },
  'setlimit.invalid_limit': {
    [Language.INDONESIAN]: '❌ *Limit Tidak Valid*\n\nLimit harus berupa angka bulat positif atau 0.\n\n*Contoh:*\n• `!setlimit @user n8n 100` (set limit 100)\n• `!setlimit @user n8n 0` (unlimited)',
    [Language.ENGLISH]: '❌ *Invalid Limit*\n\nLimit must be a positive integer or 0.\n\n*Examples:*\n• `!setlimit @user n8n 100` (set limit 100)\n• `!setlimit @user n8n 0` (unlimited)'
  },
  'setlimit.success': {
    [Language.INDONESIAN]: '✅ *Limit Berhasil Diatur*\n\n👤 *Pengguna:* {userName} ({phoneNumber})\n🔧 *Fitur:* {feature}\n📊 *Limit Baru:* {limit}\n📈 *Penggunaan Saat Ini:* {currentUsage}',
    [Language.ENGLISH]: '✅ *Limit Successfully Set*\n\n👤 *User:* {userName} ({phoneNumber})\n🔧 *Feature:* {feature}\n📊 *New Limit:* {limit}\n📈 *Current Usage:* {currentUsage}'
  },
  'setlimit.error': {
    [Language.INDONESIAN]: '❌ Terjadi kesalahan saat mengatur limit.',
    [Language.ENGLISH]: '❌ An error occurred while setting limit.'
  },

  // User notification for limit changes
  'setlimit.user_notification': {
    [Language.INDONESIAN]: '⚙️ *Limit Penggunaan Diperbarui*\n\n🔧 *Feature:* {feature}\n📊 *Limit Baru:* {limit}\n📈 *Penggunaan Saat Ini:* {currentUsage}\n\n{statusMessage}\n\n_Perubahan oleh: Administrator {botName}_',
    [Language.ENGLISH]: '⚙️ *Usage Limit Updated*\n\n🔧 *Feature:* {feature}\n📊 *New Limit:* {limit}\n📈 *Current Usage:* {currentUsage}\n\n{statusMessage}\n\n_Changed by: Administrator {botName}_'
  },
  'setlimit.disabled_message': {
    [Language.INDONESIAN]: '⚠️ *Fitur ini telah dinonaktifkan untuk Anda*\n\n_Hubungi administrator jika ada pertanyaan._',
    [Language.ENGLISH]: '⚠️ *This feature has been disabled for you*\n\n_Contact administrator if you have questions._'
  },
  'setlimit.increased_message': {
    [Language.INDONESIAN]: '🎉 *Limit Anda telah ditingkatkan!*\n\n_Nikmati akses yang lebih luas._',
    [Language.ENGLISH]: '🎉 *Your limit has been increased!*\n\n_Enjoy broader access._'
  },
  'setlimit.reset_message': {
    [Language.INDONESIAN]: '📝 *Limit Anda telah diatur ulang*\n\n_Gunakan dengan bijak._',
    [Language.ENGLISH]: '📝 *Your limit has been reset*\n\n_Use it wisely._'
  },

  // ResetLimit command
  'resetlimit.access_denied': {
    [Language.INDONESIAN]: '🚫 *Akses Ditolak*\n\nPerintah ini hanya dapat digunakan oleh:\n• Owner bot\n• Pengguna dengan level Admin\n\n_Hubungi administrator untuk upgrade level._',
    [Language.ENGLISH]: '🚫 *Access Denied*\n\nThis command can only be used by:\n• Bot owner\n• Users with Admin level\n\n_Contact administrator for level upgrade._'
  },
  'resetlimit.invalid_target': {
    [Language.INDONESIAN]: '❌ *Target Tidak Valid*\n\nGunakan salah satu format berikut:\n• `all` - Reset semua pengguna\n• `@628123456789` - Reset pengguna tertentu\n• `628123456789` - Reset berdasarkan nomor\n• Reply pesan pengguna target\n\n*Contoh:*\n• `!resetlimit all`\n• `!resetlimit @628123456789`',
    [Language.ENGLISH]: '❌ *Invalid Target*\n\nUse one of the following formats:\n• `all` - Reset all users\n• `@628123456789` - Reset specific user\n• `628123456789` - Reset by number\n• Reply to target user message\n\n*Examples:*\n• `!resetlimit all`\n• `!resetlimit @628123456789`'
  },
  'resetlimit.confirm_all': {
    [Language.INDONESIAN]: '⚠️ *Konfirmasi Reset Semua*\n\nAnda akan mereset limit penggunaan untuk **SEMUA PENGGUNA**.\n\nTindakan ini tidak dapat dibatalkan!\n\nKetik `!resetlimit all confirm` untuk melanjutkan.',
    [Language.ENGLISH]: '⚠️ *Confirm Reset All*\n\nYou are about to reset usage limits for **ALL USERS**.\n\nThis action cannot be undone!\n\nType `!resetlimit all confirm` to continue.'
  },
  'resetlimit.help': {
    [Language.INDONESIAN]: '*📋 Reset Limit - Panduan*\n\n🎯 *Pilih Mode Reset:*\n\n🌍 `resetlimit all` - Reset semua pengguna\n👤 `resetlimit @user` - Reset pengguna yang ditag\n📱 `resetlimit 628123456789` - Reset berdasarkan nomor\n\n⚠️ *Peringatan:*\n• Mode "all" akan mereset SEMUA pengguna\n• Operasi ini TIDAK DAPAT dibatalkan\n• Gunakan dengan hati-hati\n\n💡 *Tips:* Tag pengguna untuk reset individual',
    [Language.ENGLISH]: '*📋 Reset Limit - Guide*\n\n🎯 *Choose Reset Mode:*\n\n🌍 `resetlimit all` - Reset all users\n👤 `resetlimit @user` - Reset mentioned user\n📱 `resetlimit 628123456789` - Reset by number\n\n⚠️ *Warning:*\n• "all" mode will reset ALL users\n• This operation cannot be undone\n• Use with caution\n\n💡 *Tips:* Mention user for individual reset'
  },
  'resetlimit.no_data': {
    [Language.INDONESIAN]: '*📊 Reset Info*\n\n🔍 *Status Database:*\n\n✨ Tidak ada data usage untuk direset\n📈 Database sudah bersih\n\n👥 Total pengguna: {totalUsers}\n⏰ Waktu cek: {currentTime}',
    [Language.ENGLISH]: '*📊 Reset Info*\n\n🔍 *Database Status:*\n\n✨ No usage data to reset\n📈 Database is already clean\n\n👥 Total users: {totalUsers}\n⏰ Check time: {currentTime}'
  },
  'resetlimit.all_warning': {
    [Language.INDONESIAN]: '*⚠️ Konfirmasi Reset ALL*\n\n🚨 *PERINGATAN PENTING!*\n\n📊 *Data yang akan dihapus:*\n• {totalUsages} data usage\n• Dari {totalUsers} pengguna terdaftar\n\n❌ *Operasi ini TIDAK DAPAT dibatalkan!*\n\n⏰ Proses reset akan dimulai dalam 10 detik...\n💬 Balas "CANCEL" untuk membatalkan',
    [Language.ENGLISH]: '*⚠️ Confirm Reset ALL*\n\n🚨 *IMPORTANT WARNING!*\n\n📊 *Data to be deleted:*\n• {totalUsages} usage data\n• From {totalUsers} registered users\n\n❌ *This operation CANNOT be undone!*\n\n⏰ Reset process will start in 10 seconds...\n💬 Reply "CANCEL" to cancel'
  },
  'resetlimit.processing_all': {
    [Language.INDONESIAN]: '*🔄 Memproses Reset*\n\n⏳ *Sedang mereset semua data...*\n\n🔄 Menghapus data usage...\n📊 Memperbarui statistik...\n\n⏰ Mohon tunggu sebentar...',
    [Language.ENGLISH]: '*🔄 Processing Reset*\n\n⏳ *Resetting all data...*\n\n🔄 Deleting usage data...\n📊 Updating statistics...\n\n⏰ Please wait a moment...'
  },
  'resetlimit.all_success': {
    [Language.INDONESIAN]: '*✅ Reset Berhasil*\n\n🎉 *Reset ALL Selesai!*\n\n📊 *Statistik Reset:*\n• Data usage dihapus: {resetCount}\n• Pengguna terpengaruh: {totalUsers}\n• Waktu proses: {processingTime}s\n\n⏰ *Waktu reset:* {currentTime}\n👑 *Admin:* @{adminPhone}\n\n✨ Semua pengguna kini dapat menggunakan fitur kembali!',
    [Language.ENGLISH]: '*✅ Reset Successful*\n\n🎉 *Reset ALL Complete!*\n\n📊 *Reset Statistics:*\n• Usage data deleted: {resetCount}\n• Users affected: {totalUsers}\n• Processing time: {processingTime}s\n\n⏰ *Reset time:* {currentTime}\n👑 *Admin:* @{adminPhone}\n\n✨ All users can now use features again!'
  },
  'resetlimit.processing_mentions': {
    [Language.INDONESIAN]: '*🔄 Memproses Reset*\n\n⏳ *Sedang memproses {mentionCount} pengguna...*\n\n🔍 Mencari data pengguna...\n🗑️ Menghapus data usage...\n\n⏰ Mohon tunggu sebentar...',
    [Language.ENGLISH]: '*🔄 Processing Reset*\n\n⏳ *Processing {mentionCount} users...*\n\n🔍 Searching user data...\n🗑️ Deleting usage data...\n\n⏰ Please wait a moment...'
  },
  'resetlimit.mentions_success': {
    [Language.INDONESIAN]: '*📊 Hasil Reset Mention*\n\n🎉 *Reset Selesai!*\n\n{resultMessage}',
    [Language.ENGLISH]: '*📊 Mention Reset Result*\n\n🎉 *Reset Complete!*\n\n{resultMessage}'
  },
  'resetlimit.success_users': {
    [Language.INDONESIAN]: '✅ *Berhasil Reset ({count}):*\n{results}',
    [Language.ENGLISH]: '✅ *Successfully Reset ({count}):*\n{results}'
  },
  'resetlimit.not_found_users': {
    [Language.INDONESIAN]: '⚠️ *Tidak Ditemukan ({count}):*\n{results}',
    [Language.ENGLISH]: '⚠️ *Not Found ({count}):*\n{results}'
  },
  'resetlimit.summary': {
    [Language.INDONESIAN]: '📊 *Ringkasan:*\n• Total diproses: {total}\n• Berhasil: {success}\n• Gagal: {failed}\n• Waktu proses: {processingTime}s\n\n⏰ *Waktu:* {currentTime}',
    [Language.ENGLISH]: '📊 *Summary:*\n• Total processed: {total}\n• Successful: {success}\n• Failed: {failed}\n• Processing time: {processingTime}s\n\n⏰ *Time:* {currentTime}'
  },
  'resetlimit.phone_success': {
    [Language.INDONESIAN]: '*✅ Reset Berhasil*\n\n🎉 *Reset Selesai!*\n\n👤 *Pengguna:* {displayName}\n📱 *Nomor:* {phoneNumber}\n🗑️ *Data dihapus:* {usageCount} usage\n\n📊 *Detail:*\n• Waktu proses: {processingTime}s\n• Status: Limit direset\n\n⏰ *Waktu:* {currentTime}\n\n✨ Pengguna dapat menggunakan fitur kembali!',
    [Language.ENGLISH]: '*✅ Reset Successful*\n\n🎉 *Reset Complete!*\n\n👤 *User:* {displayName}\n📱 *Number:* {phoneNumber}\n🗑️ *Data deleted:* {usageCount} usage\n\n📊 *Details:*\n• Processing time: {processingTime}s\n• Status: Limit reset\n\n⏰ *Time:* {currentTime}\n\n✨ User can use features again!'
  },
  'resetlimit.phone_not_found': {
    [Language.INDONESIAN]: '*❌ Pengguna Tidak Ditemukan*\n\n🔍 *Nomor:* {phoneNumber}\n\n⚠️ *Kemungkinan Penyebab:*\n• Nomor belum terdaftar di bot\n• Format nomor tidak valid\n• Pengguna belum pernah menggunakan bot\n\n💡 *Tips:*\n• Pastikan nomor benar: {phoneNumber}\n• Pengguna harus register terlebih dahulu\n• Gunakan format: resetlimit @user untuk mention',
    [Language.ENGLISH]: '*❌ User Not Found*\n\n🔍 *Number:* {phoneNumber}\n\n⚠️ *Possible Causes:*\n• Number not registered in bot\n• Invalid number format\n• User never used the bot\n\n💡 *Tips:*\n• Make sure number is correct: {phoneNumber}\n• User must register first\n• Use format: resetlimit @user for mention'
  },
  'resetlimit.invalid_format': {
    [Language.INDONESIAN]: '*❌ Format Tidak Valid*\n\n📋 *Format yang benar:*\n\n🌍 `resetlimit all` - Reset semua pengguna\n👤 `resetlimit @user` - Reset dengan mention\n📱 `resetlimit 628123456789` - Reset dengan nomor\n\n⚠️ *Contoh Nomor:*\n• 628123456789 (dengan kode negara)\n• 08123456789 (akan otomatis dikonversi)\n\n💡 *Tips:*\n• Mention lebih akurat daripada nomor\n• Pastikan pengguna sudah terdaftar\n• Gunakan "all" dengan hati-hati',
    [Language.ENGLISH]: '*❌ Invalid Format*\n\n📋 *Correct format:*\n\n🌍 `resetlimit all` - Reset all users\n👤 `resetlimit @user` - Reset with mention\n📱 `resetlimit 628123456789` - Reset with number\n\n⚠️ *Number Examples:*\n• 628123456789 (with country code)\n• 08123456789 (will be auto-converted)\n\n💡 *Tips:*\n• Mention is more accurate than number\n• Make sure user is registered\n• Use "all" with caution'
  },
  'resetlimit.error_detailed': {
    [Language.INDONESIAN]: '*❌ Terjadi Kesalahan*\n\n🚨 *Error saat reset limit!*\n\n⚠️ *Detail Error:*\n• {errorMessage}\n\n🔄 *Solusi:*\n• Coba lagi dalam beberapa saat\n• Pastikan format command benar\n• Laporkan ke owner jika terus error\n\n⏰ *Waktu error:* {currentTime}',
    [Language.ENGLISH]: '*❌ Error Occurred*\n\n🚨 *Error during limit reset!*\n\n⚠️ *Error Details:*\n• {errorMessage}\n\n🔄 *Solutions:*\n• Try again in a moment\n• Make sure command format is correct\n• Report to owner if error persists\n\n⏰ *Error time:* {currentTime}'
  },
  'resetlimit.success': {
    [Language.INDONESIAN]: '✅ Reset limit berhasil untuk {target}.',
    [Language.ENGLISH]: '✅ Limit reset successful for {target}.'
  },
  'resetlimit.user_not_found': {
    [Language.INDONESIAN]: '❌ *Pengguna Tidak Ditemukan*\n\nPengguna dengan nomor `{phoneNumber}` tidak terdaftar dalam sistem bot.',
    [Language.ENGLISH]: '❌ *User Not Found*\n\nUser with number `{phoneNumber}` is not registered in the bot system.'
  },
  'resetlimit.user_success': {
    [Language.INDONESIAN]: '✅ *Reset Limit Berhasil*\n\n👤 *Pengguna:* {userName} ({phoneNumber})\n🔄 Semua limit penggunaan telah direset\n⏰ Waktu reset: {time}',
    [Language.ENGLISH]: '✅ *Limit Reset Successful*\n\n👤 *User:* {userName} ({phoneNumber})\n🔄 All usage limits have been reset\n⏰ Reset time: {time}'
  },  'resetlimit.error': {
    [Language.INDONESIAN]: '*❌ Terjadi Kesalahan*\n\n🚨 *Error saat reset limit!*\n\n⚠️ *Detail Error:*\n• {errorMessage}\n\n🔄 *Solusi:*\n• Coba lagi dalam beberapa saat\n• Pastikan format command benar\n• Laporkan ke owner jika terus error\n\n⏰ *Waktu error:* {currentTime}',
    [Language.ENGLISH]: '*❌ Error Occurred*\n\n🚨 *Error during limit reset!*\n\n⚠️ *Error Details:*\n• {errorMessage}\n\n🔄 *Solutions:*\n• Try again in a moment\n• Make sure command format is correct\n• Report to owner if error persists\n\n⏰ *Error time:* {currentTime}'
  },  'resetlimit.not_registered': {
    [Language.INDONESIAN]: 'tidak terdaftar',
    [Language.ENGLISH]: 'not registered'
  },
  'resetlimit.mentions_result_header': {
    [Language.INDONESIAN]: '*📊 Hasil Reset Mention*\n\n🎉 *Reset Selesai!*',
    [Language.ENGLISH]: '*📊 Mention Reset Result*\n\n🎉 *Reset Complete!*'
  },
  'resetlimit.mentions_result_success': {
    [Language.INDONESIAN]: '✅ *Berhasil Reset ({resetCount}):*\n{resetResults}',
    [Language.ENGLISH]: '✅ *Successfully Reset ({resetCount}):*\n{resetResults}'
  },
  'resetlimit.mentions_result_not_found': {
    [Language.INDONESIAN]: '⚠️ *Tidak Ditemukan ({notFoundCount}):*\n{notFoundUsers}',
    [Language.ENGLISH]: '⚠️ *Not Found ({notFoundCount}):*\n{notFoundUsers}'
  },  'resetlimit.mentions_result_summary': {
    [Language.INDONESIAN]: '📊 *Ringkasan:*\n• Total diproses: {totalProcessed}\n• Berhasil: {resetCount}\n• Gagal: {notFoundCount}\n• Waktu proses: {processingTime}s\n\n⏰ *Waktu:* {currentTime}',
    [Language.ENGLISH]: '📊 *Summary:*\n• Total processed: {totalProcessed}\n• Successful: {resetCount}\n• Failed: {notFoundCount}\n• Processing time: {processingTime}s\n\n⏰ *Time:* {currentTime}'
  },
  
  // Upgrade command
  'upgrade.access_denied': {
    [Language.INDONESIAN]: '❌ Anda tidak memiliki izin untuk menggunakan perintah ini.\n\n_Hanya admin dan owner yang dapat mengupgrade pengguna._',
    [Language.ENGLISH]: '❌ You do not have permission to use this command.\n\n_Only admin and owner can upgrade users._'
  },
  'upgrade.invalid_target': {
    [Language.INDONESIAN]: '❌ Silakan tag pengguna yang ingin di-upgrade atau masukkan nomor telepon.\n\n*Cara penggunaan:*\n• `upgrade @user` (tag pengguna)\n• `upgrade 6281234567890` (nomor telepon)',
    [Language.ENGLISH]: '❌ Please tag the user you want to upgrade or enter a phone number.\n\n*Usage:*\n• `upgrade @user` (tag user)\n• `upgrade 6281234567890` (phone number)'
  },
  'upgrade.user_not_found': {
    [Language.INDONESIAN]: '❌ Pengguna belum terdaftar dalam sistem.\n\n_Pengguna harus melakukan registrasi terlebih dahulu dengan perintah register_',
    [Language.ENGLISH]: '❌ User is not registered in the system.\n\n_User must register first with the register command_'
  },
  'upgrade.already_premium': {
    [Language.INDONESIAN]: '⚠️ Pengguna ini sudah memiliki level {levelName} atau lebih tinggi.\n\n📊 *Level saat ini:* {levelName}',
    [Language.ENGLISH]: '⚠️ This user already has {levelName} level or higher.\n\n📊 *Current level:* {levelName}'
  },
  'upgrade.self_upgrade_denied': {
    [Language.INDONESIAN]: '❌ Anda tidak dapat mengupgrade level diri sendiri.',
    [Language.ENGLISH]: '❌ You cannot upgrade your own level.'
  },
  'upgrade.upgrade_failed': {
    [Language.INDONESIAN]: '❌ Terjadi kesalahan saat mengupgrade pengguna.\n\n_Silakan coba lagi atau hubungi administrator sistem._',
    [Language.ENGLISH]: '❌ An error occurred while upgrading user.\n\n_Please try again or contact system administrator._'
  },
  'upgrade.success_with_mention': {
    [Language.INDONESIAN]: '✅ Berhasil mengupgrade @{targetPhone} ke level Premium!\n\n👤 *Target:* {targetName}\n👑 *Diupgrade oleh:* {adminName}\n🕐 *Waktu:* {currentTime}',
    [Language.ENGLISH]: '✅ Successfully upgraded @{targetPhone} to Premium level!\n\n👤 *Target:* {targetName}\n👑 *Upgraded by:* {adminName}\n🕐 *Time:* {currentTime}'
  },
  'upgrade.success_without_mention': {
    [Language.INDONESIAN]: '✅ Berhasil mengupgrade pengguna {targetPhone} ke level Premium!\n\n👑 *Diupgrade oleh:* {adminName}\n🕐 *Waktu:* {currentTime}',
    [Language.ENGLISH]: '✅ Successfully upgraded user {targetPhone} to Premium level!\n\n👑 *Upgraded by:* {adminName}\n🕐 *Time:* {currentTime}'
  },
  'upgrade.user_notification': {
    [Language.INDONESIAN]: '🎉 *Selamat! Level Akun Upgraded!*\n\n📈 Level akun Anda telah diupgrade menjadi *Premium*!\n\n✨ *Keuntungan Premium:*\n• Limit penggunaan lebih tinggi untuk semua fitur\n• Akses prioritas ke fitur baru\n• Dukungan teknis yang lebih baik\n\n👑 *Diupgrade oleh:* {adminName}\n🕐 *Waktu:* {currentTime}\n\n_Terima kasih telah menggunakan bot kami!_',
    [Language.ENGLISH]: '🎉 *Congratulations! Account Level Upgraded!*\n\n📈 Your account level has been upgraded to *Premium*!\n\n✨ *Premium Benefits:*\n• Higher usage limits for all features\n• Priority access to new features\n• Better technical support\n\n👑 *Upgraded by:* {adminName}\n🕐 *Time:* {currentTime}\n\n_Thank you for using our bot!_'
  },
  'upgrade.general_error': {
    [Language.INDONESIAN]: '❌ Terjadi kesalahan saat mengupgrade pengguna.\n\n_Silakan coba lagi nanti atau hubungi administrator._',
    [Language.ENGLISH]: '❌ An error occurred while upgrading user.\n\n_Please try again later or contact administrator._'
  },
  'upgrade.database_error': {
    [Language.INDONESIAN]: '❌ Terjadi kesalahan database saat mengupgrade pengguna.\n\n_Silakan coba lagi nanti atau hubungi administrator._',
    [Language.ENGLISH]: '❌ Database error occurred while upgrading user.\n\n_Please try again later or contact administrator._'
  },
  'upgrade.validation_error': {
    [Language.INDONESIAN]: '❌ Data pengguna tidak valid untuk diupgrade.\n\n_Silakan coba lagi nanti atau hubungi administrator._',
    [Language.ENGLISH]: '❌ User data is not valid for upgrade.\n\n_Please try again later or contact administrator._'
  },
  'upgrade.permission_error': {
    [Language.INDONESIAN]: '❌ Tidak memiliki izin untuk mengupgrade pengguna ini.\n\n_Silakan coba lagi nanti atau hubungi administrator._',
    [Language.ENGLISH]: '❌ No permission to upgrade this user.\n\n_Please try again later or contact administrator._'
  },
  
  // Common level names
  'common.level_premium': {
    [Language.INDONESIAN]: 'Premium',
    [Language.ENGLISH]: 'Premium'
  },  'common.level_admin': {
    [Language.INDONESIAN]: 'Admin',
    [Language.ENGLISH]: 'Admin'
  },
  
  // SetAdmin command
  'setadmin.access_denied': {
    [Language.INDONESIAN]: '❌ Anda tidak memiliki izin untuk menggunakan perintah ini.\n\n_Hanya owner yang dapat mengatur admin._',
    [Language.ENGLISH]: '❌ You do not have permission to use this command.\n\n_Only owner can set admin._'
  },
  'setadmin.invalid_target': {
    [Language.INDONESIAN]: '❌ Silakan tag pengguna atau masukkan nomor telepon yang ingin dijadikan admin.\n\n*Cara penggunaan:*\n• `setadmin @user` (tag pengguna)\n• `setadmin 6281234567890` (nomor telepon)',
    [Language.ENGLISH]: '❌ Please tag a user or enter phone number to make admin.\n\n*Usage:*\n• `setadmin @user` (tag user)\n• `setadmin 6281234567890` (phone number)'
  },
  'setadmin.owner_already_admin': {
    [Language.INDONESIAN]: '⚠️ Owner sudah memiliki hak akses tertinggi.',
    [Language.ENGLISH]: '⚠️ Owner already has the highest access level.'
  },
  'setadmin.user_not_found': {
    [Language.INDONESIAN]: '❌ Pengguna belum terdaftar dalam sistem.\n\n_Pengguna harus melakukan registrasi terlebih dahulu._',
    [Language.ENGLISH]: '❌ User is not registered in the system.\n\n_User must register first._'
  },
  'setadmin.already_admin': {
    [Language.INDONESIAN]: '⚠️ {userName} ({phoneNumber}) sudah memiliki level Admin atau lebih tinggi.\n\n📊 *Level saat ini:* {currentLevel}',
    [Language.ENGLISH]: '⚠️ {userName} ({phoneNumber}) already has Admin level or higher.\n\n📊 *Current level:* {currentLevel}'
  },
  'setadmin.update_failed': {
    [Language.INDONESIAN]: '❌ Gagal memperbarui level pengguna ke Admin.\n\n_Silakan coba lagi atau hubungi support._',
    [Language.ENGLISH]: '❌ Failed to update user level to Admin.\n\n_Please try again or contact support._'
  },
  'setadmin.success': {
    [Language.INDONESIAN]: '✅ Berhasil menjadikan {userName} sebagai Admin!\n\n👤 *Pengguna:* {userName}\n📱 *Nomor:* {phoneNumber}\n📈 *Level sebelumnya:* {previousLevel}\n🚀 *Level baru:* Admin\n🕐 *Waktu:* {currentTime}\n\n🎉 Selamat! Pengguna ini sekarang memiliki akses Admin.',
    [Language.ENGLISH]: '✅ Successfully made {userName} an Admin!\n\n👤 *User:* {userName}\n📱 *Number:* {phoneNumber}\n📈 *Previous level:* {previousLevel}\n🚀 *New level:* Admin\n🕐 *Time:* {currentTime}\n\n🎉 Congratulations! This user now has Admin access.'
  },
  'setadmin.user_notification': {
    [Language.INDONESIAN]: '🎉 *Selamat! Anda telah menjadi Admin!*\n\n📈 Level akun Anda telah diupgrade menjadi *Admin* oleh Owner.\n\n✨ *Hak Akses Admin:*\n• Mengelola pengguna dan level mereka\n• Mengakses fitur khusus admin\n• Reset limit penggunaan pengguna\n• Broadcast pesan ke semua pengguna\n• Akses ke semua perintah bot\n\n🤖 *Bot:* {botName}\n🕐 *Waktu promosi:* Sekarang\n\n_Gunakan kekuatan ini dengan bijak!_',
    [Language.ENGLISH]: '🎉 *Congratulations! You are now an Admin!*\n\n📈 Your account level has been upgraded to *Admin* by the Owner.\n\n✨ *Admin Access:*\n• Manage users and their levels\n• Access special admin features\n• Reset user usage limits\n• Broadcast messages to all users\n• Access to all bot commands\n\n🤖 *Bot:* {botName}\n🕐 *Promotion time:* Now\n\n_Use this power wisely!_'
  },
  'setadmin.general_error': {
    [Language.INDONESIAN]: '❌ Terjadi kesalahan saat mengatur admin.\n\n_Silakan coba lagi atau hubungi support jika masalah berlanjut._',
    [Language.ENGLISH]: '❌ An error occurred while setting admin.\n\n_Please try again or contact support if the problem persists._'
  },
  'setadmin.database_error': {
    [Language.INDONESIAN]: '❌ Kesalahan database saat memperbarui level pengguna.\n\n_Silakan coba lagi atau hubungi support jika masalah berlanjut._',
    [Language.ENGLISH]: '❌ Database error while updating user level.\n\n_Please try again or contact support if the problem persists._'
  },
  'setadmin.permission_error': {
    [Language.INDONESIAN]: '❌ Tidak memiliki izin untuk melakukan operasi ini.\n\n_Silakan coba lagi atau hubungi support jika masalah berlanjut._',
    [Language.ENGLISH]: '❌ No permission to perform this operation.\n\n_Please try again or contact support if the problem persists._'
  },  'setadmin.user_error': {
    [Language.INDONESIAN]: '❌ Pengguna tidak ditemukan atau tidak valid.\n\n_Silakan coba lagi atau hubungi support jika masalah berlanjut._',
    [Language.ENGLISH]: '❌ User not found or invalid.\n\n_Please try again or contact support if the problem persists._'
  },

  // Broadcast command
  'broadcast.help': {
    [Language.INDONESIAN]: '📢 *BROADCAST PESAN*\n\n*Penggunaan:*\n`broadcast <pesan> [level]`\n\n*Level Filter:*\n• `all` - Semua pengguna (default)\n• `free` - Hanya pengguna Free\n• `premium` - Hanya pengguna Premium\n• `admin` - Hanya Admin\n\n*Contoh:*\n• `broadcast Halo semua!`\n• `broadcast Pesan khusus premium premium`\n• `broadcast Update penting untuk admin admin`\n\n⚠️ *Hanya untuk Owner*',
    [Language.ENGLISH]: '📢 *BROADCAST MESSAGE*\n\n*Usage:*\n`broadcast <message> [level]`\n\n*Level Filters:*\n• `all` - All users (default)\n• `free` - Free users only\n• `premium` - Premium users only\n• `admin` - Admin users only\n\n*Examples:*\n• `broadcast Hello everyone!`\n• `broadcast Special premium message premium`\n• `broadcast Important admin update admin`\n\n⚠️ *Owner Only*'
  },
  'broadcast.empty_message': {
    [Language.INDONESIAN]: '❌ Pesan broadcast tidak boleh kosong.\n\n*Penggunaan:*\n`broadcast <pesan> [level]`\n\n*Contoh:*\n`broadcast Halo semua pengguna!`',
    [Language.ENGLISH]: '❌ Broadcast message cannot be empty.\n\n*Usage:*\n`broadcast <message> [level]`\n\n*Example:*\n`broadcast Hello all users!`'
  },
  'broadcast.no_target': {
    [Language.INDONESIAN]: '❌ Tidak ada pengguna target untuk broadcast.\n\n📊 *Filter:* {levelFilter}\n🎯 *Target:* {levelText}\n👥 *Pengguna ditemukan:* 0\n\n_Tidak ada pengguna yang sesuai dengan filter yang dipilih._',
    [Language.ENGLISH]: '❌ No target users found for broadcast.\n\n📊 *Filter:* {levelFilter}\n🎯 *Target:* {levelText}\n👥 *Users found:* 0\n\n_No users match the selected filter._'
  },
  'broadcast.confirmation': {
    [Language.INDONESIAN]: '📢 *KONFIRMASI BROADCAST*\n\n📝 *Preview Pesan:*\n```{previewMessage}```\n\n📊 *Detail Broadcast:*\n🎯 *Target:* {levelFilter}\n👥 *Jumlah penerima:* {userCount} pengguna\n⏱️ *Estimasi waktu:* ~{estimatedTime} menit\n📏 *Panjang pesan:* {messageLength} karakter\n\n⚠️ *PERINGATAN:*\n• Proses ini akan memakan waktu\n• Jangan matikan bot selama broadcast\n• Rate limit: 2 detik per pesan\n\n🚀 *Broadcast akan dimulai dalam 5 detik...*\n_Kirim pesan apapun untuk membatalkan_',
    [Language.ENGLISH]: '📢 *BROADCAST CONFIRMATION*\n\n📝 *Message Preview:*\n```{previewMessage}```\n\n📊 *Broadcast Details:*\n🎯 *Target:* {levelFilter}\n👥 *Recipients:* {userCount} users\n⏱️ *Estimated time:* ~{estimatedTime} minutes\n📏 *Message length:* {messageLength} characters\n\n⚠️ *WARNING:*\n• This process will take time\n• Do not turn off bot during broadcast\n• Rate limit: 2 seconds per message\n\n🚀 *Broadcast will start in 5 seconds...*\n_Send any message to cancel_'
  },
  'broadcast.starting': {
    [Language.INDONESIAN]: '🚀 *BROADCAST DIMULAI*\n\n👥 *Total penerima:* {userCount} pengguna\n🕐 *Waktu mulai:* {currentTime}\n⏳ *Status:* Mengirim pesan...\n\n📊 *Progress akan diupdate setiap 10 pesan*',
    [Language.ENGLISH]: '🚀 *BROADCAST STARTED*\n\n👥 *Total recipients:* {userCount} users\n🕐 *Start time:* {currentTime}\n⏳ *Status:* Sending messages...\n\n📊 *Progress will update every 10 messages*'
  },
  'broadcast.message_template': {
    [Language.INDONESIAN]: '📢 *PESAN BROADCAST*\n\n{message}\n\n━━━━━━━━━━━━━━\n🤖 *Bot:* {botName}\n🕐 *Waktu:* {currentTime}\n\n_Ini adalah pesan broadcast resmi_',
    [Language.ENGLISH]: '📢 *BROADCAST MESSAGE*\n\n{message}\n\n━━━━━━━━━━━━━━\n🤖 *Bot:* {botName}\n🕐 *Time:* {currentTime}\n\n_This is an official broadcast message_'
  },
  'broadcast.progress': {
    [Language.INDONESIAN]: '📊 *PROGRESS BROADCAST*\n\n{progressBar} {progressPercent}%\n\n📈 *Status:*\n👥 *Progress:* {current}/{total}\n✅ *Berhasil:* {successCount}\n❌ *Gagal:* {failedCount}\n🚫 *Terblokir:* {blockedCount}\n⏱️ *Waktu berlalu:* {elapsedTime}s\n\n🔄 *Sedang mengirim...*',
    [Language.ENGLISH]: '📊 *BROADCAST PROGRESS*\n\n{progressBar} {progressPercent}%\n\n📈 *Status:*\n👥 *Progress:* {current}/{total}\n✅ *Success:* {successCount}\n❌ *Failed:* {failedCount}\n🚫 *Blocked:* {blockedCount}\n⏱️ *Elapsed:* {elapsedTime}s\n\n🔄 *Sending...*'
  },
  'broadcast.summary': {
    [Language.INDONESIAN]: '📊 *LAPORAN BROADCAST SELESAI*\n\n✅ *STATISTIK PENGIRIMAN:*\n👥 *Total penerima:* {userCount}\n✅ *Berhasil terkirim:* {successCount} ({successRate}%)\n❌ *Gagal:* {failedCount}\n🚫 *Terblokir:* {blockedCount}\n\n⏱️ *WAKTU EKSEKUSI:*\n🕐 *Total waktu:* {totalTime}s ({totalMinutes}m)\n📈 *Rate pengiriman:* {ratePerMinute}/menit\n🎯 *Filter level:* {levelFilter}\n\n📅 *TIMELINE:*\n🟢 *Selesai:* {endTime}\n\n{showFailed}❌ *Gagal:* {failedInfo}\n{showBlocked}🚫 *Terblokir:* {blockedInfo}\n\n🎉 *Broadcast berhasil diselesaikan!*',
    [Language.ENGLISH]: '📊 *BROADCAST COMPLETION REPORT*\n\n✅ *DELIVERY STATISTICS:*\n👥 *Total recipients:* {userCount}\n✅ *Successfully sent:* {successCount} ({successRate}%)\n❌ *Failed:* {failedCount}\n🚫 *Blocked:* {blockedCount}\n\n⏱️ *EXECUTION TIME:*\n🕐 *Total time:* {totalTime}s ({totalMinutes}m)\n📈 *Send rate:* {ratePerMinute}/minute\n🎯 *Level filter:* {levelFilter}\n\n📅 *TIMELINE:*\n🟢 *Completed:* {endTime}\n\n{showFailed}❌ *Failed:* {failedInfo}\n{showBlocked}🚫 *Blocked:* {blockedInfo}\n\n🎉 *Broadcast completed successfully!*'
  },  'broadcast.error': {
    [Language.INDONESIAN]: '❌ *BROADCAST GAGAL*\n\n🚨 *ERROR SAAT BROADCAST!*\n\n⚠️ *Detail Error:*\n• {errorMessage}\n\n🔄 *Solusi:*\n• Periksa koneksi internet\n• Coba dengan pesan lebih pendek\n• Coba lagi dalam beberapa menit\n• Laporkan ke developer jika terus error\n\n⏰ *Waktu error:* {currentTime}',
    [Language.ENGLISH]: '❌ *BROADCAST FAILED*\n\n🚨 *ERROR DURING BROADCAST!*\n\n⚠️ *Error Details:*\n• {errorMessage}\n\n🔄 *Solutions:*\n• Check internet connection\n• Try with shorter message\n• Try again in a few minutes\n• Report to developer if error persists\n\n⏰ *Error time:* {currentTime}'
  },

  // ClearAll command
  'clearall.access_denied': {
    [Language.INDONESIAN]: '🚫 *Akses Ditolak*\n\nPerintah ini hanya dapat digunakan oleh owner bot.\n\n_Ini adalah operasi untuk membersihkan riwayat chat._',
    [Language.ENGLISH]: '🚫 *Access Denied*\n\nThis command can only be used by the bot owner.\n\n_This is an operation to clear chat history._'
  },
  'clearall.help': {
    [Language.INDONESIAN]: '🚨 *PERINGATAN*\n\n⚠️ *OPERASI PEMBERSIHAN CHAT*\nPerintah ini akan menghapus semua riwayat chat WhatsApp!\n\n🗑️ *Yang Akan Dihapus:*\n• Semua riwayat chat\n• Semua media (foto, video, dokumen)\n• Pesan yang tersimpan di memori\n\n✅ *Yang TIDAK Dihapus:*\n• Data pengguna di database\n• Konfigurasi bot\n• Session WhatsApp\n\n⚡ *Untuk melanjutkan, ketik:*\n`!clearall CONFIRM`\n\n_Tujuan: Mengosongkan memory dan mempercepat bot._',
    [Language.ENGLISH]: '🚨 *WARNING*\n\n⚠️ *CHAT CLEANUP OPERATION*\nThis command will delete all WhatsApp chat history!\n\n🗑️ *What Will Be Deleted:*\n• All chat history\n• All media (photos, videos, documents)\n• Messages stored in memory\n\n✅ *What Will NOT Be Deleted:*\n• User data in database\n• Bot configuration\n• WhatsApp session\n\n⚡ *To continue, type:*\n`!clearall CONFIRM`\n\n_Purpose: Free up memory and speed up bot._'
  },
  'clearall.starting': {
    [Language.INDONESIAN]: '🚨 *PROSES PEMBERSIHAN DIMULAI*\n\n⚠️ Menghapus riwayat chat dalam 3 detik...\n🔄 Proses ini akan membersihkan memory bot.\n\n_Tunggu hingga selesai..._',
    [Language.ENGLISH]: '🚨 *CLEANUP PROCESS STARTED*\n\n⚠️ Deleting chat history in 3 seconds...\n🔄 This process will clean bot memory.\n\n_Please wait until finished..._'
  },
  'clearall.processing': {
    [Language.INDONESIAN]: '🔄 *Membersihkan riwayat chat...*\n\n_Harap tunggu, jangan matikan bot._',
    [Language.ENGLISH]: '🔄 *Clearing chat history...*\n\n_Please wait, do not turn off the bot._'
  },
  'clearall.success': {
    [Language.INDONESIAN]: '✅ *RIWAYAT CHAT BERHASIL DIBERSIHKAN*\n\n🧹 *{statusMessage}*\n⚙️ *Metode:* {method}\n⏰ *Waktu:* {timestamp}\n👑 *Oleh:* Owner\n\n✨ *Hasil:* Memory bot telah dibersihkan!\n🚀 *Bot siap dengan performa optimal.*',
    [Language.ENGLISH]: '✅ *CHAT HISTORY SUCCESSFULLY CLEARED*\n\n🧹 *{statusMessage}*\n⚙️ *Method:* {method}\n⏰ *Time:* {timestamp}\n👑 *By:* Owner\n\n✨ *Result:* Bot memory has been cleaned!\n🚀 *Bot ready with optimal performance.*'
  },
  'clearall.status_all': {
    [Language.INDONESIAN]: 'Status: Semua chat dibersihkan',
    [Language.ENGLISH]: 'Status: All chats cleared'
  },
  'clearall.status_count': {
    [Language.INDONESIAN]: 'Chat Dibersihkan: {count} chat',
    [Language.ENGLISH]: 'Chats Cleared: {count} chats'
  },
  'clearall.error_cleanup': {
    [Language.INDONESIAN]: '❌ *OPERASI GAGAL*\n\nTerjadi kesalahan saat membersihkan chat.\n\n🔧 *Saran:*\n• Restart bot dan coba lagi\n• Periksa koneksi WhatsApp\n• Hapus chat manual jika diperlukan\n\n_Coba lagi nanti atau restart bot._',
    [Language.ENGLISH]: '❌ *OPERATION FAILED*\n\nAn error occurred while clearing chats.\n\n🔧 *Suggestions:*\n• Restart bot and try again\n• Check WhatsApp connection\n• Delete chats manually if needed\n\n_Try again later or restart bot._'
  },  'clearall.error_critical': {
    [Language.INDONESIAN]: '❌ *KESALAHAN SISTEM*\n\nTerjadi kesalahan kritis.\n\n🔧 *Solusi:*\n• Restart bot\n• Periksa log error\n• Hubungi support jika masalah berlanjut',
    [Language.ENGLISH]: '❌ *SYSTEM ERROR*\n\nA critical error occurred.\n\n🔧 *Solutions:*\n• Restart bot\n• Check error logs\n• Contact support if problem persists'
  },

  // Restart command
  'restart.help': {
    [Language.INDONESIAN]: '*🔄 Konfirmasi Restart Bot*\n\n⚠️ *KONFIRMASI RESTART DIPERLUKAN*\n\n🤖 *Info Bot:*\n• Nama: {botName}\n• Uptime: {uptime}\n• PID: {processId}\n• Memory: {memoryUsage}MB\n\n🔄 *Dampak Restart:*\n• Bot akan offline 30-60 detik\n• Semua sesi akan terputus\n• Proses akan dimulai ulang\n\n✅ *Untuk melanjutkan:*\n`restart confirm` - Lanjutkan restart\n\n⏰ *Timeout:* 30 detik (otomatis batal)',
    [Language.ENGLISH]: '*🔄 Bot Restart Confirmation*\n\n⚠️ *RESTART CONFIRMATION REQUIRED*\n\n🤖 *Bot Info:*\n• Name: {botName}\n• Uptime: {uptime}\n• PID: {processId}\n• Memory: {memoryUsage}MB\n\n🔄 *Restart Impact:*\n• Bot will be offline 30-60 seconds\n• All sessions will disconnect\n• Process will restart\n\n✅ *To continue:*\n`restart confirm` - Continue restart\n\n⏰ *Timeout:* 30 seconds (auto cancel)'
  },
  'restart.starting': {
    [Language.INDONESIAN]: '*🔄 Restart Bot Dimulai*\n\n⏳ *BOT SEDANG DIRESTART...*\n\n🤖 *Detail Restart:*\n• Dipicu oleh: Owner\n• Waktu mulai: {currentTime}\n• Uptime sebelumnya: {uptime}\n\n⏰ *Timeline:*\n• 00:05 - Menyimpan data\n• 00:10 - Menutup koneksi\n• 00:15 - Restart proses\n• 01:00 - Bot kembali online\n\n📱 *Status:* Memulai shutdown...\n🔄 Bot akan kembali online sebentar lagi!',
    [Language.ENGLISH]: '*🔄 Bot Restart Started*\n\n⏳ *BOT IS RESTARTING...*\n\n🤖 *Restart Details:*\n• Triggered by: Owner\n• Start time: {currentTime}\n• Previous uptime: {uptime}\n\n⏰ *Timeline:*\n• 00:05 - Saving data\n• 00:10 - Closing connections\n• 00:15 - Restarting process\n• 01:00 - Bot back online\n\n📱 *Status:* Starting shutdown...\n🔄 Bot will be back online shortly!'
  },
  'restart.owner_notification': {
    [Language.INDONESIAN]: '*🤖 Bot Restart Notification*\n\n🔄 *BOT RESTART INITIATED*\n\n👑 *Dipicu oleh:* Owner ({ownerPhone})\n📍 *Lokasi:* {location}\n⏰ *Waktu:* {currentTime}\n\n📊 *System Info:*\n• Bot Name: {botName}\n• Uptime: {uptime}\n• Process ID: {processId}\n• Memory Usage: {memoryUsage}MB\n• Node Version: {nodeVersion}\n\n🔄 *Status:* Initializing restart sequence...\n🚀 Bot akan kembali online dalam 30-60 detik.',
    [Language.ENGLISH]: '*🤖 Bot Restart Notification*\n\n🔄 *BOT RESTART INITIATED*\n\n👑 *Triggered by:* Owner ({ownerPhone})\n📍 *Location:* {location}\n⏰ *Time:* {currentTime}\n\n📊 *System Info:*\n• Bot Name: {botName}\n• Uptime: {uptime}\n• Process ID: {processId}\n• Memory Usage: {memoryUsage}MB\n• Node Version: {nodeVersion}\n\n🔄 *Status:* Initializing restart sequence...\n🚀 Bot will be back online in 30-60 seconds.'
  },
  'restart.progress_saving': {
    [Language.INDONESIAN]: '*🔄 Restart Progress*\n\n📊 *MENYIMPAN DATA...*\n\n✅ Database connections closing\n✅ Active sessions saving\n⏳ Memory cleanup in progress\n\n⏰ *ETA:* 10 detik lagi',
    [Language.ENGLISH]: '*🔄 Restart Progress*\n\n📊 *SAVING DATA...*\n\n✅ Database connections closing\n✅ Active sessions saving\n⏳ Memory cleanup in progress\n\n⏰ *ETA:* 10 seconds remaining'
  },
  'restart.final': {
    [Language.INDONESIAN]: '*🔄 Final Restart*\n\n🚀 *RESTARTING NOW...*\n\n✅ Data saved successfully\n✅ Connections closed\n🔄 Process restarting...\n\n💫 *See you in a moment!*\n⏰ Bot akan online kembali sebentar lagi',
    [Language.ENGLISH]: '*🔄 Final Restart*\n\n🚀 *RESTARTING NOW...*\n\n✅ Data saved successfully\n✅ Connections closed\n🔄 Process restarting...\n\n💫 *See you in a moment!*\n⏰ Bot will be back online shortly'
  },
  'restart.error': {
    [Language.INDONESIAN]: '*❌ Restart Gagal*\n\n🚨 *ERROR SAAT RESTART!*\n\n⚠️ *Detail Error:*\n• {errorMessage}\n\n🔄 *Solusi:*\n• Coba restart manual dari server\n• Periksa log sistem untuk detail\n• Hubungi developer jika masalah berlanjut\n\n📊 *System Info:*\n• PID: {processId}\n• Memory: {memoryUsage}MB\n• Uptime: {uptime}\n\n⏰ *Waktu error:* {currentTime}',
    [Language.ENGLISH]: '*❌ Restart Failed*\n\n🚨 *ERROR DURING RESTART!*\n\n⚠️ *Error Details:*\n• {errorMessage}\n\n🔄 *Solutions:*\n• Try manual restart from server\n• Check system logs for details\n• Contact developer if problem persists\n\n📊 *System Info:*\n• PID: {processId}\n• Memory: {memoryUsage}MB\n• Uptime: {uptime}\n\n⏰ *Error time:* {currentTime}'
  },
};


/**
 * Get translated text based on user's language preference
 * @param key - Translation key
 * @param language - User's preferred language
 * @param fallback - Fallback text if translation not found
 * @param replacements - Object with placeholder replacements
 * @returns Translated text with replacements
 */
export function getText(
  key: string, 
  language: Language = Language.INDONESIAN, 
  fallback?: string,
  replacements?: Record<string, string | number>
): string {
  const translation = translations[key];
  
  if (!translation) {
    logger.warn('Translation key not found', {
      key: key,
      language: language,
      fallbackProvided: !!fallback
    });
    return fallback || key;
  }
  
  let text = translation[language] || translation[Language.INDONESIAN] || fallback || key;
  
  // Replace placeholders if provided
  if (replacements) {
    Object.keys(replacements).forEach(placeholder => {
      const regex = new RegExp(`{${placeholder}}`, 'g');
      text = text.replace(regex, String(replacements[placeholder]));
    });
  }
  
  return text;
}

/**
 * Get feature name in user's language
 * @param feature - Feature type
 * @param language - User's preferred language
 * @returns Translated feature name
 */
export function getFeatureName(feature: string, language: Language = Language.INDONESIAN): string {
  const key = `feature.${feature.toLowerCase()}`;
  return getText(key, language, feature);
}

/**
 * Format time duration in user's language
 * @param seconds - Duration in seconds
 * @param language - User's preferred language
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number, language: Language = Language.INDONESIAN): string {
  if (seconds < 60) {
    return `${seconds} ${getText('common.seconds', language)}`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} ${getText('common.minutes', language)}`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} ${getText('common.hours', language)}`;
  } else {
    const days = Math.floor(seconds / 86400);
    return `${days} ${getText('common.days', language)}`;
  }
}

/**
 * Get localized date format
 * @param date - Date object
 * @param language - User's preferred language
 * @returns Formatted date string
 */
export function formatDate(date: Date, language: Language = Language.INDONESIAN): string {
  return date.toLocaleDateString(
    language === Language.INDONESIAN ? 'id-ID' : 'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Jakarta'
    }
  );
}

/**
 * Get localized datetime format
 * @param date - Date object
 * @param language - User's preferred language
 * @returns Formatted datetime string
 */
export function formatDateTime(date: Date, language: Language = Language.INDONESIAN): string {
  return date.toLocaleString(
    language === Language.INDONESIAN ? 'id-ID' : 'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    }
  );
}

/**
 * Get command category name in user's language
 * @param category - Category name
 * @param language - User's preferred language
 * @returns Translated category name
 */
export function getCategoryName(category: string, language: Language = Language.INDONESIAN): string {
  const categoryMap: Record<string, { [key in Language]: string }> = {
    'Umum': {
      [Language.INDONESIAN]: 'Umum',
      [Language.ENGLISH]: 'General'
    },
    'Grup': {
      [Language.INDONESIAN]: 'Grup',
      [Language.ENGLISH]: 'Group'
    },
    'N8N': {
      [Language.INDONESIAN]: 'N8N',
      [Language.ENGLISH]: 'N8N'
    },
    'Utilitas': {
      [Language.INDONESIAN]: 'Utilitas',
      [Language.ENGLISH]: 'Utilities'
    },
    'Admin': {
      [Language.INDONESIAN]: 'Admin',
      [Language.ENGLISH]: 'Admin'
    },
    'Owner': {
      [Language.INDONESIAN]: 'Owner',
      [Language.ENGLISH]: 'Owner'
    }
  };
  
  return categoryMap[category]?.[language] || category;
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
  getFeatureName,
  formatDuration,
  formatDate,
  formatDateTime,
  getCategoryName,
  Language
};
