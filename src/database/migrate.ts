import sequelize from './config/database';
import { User, Group, Usage, Reminder } from './models';

// Function to sync all models with the database
async function migrateDatabase(): Promise<void> {
  try {
    console.log('🔄 Starting database migration...');
    
    // Test connection first
    await sequelize.authenticate();
    console.log('✅ Database connection verified');
    
    // For development: force sync (drops and recreates tables)
    // For production: use { alter: true } or proper migrations
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      console.log('⚠️ Development mode: Force syncing database (will drop existing tables)');
      await sequelize.sync({ force: true });
    } else {
      console.log('🔧 Production mode: Syncing database (preserving data)');
      await sequelize.sync({ alter: true });
    }
    
    console.log('✅ Database migration completed successfully.');
    console.log('📊 Tables created/updated: User, Group, Usage, Reminder');
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateDatabase();
}

export default migrateDatabase;
