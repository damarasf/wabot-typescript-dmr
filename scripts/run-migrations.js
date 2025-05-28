#!/usr/bin/env node

/**
 * Alternative migration runner for production deployment
 * This script runs migrations without requiring sequelize-cli
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Import database connection
const { QueryInterface, Sequelize } = require('sequelize');

// Create Sequelize instance
const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dialect: 'postgres',
  logging: console.log,
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

// Migration runner
async function runMigrations() {
  try {
    console.log('🔍 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Create SequelizeMeta table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
        name VARCHAR(255) NOT NULL PRIMARY KEY
      );
    `);

    // Get already executed migrations
    const [executedMigrations] = await sequelize.query(
      'SELECT name FROM "SequelizeMeta" ORDER BY name;'
    );
    const executedNames = executedMigrations.map(row => row.name);

    // Get migration files
    const migrationsPath = path.join(__dirname, '..', 'src', 'database', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.js'))
      .sort();

    console.log(`📊 Found ${migrationFiles.length} migration files`);
    console.log(`📝 Already executed: ${executedNames.length} migrations`);

    // Run pending migrations
    const queryInterface = sequelize.getQueryInterface();
    let pendingMigrations = 0;

    for (const file of migrationFiles) {
      if (!executedNames.includes(file)) {
        console.log(`🔄 Running migration: ${file}`);
        
        const migrationPath = path.join(migrationsPath, file);
        const migration = require(migrationPath);
        
        // Run the migration
        await migration.up(queryInterface, Sequelize);
        
        // Mark as executed
        await sequelize.query(
          'INSERT INTO "SequelizeMeta" (name) VALUES (?);',
          {
            replacements: [file],
            type: Sequelize.QueryTypes.INSERT
          }
        );
        
        console.log(`✅ Migration completed: ${file}`);
        pendingMigrations++;
      } else {
        console.log(`⏭️  Skipping already executed: ${file}`);
      }
    }

    if (pendingMigrations === 0) {
      console.log('✅ All migrations are up to date!');
    } else {
      console.log(`✅ Successfully executed ${pendingMigrations} migrations!`);
    }

    // Check if tables were created
    const [tables] = await sequelize.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE 'pg_%';"
    );
    
    console.log('📋 Database tables:');
    tables.forEach(table => {
      console.log(`  - ${table.tablename}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;
