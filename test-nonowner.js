const { User } = require('./dist/database/models');
const { parseCommand } = require('./dist/middlewares/commandParser');

// Mock message object for testing
function createMockMessage(body, senderId = '6281319916659@c.us') {
  return {
    body: body,
    sender: {
      id: senderId,
      pushname: 'Test User'
    },
    chatId: 'test@c.us',
    id: 'test123',
    isGroupMsg: false
  };
}

async function testNonOwnerCommands() {
  try {
    console.log('🔧 Testing Non-Owner Commands...\n');
    
    // Check if non-owner user exists in database
    const nonOwnerUser = await User.findOne({ where: { phoneNumber: '628123456789' } });
    console.log(`Non-owner user in DB: ${nonOwnerUser ? 'YES' : 'NO'}`);
    if (nonOwnerUser) {
      console.log(`Details: Phone=${nonOwnerUser.phoneNumber}, Level=${nonOwnerUser.level}`);
    }
    
    // Mock the command for testing
    const mockProfileCommand = {
      name: 'profile',
      description: 'Test profile command',
      usage: '!profile',
      example: '!profile',
      category: 'Test',
      minimumLevel: 1, // FREE level required
      execute: async (message, args, client, user) => {
        console.log(`Profile command executed with user: ${user ? 'Present' : 'Undefined'}`);
        return Promise.resolve();
      }
    };
    
    // Mock getCommand function
    require('./dist/handlers/commandHandler').getCommand = (name) => {
      if (name === 'profile') return mockProfileCommand;
      return null;
    };
    
    console.log('\nTesting profile command for non-owner...');
    const nonOwnerMessage = createMockMessage('!profile', '628123456789@c.us');
    const nonOwnerContext = await parseCommand(nonOwnerMessage);
    
    if (nonOwnerContext) {
      console.log(`✅ Non-owner command parsing: PASS`);
      console.log(`Command: ${nonOwnerContext.command.name}`);
      console.log(`User provided: ${nonOwnerContext.user ? 'YES' : 'NO'}`);
      if (nonOwnerContext.user) {
        console.log(`User details: Phone=${nonOwnerContext.user.phoneNumber}, Level=${nonOwnerContext.user.level}`);
      }
    } else {
      console.log(`❌ Non-owner command parsing: FAIL - Command context is null`);
    }
    
    // Test with an unregistered user
    console.log('\nTesting profile command for unregistered user...');
    const unregisteredMessage = createMockMessage('!profile', '628999999999@c.us');
    const unregisteredContext = await parseCommand(unregisteredMessage);
    
    if (unregisteredContext) {
      console.log(`✅ Unregistered user command parsing: PASS`);
    } else {
      console.log(`❌ Unregistered user command parsing: FAIL - This is expected for commands requiring registration`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testNonOwnerCommands();
