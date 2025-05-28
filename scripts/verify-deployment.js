#!/usr/bin/env node

/**
 * Pre-deployment verification script
 * Checks if all required files and configurations are ready for EasyPanel deployment
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`)
};

console.log(`${colors.blue}🔍 WhatsApp Bot - Deployment Verification${colors.reset}`);
console.log('==========================================');

let allChecksPass = true;

// Required files for deployment
const requiredFiles = [
    'Dockerfile',
    'docker-compose.yml',
    '.dockerignore',
    'package.json',
    'tsconfig.json',
    'scripts/deploy.sh',
    'scripts/health-check.js',
    '.env.example',
    'DEPLOYMENT.md',
    'EASYPANEL_DEPLOYMENT.md'
];

// Required directories
const requiredDirectories = [
    'src',
    'src/database',
    'src/database/migrations',
    'src/database/config',
    'scripts'
];

// Check required files
console.log('\n📁 Checking required files...');
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        log.success(`${file} exists`);
    } else {
        log.error(`${file} is missing`);
        allChecksPass = false;
    }
});

// Check required directories
console.log('\n📂 Checking required directories...');
requiredDirectories.forEach(dir => {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
        log.success(`${dir}/ exists`);
    } else {
        log.error(`${dir}/ is missing`);
        allChecksPass = false;
    }
});

// Check package.json scripts
console.log('\n🔧 Checking package.json scripts...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredScripts = ['build', 'start', 'migrate', 'health'];
    
    requiredScripts.forEach(script => {
        if (packageJson.scripts && packageJson.scripts[script]) {
            log.success(`Script "${script}" is defined`);
        } else {
            log.error(`Script "${script}" is missing`);
            allChecksPass = false;
        }
    });

    // Check dependencies
    const requiredDeps = ['@open-wa/wa-automate', 'sequelize', 'pg', 'winston'];
    requiredDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
            log.success(`Dependency "${dep}" is installed`);
        } else {
            log.error(`Dependency "${dep}" is missing`);
            allChecksPass = false;
        }
    });

} catch (error) {
    log.error('Failed to read package.json');
    allChecksPass = false;
}

// Check migration files
console.log('\n🗃️  Checking database migrations...');
const migrationDir = 'src/database/migrations';
if (fs.existsSync(migrationDir)) {
    const migrationFiles = fs.readdirSync(migrationDir).filter(file => file.endsWith('.js'));
    
    if (migrationFiles.length > 0) {
        log.success(`${migrationFiles.length} migration files found`);
        migrationFiles.forEach(file => {
            log.info(`  - ${file}`);
        });
    } else {
        log.warning('No migration files found');
    }
} else {
    log.error('Migration directory not found');
    allChecksPass = false;
}

// Check TypeScript configuration
console.log('\n📝 Checking TypeScript configuration...');
try {
    const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    
    if (tsConfig.compilerOptions && tsConfig.compilerOptions.outDir) {
        log.success('TypeScript outDir is configured');
    } else {
        log.warning('TypeScript outDir not configured');
    }

    if (tsConfig.include && tsConfig.include.includes('src/**/*')) {
        log.success('TypeScript includes src directory');
    } else {
        log.warning('TypeScript include configuration may need adjustment');
    }

} catch (error) {
    log.error('Failed to read tsconfig.json');
    allChecksPass = false;
}

// Check Dockerfile
console.log('\n🐳 Checking Dockerfile...');
try {
    const dockerfile = fs.readFileSync('Dockerfile', 'utf8');
    
    if (dockerfile.includes('FROM node:18')) {
        log.success('Dockerfile uses Node.js 18');
    } else {
        log.warning('Dockerfile may not use recommended Node.js version');
    }

    if (dockerfile.includes('RUN npm run build')) {
        log.success('Dockerfile includes build step');
    } else {
        log.warning('Dockerfile may be missing build step');
    }

    if (dockerfile.includes('postgresql-client')) {
        log.success('Dockerfile includes PostgreSQL client');
    } else {
        log.warning('Dockerfile may be missing PostgreSQL client');
    }

} catch (error) {
    log.error('Failed to read Dockerfile');
    allChecksPass = false;
}

// Check environment example
console.log('\n🌍 Checking environment configuration...');
try {
    const envExample = fs.readFileSync('.env.example', 'utf8');
    const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'OWNER_NUMBER', 'BOT_NAME'];
    
    requiredEnvVars.forEach(envVar => {
        if (envExample.includes(envVar)) {
            log.success(`Environment variable ${envVar} is documented`);
        } else {
            log.warning(`Environment variable ${envVar} not found in .env.example`);
        }
    });

} catch (error) {
    log.error('Failed to read .env.example');
    allChecksPass = false;
}

// Check for sensitive files that shouldn't be committed
console.log('\n🔒 Checking for sensitive files...');
const sensitiveFiles = ['.env', 'dmr-bot.data.json'];
sensitiveFiles.forEach(file => {
    if (fs.existsSync(file)) {
        log.warning(`Sensitive file ${file} exists - make sure it's in .gitignore`);
    } else {
        log.success(`No sensitive file ${file} found`);
    }
});

// Final summary
console.log('\n📊 Verification Summary:');
console.log('========================');

if (allChecksPass) {
    log.success('All checks passed! Your project is ready for EasyPanel deployment.');
    console.log('\n🚀 Next steps:');
    console.log('1. Push your code to GitHub');
    console.log('2. Create application in EasyPanel');
    console.log('3. Configure environment variables');
    console.log('4. Deploy and monitor logs for QR code');
    console.log('\n📖 See EASYPANEL_DEPLOYMENT.md for detailed instructions.');
} else {
    log.error('Some checks failed. Please fix the issues above before deploying.');
    process.exit(1);
}

console.log(`\n${colors.blue}🎉 Verification completed!${colors.reset}`);
