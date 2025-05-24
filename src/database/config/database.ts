import { Sequelize } from 'sequelize';
import config from '../../utils/config';
import { log } from '../../utils/logger';

// Create Sequelize instance with PostgreSQL connection
const sequelize = new Sequelize({
  host: config.dbHost,
  port: config.dbPort,
  database: config.dbName,
  username: config.dbUser,
  password: config.dbPassword,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? (msg: string) => log.debug(msg) : false,
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  timezone: '+07:00' // Asia/Jakarta
});

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    log.database('Database connection established successfully');
    return true;
  } catch (error) {
    log.error('Unable to connect to the database', error);
    return false;
  }
};

// Initialize database
export const initializeDatabase = async (): Promise<void> => {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }    // Import models to register them
    await import('../models');
    
    // Use proper migrations in production, sync only for development
    if (process.env.NODE_ENV === 'development') {
      // Sync database with alter mode to preserve data
      await sequelize.sync({ alter: true });
      log.database('Database synchronized successfully (development mode)');
    } else {
      log.database('Database ready (production mode - use migrations)');
    }
  } catch (error) {
    log.error('Database initialization failed', error);
    throw error;
  }
};

// Export the Sequelize instance
export { sequelize };
export default sequelize;
