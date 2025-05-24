// Test script for logging system validation
const logger = require('../dist/utils/logger.js').default;

console.log('🧪 Testing Winston Logging System...\n');

// Test all log levels
logger.info('✅ Info level logging test');
logger.warn('⚠️ Warning level logging test');
logger.error('❌ Error level logging test');
logger.debug('🐛 Debug level logging test');

// Test specialized logging methods
logger.system('🔧 System logging test');
logger.success('🎉 Success logging test');
logger.database('🗄️ Database logging test');
logger.user('👤 User logging test');
logger.command('⚡ Command logging test');
logger.security('🔒 Security logging test');

// Test logging with metadata
logger.info('Testing logging with metadata', {
  userId: 'test123',
  action: 'test_action',
  timestamp: new Date().toISOString()
});

// Test media content sanitization
const messageWithMedia = {
  type: 'image',
  caption: 'Test caption',
  mimetype: 'image/jpeg',
  data: 'base64_image_data_here...',
  body: 'This is a test message'
};

logger.info('Testing media content sanitization', { message: messageWithMedia });

// Test error logging with Error object
try {
  throw new Error('Test error for logging validation');
} catch (error) {
  logger.error('Testing error object logging', { error: error.message, stack: error.stack });
}

console.log('\n✅ All logging tests completed! Check logs/combined.log and logs/error.log for results.');
