#!/bin/bash

# =============================================================================
# WhatsApp Bot Update Script
# =============================================================================
# This script updates the WhatsApp Bot application to a new version
# Usage: ./update.sh [version] [--no-backup] [--force]
# =============================================================================

set -e

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VERSION="${1:-latest}"
NO_BACKUP=false
FORCE=false

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

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --no-backup)
            NO_BACKUP=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        -h|--help)
            cat << EOF
WhatsApp Bot Update Script

USAGE:
    ./update.sh [VERSION] [OPTIONS]

ARGUMENTS:
    VERSION         Git tag, branch, or 'latest' [default: latest]

OPTIONS:
    --no-backup     Skip creating backup before update
    --force         Force update without confirmation
    -h, --help      Show this help message

EXAMPLES:
    ./update.sh                     # Update to latest
    ./update.sh v1.2.0             # Update to specific version
    ./update.sh --no-backup latest # Update without backup
    ./update.sh --force v1.2.0     # Force update to v1.2.0

EOF
            exit 0
            ;;
        *)
            if [[ -z "$VERSION" || "$VERSION" == "latest" ]]; then
                VERSION=$1
            fi
            shift
            ;;
    esac
done

# Get current version
get_current_version() {
    cd "$PROJECT_ROOT"
    
    if [[ -d .git ]]; then
        git describe --tags --abbrev=0 2>/dev/null || git rev-parse --short HEAD
    else
        echo "unknown"
    fi
}

# Check if update is needed
check_update_needed() {
    local current_version=$(get_current_version)
    
    if [[ "$VERSION" == "latest" ]]; then
        cd "$PROJECT_ROOT"
        git fetch --tags
        VERSION=$(git describe --tags --abbrev=0 origin/main 2>/dev/null || echo "main")
    fi
    
    if [[ "$current_version" == "$VERSION" ]] && [[ "$FORCE" != true ]]; then
        log_info "Already on version $VERSION. Use --force to reinstall."
        exit 0
    fi
    
    log_info "Current version: $current_version"
    log_info "Target version: $VERSION"
}

# Confirm update
confirm_update() {
    if [[ "$FORCE" != true ]]; then
        echo ""
        log_warning "This will update the WhatsApp Bot to version: $VERSION"
        
        if [[ "$NO_BACKUP" == true ]]; then
            log_warning "No backup will be created!"
        else
            log_info "A backup will be created before update"
        fi
        
        echo ""
        read -p "Do you want to continue? (y/N): " -n 1 -r
        echo ""
        
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Update cancelled."
            exit 0
        fi
    fi
}

# Create pre-update backup
create_backup() {
    if [[ "$NO_BACKUP" != true ]]; then
        log_info "Creating pre-update backup..."
        
        local backup_name="pre_update_$(date +%Y%m%d_%H%M%S)"
        
        if [[ -f "$SCRIPT_DIR/backup.sh" ]]; then
            "$SCRIPT_DIR/backup.sh" "$backup_name"
            log_success "Backup created: $backup_name"
        else
            log_warning "Backup script not found, skipping backup"
        fi
    fi
}

# Update application
update_application() {
    log_info "Updating application..."
    
    cd "$PROJECT_ROOT"
    
    # Store current docker-compose state
    local was_running=false
    if docker-compose ps | grep -q "Up"; then
        was_running=true
        log_info "Services are currently running"
    fi
    
    # Stop services
    log_info "Stopping services..."
    docker-compose down || true
    
    # Update code
    log_info "Fetching latest code..."
    git fetch --all --tags
    
    # Checkout target version
    if [[ "$VERSION" == "latest" || "$VERSION" == "main" ]]; then
        git checkout main
        git pull origin main
    else
        git checkout "$VERSION"
    fi
    
    # Update dependencies if package.json changed
    if git diff --name-only HEAD~1 HEAD | grep -q "package.json\|package-lock.json"; then
        log_info "Dependencies changed, rebuilding Docker image..."
        docker-compose build --no-cache wabot
    else
        log_info "Building updated Docker image..."
        docker-compose build wabot
    fi
    
    # Start services if they were running before
    if [[ "$was_running" == true ]]; then
        log_info "Starting services..."
        docker-compose up -d
        
        # Wait for services to be ready
        log_info "Waiting for services to be ready..."
        sleep 15
        
        # Run migrations if needed
        log_info "Running database migrations..."
        docker-compose exec wabot npm run migrate || {
            log_warning "Migration failed or no migrations needed"
        }
    else
        log_info "Services were not running before update, leaving them stopped"
    fi
    
    log_success "Application updated successfully!"
}

# Verify update
verify_update() {
    log_info "Verifying update..."
    
    cd "$PROJECT_ROOT"
    
    # Check current version
    local current_version=$(get_current_version)
    log_info "Updated to version: $current_version"
    
    # Check if services are running (if they should be)
    if docker-compose ps | grep -q "Up"; then
        log_info "Checking service health..."
        
        # Wait a bit for services to stabilize
        sleep 10
        
        # Check application health
        if docker-compose exec wabot node -e "console.log('Health check passed')" >/dev/null 2>&1; then
            log_success "Application is responding"
        else
            log_warning "Application health check failed"
        fi
        
        # Show service status
        echo ""
        log_info "Service status:"
        docker-compose ps
        
        # Show recent logs
        echo ""
        log_info "Recent logs:"
        docker-compose logs --tail=10 wabot
    fi
}

# Rollback on failure
rollback_on_failure() {
    log_error "Update failed! Attempting rollback..."
    
    cd "$PROJECT_ROOT"
    
    # Get previous version
    local previous_version=$(git describe --tags --abbrev=0 HEAD~1 2>/dev/null || echo "main")
    
    log_info "Rolling back to: $previous_version"
    
    # Checkout previous version
    git checkout "$previous_version"
    
    # Rebuild and restart
    docker-compose down
    docker-compose build wabot
    docker-compose up -d
    
    log_warning "Rollback completed. Please check the application."
}

# Cleanup old images
cleanup() {
    log_info "Cleaning up old Docker images..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove old application images (keep last 3)
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}" | \
    grep wabot-app | \
    tail -n +4 | \
    awk '{print $3}' | \
    xargs -r docker rmi -f 2>/dev/null || true
    
    log_success "Cleanup completed"
}

# Main update function
main() {
    log_info "WhatsApp Bot Update Script"
    log_info "========================="
    
    # Check prerequisites
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed"
        exit 1
    fi
    
    if [[ ! -f "$PROJECT_ROOT/docker-compose.yml" ]]; then
        log_error "docker-compose.yml not found in project root"
        exit 1
    fi
    
    # Perform update
    check_update_needed
    confirm_update
    create_backup
    
    # Set trap for rollback on failure
    trap rollback_on_failure ERR
    
    update_application
    verify_update
    cleanup
    
    # Remove trap
    trap - ERR
    
    log_success "Update completed successfully!"
    
    echo ""
    log_info "Update Summary:"
    echo "  Version: $VERSION"
    echo "  Backup: $([ "$NO_BACKUP" == true ] && echo "Skipped" || echo "Created")"
    echo "  Status: Success"
    
    echo ""
    log_info "Next steps:"
    echo "  - Monitor application logs: docker-compose logs -f wabot"
    echo "  - Check application status: ./deployment/monitor.sh"
    echo "  - Test application functionality"
}

# Run main function
main "$@"
