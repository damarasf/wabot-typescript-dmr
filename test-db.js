const { User } = require('./dist/database/models');

async function checkUsers() {
  try {
    console.log('Checking users in database...');
    const users = await User.findAll();
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
    } else {
      console.log(`✅ Found ${users.length} users:`);
      users.forEach(user => {
        console.log(`- Phone: ${user.phoneNumber}, Level: ${user.level}, Registered: ${user.registeredAt}`);
      });
    }
    
    // Check for specific owner
    const ownerNumber = process.env.OWNER_NUMBER || '6281319916659';
    console.log(`\nChecking for owner: ${ownerNumber}`);
    
    const ownerUser = await User.findOne({ where: { phoneNumber: ownerNumber } });
    if (ownerUser) {
      console.log(`✅ Owner found: Level ${ownerUser.level}`);
    } else {
      console.log(`❌ Owner not found in database`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  }
}

checkUsers();
