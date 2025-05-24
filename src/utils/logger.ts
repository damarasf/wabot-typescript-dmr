import winston from 'winston';
import path from 'path';

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Define colors for console output
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

winston.addColors(logColors);

// Environment variables for configuration
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_DIR = process.env.LOG_DIR || 'logs';
const ERROR_LOG_FILE = process.env.ERROR_LOG_FILE || 'error.log';
const COMBINED_LOG_FILE = process.env.COMBINED_LOG_FILE || 'combined.log';
const LOG_MAX_SIZE = process.env.LOG_MAX_SIZE || '5m';
const LOG_MAX_FILES = parseInt(process.env.LOG_MAX_FILES || '5');

// Create log directory if it doesn't exist
const logDir = path.join(__dirname, '../../', LOG_DIR);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
  })
);

// Define console format with colors
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}]: ${message}`;
  })
);

// Create Winston logger
const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === 'production' ? 'warn' : LOG_LEVEL,
    }),
    
    // File transport for errors
    new winston.transports.File({
      filename: path.join(logDir, ERROR_LOG_FILE),
      level: 'error',
      maxsize: LOG_MAX_SIZE === '5m' ? 5242880 : parseInt(LOG_MAX_SIZE.replace(/[^\d]/g, '')) * 1024 * 1024,
      maxFiles: LOG_MAX_FILES,
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logDir, COMBINED_LOG_FILE),
      level: LOG_LEVEL,
      maxsize: LOG_MAX_SIZE === '5m' ? 5242880 : parseInt(LOG_MAX_SIZE.replace(/[^\d]/g, '')) * 1024 * 1024,
      maxFiles: LOG_MAX_FILES,
    }),
  ],
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Create logs directory if it doesn't exist
import fs from 'fs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Helper function to sanitize data before logging (removes media content)
const sanitizeForLog = (data: any): any => {
  if (typeof data === 'string') {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeForLog);
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip logging media content and sensitive data
      if (
        key.toLowerCase().includes('media') ||
        key.toLowerCase().includes('image') ||
        key.toLowerCase().includes('video') ||
        key.toLowerCase().includes('audio') ||
        key.toLowerCase().includes('document') ||
        key.toLowerCase().includes('file') ||
        key.toLowerCase().includes('base64') ||
        key.toLowerCase().includes('buffer') ||
        key === 'body' && typeof value === 'string' && value.length > 1000
      ) {
        sanitized[key] = '[MEDIA_CONTENT_HIDDEN]';
      } else {
        sanitized[key] = sanitizeForLog(value);
      }
    }
    return sanitized;
  }
  
  return data;
};

// Enhanced logger methods with sanitization
export const log = {
  error: (message: string, meta?: any) => {
    logger.error(message, meta ? sanitizeForLog(meta) : undefined);
  },
  
  warn: (message: string, meta?: any) => {
    logger.warn(message, meta ? sanitizeForLog(meta) : undefined);
  },
  
  info: (message: string, meta?: any) => {
    logger.info(message, meta ? sanitizeForLog(meta) : undefined);
  },
  
  debug: (message: string, meta?: any) => {
    logger.debug(message, meta ? sanitizeForLog(meta) : undefined);
  },
  
  // System startup/shutdown logs
  system: (message: string, meta?: any) => {
    logger.info(`🚀 SYSTEM: ${message}`, meta ? sanitizeForLog(meta) : undefined);
  },
  
  // Success operations
  success: (message: string, meta?: any) => {
    logger.info(`✅ SUCCESS: ${message}`, meta ? sanitizeForLog(meta) : undefined);
  },
  
  // Database operations
  database: (message: string, meta?: any) => {
    logger.info(`💾 DATABASE: ${message}`, meta ? sanitizeForLog(meta) : undefined);
  },
  
  // User operations
  user: (message: string, meta?: any) => {
    logger.info(`👤 USER: ${message}`, meta ? sanitizeForLog(meta) : undefined);
  },
  
  // Command operations
  command: (message: string, meta?: any) => {
    logger.info(`⚡ COMMAND: ${message}`, meta ? sanitizeForLog(meta) : undefined);
  },
  
  // Security/Admin operations
  security: (message: string, meta?: any) => {
    logger.warn(`🔒 SECURITY: ${message}`, meta ? sanitizeForLog(meta) : undefined);
  },
};

// Export the enhanced logger methods as default
export default log;

// Also export the raw winston logger if needed
export { logger };
