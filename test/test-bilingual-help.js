// Test bilingual help command functionality
const { Language, UserLevel } = require('../dist/database/models');
const { getCategoryName, getCommandDescription } = require('../dist/utils/i18n');

console.log('=== BILINGUAL HELP COMMAND TEST ===\n');

// Test category name translations
console.log('1. Testing Category Name Translations:');
console.log('-------------------------------------------');
const categories = ['Umum', 'Grup', 'N8N', 'Utilitas', 'Admin', 'Owner'];

categories.forEach(category => {
  const indonesian = getCategoryName(category, Language.INDONESIAN);
  const english = getCategoryName(category, Language.ENGLISH);
  console.log(`${category}: ID="${indonesian}" | EN="${english}"`);
});

console.log('\n2. Testing Command Description Translations:');
console.log('-------------------------------------------');
const commands = ['help', 'register', 'profile', 'n8n', 'tagall', 'setadmin'];

commands.forEach(command => {
  const indonesian = getCommandDescription(command, Language.INDONESIAN);
  const english = getCommandDescription(command, Language.ENGLISH);
  console.log(`${command}:`);
  console.log(`  ID: ${indonesian}`);
  console.log(`  EN: ${english}`);
  console.log('');
});

console.log('3. Testing Help Menu Headers:');
console.log('-------------------------------------------');
const { getText } = require('../dist/utils/i18n');

const helpKeys = ['help.total_commands', 'help.tips', 'help.usage', 'help.example'];
helpKeys.forEach(key => {
  const indonesian = getText(key, Language.INDONESIAN);
  const english = getText(key, Language.ENGLISH);
  console.log(`${key}:`);
  console.log(`  ID: ${indonesian}`);
  console.log(`  EN: ${english}`);
  console.log('');
});

console.log('=== TEST COMPLETED ===');
