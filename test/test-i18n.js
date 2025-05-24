const { getText, getLevelName, isValidLanguage, getAvailableLanguages } = require('../dist/utils/i18n.js');
const { Language } = require('../dist/database/models/index.js');

console.log('=== Testing Multi-language System ===\n');

// Test basic translation
console.log('1. Testing basic translations:');
console.log('ID:', getText('register.success', Language.INDONESIAN));
console.log('EN:', getText('register.success', Language.ENGLISH));
console.log();

// Test user levels
console.log('2. Testing user levels:');
console.log('Free ID:', getLevelName(1, Language.INDONESIAN));
console.log('Free EN:', getLevelName(1, Language.ENGLISH));
console.log('Premium ID:', getLevelName(2, Language.INDONESIAN));
console.log('Premium EN:', getLevelName(2, Language.ENGLISH));
console.log();

// Test language validation
console.log('3. Testing language validation:');
console.log('Valid "id":', isValidLanguage('id'));
console.log('Valid "en":', isValidLanguage('en'));
console.log('Invalid "fr":', isValidLanguage('fr'));
console.log();

// Test available languages
console.log('4. Available languages:', getAvailableLanguages());
console.log();

// Test help messages
console.log('5. Testing help messages:');
console.log('Help title ID:', getText('help.title', Language.INDONESIAN));
console.log('Help title EN:', getText('help.title', Language.ENGLISH));
console.log();

// Test profile messages
console.log('6. Testing profile messages:');
console.log('Profile title ID:', getText('profile.title', Language.INDONESIAN));
console.log('Profile title EN:', getText('profile.title', Language.ENGLISH));
console.log();

// Test language command messages
console.log('7. Testing language command messages:');
console.log('Current lang ID:', getText('language.current', Language.INDONESIAN));
console.log('Current lang EN:', getText('language.current', Language.ENGLISH));

console.log('\n=== Multi-language Test Complete ===');
