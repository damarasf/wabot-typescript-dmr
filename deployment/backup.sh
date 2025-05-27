#!/bin/bash

# =============================================================================
# WhatsApp Bot Backup Script
# =============================================================================
# This script creates backups of the WhatsApp Bot application data
# Usage: ./backup.sh [backup_name]
# =============================================================================

set -e

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_NAME=${1:-$(date +%Y%m%d_%H%M%S)}
BACKUP_DIR="$PROJECT_ROOT/backups/$BACKUP_NAME"

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

# Load environment variables
if [[ -f "$PROJECT_ROOT/.env" ]]; then
    source "$PROJECT_ROOT/.env"
fi

log_info "Creating backup: $BACKUP_NAME"
log_info "Backup directory: $BACKUP_DIR"

# Create backup directory
mkdir -p "$BACKUP_DIR"

cd "$PROJECT_ROOT"

# Backup database
backup_database() {
    log_info "Backing up PostgreSQL database..."
    
    if docker-compose ps postgres | grep -q "Up"; then
        docker-compose exec -T postgres pg_dump \
            -U "${DB_USER:-wabot_user}" \
            -d "${DB_NAME:-wabot_db}" \
            --verbose \
            --clean \
            --if-exists \
            > "$BACKUP_DIR/database_backup.sql" 2>/dev/null || {
            log_warning "Database backup failed or database is empty."
            touch "$BACKUP_DIR/database_backup.sql"
        }
        
        # Also create a compressed version
        gzip -c "$BACKUP_DIR/database_backup.sql" > "$BACKUP_DIR/database_backup.sql.gz"
        log_success "Database backup completed."
    else
        log_warning "PostgreSQL container is not running. Skipping database backup."
        touch "$BACKUP_DIR/database_backup_skipped.txt"
    fi
}

# Backup WhatsApp session data
backup_session_data() {
    log_info "Backing up WhatsApp session data..."
    
    if [[ -d "$PROJECT_ROOT/_IGNORE_dmr-bot" ]] && [[ "$(ls -A "$PROJECT_ROOT/_IGNORE_dmr-bot")" ]]; then
        cp -r "$PROJECT_ROOT/_IGNORE_dmr-bot" "$BACKUP_DIR/"
        log_success "WhatsApp session data backup completed."
    else
        log_warning "No WhatsApp session data found to backup."
        touch "$BACKUP_DIR/session_data_empty.txt"
    fi
}

# Backup application logs
backup_logs() {
    log_info "Backing up application logs..."
    
    if [[ -d "$PROJECT_ROOT/logs" ]] && [[ "$(ls -A "$PROJECT_ROOT/logs")" ]]; then
        cp -r "$PROJECT_ROOT/logs" "$BACKUP_DIR/"
        log_success "Application logs backup completed."
    else
        log_warning "No application logs found to backup."
        touch "$BACKUP_DIR/logs_empty.txt"
    fi
}

# Backup configuration files
backup_config() {
    log_info "Backing up configuration files..."
    
    # Backup environment files (without sensitive data)
    for env_file in .env .env.production .env.staging .env.development; do
        if [[ -f "$PROJECT_ROOT/$env_file" ]]; then
            # Create sanitized version (remove sensitive values)
            sed 's/=.*/=***REDACTED***/g' "$PROJECT_ROOT/$env_file" > "$BACKUP_DIR/${env_file}.template"
        fi
    done
    
    # Backup other important config files
    for config_file in package.json tsconfig.json docker-compose.yml .dockerignore; do
        if [[ -f "$PROJECT_ROOT/$config_file" ]]; then
            cp "$PROJECT_ROOT/$config_file" "$BACKUP_DIR/"
        fi
    done
    
    log_success "Configuration files backup completed."
}

