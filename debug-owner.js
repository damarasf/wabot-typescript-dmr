const config = require('./dist/utils/config').default;
const { normalizePhoneNumber, isOwner } = require('./dist/utils/phoneUtils');
const { getUserByPhone } = require('./dist/utils/userManager');

async function debugOwnerLookup() {
  try {
    console.log('=== Owner Detection Debug ===');
    
    // Test phone numbers
    const testNumbers = [
      '6281319916659@c.us',
      '6281319916659',
      '+6281319916659@c.us',
      '+6281319916659'
    ];
    
    console.log('Config owner number:', config.ownerNumber);
    console.log('Config owner formatted:', config.ownerNumberFormatted);
    
    for (const testNumber of testNumbers) {
      console.log(`\n--- Testing: ${testNumber} ---`);
      console.log('Normalized:', normalizePhoneNumber(testNumber));
      console.log('Is owner:', isOwner(testNumber, config.ownerNumber));
      
      // Test database lookup
      const user = await getUserByPhone(testNumber);
      console.log('Database user found:', user ? `Yes (Level: ${user.level})` : 'No');
    }
    
    // Test the actual logic from commandParser
    console.log('\n=== Command Parser Logic Test ===');
    const senderIdExample = '6281319916659@c.us';
    const isOwnerResult = isOwner(senderIdExample, config.ownerNumber);
    
    console.log('Sender ID:', senderIdExample);
    console.log('Is owner check result:', isOwnerResult);
    
    if (!isOwnerResult) {
      console.log('❌ Owner detection failed - will try database lookup');
      const user = await getUserByPhone(senderIdExample);
      console.log('Database lookup result:', user ? `Found (Level: ${user.level})` : 'Not found');
    } else {
      console.log('✅ Owner detected - skipping database lookup');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Debug error:', error.message);
    process.exit(1);
  }
}

debugOwnerLookup();
