import { config as dotenvConfig } from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env file
dotenvConfig();

/**
 * Utility function to ensure phone number has @c.us suffix
 * @param phoneNumber - The phone number to format
 * @returns The phone number with @c.us suffix
 */
const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return phoneNumber;
  return phoneNumber.endsWith('@c.us') ? phoneNumber : `${phoneNumber}@c.us`;
};

/**
 * Configuration interface for the WhatsApp bot
 */
interface Config {
  // Bot configuration
  botName: string;
  ownerNumber: string;
  ownerNumberFormatted: string; // Formatted owner number with @c.us suffix
  prefixes: string[];
  antiCall: boolean;
  antiDelete: boolean;
  autoRestartEnabled: boolean;
  autoRestartTime: number;
  timezone: string;

  // WhatsApp-Automate configuration
  waLicenseKey?: string;
  waDisableLicenseCheck: boolean;

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
  ownerNumber: '628xxxxxxxxxx', // Replace with your actual owner number
  ownerNumberFormatted: formatPhoneNumber('628xxxxxxxxxx'), // Ensure this is formatted correctly
  prefixes: ['!', '#', '/', '.'],
  antiCall: true,
  antiDelete: true,
  autoRestartEnabled: true,
  autoRestartTime: 3600000, // 1 hour in milliseconds
  timezone: 'Asia/Jakarta',

  // WhatsApp-Automate configuration
  waLicenseKey: 'non-commercial',
  waDisableLicenseCheck: true,

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
  ownerNumberFormatted: formatPhoneNumber(process.env.OWNER_NUMBER || defaultConfig.ownerNumberFormatted),
  prefixes: process.env.BOT_PREFIX ? process.env.BOT_PREFIX.split(',') : defaultConfig.prefixes,
  antiCall: process.env.ANTI_CALL === 'true' || defaultConfig.antiCall,
  antiDelete: process.env.ANTI_DELETE === 'true' || defaultConfig.antiDelete,
  autoRestartEnabled: process.env.AUTO_RESTART_ENABLED !== 'false',
  autoRestartTime: parseInt(process.env.AUTO_RESTART_TIME || String(defaultConfig.autoRestartTime), 10),
  timezone: process.env.TIMEZONE || defaultConfig.timezone,

  // WhatsApp-Automate configuration
  waLicenseKey: process.env.WA_LICENSE_KEY || defaultConfig.waLicenseKey,
  waDisableLicenseCheck: process.env.WA_DISABLE_LICENSE_CHECK === 'true' || defaultConfig.waDisableLicenseCheck,

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
