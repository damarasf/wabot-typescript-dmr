#!/bin/sh

# Deploy script for WhatsApp Bot
# This script checks PostgreSQL, runs migrations, and starts the application

set -e

echo "🚀 Starting WhatsApp Bot deployment..."

# Function to check if PostgreSQL is ready
wait_for_postgres() {
    echo "🔍 Checking PostgreSQL connection..."
    
    until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; do
        echo "⏳ Waiting for PostgreSQL to be ready..."
        sleep 2
    done
    
    echo "✅ PostgreSQL is ready!"
}

# Function to run database migrations
run_migrations() {
    echo "📊 Running database migrations..."
    
    # Setup Sequelize CLI configuration
    echo "🔧 Setting up Sequelize CLI configuration..."
    if [ -f "scripts/setup-sequelize.js" ]; then
        node scripts/setup-sequelize.js
    else
        # Fallback setup
        echo "⚠️  Setup script not found, using fallback configuration..."
        
        # Create config directory and files
        mkdir -p config
        if [ -f "src/database/config/config.js" ]; then
            cp src/database/config/config.js config/config.js
            cp src/database/config/config.js config/config.json
        fi
        
        # Create .sequelizerc if it doesn't exist
        if [ ! -f ".sequelizerc" ]; then
            cat > .sequelizerc << 'EOF'
const path = require('path');

module.exports = {
  'config': path.resolve('config', 'config.js'),
  'models-path': path.resolve('src', 'database', 'models'),
  'seeders-path': path.resolve('src', 'database', 'seeders'),
  'migrations-path': path.resolve('src', 'database', 'migrations')
};
EOF
        fi
    fi
    
    # Check if sequelize-cli is available
    if command -v npx sequelize-cli > /dev/null 2>&1; then
        echo "🔄 Running Sequelize migrations..."
        
        # Try to run migrations with CLI
        if npx sequelize-cli db:migrate; then
            echo "✅ Migrations completed successfully!"
            
            # Run seeders if in development mode
            if [ "$NODE_ENV" = "development" ]; then
                echo "🌱 Running database seeders (development mode)..."
                npx sequelize-cli db:seed:all || echo "⚠️  Seeders failed or already exist"
            fi
        else
            echo "❌ Sequelize CLI migration failed, trying alternative migration runner..."
            # Fall back to alternative migration runner
            if [ -f "scripts/run-migrations.js" ]; then
                node scripts/run-migrations.js
            elif [ -f "src/database/migrate.ts" ]; then
                npx ts-node src/database/migrate.ts
            else
                echo "❌ No migration method available"
                exit 1
            fi
        fi
    else
        echo "🔄 Running TypeScript migrations..."
        
        # Try production migration script first
        if [ -f "scripts/run-migrations.js" ]; then
            echo "🔄 Using production migration runner..."
            node scripts/run-migrations.js
        elif npm run migrate:prod 2>/dev/null; then
            echo "✅ Production migrations completed!"
        elif npm run migrate 2>/dev/null; then
            echo "✅ TypeScript migrations completed!"
        elif [ -f "src/database/migrate.ts" ]; then
            echo "🔄 Running direct TypeScript migration..."
            npx ts-node src/database/migrate.ts
        else
            echo "❌ No migration method available"
            exit 1
        fi
    fi
}

# Function to create necessary directories
setup_directories() {
    echo "📁 Setting up directories..."
    
    mkdir -p logs
    mkdir -p data
    
    # Set permissions if running as root
    if [ "$(id -u)" = "0" ]; then
        chown -R appuser:nodejs logs data || echo "⚠️  Could not change ownership"
    fi
    
    echo "✅ Directories ready!"
}

# Function to validate environment variables
validate_environment() {
    echo "🔧 Validating environment variables..."
    
    required_vars="DB_HOST DB_PORT DB_NAME DB_USER DB_PASSWORD OWNER_NUMBER"
    
    for var in $required_vars; do
        eval value=\$$var
        if [ -z "$value" ]; then
            echo "❌ Error: Required environment variable $var is not set"
            exit 1
        fi
    done
    
    echo "✅ Environment variables validated!"
}

# Main deployment process
main() {
    echo "🤖 WhatsApp Bot - Production Deployment"
    echo "======================================="
    
    # Validate environment
    validate_environment
    
    # Setup directories
    setup_directories
    
    # Wait for PostgreSQL
    wait_for_postgres
    
    # Run migrations
    run_migrations
    
    echo "🎉 Deployment setup completed successfully!"
    echo "🚀 Starting WhatsApp Bot application..."
    
    # Start the application
    exec npm start
}

# Handle shutdown gracefully
shutdown() {
    echo "🛑 Shutting down WhatsApp Bot..."
    exit 0
}

# Trap signals
trap shutdown SIGTERM SIGINT

# Run main function
main "$@"
