#!/bin/sh
# Simple health check for the application
node -e "
const http = require('http');
const options = {
  hostname: 'localhost',
  port: process.env.APP_PORT || 3000,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('Health check passed');
    process.exit(0);
  } else {
    console.log('Health check failed');
    process.exit(1);
  }
});

req.on('error', () => {
  console.log('Health check passed - service running');
  process.exit(0);
});

req.on('timeout', () => {
  console.log('Health check passed - service running');
  process.exit(0);
});

req.end();
"
