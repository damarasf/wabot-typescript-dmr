// Simple test to verify the logging system works
const logger = require('../dist/utils/logger').default;

console.log('Testing logger functionality...');

// Test basic logging
logger.info('Testing basic info logging');
logger.error('Testing error logging');
logger.warn('Testing warning logging');
logger.debug('Testing debug logging');

// Test custom methods
logger.system('Testing system logging');
logger.success('Testing success logging');
logger.database('Testing database logging');
logger.user('Testing user logging');
logger.command('Testing command logging');
logger.security('Testing security logging');

// Test with metadata
logger.info('Testing logging with metadata', { 
  testKey: 'testValue',
  number: 123,
  boolean: true 
});

// Test media content sanitization
logger.info('Testing media content sanitization', {
  normalData: 'this should appear',
  imageData: 'data:image/png;base64,iVBORw0KGgoAAAANS...',
  base64Content: 'some base64 content here',
  buffer: Buffer.from('test'),
  body: 'a'.repeat(2000) // Long content
});

console.log('Logger test completed. Check the log files in the logs directory.');
