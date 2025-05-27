#!/bin/bash

# =============================================================================
# Environment Setup Script for WhatsApp Bot
# =============================================================================
# This script sets up the environment for deploying the WhatsApp Bot
# Usage: ./setup-environment.sh [environment]
# =============================================================================

set -e

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Environment parameter
ENVIRONMENT=${1:-production}

log_info "Setting up environment for: $ENVIRONMENT"

# Create environment file
create_env_file() {
    local env_file="$PROJECT_ROOT/.env"
    
    if [[ "$ENVIRONMENT" != "production" ]]; then
        env_file="$PROJECT_ROOT/.env.$ENVIRONMENT"
    fi
    
    if [[ -f "$env_file" ]]; then
        log_warning "Environment file $env_file already exists."
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Keeping existing environment file."
            return
        fi
    fi
    
    log_info "Creating environment file: $env_file"
    
    cat > "$env_file" << EOF
# =============================================================================
# WhatsApp Bot Environment Configuration - $ENVIRONMENT
# =============================================================================

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wabot_db
DB_USER=wabot_user
DB_PASSWORD=your_secure_password_here

# Bot Configuration
BOT_NAME=DMR Bot
OWNER_NUMBER=62xxxxxxxxxx

# N8N Integration
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/
N8N_API_KEY=your_n8n_api_key_here

# Usage Limits
DAILY_LIMIT_FREE=10
DAILY_LIMIT_PREMIUM=100

# Application Settings
APP_PORT=3000
NODE_ENV=$ENVIRONMENT

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Timezone
TIMEZONE=Asia/Jakarta

# Logging
LOG_LEVEL=info

# Security
SESSION_SECRET=your_very_secure_session_secret_here

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *

# Monitoring (Optional)
HEALTHCHECK_URL=
MONITORING_WEBHOOK=
EOF
    
    log_success "Environment file created: $env_file"
    log_warning "Please update the configuration values in $env_file before deployment!"
}

# Create Docker Compose override for specific environments
create_docker_override() {
    local override_file="$PROJECT_ROOT/docker-compose.$ENVIRONMENT.yml"
    
    case $ENVIRONMENT in
        development)
            cat > "$override_file" << EOF
version: '3.8'

services:
  wabot:
    build:
      target: builder
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      NODE_ENV: development
    command: npm run dev
    ports:
      - "3000:3000"
      - "9229:9229"  # Debug port

  postgres:
    ports:
      - "5432:5432"
    
  redis:
    ports:
      - "6379:6379"
EOF
            ;;
        staging)
            cat > "$override_file" << EOF
version: '3.8'

services:
  wabot:
    environment:
      NODE_ENV: staging
    restart: unless-stopped
    
  postgres:
    environment:
      POSTGRES_DB: wabot_staging
    
volumes:
  postgres_data:
  wabot_logs:
  wabot_session:
  redis_data:
EOF
            ;;
    esac
    
    if [[ -f "$override_file" ]]; then
        log_success "Docker Compose override created: $override_file"
    fi
}

# Create systemd service file for production
create_systemd_service() {
    if [[ "$ENVIRONMENT" == "production" ]]; then
        log_info "Creating systemd service file..."
        
        local service_file="$PROJECT_ROOT/deployment/wabot.service"
        
        cat > "$service_file" << EOF
[Unit]
Description=WhatsApp Bot Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$PROJECT_ROOT
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
        
        log_success "Systemd service file created: $service_file"
        log_info "To install the service, run as root:"
        echo "  sudo cp $service_file /etc/systemd/system/"
        echo "  sudo systemctl daemon-reload"
        echo "  sudo systemctl enable wabot"
        echo "  sudo systemctl start wabot"
    fi
}

# Create backup directories
create_directories() {
    log_info "Creating necessary directories..."
    
    mkdir -p "$PROJECT_ROOT/backups"
    mkdir -p "$PROJECT_ROOT/logs"
    mkdir -p "$PROJECT_ROOT/_IGNORE_dmr-bot"
    
    # Set proper permissions
    chmod 755 "$PROJECT_ROOT/backups"
    chmod 755 "$PROJECT_ROOT/logs"
    chmod 755 "$PROJECT_ROOT/_IGNORE_dmr-bot"
    
    log_success "Directories created successfully."
}

