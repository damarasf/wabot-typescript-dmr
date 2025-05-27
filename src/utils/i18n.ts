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
    [Language.INDONESIAN]: 'Berhasil! Perintah sudah dijalankan 👍',
    [Language.ENGLISH]: 'Success! Command executed 👍'
  },
  'command.error': {
    [Language.INDONESIAN]: 'Aduh, ada error nih! Coba sekali lagi ya 🔧',
    [Language.ENGLISH]: 'Oops, there was an error! Please try again 🔧'
  },
  'command.not_found': {
    [Language.INDONESIAN]: 'Perintah tidak ditemukan. Ketik "help" untuk lihat semua perintah ya! 📋',
    [Language.ENGLISH]: 'Command not found. Type "help" to see all commands! 📋'
  },'user.not_registered': {
    [Language.INDONESIAN]: 'Halo! Kamu belum terdaftar nih. Yuk daftar dulu dengan ketik "register" 👋',
    [Language.ENGLISH]: 'Hello! You are not registered yet. Please register first by typing "register" 👋'
  },
  'user.no_permission': {
    [Language.INDONESIAN]: 'Ups! Kamu belum punya akses untuk fitur ini. Upgrade dulu ya! 🔒',
    [Language.ENGLISH]: 'Oops! You don\'t have access to this feature yet. Please upgrade first! 🔒'
  },
  'user.limit_reached': {
    [Language.INDONESIAN]: 'Limit penggunaan kamu sudah habis untuk hari ini. Coba lagi besok ya! ⏰',
    [Language.ENGLISH]: 'Your usage limit is reached for today. Please try again tomorrow! ⏰'
  },
    // Registration
  'register.already_registered': {
    [Language.INDONESIAN]: 'Halo! Kamu sudah terdaftar sebagai pengguna bot kami 😊',
    [Language.ENGLISH]: 'Hello! You are already registered as our bot user 😊'
  },
  'register.success': {
    [Language.INDONESIAN]: 'Selamat datang! Pendaftaran berhasil 🎉 Kamu sekarang bisa menggunakan semua fitur bot.',
    [Language.ENGLISH]: 'Welcome! Registration successful 🎉 You can now use all bot features.'
  },
  'register.error': {
    [Language.INDONESIAN]: 'Maaf, terjadi kendala saat mendaftarkan akun kamu. Coba lagi ya! 😅',
    [Language.ENGLISH]: 'Sorry, there was an issue registering your account. Please try again! 😅'
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
    [Language.INDONESIAN]: 'Selamat datang! 🎉',
    [Language.ENGLISH]: 'Welcome! 🎉'
  },
  'register.welcome_greeting': {
    [Language.INDONESIAN]: 'Hai {displayName}! Kamu berhasil terdaftar di {botName}. Senang bisa bantu kamu! 😊',
    [Language.ENGLISH]: 'Hi {displayName}! You\'ve successfully registered with {botName}. Happy to help you! 😊'
  },
  'register.account_info_title': {
    [Language.INDONESIAN]: 'Info Akun Kamu:',
    [Language.ENGLISH]: 'Your Account Info:'
  },
  'register.phone_number_label': {
    [Language.INDONESIAN]: '📱 Nomor',
    [Language.ENGLISH]: '📱 Number'
  },
  'register.level_info_label': {
    [Language.INDONESIAN]: '⭐ Level',
    [Language.ENGLISH]: '⭐ Level'
  },
  'register.registered_date_label': {
    [Language.INDONESIAN]: '📅 Bergabung',
    [Language.ENGLISH]: '📅 Joined'
  },
  'register.features_title': {
    [Language.INDONESIAN]: 'Yang bisa kamu lakukan:',
    [Language.ENGLISH]: 'What you can do:'
  },
  'register.feature_basic_commands': {
    [Language.INDONESIAN]: '✨ Akses semua perintah dasar',
    [Language.ENGLISH]: '✨ Access all basic commands'
  },
  'register.feature_n8n_integration': {
    [Language.INDONESIAN]: '🔗 Pakai workflow N8N',
    [Language.ENGLISH]: '🔗 Use N8N workflows'
  },
  'register.feature_reminder_settings': {
    [Language.INDONESIAN]: '⏰ Atur reminder otomatis',
    [Language.ENGLISH]: '⏰ Set automatic reminders'
  },
  'register.feature_more': {
    [Language.INDONESIAN]: '🚀 Dan masih banyak lagi!',
    [Language.ENGLISH]: '🚀 And much more!'
  },
  'register.help_tip': {
    [Language.INDONESIAN]: 'Tips: Ketik "help" untuk lihat semua perintah yang tersedia! 💡',
    [Language.ENGLISH]: 'Tip: Type "help" to see all available commands! 💡'
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
  },  'language.current': {
    [Language.INDONESIAN]: '🌐 Bahasa sekarang: Bahasa Indonesia',
    [Language.ENGLISH]: '🌐 Current language: English'
  },
  'language.changed.to_id': {
    [Language.INDONESIAN]: '✅ Bahasa berhasil diubah ke Bahasa Indonesia! 🇮🇩',
    [Language.ENGLISH]: '✅ Language successfully changed to Indonesian! 🇮🇩'
  },
  'language.changed.to_en': {
    [Language.INDONESIAN]: '✅ Bahasa berhasil diubah ke English! 🇺🇸',
    [Language.ENGLISH]: '✅ Language successfully changed to English! 🇺🇸'
  },
  'language.invalid': {
    [Language.INDONESIAN]: '❌ Bahasa nggak valid nih. Pilihan: id (Indonesia) atau en (English) 🌐',
    [Language.ENGLISH]: '❌ Invalid language. Options: id (Indonesian) or en (English) 🌐'
  },
  'language.help': {
    [Language.INDONESIAN]: '🌐 Cara pakai: !language [id/en]\n• id = Bahasa Indonesia 🇮🇩\n• en = English 🇺🇸',
    [Language.ENGLISH]: '🌐 Usage: !language [id/en]\n• id = Indonesian 🇮🇩\n• en = English 🇺🇸'
  },
  'language.info_text': {
    [Language.INDONESIAN]: '📱 Semua respon bot sekarang pakai Bahasa Indonesia.\n💡 Ketik !help untuk lihat menu dalam bahasa baru.',
    [Language.ENGLISH]: '📱 All bot responses will now use English.\n💡 Type !help to see the menu in your new language.'
  },
  'language.settings_title': {
    [Language.INDONESIAN]: '🌐 Pengaturan Bahasa',
    [Language.ENGLISH]: '🌐 Language Settings'
  },
  'language.error': {
    [Language.INDONESIAN]: '❌ Ada error saat ubah bahasa. Coba lagi nanti ya! 🔄',
    [Language.ENGLISH]: '❌ Error changing language. Please try again later! 🔄'
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
    [Language.INDONESIAN]: 'Belum Daftar',
    [Language.ENGLISH]: 'Not Registered'
  },
  'help.prefix': {
    [Language.INDONESIAN]: '🎯 Prefix',
    [Language.ENGLISH]: '🎯 Prefix'
  },
  'help.register_notice': {
    [Language.INDONESIAN]: '⚠️ Daftar dulu ya buat akses penuh!\nKetik `!register` untuk daftar.',
    [Language.ENGLISH]: '⚠️ Register first for full access!\nType `!register` to register.'
  },
  'help.total_commands': {
    [Language.INDONESIAN]: '🔢 Total Perintah',
    [Language.ENGLISH]: '🔢 Total Commands'
  },
  'help.tips': {
    [Language.INDONESIAN]: '💡 Tips',
    [Language.ENGLISH]: '💡 Tips'
  },  'help.tip_detail': {
    [Language.INDONESIAN]: '• Ketik `!help [perintah]` untuk detail\n• Upgrade ke Premium untuk lebih banyak fitur\n• Jangan lupa pakai prefix !',
    [Language.ENGLISH]: '• Type `!help [command]` for details\n• Upgrade to Premium for more features\n• Don\'t forget to use prefix !'
  },
  'help.tips_header': {
    [Language.INDONESIAN]: '💡 *Tips Penggunaan*',
    [Language.ENGLISH]: '💡 *Usage Tips*'
  },
  'help.footer': {
    [Language.INDONESIAN]: '_Dibuat dengan ❤️ untuk otomasi yang lebih baik_',
    [Language.ENGLISH]: '_Made with ❤️ for better automation_'
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
    [Language.INDONESIAN]: '👤 *Info Profil Kamu*',
    [Language.ENGLISH]: '👤 *Your Profile Info*'
  },
  'profile.name': {
    [Language.INDONESIAN]: '📛 *Nama:*',
    [Language.ENGLISH]: '📛 *Name:*'
  },
  'profile.context_group': {
    [Language.INDONESIAN]: '📍 *Chat dari:* Grup',
    [Language.ENGLISH]: '📍 *Chat from:* Group'
  },
  'profile.context_personal': {
    [Language.INDONESIAN]: '📍 *Chat dari:* Personal',
    [Language.ENGLISH]: '📍 *Chat from:* Personal'
  },
  'profile.access_time': {
    [Language.INDONESIAN]: '🕐 *Diakses:*',
    [Language.ENGLISH]: '🕐 *Accessed:*'
  },
  'profile.owner_status': {
    [Language.INDONESIAN]: '👑 *Status:* Owner Bot',
    [Language.ENGLISH]: '👑 *Status:* Bot Owner'
  },
  'profile.help_footer': {
    [Language.INDONESIAN]: '_Tips: Ketik !help untuk lihat semua perintah yang bisa kamu pakai 💡_',
    [Language.ENGLISH]: '_Tip: Type !help to see all commands you can use 💡_'
  },
  'profile.error': {
    [Language.INDONESIAN]: 'Aduh, gagal ambil profil kamu. Coba lagi ya! 😅',
    [Language.ENGLISH]: 'Oops, failed to get your profile. Please try again! 😅'
  },
  'profile.database_error': {
    [Language.INDONESIAN]: 'Ada masalah dengan database nih. Coba lagi sebentar ya! 🔧',
    [Language.ENGLISH]: 'There\'s a database issue. Please try again in a moment! 🔧'
  },
  'profile.format_error': {
    [Language.INDONESIAN]: 'Ada error format data profil. Tim kami akan perbaiki! 🛠️',
    [Language.ENGLISH]: 'Profile data format error. Our team will fix it! 🛠️'
  },
  // Help command detailed messages
  'help.command_not_found': {
    [Language.INDONESIAN]: '❌ Perintah tidak ditemukan atau kamu belum punya akses. Cek lagi ya! 🔍',
    [Language.ENGLISH]: '❌ Command not found or you don\'t have access yet. Please check again! 🔍'
  },
  'help.command_detail': {
    [Language.INDONESIAN]: '📋 *Detail Perintah*',
    [Language.ENGLISH]: '📋 *Command Details*'
  },
  'help.usage': {
    [Language.INDONESIAN]: '📝 *Cara pakai:*',
    [Language.ENGLISH]: '📝 *How to use:*'
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
    [Language.INDONESIAN]: '🔒 *Level minimal:*',
    [Language.ENGLISH]: '🔒 *Minimum level:*'
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
    [Language.INDONESIAN]: '⚡ *Perintah yang bisa kamu pakai:*',
    [Language.ENGLISH]: '⚡ *Commands you can use:*'
  },

  // Command descriptions
  'command.desc.help': {
    [Language.INDONESIAN]: 'Menampilkan daftar perintah bot',
    [Language.ENGLISH]: 'Display bot command list'
  },
  'command.desc.register': {
    [Language.INDONESIAN]: 'Mendaftar sebagai pengguna bot',
    [Language.ENGLISH]: 'Register as a bot user'
  },
  'command.desc.profile': {
    [Language.INDONESIAN]: 'Melihat profil pengguna',
    [Language.ENGLISH]: 'View user profile'
  },
  'command.desc.language': {
    [Language.INDONESIAN]: 'Mengubah bahasa bot',
    [Language.ENGLISH]: 'Change bot language'
  },
  'command.desc.limit': {
    [Language.INDONESIAN]: 'Melihat batas penggunaan',
    [Language.ENGLISH]: 'View usage limits'
  },
  'command.desc.n8n': {
    [Language.INDONESIAN]: 'Menjalankan workflow N8N',
    [Language.ENGLISH]: 'Execute N8N workflow'
  },
  'command.desc.reminder': {
    [Language.INDONESIAN]: 'Membuat pengingat',
    [Language.ENGLISH]: 'Create reminder'
  },
  'command.desc.tagall': {
    [Language.INDONESIAN]: 'Menandai semua anggota grup',
    [Language.ENGLISH]: 'Tag all group members'
  },
  'command.desc.setlimit': {
    [Language.INDONESIAN]: 'Mengatur batas penggunaan pengguna',
    [Language.ENGLISH]: 'Set user usage limits'
  },
  'command.desc.resetlimit': {
    [Language.INDONESIAN]: 'Reset batas penggunaan pengguna',
    [Language.ENGLISH]: 'Reset user usage limits'
  },
  'command.desc.setadmin': {
    [Language.INDONESIAN]: 'Mengatur admin bot',
    [Language.ENGLISH]: 'Set bot admin'
  },
  'command.desc.upgrade': {
    [Language.INDONESIAN]: 'Upgrade level pengguna',
    [Language.ENGLISH]: 'Upgrade user level'
  },  'command.desc.broadcast': {
    [Language.INDONESIAN]: 'Broadcast pesan ke semua pengguna',
    [Language.ENGLISH]: 'Broadcast message to all users'
  },
  'command.desc.safebroadcast': {
    [Language.INDONESIAN]: 'Broadcast aman dengan anti-spam protection',
    [Language.ENGLISH]: 'Safe broadcast with anti-spam protection'
  },
  'command.desc.clearall': {
    [Language.INDONESIAN]: 'Hapus semua riwayat chat',
    [Language.ENGLISH]: 'Clear all chat history'
  },
  'command.desc.restart': {
    [Language.INDONESIAN]: 'Restart bot',
    [Language.ENGLISH]: 'Restart bot'
  },
  // Limit command
  'limit.title': {
    [Language.INDONESIAN]: '📊 *Status Limit Kamu*',
    [Language.ENGLISH]: '📊 *Your Limit Status*'
  },
  'limit.info_title': {
    [Language.INDONESIAN]: '*📊 Info Limit*',
    [Language.ENGLISH]: '*📊 Limit Info*'
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
  },  'limit.reset_auto_label': {
    [Language.INDONESIAN]: '⏱️ *Reset otomatis:*',
    [Language.ENGLISH]: '⏱️ *Auto reset:*'
  },
  'limit.reset_time_format': {
    [Language.INDONESIAN]: '{hours}j lagi (00:00 WIB)',
    [Language.ENGLISH]: '{hours}h remaining (00:00 WIB)'
  },
  'limit.upgrade_title': {
    [Language.INDONESIAN]: '\n💎 *Pengen limit lebih tinggi?*\n',
    [Language.ENGLISH]: '\n💎 *Want higher limits?*\n'
  },
  'limit.upgrade_text': {
    [Language.INDONESIAN]: 'Chat admin untuk upgrade ke Premium!',
    [Language.ENGLISH]: 'Contact admin to upgrade to Premium!'
  },
  'limit.tips_title': {
    [Language.INDONESIAN]: '\n\n💡 *Tips:*\n',
    [Language.ENGLISH]: '\n\n💡 *Tips:*\n'
  },
  'limit.tip_use_wisely': {
    [Language.INDONESIAN]: '• Pakai fitur secara bijak\n',
    [Language.ENGLISH]: '• Use features wisely\n'
  },
  'limit.tip_daily_reset': {
    [Language.INDONESIAN]: '• Limit direset tiap hari\n',
    [Language.ENGLISH]: '• Limits reset daily\n'
  },
  'limit.tip_upgrade': {
    [Language.INDONESIAN]: '• Upgrade buat akses lebih luas',
    [Language.ENGLISH]: '• Upgrade for broader access'
  },
  'limit.error_general': {
    [Language.INDONESIAN]: 'Waduh, ada error saat ambil info limit. Coba lagi ya! 😅',
    [Language.ENGLISH]: 'Oops, error getting limit info. Please try again! 😅'
  },
  'limit.error_database': {
    [Language.INDONESIAN]: 'Ada masalah database nih. Coba lagi sebentar ya! 🔧',
    [Language.ENGLISH]: 'Database issue. Please try again in a moment! 🔧'
  },
  'limit.error_user': {
    [Language.INDONESIAN]: 'Data pengguna nggak valid atau nggak ketemu. Daftar dulu ya! 🔍',
    [Language.ENGLISH]: 'User data is invalid or not found. Please register first! 🔍'
  },
  'limit.error_footer': {
    [Language.INDONESIAN]: '\n\n_Coba lagi nanti atau hubungi admin ya!_',
    [Language.ENGLISH]: '\n\n_Please try again later or contact admin!_'
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
  },  // N8N command
  'n8n.not_registered': {
    [Language.INDONESIAN]: '❌ Kamu belum daftar nih. Daftar dulu yuk dengan *!register* 😊',
    [Language.ENGLISH]: '❌ You haven\'t registered yet. Please register first with *!register* 😊'
  },
  'n8n.limit_reached': {
    [Language.INDONESIAN]: '⚠️ Limit N8N kamu sudah habis nih ({currentUsage}/{maxUsage}).\n\nTunggu sampai reset atau upgrade ke Premium buat limit lebih tinggi! ⭐',
    [Language.ENGLISH]: '⚠️ Your N8N limit is used up ({currentUsage}/{maxUsage}).\n\nWait until reset or upgrade to Premium for higher limits! ⭐'
  },
  'n8n.workflow_id_empty': {
    [Language.INDONESIAN]: '❌ Workflow ID kosong nih. Contoh: `!n8n translate Hello World` 📝',
    [Language.ENGLISH]: '❌ Workflow ID is empty. Example: `!n8n translate Hello World` 📝'
  },
  'n8n.config_missing': {
    [Language.INDONESIAN]: '❌ Konfigurasi N8N belum lengkap. Hubungi admin ya! 🔧',
    [Language.ENGLISH]: '❌ N8N configuration is incomplete. Please contact admin! 🔧'
  },  'n8n.executing': {
    [Language.INDONESIAN]: '🔄 Lagi jalanin workflow N8N... tunggu sebentar ya!',
    [Language.ENGLISH]: '🔄 Running N8N workflow... please wait a moment!'
  },
  'n8n.processing': {
    [Language.INDONESIAN]: '⏳ Sedang memproses workflow N8N...',
    [Language.ENGLISH]: '⏳ Processing N8N workflow...'
  },
  'n8n.success': {
    [Language.INDONESIAN]: '✅ *Workflow N8N Berhasil!* 🎉\n\n📋 *Hasil:*\n{result}',
    [Language.ENGLISH]: '✅ *N8N Workflow Success!* 🎉\n\n📋 *Result:*\n{result}'
  },
  'n8n.error': {
    [Language.INDONESIAN]: '❌ Ada error saat jalanin workflow N8N:\n{error}\n\nCoba lagi atau hubungi admin ya! 🔧',
    [Language.ENGLISH]: '❌ Error running N8N workflow:\n{error}\n\nPlease try again or contact admin! 🔧'
  },
  // Reminder command
  'reminder.not_registered': {
    [Language.INDONESIAN]: '❌ Kamu belum daftar nih. Daftar dulu yuk dengan *!register* 😊',
    [Language.ENGLISH]: '❌ You haven\'t registered yet. Please register first with *!register* 😊'
  },
  'reminder.limit_reached': {
    [Language.INDONESIAN]: '⚠️ Limit reminder kamu sudah habis ({currentUsage}/{maxUsage}).\n\nTunggu sampai reset atau upgrade ke Premium ya! ⭐',
    [Language.ENGLISH]: '⚠️ Your reminder limit is used up ({currentUsage}/{maxUsage}).\n\nWait until reset or upgrade to Premium! ⭐'
  },
  'reminder.invalid_time_format': {
    [Language.INDONESIAN]: '❌ Format waktu salah nih.\n\n*Format yang bisa:*\n• `30s` = 30 detik\n• `10m` = 10 menit\n• `2h` = 2 jam\n• `1d` = 1 hari\n\n*Contoh:* `!reminder 30m Jangan lupa makan siang` 🍽️',
    [Language.ENGLISH]: '❌ Wrong time format.\n\n*Available formats:*\n• `30s` = 30 seconds\n• `10m` = 10 minutes\n• `2h` = 2 hours\n• `1d` = 1 day\n\n*Example:* `!reminder 30m Don\'t forget lunch` 🍽️'
  },
  'reminder.time_too_short': {
    [Language.INDONESIAN]: '❌ Waktunya terlalu pendek. Minimal 30 detik ya! ⏱️',
    [Language.ENGLISH]: '❌ Time is too short. Minimum 30 seconds! ⏱️'
  },
  'reminder.time_too_long': {
    [Language.INDONESIAN]: '❌ Waktunya terlalu lama. Maksimal 30 hari ya! 📅',
    [Language.ENGLISH]: '❌ Time is too long. Maximum 30 days! 📅'
  },  'reminder.created': {
    [Language.INDONESIAN]: '✅ *Reminder berhasil dibuat!* 🎉\n\n📝 *Pesan:* {message}\n⏰ *Waktu:* {time}\n📍 *Konteks:* {context}',
    [Language.ENGLISH]: '✅ *Reminder successfully created!* 🎉\n\n📝 *Message:* {message}\n⏰ *Time:* {time}\n📍 *Context:* {context}'
  },
  'reminder.success': {
    [Language.INDONESIAN]: '✅ Reminder berhasil diatur! Kamu akan diingatkan dalam {time} 🔔',
    [Language.ENGLISH]: '✅ Reminder set successfully! You will be reminded in {time} 🔔'
  },
  'reminder.error': {
    [Language.INDONESIAN]: '❌ Gagal bikin reminder nih. Coba lagi ya! 😅',
    [Language.ENGLISH]: '❌ Failed to create reminder. Please try again! 😅'
  },
  'reminder.message_too_long': {
    [Language.INDONESIAN]: '❌ Pesan reminder terlalu panjang. Maksimal 500 karakter ya! ✂️',
    [Language.ENGLISH]: '❌ Reminder message is too long. Maximum 500 characters! ✂️'
  },
  'reminder.group_context': {
    [Language.INDONESIAN]: 'grup ini',
    [Language.ENGLISH]: 'this group'
  },
  'reminder.personal_context': {
    [Language.INDONESIAN]: 'chat personal',
    [Language.ENGLISH]: 'personal chat'
  },  // TagAll command
  'tagall.title': {
    [Language.INDONESIAN]: '📢 Tag All Members',
    [Language.ENGLISH]: '📢 Tag All Members'
  },
  'tagall.not_registered': {
    [Language.INDONESIAN]: '❌ Kamu belum daftar nih. Daftar dulu yuk dengan *!register* 😊',
    [Language.ENGLISH]: '❌ You haven\'t registered yet. Please register first with *!register* 😊'
  },
  'tagall.limit_reached': {
    [Language.INDONESIAN]: '⚠️ Limit tag all kamu sudah habis ({currentUsage}/{maxUsage}).\n\nTunggu sampai reset atau upgrade ke Premium ya! ⭐',
    [Language.ENGLISH]: '⚠️ Your tag all limit is used up ({currentUsage}/{maxUsage}).\n\nWait until reset or upgrade to Premium! ⭐'
  },
  'tagall.admin_only': {
    [Language.INDONESIAN]: '🚫 Perintah ini khusus admin grup atau level Admin bot ke atas ya! 👑',
    [Language.ENGLISH]: '🚫 This command is for group admins or bot Admin level and above! 👑'
  },
  'tagall.no_message': {
    [Language.INDONESIAN]: '👥 *Tag All Members* 📢\n\n_Semua anggota grup udah ditandai nih!_',
    [Language.ENGLISH]: '👥 *Tag All Members* 📢\n\n_All group members have been tagged!_'
  },
  'tagall.with_message': {
    [Language.INDONESIAN]: '👥 *Tag All Members* 📢\n\n💬 *Pesan:* {message}\n\n_Semua anggota grup udah ditandai!_',
    [Language.ENGLISH]: '👥 *Tag All Members* 📢\n\n💬 *Message:* {message}\n\n_All group members have been tagged!_'
  },
  'tagall.error': {
    [Language.INDONESIAN]: '❌ Ada error saat tag all. Coba lagi ya! 😅',
    [Language.ENGLISH]: '❌ Error during tag all. Please try again! 😅'
  },
  'tagall.group_only': {
    [Language.INDONESIAN]: '❌ Perintah ini cuma bisa dipake di grup ya! 👥',
    [Language.ENGLISH]: '❌ This command can only be used in groups! 👥'
  },
  'tagall.no_metadata': {
    [Language.INDONESIAN]: '❌ Nggak bisa ambil info grup nih. Coba lagi! 🔄',
    [Language.ENGLISH]: '❌ Can\'t get group info. Please try again! 🔄'
  },
  'tagall.no_members': {
    [Language.INDONESIAN]: '❌ Grup ini nggak ada anggotanya. Aneh deh! 🤔',
    [Language.ENGLISH]: '❌ This group has no members. That\'s weird! 🤔'
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
    [Language.INDONESIAN]: '❌ Kamu nggak punya akses untuk perintah ini.\n\n_Cuma admin dan owner yang bisa upgrade pengguna lain._',
    [Language.ENGLISH]: '❌ You don\'t have access to this command.\n\n_Only admin and owner can upgrade other users._'
  },
  'upgrade.invalid_target': {
    [Language.INDONESIAN]: '❌ Tag pengguna yang mau di-upgrade atau masukkan nomornya.\n\n*Cara pakai:*\n• `upgrade @user` (tag pengguna)\n• `upgrade 6281234567890` (nomor telepon)',
    [Language.ENGLISH]: '❌ Please tag the user you want to upgrade or enter their number.\n\n*How to use:*\n• `upgrade @user` (tag user)\n• `upgrade 6281234567890` (phone number)'
  },
  'upgrade.user_not_found': {
    [Language.INDONESIAN]: '❌ Pengguna belum daftar di sistem nih.\n\n_Mereka harus register dulu dengan perintah register_',
    [Language.ENGLISH]: '❌ User is not registered in the system yet.\n\n_They must register first with the register command_'
  },
  'upgrade.already_premium': {
    [Language.INDONESIAN]: '⚠️ Pengguna ini udah level {levelName} atau lebih tinggi kok.\n\n📊 *Level sekarang:* {levelName}',
    [Language.ENGLISH]: '⚠️ This user already has {levelName} level or higher.\n\n📊 *Current level:* {levelName}'
  },
  'upgrade.self_upgrade_denied': {
    [Language.INDONESIAN]: '❌ Kamu nggak bisa upgrade level diri sendiri dong! 😅',
    [Language.ENGLISH]: '❌ You can\'t upgrade your own level! 😅'
  },
  'upgrade.upgrade_failed': {
    [Language.INDONESIAN]: '❌ Gagal upgrade pengguna nih. Coba lagi ya!\n\n_Kalau masih error, hubungi admin sistem._',
    [Language.ENGLISH]: '❌ Failed to upgrade user. Please try again!\n\n_If it keeps failing, contact system admin._'
  },
  'upgrade.success_with_mention': {
    [Language.INDONESIAN]: '✅ Berhasil upgrade @{targetPhone} ke level Premium! 🎉\n\n👤 *Target:* {targetName}\n👑 *Diupgrade oleh:* {adminName}\n🕐 *Waktu:* {currentTime}',
    [Language.ENGLISH]: '✅ Successfully upgraded @{targetPhone} to Premium level! 🎉\n\n👤 *Target:* {targetName}\n👑 *Upgraded by:* {adminName}\n🕐 *Time:* {currentTime}'
  },
  'upgrade.success_without_mention': {
    [Language.INDONESIAN]: '✅ Berhasil upgrade pengguna {targetPhone} ke level Premium! 🎉\n\n👑 *Diupgrade oleh:* {adminName}\n🕐 *Waktu:* {currentTime}',
    [Language.ENGLISH]: '✅ Successfully upgraded user {targetPhone} to Premium level! 🎉\n\n👑 *Upgraded by:* {adminName}\n🕐 *Time:* {currentTime}'
  },
  'upgrade.user_notification': {
    [Language.INDONESIAN]: '🎉 *Selamat! Level kamu diupgrade!* 🚀\n\n📈 Level akun kamu sekarang jadi *Premium*!\n\n✨ *Keuntungan Premium:*\n• Limit lebih tinggi untuk semua fitur\n• Akses prioritas ke fitur baru\n• Support lebih baik\n\n👑 *Diupgrade oleh:* {adminName}\n🕐 *Waktu:* {currentTime}\n\n_Makasih udah pakai bot kami!_ 💝',
    [Language.ENGLISH]: '🎉 *Congratulations! Your level upgraded!* 🚀\n\n📈 Your account level is now *Premium*!\n\n✨ *Premium Benefits:*\n• Higher limits for all features\n• Priority access to new features\n• Better support\n\n👑 *Upgraded by:* {adminName}\n🕐 *Time:* {currentTime}\n\n_Thank you for using our bot!_ 💝'
  },  'upgrade.general_error': {
    [Language.INDONESIAN]: '❌ Ada error saat upgrade pengguna. Coba lagi ya!\n\n_Kalau masih error terus, hubungi admin._',
    [Language.ENGLISH]: '❌ Error upgrading user. Please try again!\n\n_If it keeps failing, contact admin._'
  },
  'upgrade.database_error': {
    [Language.INDONESIAN]: '❌ Ada masalah database saat upgrade pengguna.\n\n_Coba lagi nanti atau hubungi admin._',
    [Language.ENGLISH]: '❌ Database issue while upgrading user.\n\n_Please try again later or contact admin._'
  },
  'upgrade.validation_error': {
    [Language.INDONESIAN]: '❌ Data pengguna nggak valid untuk diupgrade.\n\n_Coba lagi nanti atau hubungi admin._',
    [Language.ENGLISH]: '❌ User data is not valid for upgrade.\n\n_Please try again later or contact admin._'
  },
  'upgrade.permission_error': {
    [Language.INDONESIAN]: '❌ Nggak punya izin untuk upgrade pengguna ini.\n\n_Coba lagi nanti atau hubungi admin._',
    [Language.ENGLISH]: '❌ No permission to upgrade this user.\n\n_Please try again later or contact admin._'
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
    [Language.INDONESIAN]: '❌ Kamu nggak punya akses untuk perintah ini.\n\n_Cuma owner yang bisa atur admin._',
    [Language.ENGLISH]: '❌ You don\'t have access to this command.\n\n_Only owner can set admin._'
  },
  'setadmin.invalid_target': {
    [Language.INDONESIAN]: '❌ Tag pengguna atau masukkan nomor yang mau dijadikan admin.\n\n*Cara pakai:*\n• `setadmin @user` (tag pengguna)\n• `setadmin 6281234567890` (nomor telepon)',
    [Language.ENGLISH]: '❌ Please tag a user or enter number to make admin.\n\n*How to use:*\n• `setadmin @user` (tag user)\n• `setadmin 6281234567890` (phone number)'
  },
  'setadmin.owner_already_admin': {
    [Language.INDONESIAN]: '⚠️ Owner udah punya hak akses tertinggi kok! 👑',
    [Language.ENGLISH]: '⚠️ Owner already has the highest access level! 👑'
  },
  'setadmin.user_not_found': {
    [Language.INDONESIAN]: '❌ Pengguna belum daftar di sistem nih.\n\n_Mereka harus register dulu._',
    [Language.ENGLISH]: '❌ User is not registered in the system yet.\n\n_They must register first._'
  },
  'setadmin.already_admin': {
    [Language.INDONESIAN]: '⚠️ {userName} ({phoneNumber}) udah jadi Admin atau lebih tinggi kok.\n\n📊 *Level sekarang:* {currentLevel}',
    [Language.ENGLISH]: '⚠️ {userName} ({phoneNumber}) is already Admin or higher.\n\n📊 *Current level:* {currentLevel}'
  },
  'setadmin.update_failed': {
    [Language.INDONESIAN]: '❌ Gagal update level pengguna ke Admin nih.\n\n_Coba lagi atau hubungi support._',
    [Language.ENGLISH]: '❌ Failed to update user level to Admin.\n\n_Please try again or contact support._'
  },
  'setadmin.success': {
    [Language.INDONESIAN]: '✅ Berhasil jadikan {userName} sebagai Admin! 🎉\n\n👤 *Pengguna:* {userName}\n📱 *Nomor:* {phoneNumber}\n📈 *Level sebelumnya:* {previousLevel}\n🚀 *Level baru:* Admin\n🕐 *Waktu:* {currentTime}\n\n🎉 Selamat! Mereka sekarang punya akses Admin.',
    [Language.ENGLISH]: '✅ Successfully made {userName} an Admin! 🎉\n\n👤 *User:* {userName}\n📱 *Number:* {phoneNumber}\n📈 *Previous level:* {previousLevel}\n🚀 *New level:* Admin\n🕐 *Time:* {currentTime}\n\n🎉 Congratulations! They now have Admin access.'
  },
  'setadmin.user_notification': {
    [Language.INDONESIAN]: '🎉 *Selamat! Kamu jadi Admin sekarang!* 👑\n\n📈 Level akun kamu diupgrade jadi *Admin* sama Owner.\n\n✨ *Hak Akses Admin:*\n• Kelola pengguna dan level mereka\n• Akses fitur khusus admin\n• Reset limit penggunaan pengguna\n• Broadcast pesan ke semua pengguna\n• Akses ke semua perintah bot\n\n🤖 *Bot:* {botName}\n🕐 *Waktu promosi:* Sekarang\n\n_Gunakan kekuatan ini dengan bijak ya!_ 💪',
    [Language.ENGLISH]: '🎉 *Congratulations! You are now an Admin!* 👑\n\n📈 Your account level has been upgraded to *Admin* by the Owner.\n\n✨ *Admin Access:*\n• Manage users and their levels\n• Access special admin features\n• Reset user usage limits\n• Broadcast messages to all users\n• Access to all bot commands\n\n🤖 *Bot:* {botName}\n🕐 *Promotion time:* Now\n\n_Use this power wisely!_ 💪'
  },  'setadmin.general_error': {
    [Language.INDONESIAN]: '❌ Ada error saat atur admin. Coba lagi ya!\n\n_Kalau masih bermasalah, hubungi support._',
    [Language.ENGLISH]: '❌ Error setting admin. Please try again!\n\n_If problem persists, contact support._'
  },
  'setadmin.database_error': {
    [Language.INDONESIAN]: '❌ Ada masalah database saat update level pengguna.\n\n_Coba lagi nanti atau hubungi support._',
    [Language.ENGLISH]: '❌ Database issue while updating user level.\n\n_Please try again later or contact support._'
  },
  'setadmin.permission_error': {
    [Language.INDONESIAN]: '❌ Nggak punya izin untuk operasi ini.\n\n_Coba lagi nanti atau hubungi support._',
    [Language.ENGLISH]: '❌ No permission for this operation.\n\n_Please try again later or contact support._'
  },
  'setadmin.user_error': {
    [Language.INDONESIAN]: '❌ Pengguna nggak ketemu atau nggak valid.\n\n_Coba lagi nanti atau hubungi support._',
    [Language.ENGLISH]: '❌ User not found or invalid.\n\n_Please try again later or contact support._'
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

  // SafeBroadcast command
  'safebroadcast.help': {
    [Language.INDONESIAN]: '📢 *SAFE BROADCAST COMMAND*\n\n*Penggunaan:*\n`safebroadcast <pesan> [level]`\n\n*Level Filter:*\n• `all` - Semua pengguna (default)\n• `free` - Hanya pengguna Free\n• `premium` - Hanya pengguna Premium\n• `admin` - Hanya Admin\n\n*Fitur Anti-Spam:*\n• 🛡️ Rate limiting adaptif\n• 🕵️ Deteksi konten spam\n• ✅ Validasi recipient otomatis\n• 📊 Monitoring real-time\n• 🚫 Auto-stop jika terdeteksi spam\n\n*Contoh:*\n• `safebroadcast Halo semua!`\n• `safebroadcast Pesan premium premium`\n\n⚠️ *Hanya untuk Owner*',
    [Language.ENGLISH]: '📢 *SAFE BROADCAST COMMAND*\n\n*Usage:*\n`safebroadcast <message> [level]`\n\n*Level Filters:*\n• `all` - All users (default)\n• `free` - Free users only\n• `premium` - Premium users only\n• `admin` - Admin users only\n\n*Anti-Spam Features:*\n• 🛡️ Adaptive rate limiting\n• 🕵️ Spam content detection\n• ✅ Automatic recipient validation\n• 📊 Real-time monitoring\n• 🚫 Auto-stop if spam detected\n\n*Examples:*\n• `safebroadcast Hello everyone!`\n• `safebroadcast Premium message premium`\n\n⚠️ *Owner Only*'
  },
  'safebroadcast.spam_detected': {
    [Language.INDONESIAN]: '⚠️ *Pesan Terdeteksi Sebagai Spam*\n\nPesan Anda mengandung konten yang berisiko tinggi terdeteksi sebagai spam oleh WhatsApp.\n\n*Alasan:*\n• Terlalu banyak kata kunci promosi\n• Format pesan tidak natural\n• Mengandung URL atau link\n\n*Saran:* Ubah pesan agar lebih personal dan natural.',
    [Language.ENGLISH]: '⚠️ *Message Detected as Spam*\n\nYour message contains content that has a high risk of being detected as spam by WhatsApp.\n\n*Reasons:*\n• Too many promotional keywords\n• Unnatural message format\n• Contains URLs or links\n\n*Suggestion:* Modify the message to be more personal and natural.'
  },
  'safebroadcast.confirmation': {
    [Language.INDONESIAN]: '📢 *SAFE BROADCAST CONFIRMATION*\n\n📝 *Preview Pesan:*\n```{previewMessage}```\n\n📊 *Detail Broadcast:*\n🎯 *Target:* {levelFilter}\n👥 *Jumlah penerima:* {userCount} pengguna\n📦 *Jumlah batch:* {batches} batch\n👤 *Per batch:* {batchSize} pengguna\n⏱️ *Estimasi waktu:* ~{estimatedTime} menit\n🛡️ *Delay per pesan:* {delay} detik\n📏 *Panjang pesan:* {messageLength} karakter\n\n⚠️ *PROTEKSI ANTI-SPAM AKTIF:*\n• Rate limiting dengan delay adaptif\n• Validasi recipient otomatis\n• Error handling dengan auto-throttle\n• Monitoring real-time\n\n🚀 *Broadcast akan dimulai dalam 10 detik...*\n_Kirim pesan apapun untuk membatalkan_',
    [Language.ENGLISH]: '📢 *SAFE BROADCAST CONFIRMATION*\n\n📝 *Message Preview:*\n```{previewMessage}```\n\n📊 *Broadcast Details:*\n🎯 *Target:* {levelFilter}\n👥 *Recipients:* {userCount} users\n📦 *Batches:* {batches} batches\n👤 *Per batch:* {batchSize} users\n⏱️ *Estimated time:* ~{estimatedTime} minutes\n🛡️ *Delay per message:* {delay} seconds\n📏 *Message length:* {messageLength} characters\n\n⚠️ *ANTI-SPAM PROTECTION ACTIVE:*\n• Rate limiting with adaptive delay\n• Automatic recipient validation\n• Error handling with auto-throttle\n• Real-time monitoring\n\n🚀 *Broadcast will start in 10 seconds...*\n_Send any message to cancel_'
  },
  'safebroadcast.starting': {
    [Language.INDONESIAN]: '🚀 *SAFE BROADCAST DIMULAI*\n\n📊 Target: {userCount} pengguna dalam {batches} batch\n🛡️ Anti-spam protection: AKTIF\n⏰ Waktu mulai: {currentTime}\n\n_Progress akan diupdate setiap batch..._',
    [Language.ENGLISH]: '🚀 *SAFE BROADCAST STARTED*\n\n📊 Target: {userCount} users in {batches} batches\n🛡️ Anti-spam protection: ACTIVE\n⏰ Start time: {currentTime}\n\n_Progress will be updated every batch..._'
  },
  'safebroadcast.spam_alert': {
    [Language.INDONESIAN]: '🚨 *SPAM ALERT TERDETEKSI!*\n\nBot mendeteksi pesan terblokir sebagai spam.\nBroadcast dihentikan untuk melindungi akun.\n\n📊 *Progress saat ini:*\n✅ Berhasil: {successCount}\n❌ Gagal: {failedCount}\n🚫 Diblokir: {blockedCount}\n\n⏰ Waktu: {currentTime}',
    [Language.ENGLISH]: '🚨 *SPAM ALERT DETECTED!*\n\nBot detected messages blocked as spam.\nBroadcast stopped to protect account.\n\n📊 *Current progress:*\n✅ Success: {successCount}\n❌ Failed: {failedCount}\n🚫 Blocked: {blockedCount}\n\n⏰ Time: {currentTime}'
  },
  'safebroadcast.batch_progress': {
    [Language.INDONESIAN]: '📊 *PROGRESS BATCH {currentBatch}/{totalBatches}*\n\n🎯 Progress: {progressPercent}%\n✅ Berhasil: {successCount}\n❌ Gagal: {failedCount}\n🚫 Diblokir: {blockedCount}\n⏭️ Dilewati: {skippedCount}\n⏱️ Elapsed: {elapsedTime}s\n\n{nextBatchMessage}',
    [Language.ENGLISH]: '📊 *BATCH PROGRESS {currentBatch}/{totalBatches}*\n\n🎯 Progress: {progressPercent}%\n✅ Success: {successCount}\n❌ Failed: {failedCount}\n🚫 Blocked: {blockedCount}\n⏭️ Skipped: {skippedCount}\n⏱️ Elapsed: {elapsedTime}s\n\n{nextBatchMessage}'
  },
  'safebroadcast.summary': {
    [Language.INDONESIAN]: '📊 *SAFE BROADCAST SELESAI*\n\n🎯 *Target:* {levelFilter} ({userCount} pengguna)\n✅ *Berhasil:* {successCount} ({successRate}%)\n❌ *Gagal:* {failedCount}\n🚫 *Diblokir:* {blockedCount}\n⏭️ *Dilewati:* {skippedCount}\n⏱️ *Total waktu:* {totalTime}s ({totalMinutes} menit)\n📈 *Rate:* {messageRate} pesan/menit\n🛡️ *Status:* {safetyStatus}\n\n⏰ *Selesai:* {endTime}\n\n{failedInfo}{blockedInfo}{skippedInfo}\n📝 *Rekomendasi:*\n{recommendations}',
    [Language.ENGLISH]: '📊 *SAFE BROADCAST COMPLETED*\n\n🎯 *Target:* {levelFilter} ({userCount} users)\n✅ *Success:* {successCount} ({successRate}%)\n❌ *Failed:* {failedCount}\n🚫 *Blocked:* {blockedCount}\n⏭️ *Skipped:* {skippedCount}\n⏱️ *Total time:* {totalTime}s ({totalMinutes} minutes)\n📈 *Rate:* {messageRate} messages/minute\n🛡️ *Status:* {safetyStatus}\n\n⏰ *Completed:* {endTime}\n\n{failedInfo}{blockedInfo}{skippedInfo}\n📝 *Recommendations:*\n{recommendations}'
  },
  'safebroadcast.error': {
    [Language.INDONESIAN]: '❌ *Error dalam Safe Broadcast*\n\n🚨 Terjadi kesalahan: {errorMessage}\n⏰ Waktu: {currentTime}\n\n🔧 *Saran:*\n• Coba lagi dalam beberapa menit\n• Periksa koneksi internet\n• Hubungi developer jika masalah berlanjut',
    [Language.ENGLISH]: '❌ *Safe Broadcast Error*\n\n🚨 Error occurred: {errorMessage}\n⏰ Time: {currentTime}\n\n🔧 *Suggestions:*\n• Try again in a few minutes\n• Check internet connection\n• Contact developer if problem persists'  },

  // Common status messages for broadcasts and other operations
  'common.safe_status': {
    [Language.INDONESIAN]: '🟢 AMAN',
    [Language.ENGLISH]: '🟢 SAFE'
  },
  'common.warning_status': {
    [Language.INDONESIAN]: '🟡 PERINGATAN',
    [Language.ENGLISH]: '🟡 WARNING'
  },
  'common.danger_status': {
    [Language.INDONESIAN]: '🔴 BAHAYA',
    [Language.ENGLISH]: '🔴 DANGER'
  },
  'common.failed': {
    [Language.INDONESIAN]: 'Gagal',
    [Language.ENGLISH]: 'Failed'
  },
  'common.blocked': {
    [Language.INDONESIAN]: 'Diblokir',
    [Language.ENGLISH]: 'Blocked'
  },
  'common.skipped': {
    [Language.INDONESIAN]: 'Dilewati',
    [Language.ENGLISH]: 'Skipped'
  },
  'common.others': {
    [Language.INDONESIAN]: 'Lainnya',
    [Language.ENGLISH]: 'Others'
  },
  'common.waiting_next_batch': {
    [Language.INDONESIAN]: '⏳ Menunggu batch berikutnya...',
    [Language.ENGLISH]: '⏳ Waiting for next batch...'
  },
  'common.almost_finished': {
    [Language.INDONESIAN]: '🏁 Hampir selesai...',
    [Language.ENGLISH]: '🏁 Almost finished...'
  },
  'safebroadcast.recommendations_warning': {
    [Language.INDONESIAN]: '⚠️ Tingkat kegagalan tinggi. Kurangi kecepatan broadcast dan gunakan pesan yang lebih personal.',
    [Language.ENGLISH]: '⚠️ High failure rate detected. Reduce broadcast speed and use more personalized messages.'
  },
  'safebroadcast.recommendations_safe': {
    [Language.INDONESIAN]: '✅ Broadcast berjalan dengan baik. Rate dan konten aman untuk WhatsApp.',
    [Language.ENGLISH]: '✅ Broadcast is running well. Rate and content are safe for WhatsApp.'
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

  // Language command specific keys
  'language.current_language_id': {
    [Language.INDONESIAN]: '🌐 Bahasa saat ini: Bahasa Indonesia',
    [Language.ENGLISH]: '🌐 Current language: Indonesian'
  },
  'language.current_language_en': {
    [Language.INDONESIAN]: '🌐 Bahasa saat ini: English',
    [Language.ENGLISH]: '🌐 Current language: English'
  },
  'language.changed_success_id': {
    [Language.INDONESIAN]: '✅ Bahasa berhasil diubah ke Bahasa Indonesia!',
    [Language.ENGLISH]: '✅ Language successfully changed to Indonesian!'
  },
  'language.changed_success_en': {
    [Language.INDONESIAN]: '✅ Bahasa berhasil diubah ke English!',
    [Language.ENGLISH]: '✅ Language successfully changed to English!'
  },

  // Profile command specific keys
  'profile.phone_label': {
    [Language.INDONESIAN]: '📱 *Nomor:*',
    [Language.ENGLISH]: '📱 *Phone:*'
  },
  'profile.level_label': {
    [Language.INDONESIAN]: '🏆 *Level:*',
    [Language.ENGLISH]: '🏆 *Level:*'
  },
  'profile.registration_date_label': {
    [Language.INDONESIAN]: '📅 *Terdaftar:*',
    [Language.ENGLISH]: '📅 *Registered:*'
  },
  'profile.welcome_message': {
    [Language.INDONESIAN]: 'Selamat datang {userName}! Bot {botName} siap membantu Anda.',
    [Language.ENGLISH]: 'Welcome {userName}! Bot {botName} is ready to assist you.'
  },

  // Limit command specific keys
  'limit.current_usage': {
    [Language.INDONESIAN]: '📊 Penggunaan: {currentUsage}/{maxUsage}',
    [Language.ENGLISH]: '📊 Usage: {currentUsage}/{maxUsage}'
  },
  'limit.usage_summary': {
    [Language.INDONESIAN]: '📈 *Ringkasan Penggunaan:* Fitur N8N, Reminder, dan Tag All tersedia',
    [Language.ENGLISH]: '📈 *Usage Summary:* N8N, Reminder, and Tag All features available'
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
 * Get command description in user's language
 * @param commandName - Command name
 * @param language - User's preferred language
 * @returns Translated command description
 */
export function getCommandDescription(commandName: string, language: Language = Language.INDONESIAN): string {
  const key = `command.desc.${commandName}`;
  return getText(key, language, commandName); // Fallback to command name if translation not found
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
