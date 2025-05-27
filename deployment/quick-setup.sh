#!/bin/bash

# =============================================================================
# WhatsApp Bot Quick Setup Script
# =============================================================================
# This script performs quick setup for deployment environment
# Usage: ./quick-setup.sh
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

log_info "WhatsApp Bot Quick Setup"
log_info "======================="

# Make all deployment scripts executable
log_info "Making deployment scripts executable..."
chmod +x "$SCRIPT_DIR"/*.sh
log_success "All deployment scripts are now executable"

# Create necessary directories
log_info "Creating necessary directories..."
mkdir -p "$PROJECT_ROOT/logs"
mkdir -p "$PROJECT_ROOT/backups"
mkdir -p "$PROJECT_ROOT/_IGNORE_dmr-bot"
log_success "Directories created"

# Check if .env file exists
if [[ ! -f "$PROJECT_ROOT/.env" ]]; then
    if [[ -f "$PROJECT_ROOT/.env.example" ]]; then
        log_info "Copying .env.example to .env..."
        cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
        log_warning "Please configure .env file before deployment!"
    else
        log_warning ".env file not found. Please create one before deployment."
    fi
else
    log_success ".env file already exists"
fi

# Check prerequisites
log_info "Checking prerequisites..."

# Check Docker
if command -v docker &> /dev/null; then
    log_success "Docker is installed"
    
    if docker info &> /dev/null; then
        log_success "Docker is running"
    else
        log_warning "Docker is installed but not running"
    fi
else
    log_error "Docker is not installed"
fi

# Check Docker Compose
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    log_success "Docker Compose is available"
else
    log_error "Docker Compose is not installed"
fi

# Check Git
if command -v git &> /dev/null; then
    log_success "Git is installed"
else
    log_error "Git is not installed"
fi

echo ""
log_info "Setup completed! Next steps:"
echo "1. Configure your .env file with proper values"
echo "2. Run: ./deployment/deploy.sh"
echo "3. Monitor: ./deployment/monitor.sh"
echo ""
log_info "Available deployment commands:"
echo "  ./deployment/deploy.sh          - Deploy application"
echo "  ./deployment/monitor.sh         - Monitor application"
echo "  ./deployment/backup.sh          - Create backup"
echo "  ./deployment/update.sh          - Update application"
echo "  ./deployment/health-check.sh    - Check application health"
echo "  ./deployment/log-manager.sh     - Manage logs"
echo "  ./deployment/service-manager.sh - Manage systemd service"
