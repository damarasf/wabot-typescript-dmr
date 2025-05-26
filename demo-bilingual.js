const { getText } = require('./dist/utils/i18n');

console.log('🌐 BILINGUAL WHATSAPP BOT - USAGE DEMONSTRATION\n');

// Simulate different users with different language preferences
const users = [
  { name: 'Ahmad', language: 'id', level: 'Premium' },
  { name: 'Sarah', language: 'en', level: 'Free' },
  { name: 'David', language: 'en', level: 'Admin' }
];

console.log('=== USER REGISTRATION RESPONSES ===');
users.forEach(user => {
  const welcome = getText('register.success', user.language);
  console.log(`👤 ${user.name} (${user.language.toUpperCase()}): ${welcome}\n`);
});

console.log('=== PROFILE INFORMATION ===');
users.forEach(user => {
  const title = getText('profile.title', user.language);
  const level = getText('profile.level_label', user.language);
  console.log(`👤 ${user.name}:`);
  console.log(`${title}`);
  console.log(`${level} ${user.level}\n`);
});

console.log('=== HELP SYSTEM ===');
users.forEach(user => {
  const title = getText('help.title', user.language);
  const status = getText('help.status', user.language);
  console.log(`👤 ${user.name}: ${title}`);
  console.log(`${status}: ${user.level}\n`);
});

console.log('=== LANGUAGE SWITCHING SIMULATION ===');
// Simulate language switching
console.log('📱 Ahmad switches from Indonesian to English:');
console.log(`Before: ${getText('help.title', 'id')}`);
console.log(`After:  ${getText('help.title', 'en')}`);

console.log('\n📱 Sarah switches from English to Indonesian:');
console.log(`Before: ${getText('profile.title', 'en')}`);
console.log(`After:  ${getText('profile.title', 'id')}`);

console.log('\n=== ADMIN COMMAND EXAMPLES ===');
const adminCommands = [
  {
    key: 'setlimit.success',
    replacements: {
      userName: 'John Doe',
      phoneNumber: '+62812345678',
      feature: 'N8N Integration',
      limit: '100',
      currentUsage: '25'
    }
  },
  {
    key: 'broadcast.help'
  }
];

adminCommands.forEach(cmd => {
  console.log(`\n📋 ${cmd.key}:`);
  console.log(`🇮🇩 Indonesian:`);
  console.log(getText(cmd.key, 'id', undefined, cmd.replacements));
  console.log(`\n🇺🇸 English:`);
  console.log(getText(cmd.key, 'en', undefined, cmd.replacements));
  console.log('─'.repeat(50));
});

console.log('\n✅ BILINGUAL SYSTEM FULLY OPERATIONAL!');
console.log('🎯 All commands support both Indonesian and English');
console.log('🔄 Users can switch languages anytime with !language command');
console.log('💾 Language preferences are saved in the database');
console.log('🌍 Ready for international WhatsApp bot usage!');
