// Simple test for i18n functionality
const path = require('path');

// Import the compiled i18n module
const distPath = path.join(__dirname, '..', 'dist');
const i18n = require(path.join(distPath, 'utils', 'i18n.js'));

console.log('🧪 Testing i18n functionality...\n');

// Test the getText function directly
const getText = i18n.getText || i18n.default?.getText || i18n.default;

if (getText) {
    console.log('✅ getText function found');
    
    // Test with both languages
    const testKeys = [
        'command.desc.safebroadcast',
        'common.safe_status',
        'common.failed',
        'safebroadcast.help'
    ];
    
    testKeys.forEach(key => {
        try {
            console.log(`\n📋 Testing key: ${key}`);
            const indonesian = getText(key, 'INDONESIAN');
            const english = getText(key, 'ENGLISH');
            
            console.log(`   ID: ${indonesian?.substring(0, 100)}${indonesian?.length > 100 ? '...' : ''}`);
            console.log(`   EN: ${english?.substring(0, 100)}${english?.length > 100 ? '...' : ''}`);
            
            // Check if they're different (properly translated)
            if (indonesian === english) {
                console.log(`   ⚠️  Same value for both languages`);
            } else {
                console.log(`   ✅ Different values - properly translated`);
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
    });
} else {
    console.log('❌ getText function not found');
    console.log('Available properties:', Object.keys(i18n));
    if (i18n.default) {
        console.log('Default properties:', Object.keys(i18n.default));
    }
}

console.log('\n🏁 i18n test completed!');
