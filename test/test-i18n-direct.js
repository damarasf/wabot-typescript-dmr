// Direct test of the i18n system with specific focus on the translations
const path = require('path');

// Import compiled modules directly
const distPath = path.join(__dirname, '..', 'dist');

console.log('🧪 Testing direct i18n translation system...\n');

try {
    // Load the compiled i18n module
    const i18nModule = require(path.join(distPath, 'utils', 'i18n.js'));
    
    // Check what's available
    console.log('📋 Available exports:', Object.keys(i18nModule));
    
    // Test different ways to access getText
    let getText = i18nModule.getText || i18nModule.default?.getText || i18nModule.default;
    
    if (!getText) {
        console.log('❌ getText function not found in any form');
        console.log('   - Direct access:', !!i18nModule.getText);
        console.log('   - Default access:', !!i18nModule.default?.getText);
        console.log('   - Default direct:', !!i18nModule.default);
        
        // Try to access the default export directly
        if (i18nModule.default) {
            console.log('   - Default properties:', Object.keys(i18nModule.default));
        }
        
        process.exit(1);
    }
    
    console.log('✅ getText function found\n');
    
    // Test translations with the exact values from the file
    const testCases = [
        {
            key: 'command.desc.safebroadcast',
            expectedID: 'Broadcast aman dengan anti-spam protection',
            expectedEN: 'Safe broadcast with anti-spam protection'
        },
        {
            key: 'common.safe_status',
            expectedID: '🟢 AMAN',
            expectedEN: '🟢 SAFE'
        },
        {
            key: 'common.failed',
            expectedID: 'Gagal',
            expectedEN: 'Failed'
        }
    ];
    
    testCases.forEach((testCase, index) => {
        console.log(`📋 Test ${index + 1}: ${testCase.key}`);
        
        try {
            const indonesianText = getText(testCase.key, 'id');
            const englishText = getText(testCase.key, 'en');
            
            console.log(`   ID Result: "${indonesianText}"`);
            console.log(`   ID Expected: "${testCase.expectedID}"`);
            console.log(`   ID Match: ${indonesianText === testCase.expectedID ? '✅' : '❌'}`);
            
            console.log(`   EN Result: "${englishText}"`);
            console.log(`   EN Expected: "${testCase.expectedEN}"`);
            console.log(`   EN Match: ${englishText === testCase.expectedEN ? '✅' : '❌'}`);
            
            console.log(`   Different languages: ${indonesianText !== englishText ? '✅' : '❌'}`);
            
        } catch (error) {
            console.log(`   ❌ Error testing ${testCase.key}:`, error.message);
        }
        
        console.log('');
    });
    
    // Test with actual enum values
    console.log('📋 Testing with enum values from User model...');
    
    try {
        const userModule = require(path.join(distPath, 'database', 'models', 'User.js'));
        console.log('   Available User exports:', Object.keys(userModule));
        
        const Language = userModule.Language || userModule.default?.Language;
        
        if (Language) {
            console.log('   Language enum found:', Language);
            console.log('   INDONESIAN:', Language.INDONESIAN);
            console.log('   ENGLISH:', Language.ENGLISH);
            
            // Test with enum values
            const testKey = 'command.desc.safebroadcast';
            const resultID = getText(testKey, Language.INDONESIAN);
            const resultEN = getText(testKey, Language.ENGLISH);
            
            console.log(`   Using enum - ID: "${resultID}"`);
            console.log(`   Using enum - EN: "${resultEN}"`);
            console.log(`   Different: ${resultID !== resultEN ? '✅' : '❌'}`);
            
        } else {
            console.log('   ❌ Language enum not found');
        }
        
    } catch (error) {
        console.log('   ❌ Error loading User model:', error.message);
    }
    
} catch (error) {
    console.log('❌ Critical error:', error.message);
}

console.log('\n🏁 Direct translation test completed!');
