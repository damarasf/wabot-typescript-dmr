const { User } = require('./dist/database/models');

async function addDemoUsers() {
  try {
    console.log('Adding demo users...');
    
    const demoUsers = [
      {
        phoneNumber: '628123456789',
        level: 3, // Admin level
        registeredAt: new Date(),
        lastActivity: new Date()
      },
      {
        phoneNumber: '628234567890',
        level: 2, // Premium level
        registeredAt: new Date(),
        lastActivity: new Date()
      },
      {
        phoneNumber: '628345678901',
        level: 1, // Free level
        registeredAt: new Date(),
        lastActivity: new Date()
      }
    ];
    
    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ where: { phoneNumber: userData.phoneNumber } });
      if (!existingUser) {
        const user = await User.create(userData);
        console.log(`✅ Created user: ${user.phoneNumber} (Level: ${user.level})`);
      } else {
        console.log(`⚠️ User already exists: ${userData.phoneNumber}`);
      }
    }
    
    // List all users
    console.log('\n📋 All users in database:');
    const allUsers = await User.findAll();
    allUsers.forEach(user => {
      console.log(`- Phone: ${user.phoneNumber}, Level: ${user.level}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding demo users:', error.message);
    process.exit(1);
  }
}

addDemoUsers();
