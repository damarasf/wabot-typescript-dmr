const { User } = require('./dist/database/models');
const config = require('./dist/utils/config').default;
const { isOwner, normalizePhoneNumber } = require('./dist/utils/phoneUtils');
const { parseCommand } = require('./dist/middlewares/commandParser');

// Mock message object for testing
function createMockMessage(body, senderId = '6281319916659@c.us') {
  return {
    body: body,
    sender: {
      id: senderId,
      pushname: 'Test Owner'
    },
    chatId: 'test@c.us',
    id: 'test123',
    isGroupMsg: false
  };
}

// Mock client object
const mockClient = {
  reply: async (chatId, message, messageId) => {
    console.log(`📤 Reply: ${message}`);
    return Promise.resolve();
  },
  sendText: async (chatId, message) => {
    console.log(`📤 Send: ${message}`);
    return Promise.resolve();
  },
  getContact: async (contactId) => {
    return Promise.resolve({
      name: 'Test Owner',
      pushname: 'Test Owner'
    });
  }
};

async function testFeatures() {
  try {
    console.log('🔧 === WhatsApp Bot Feature Testing ===\n');

    // Test 1: Owner Detection
    console.log('1️⃣ Testing Owner Detection...');
    const ownerSenderId = '6281319916659@c.us';
    const isOwnerResult = isOwner(ownerSenderId, config.ownerNumber);
    console.log(`✅ Owner detection: ${isOwnerResult ? 'PASS' : 'FAIL'}`);
    
    // Test 2: Database User Lookup
    console.log('\n2️⃣ Testing Database User Lookup...');
    const dbUser = await User.findOne({ where: { phoneNumber: '6281319916659' } });
    console.log(`✅ Database user found: ${dbUser ? 'PASS' : 'FAIL'}`);
    if (dbUser) {
      console.log(`   📋 User details: Phone=${dbUser.phoneNumber}, Level=${dbUser.level}`);
    }
    
    // Test 3: Command Parser for Owner
    console.log('\n3️⃣ Testing Command Parser for Owner...');
    try {
      const { getCommand } = require('./dist/handlers/commandHandler');
      
      // Mock the command for testing
      const mockProfileCommand = {
        name: 'profile',
        description: 'Test profile command',
        usage: '!profile',
        example: '!profile',
        category: 'Test',
        minimumLevel: 1, // FREE level required
        execute: async (message, args, client, user) => {
          console.log(`   🎯 Profile command executed with user: ${user ? 'Present' : 'Undefined'}`);
          if (user) {
            console.log(`   📋 User data: Phone=${user.phoneNumber}, Level=${user.level}`);
          }
          return Promise.resolve();
        }
      };
      
      // Mock getCommand function
      require('./dist/handlers/commandHandler').getCommand = (name) => {
        if (name === 'profile') return mockProfileCommand;
        return null;
      };
      
      const profileMessage = createMockMessage('!profile');
      const commandContext = await parseCommand(profileMessage);
      
      if (commandContext) {
        console.log(`✅ Command parsing: PASS`);
        console.log(`   📋 Command: ${commandContext.command.name}`);
        console.log(`   👤 User provided: ${commandContext.user ? 'YES' : 'NO'}`);
        
        if (commandContext.user) {
          console.log(`   📋 User details: Phone=${commandContext.user.phoneNumber}, Level=${commandContext.user.level}`);
        }
        
        // Execute the command to test full flow
        console.log('\n   🚀 Executing command...');
        await commandContext.command.execute(profileMessage, [], mockClient, commandContext.user);
      } else {
        console.log(`❌ Command parsing: FAIL`);
      }
    } catch (parseError) {
      console.log(`❌ Command parsing error: ${parseError.message}`);
    }
    
    // Test 4: Registration Command
    console.log('\n4️⃣ Testing Registration Command...');
    try {
      const registerCommand = require('./dist/commands/register').default;
      
      console.log('   🚀 Executing register command for owner...');
      const registerMessage = createMockMessage('!register');
      
      // Test with existing user
      await registerCommand.execute(registerMessage, [], mockClient, dbUser);
    } catch (regError) {
      console.log(`❌ Registration error: ${regError.message}`);
    }
    
    // Test 5: Other User Commands
    console.log('\n5️⃣ Testing Other Commands for Non-Owner...');
    const nonOwnerMessage = createMockMessage('!profile', '628123456789@c.us');
    const nonOwnerContext = await parseCommand(nonOwnerMessage);
    
    if (nonOwnerContext) {
      console.log(`✅ Non-owner command parsing: PASS`);
      console.log(`   👤 User provided: ${nonOwnerContext.user ? 'YES' : 'NO'}`);
      if (nonOwnerContext.user) {
        console.log(`   📋 User details: Phone=${nonOwnerContext.user.phoneNumber}, Level=${nonOwnerContext.user.level}`);
      }
    } else {
      console.log(`❌ Non-owner command parsing: FAIL`);
    }
    
    console.log('\n🎉 === Feature Testing Complete ===');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testFeatures();
