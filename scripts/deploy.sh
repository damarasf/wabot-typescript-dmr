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
    
    # Check if sequelize-cli is available
    if command -v npx sequelize-cli > /dev/null 2>&1; then
        echo "🔄 Running Sequelize migrations..."
        npx sequelize-cli db:migrate
        echo "✅ Migrations completed successfully!"
        
        # Run seeders if in development mode
        if [ "$NODE_ENV" = "development" ]; then
            echo "🌱 Running database seeders (development mode)..."
            npx sequelize-cli db:seed:all || echo "⚠️  Seeders failed or already exist"
        fi
    else
        echo "🔄 Running TypeScript migrations..."
        npm run migrate || echo "⚠️  Migration script not found, trying alternative..."
        
        # Alternative: direct TypeScript migration
        if [ -f "src/database/migrate.ts" ]; then
            npx ts-node src/database/migrate.ts
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
