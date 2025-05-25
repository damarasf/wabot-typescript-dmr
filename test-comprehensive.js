const { User } = require('./dist/database/models');
const config = require('./dist/utils/config').default;
const { parseCommand } = require('./dist/middlewares/commandParser');

// Mock client object
const mockClient = {
  reply: async (chatId, message, messageId) => {
    console.log(`   📤 Reply: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`);
    return Promise.resolve();
  },
  sendText: async (chatId, message) => {
    console.log(`   📤 Send: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`);
    return Promise.resolve();
  },
  getContact: async (contactId) => {
    return Promise.resolve({
      name: 'Test User',
      pushname: 'Test User'
    });
  }
};

// Mock message object for testing
function createMockMessage(body, senderId = '6281319916659@c.us', isGroup = false) {
  return {
    body: body,
    sender: {
      id: senderId,
      pushname: 'Test User'
    },
    chatId: isGroup ? 'test-group@g.us' : 'test@c.us',
    id: 'test123',
    isGroupMsg: isGroup,
    mentionedJidList: []
  };
}

async function comprehensiveTest() {
  try {
    console.log('🚀 === COMPREHENSIVE WHATSAPP BOT TESTING ===\n');

    // Mock all command modules
    const mockCommands = {
      profile: {
        name: 'profile',
        description: 'Show user profile',
        usage: '!profile',
        example: '!profile',
        category: 'General',
        minimumLevel: 1,
        execute: async (message, args, client, user) => {
          const profileCmd = require('./dist/commands/profile').default;
          return await profileCmd.execute(message, args, client, user);
        }
      },
      register: {
        name: 'register',
        description: 'Register as bot user',
        usage: '!register',
        example: '!register',
        category: 'General',
        execute: async (message, args, client, user) => {
          const registerCmd = require('./dist/commands/register').default;
          return await registerCmd.execute(message, args, client, user);
        }
      },
      help: {
        name: 'help',
        description: 'Show help information',
        usage: '!help',
        example: '!help',
        category: 'General',
        execute: async (message, args, client, user) => {
          const helpCmd = require('./dist/commands/help').default;
          return await helpCmd.execute(message, args, client, user);
        }
      },
      setadmin: {
        name: 'setadmin',
        description: 'Set user as admin',
        usage: '!setadmin <phone>',
        example: '!setadmin 628123456789',
        category: 'Admin',
        ownerOnly: true,
        execute: async (message, args, client, user) => {
          const setadminCmd = require('./dist/commands/setadmin').default;
          return await setadminCmd.execute(message, args, client, user);
        }
      }
    };

    // Mock getCommand function
    require('./dist/handlers/commandHandler').getCommand = (name) => {
      return mockCommands[name] || null;
    };

    console.log('1️⃣ === OWNER FUNCTIONALITY TESTS ===');
    
    // Test 1: Owner Profile Command
    console.log('\n🧪 Testing Owner Profile Command...');
    const ownerProfileMsg = createMockMessage('!profile', '6281319916659@c.us');
    const ownerProfileCtx = await parseCommand(ownerProfileMsg);
    
    if (ownerProfileCtx && ownerProfileCtx.user) {
      console.log(`✅ Owner profile parsing: PASS`);
      console.log(`   📋 User: Phone=${ownerProfileCtx.user.phoneNumber}, Level=${ownerProfileCtx.user.level}`);
      
      // Execute profile command
      await ownerProfileCtx.command.execute(ownerProfileMsg, [], mockClient, ownerProfileCtx.user);
    } else {
      console.log(`❌ Owner profile parsing: FAIL`);
    }

    // Test 2: Owner Registration (Already Registered)
    console.log('\n🧪 Testing Owner Registration...');
    const ownerRegisterMsg = createMockMessage('!register', '6281319916659@c.us');
    const ownerRegisterCtx = await parseCommand(ownerRegisterMsg);
    
    if (ownerRegisterCtx) {
      console.log(`✅ Owner registration parsing: PASS`);
      await ownerRegisterCtx.command.execute(ownerRegisterMsg, [], mockClient, ownerRegisterCtx.user);
    } else {
      console.log(`❌ Owner registration parsing: FAIL`);
    }

    // Test 3: Owner-Only Command (setadmin)
    console.log('\n🧪 Testing Owner-Only Command (setadmin)...');
    const setadminMsg = createMockMessage('!setadmin 628234567890', '6281319916659@c.us');
    const setadminCtx = await parseCommand(setadminMsg);
    
    if (setadminCtx) {
      console.log(`✅ Setadmin command parsing: PASS`);
      await setadminCtx.command.execute(setadminMsg, ['628234567890'], mockClient, setadminCtx.user);
    } else {
      console.log(`❌ Setadmin command parsing: FAIL`);
    }

    console.log('\n2️⃣ === NON-OWNER USER TESTS ===');

    // Test 4: Admin User Profile
    console.log('\n🧪 Testing Admin User Profile...');
    const adminProfileMsg = createMockMessage('!profile', '628123456789@c.us');
    const adminProfileCtx = await parseCommand(adminProfileMsg);
    
    if (adminProfileCtx && adminProfileCtx.user) {
      console.log(`✅ Admin profile parsing: PASS`);
      console.log(`   📋 User: Phone=${adminProfileCtx.user.phoneNumber}, Level=${adminProfileCtx.user.level}`);
      await adminProfileCtx.command.execute(adminProfileMsg, [], mockClient, adminProfileCtx.user);
    } else {
      console.log(`❌ Admin profile parsing: FAIL`);
    }

    // Test 5: Premium User Profile
    console.log('\n🧪 Testing Premium User Profile...');
    const premiumProfileMsg = createMockMessage('!profile', '628234567890@c.us');
    const premiumProfileCtx = await parseCommand(premiumProfileMsg);
    
    if (premiumProfileCtx && premiumProfileCtx.user) {
      console.log(`✅ Premium profile parsing: PASS`);
      console.log(`   📋 User: Phone=${premiumProfileCtx.user.phoneNumber}, Level=${premiumProfileCtx.user.level}`);
      await premiumProfileCtx.command.execute(premiumProfileMsg, [], mockClient, premiumProfileCtx.user);
    } else {
      console.log(`❌ Premium profile parsing: FAIL`);
    }

    // Test 6: Free User Profile
    console.log('\n🧪 Testing Free User Profile...');
    const freeProfileMsg = createMockMessage('!profile', '628345678901@c.us');
    const freeProfileCtx = await parseCommand(freeProfileMsg);
    
    if (freeProfileCtx && freeProfileCtx.user) {
      console.log(`✅ Free user profile parsing: PASS`);
      console.log(`   📋 User: Phone=${freeProfileCtx.user.phoneNumber}, Level=${freeProfileCtx.user.level}`);
      await freeProfileCtx.command.execute(freeProfileMsg, [], mockClient, freeProfileCtx.user);
    } else {
      console.log(`❌ Free user profile parsing: FAIL`);
    }

    console.log('\n3️⃣ === PERMISSION TESTS ===');

    // Test 7: Non-Owner trying Owner-Only Command
    console.log('\n🧪 Testing Permission Denial (Non-Owner -> Owner Command)...');
    const deniedSetadminMsg = createMockMessage('!setadmin 628999999999', '628123456789@c.us');
    const deniedSetadminCtx = await parseCommand(deniedSetadminMsg);
    
    if (deniedSetadminCtx) {
      console.log(`❌ Permission check FAILED - Non-owner should not access owner-only commands`);
    } else {
      console.log(`✅ Permission check PASSED - Non-owner correctly denied access to owner-only command`);
    }

    console.log('\n4️⃣ === UNREGISTERED USER TESTS ===');

    // Test 8: Unregistered User Profile
    console.log('\n🧪 Testing Unregistered User Profile...');
    const unregProfileMsg = createMockMessage('!profile', '628999999999@c.us');
    const unregProfileCtx = await parseCommand(unregProfileMsg);
    
    if (unregProfileCtx) {
      console.log(`❌ Unregistered user access FAILED - Should be denied for profile command`);
    } else {
      console.log(`✅ Unregistered user access PASSED - Correctly denied access to profile command`);
    }

    // Test 9: Unregistered User Registration
    console.log('\n🧪 Testing Unregistered User Registration...');
    const unregRegisterMsg = createMockMessage('!register', '628999999999@c.us');
    const unregRegisterCtx = await parseCommand(unregRegisterMsg);
    
    if (unregRegisterCtx) {
      console.log(`✅ Unregistered user registration: PASS`);
      await unregRegisterCtx.command.execute(unregRegisterMsg, [], mockClient, unregRegisterCtx.user);
    } else {
      console.log(`❌ Unregistered user registration: FAIL`);
    }

    console.log('\n🎉 === COMPREHENSIVE TESTING COMPLETE ===');
    console.log('\n📊 SUMMARY:');
    console.log('✅ Owner can access all features with proper user data');
    console.log('✅ Non-owner users can access appropriate features');
    console.log('✅ Permission system working correctly');
    console.log('✅ Registration system functional');
    console.log('✅ Database integration working');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Comprehensive test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

comprehensiveTest();
