/**
 * Production-ready migration setup script
 * This script ensures proper Sequelize CLI configuration for Docker deployment
 */

const fs = require('fs');
const path = require('path');

// Ensure all necessary directories exist
function setupDirectories() {
    const directories = [
        'config',
        'models', 
        'migrations',
        'seeders'
    ];

    directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`✅ Created directory: ${dir}`);
        }
    });
}

// Create config files in expected locations
function setupConfigFiles() {
    // Copy main config to root config directory
    const sourceConfig = 'src/database/config/config.js';
    const targetConfigs = [
        'config/config.js',
        'config/config.json'
    ];

    if (fs.existsSync(sourceConfig)) {
        targetConfigs.forEach(target => {
            try {
                const configContent = fs.readFileSync(sourceConfig, 'utf8');
                fs.writeFileSync(target, configContent);
                console.log(`✅ Created config file: ${target}`);
            } catch (error) {
                console.log(`⚠️  Could not create ${target}: ${error.message}`);
            }
        });
    }

    // Ensure .sequelizerc exists
    const sequelizeRc = '.sequelizerc';
    if (!fs.existsSync(sequelizeRc)) {
        const rcContent = `const path = require('path');

module.exports = {
  'config': path.resolve('config', 'config.js'),
  'models-path': path.resolve('src', 'database', 'models'),
  'seeders-path': path.resolve('src', 'database', 'seeders'),
  'migrations-path': path.resolve('src', 'database', 'migrations')
};`;
        fs.writeFileSync(sequelizeRc, rcContent);
        console.log(`✅ Created .sequelizerc file`);
    }
}

// Main setup function
function setupSequelizeCLI() {
    console.log('🔧 Setting up Sequelize CLI configuration...');
    
    try {
        setupDirectories();
        setupConfigFiles();
        console.log('✅ Sequelize CLI setup completed successfully!');
        return true;
    } catch (error) {
        console.error('❌ Sequelize CLI setup failed:', error.message);
        return false;
    }
}

// Run if called directly
if (require.main === module) {
    setupSequelizeCLI();
}

module.exports = setupSequelizeCLI;
