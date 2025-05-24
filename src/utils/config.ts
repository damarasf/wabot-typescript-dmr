import { config as dotenvConfig } from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env file
dotenvConfig();

/**
 * Configuration interface for the WhatsApp bot
 */
interface Config {
  // Bot configuration
  botName: string;
  ownerNumber: string;
  prefixes: string[];
  antiCall: boolean;
  antiDelete: boolean;
  autoRestartTime: number;
  timezone: string;

  // Database configuration
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  dbPassword: string;

  // N8N configuration
  n8nUrl: string;
  n8nToken: string;

  // Default limits for user features
  freeLimit: number;
  premiumLimit: number;
}

/**
 * Default configuration values
 * These values will be used if environment variables are not set
 */
const defaultConfig: Config = {
  // Bot configuration
  botName: 'DMR-Bot',
  ownerNumber: '628xxxxxxxxxx', // Change this to your actual number
  prefixes: ['!', '#', '/', '.'],
  antiCall: true,
  antiDelete: true,
  autoRestartTime: 3600000, // 1 hour in milliseconds
  timezone: 'Asia/Jakarta',

  // Database configuration
  dbHost: 'localhost',
  dbPort: 5432,
  dbName: 'wabot_db',
  dbUser: 'postgres',
  dbPassword: 'postgres',

  // N8N configuration
  n8nUrl: 'http://localhost:5678',
  n8nToken: 'your_n8n_token',

  // Default limits for user features
  freeLimit: 10,
  premiumLimit: 50,
};

/**
 * Load configuration from environment variables with defaults
 * Environment variables take precedence over default values
 */
const config: Config = {
  // Bot configuration
  botName: process.env.BOT_NAME || defaultConfig.botName,
  ownerNumber: process.env.OWNER_NUMBER || defaultConfig.ownerNumber,
  prefixes: process.env.BOT_PREFIX ? process.env.BOT_PREFIX.split(',') : defaultConfig.prefixes,
  antiCall: process.env.ANTI_CALL === 'true' || defaultConfig.antiCall,
  antiDelete: process.env.ANTI_DELETE === 'true' || defaultConfig.antiDelete,
  autoRestartTime: parseInt(process.env.AUTO_RESTART_TIME || String(defaultConfig.autoRestartTime), 10),
  timezone: process.env.TIMEZONE || defaultConfig.timezone,

  // Database configuration
  dbHost: process.env.DB_HOST || defaultConfig.dbHost,
  dbPort: parseInt(process.env.DB_PORT || String(defaultConfig.dbPort), 10),
  dbName: process.env.DB_NAME || defaultConfig.dbName,
  dbUser: process.env.DB_USER || defaultConfig.dbUser,
  dbPassword: process.env.DB_PASSWORD || defaultConfig.dbPassword,

  // N8N configuration
  n8nUrl: process.env.N8N_URL || defaultConfig.n8nUrl,
  n8nToken: process.env.N8N_TOKEN || defaultConfig.n8nToken,

  // Default limits for user features
  freeLimit: parseInt(process.env.FREE_LIMIT || String(defaultConfig.freeLimit), 10),
  premiumLimit: parseInt(process.env.PREMIUM_LIMIT || String(defaultConfig.premiumLimit), 10),
};

export default config;