# Create backup metadata
create_metadata() {
    log_info "Creating backup metadata..."
    
    cat > "$BACKUP_DIR/backup_info.txt" << EOF
WhatsApp Bot Backup Information
===============================

Backup Name: $BACKUP_NAME
Backup Date: $(date)
Backup Time: $(date +%H:%M:%S)
Server: $(hostname)
User: $(whoami)
Git Commit: $(git rev-parse HEAD 2>/dev/null || echo "Not available")
Git Branch: $(git branch --show-current 2>/dev/null || echo "Not available")

Backup Contents:
- Database dump (PostgreSQL)
- WhatsApp session data
- Application logs
- Configuration files (sanitized)

Environment:
- Node.js Version: $(node --version 2>/dev/null || echo "Not available")
- Docker Version: $(docker --version 2>/dev/null || echo "Not available")
- Docker Compose Version: $(docker-compose --version 2>/dev/null || echo "Not available")

Application Status at Backup Time:
$(docker-compose ps 2>/dev/null || echo "Docker Compose not available")
EOF
    
    log_success "Backup metadata created."
}

# Create compressed archive
create_archive() {
    log_info "Creating compressed archive..."
    
    cd "$PROJECT_ROOT/backups"
    
    # Create tar.gz archive
    tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
    
    # Get file size
    ARCHIVE_SIZE=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)
    
    log_success "Compressed archive created: ${BACKUP_NAME}.tar.gz ($ARCHIVE_SIZE)"
    
    # Remove uncompressed backup directory
    rm -rf "$BACKUP_NAME"
    
    log_info "Uncompressed backup directory removed."
}

# Cleanup old backups
cleanup_old_backups() {
    log_info "Cleaning up old backups..."
    
    # Keep last 7 daily backups
    find "$PROJECT_ROOT/backups" -name "*.tar.gz" -mtime +7 -type f | while read -r old_backup; do
        log_warning "Removing old backup: $(basename "$old_backup")"
        rm -f "$old_backup"
    done
    
    log_success "Old backups cleanup completed."
}

# Verify backup
verify_backup() {
    log_info "Verifying backup archive..."
    
    cd "$PROJECT_ROOT/backups"
    
    if tar -tzf "${BACKUP_NAME}.tar.gz" >/dev/null 2>&1; then
        log_success "Backup archive verification passed."
        
        # List contents
        log_info "Backup contents:"
        tar -tzf "${BACKUP_NAME}.tar.gz" | head -20
        
        local file_count=$(tar -tzf "${BACKUP_NAME}.tar.gz" | wc -l)
        if [[ $file_count -gt 20 ]]; then
            echo "... and $((file_count - 20)) more files"
        fi
    else
        log_error "Backup archive verification failed!"
        exit 1
    fi
}

# Send notification (if webhook is configured)
send_notification() {
    if [[ -n "$BACKUP_NOTIFICATION_WEBHOOK" ]]; then
        log_info "Sending backup notification..."
        
        local archive_size=$(du -h "$PROJECT_ROOT/backups/${BACKUP_NAME}.tar.gz" | cut -f1)
        local message="✅ WhatsApp Bot backup completed successfully!\n\nBackup: $BACKUP_NAME\nSize: $archive_size\nDate: $(date)"
        
        curl -X POST "$BACKUP_NOTIFICATION_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{\"text\":\"$message\"}" \
            >/dev/null 2>&1 || log_warning "Failed to send notification"
    fi
}

# Main backup function
main() {
    log_info "WhatsApp Bot Backup Script"
    log_info "=========================="
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Perform backup steps
    backup_database
    backup_session_data
    backup_logs
    backup_config
    create_metadata
    create_archive
    verify_backup
    cleanup_old_backups
    send_notification
    
    log_success "Backup process completed successfully!"
    log_info "Backup location: $PROJECT_ROOT/backups/${BACKUP_NAME}.tar.gz"
}

# Trap errors
trap 'log_error "Backup failed!"; exit 1' ERR

# Run main function
main "$@"
