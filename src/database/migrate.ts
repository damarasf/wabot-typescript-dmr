import sequelize from './config/database';
import { User, Group, Usage, Reminder } from './models';
import logger from '../utils/logger';

// Function to sync all models with the database
async function migrateDatabase(): Promise<void> {  try {
    logger.system('Starting database migration');
    
    // Test connection first
    await sequelize.authenticate();
    logger.database('Database connection verified');
    
    // For development: force sync (drops and recreates tables)
    // For production: use { alter: true } or proper migrations
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      logger.warn('Development mode: Force syncing database (will drop existing tables)');
      await sequelize.sync({ force: true });
    } else {
      logger.info('Production mode: Syncing database (preserving data)');
      await sequelize.sync({ alter: true });
    }
    
    logger.success('Database migration completed successfully');
    logger.database('Tables created/updated: User, Group, Usage, Reminder');  } catch (error) {
    logger.error('Database migration failed:', { 
      error: error instanceof Error ? error.message : error 
    });
    if (error instanceof Error) {
      logger.error('Error details:', { message: error.message, stack: error.stack });
    }
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateDatabase();
}

export default migrateDatabase;