# Create backup script
create_backup_script() {
    local backup_script="$PROJECT_ROOT/deployment/backup.sh"
    
    cat > "$backup_script" << 'EOF'
#!/bin/bash

# WhatsApp Bot Backup Script

set -e

PROJECT_ROOT="$(dirname "$(dirname "$(realpath "$0")")")"
BACKUP_DIR="$PROJECT_ROOT/backups/$(date +%Y%m%d_%H%M%S)"

mkdir -p "$BACKUP_DIR"

echo "Creating backup in: $BACKUP_DIR"

# Backup database
if docker-compose ps | grep -q postgres; then
    echo "Backing up database..."
    docker-compose exec -T postgres pg_dump \
        -U "${DB_USER:-wabot_user}" \
        -d "${DB_NAME:-wabot_db}" \
        > "$BACKUP_DIR/database_backup.sql"
fi

# Backup application data
if [[ -d "$PROJECT_ROOT/_IGNORE_dmr-bot" ]]; then
    echo "Backing up WhatsApp session data..."
    cp -r "$PROJECT_ROOT/_IGNORE_dmr-bot" "$BACKUP_DIR/"
fi

if [[ -d "$PROJECT_ROOT/logs" ]]; then
    echo "Backing up logs..."
    cp -r "$PROJECT_ROOT/logs" "$BACKUP_DIR/"
fi

# Create archive
cd "$PROJECT_ROOT/backups"
tar -czf "backup_$(date +%Y%m%d_%H%M%S).tar.gz" "$(basename "$BACKUP_DIR")"
rm -rf "$BACKUP_DIR"

echo "Backup completed successfully!"

# Clean up old backups (keep last 7 days)
find "$PROJECT_ROOT/backups" -name "backup_*.tar.gz" -mtime +7 -delete
EOF
    
    chmod +x "$backup_script"
    log_success "Backup script created: $backup_script"
}

# Create monitoring script
create_monitoring_script() {
    local monitor_script="$PROJECT_ROOT/deployment/monitor.sh"
    
    cat > "$monitor_script" << 'EOF'
#!/bin/bash

# WhatsApp Bot Monitoring Script

PROJECT_ROOT="$(dirname "$(dirname "$(realpath "$0")")")"

cd "$PROJECT_ROOT"

echo "=== WhatsApp Bot Status ==="
echo "Date: $(date)"
echo ""

echo "=== Docker Services ==="
docker-compose ps
echo ""

echo "=== Service Health ==="
if docker-compose exec wabot curl -f http://localhost:3000/health 2>/dev/null; then
    echo "✓ Application is healthy"
else
    echo "✗ Application health check failed"
fi
echo ""

echo "=== Resource Usage ==="
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
echo ""

echo "=== Recent Logs ==="
docker-compose logs --tail=10 wabot
echo ""

echo "=== Disk Usage ==="
df -h "$PROJECT_ROOT"
echo ""
EOF
    
    chmod +x "$monitor_script"
    log_success "Monitoring script created: $monitor_script"
}

# Main function
main() {
    log_info "WhatsApp Bot Environment Setup"
    log_info "=============================="
    
    create_directories
    create_env_file
    create_docker_override
    create_systemd_service
    create_backup_script
    create_monitoring_script
    
    # Make deploy script executable
    chmod +x "$PROJECT_ROOT/deployment/deploy.sh"
    
    log_success "Environment setup completed for: $ENVIRONMENT"
    echo ""
    log_info "Next steps:"
    echo "1. Edit the environment file and configure your settings"
    echo "2. Run ./deployment/deploy.sh to deploy the application"
    echo "3. Use ./deployment/monitor.sh to check application status"
    echo "4. Use ./deployment/backup.sh to create backups"
}

main "$@"
EOF
