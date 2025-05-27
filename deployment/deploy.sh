#!/bin/bash

# =============================================================================
# WhatsApp Bot Deployment Script
# =============================================================================
# This script deploys the WhatsApp Bot application using Docker
# Usage: ./deploy.sh [environment] [version]
# Example: ./deploy.sh production v1.0.0
#
# Prerequisites:
# - Docker and Docker Compose installed
# - Git installed
# - Environment variables configured
# =============================================================================

set -e  # Exit on any error

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
APP_NAME="wabot-typescript-dmr"
DOCKER_IMAGE_NAME="wabot-app"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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

# Help function
show_help() {
    cat << EOF
WhatsApp Bot Deployment Script

USAGE:
    ./deploy.sh [OPTIONS] [ENVIRONMENT] [VERSION]

ARGUMENTS:
    ENVIRONMENT    Target environment (development|staging|production) [default: production]
    VERSION        Git tag or branch to deploy [default: main]

OPTIONS:
    -h, --help     Show this help message
    -f, --force    Force deployment (skip confirmations)
    -b, --backup   Create backup before deployment
    -r, --rollback Rollback to previous version
    --no-build     Skip Docker image build
    --no-migrate   Skip database migrations

EXAMPLES:
    ./deploy.sh                                  # Deploy main branch to production
    ./deploy.sh development                      # Deploy to development environment
    ./deploy.sh production v1.2.0               # Deploy specific version to production
    ./deploy.sh --force production v1.2.0       # Force deploy without confirmations
    ./deploy.sh --backup production v1.2.0      # Deploy with backup

ENVIRONMENT VARIABLES:
    The following environment variables should be set in .env file:
    - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
    - BOT_NAME, OWNER_NUMBER
    - N8N_WEBHOOK_URL, N8N_API_KEY
    - DAILY_LIMIT_FREE, DAILY_LIMIT_PREMIUM

EOF
}

# Parse command line arguments
ENVIRONMENT="production"
VERSION="main"
FORCE=false
BACKUP=false
ROLLBACK=false
NO_BUILD=false
NO_MIGRATE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -b|--backup)
            BACKUP=true
            shift
            ;;
        -r|--rollback)
            ROLLBACK=true
            shift
            ;;
        --no-build)
            NO_BUILD=true
            shift
            ;;
        --no-migrate)
            NO_MIGRATE=true
            shift
            ;;
        development|staging|production)
            ENVIRONMENT=$1
            shift
            ;;
        *)
            if [[ -z "$VERSION" || "$VERSION" == "main" ]]; then
                VERSION=$1
            fi
            shift
            ;;
    esac
done

# Set environment-specific variables
case $ENVIRONMENT in
    development)
        COMPOSE_FILE="docker-compose.yml"
        ENV_FILE=".env.development"
        ;;
    staging)
        COMPOSE_FILE="docker-compose.staging.yml"
        ENV_FILE=".env.staging"
        ;;
    production)
        COMPOSE_FILE="docker-compose.yml"
        ENV_FILE=".env"
        ;;
    *)
        log_error "Invalid environment: $ENVIRONMENT. Use development, staging, or production."
        exit 1
        ;;
esac

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi
    
    # Check if Git is installed
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    # Check if environment file exists
    if [[ ! -f "$PROJECT_ROOT/$ENV_FILE" ]]; then
        log_warning "Environment file $ENV_FILE not found. Creating from example..."
        if [[ -f "$PROJECT_ROOT/.env.example" ]]; then
            cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/$ENV_FILE"
            log_warning "Please configure $ENV_FILE before continuing."
            exit 1
        else
            log_error "No environment file or example found. Please create $ENV_FILE first."
            exit 1
        fi
    fi
    
    log_success "Prerequisites check passed."
}

# Create backup
create_backup() {
    if [[ "$BACKUP" == true ]]; then
        log_info "Creating backup..."
        
        BACKUP_DIR="$PROJECT_ROOT/backups/$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        
        # Backup database
        docker-compose -f "$PROJECT_ROOT/$COMPOSE_FILE" exec -T postgres pg_dump \
            -U "${DB_USER:-wabot_user}" \
            -d "${DB_NAME:-wabot_db}" \
            > "$BACKUP_DIR/database_backup.sql" 2>/dev/null || {
            log_warning "Database backup failed or no existing database found."
        }
        
        # Backup application data
        if [[ -d "$PROJECT_ROOT/_IGNORE_dmr-bot" ]]; then
            cp -r "$PROJECT_ROOT/_IGNORE_dmr-bot" "$BACKUP_DIR/"
        fi
        
        if [[ -d "$PROJECT_ROOT/logs" ]]; then
            cp -r "$PROJECT_ROOT/logs" "$BACKUP_DIR/"
        fi
        
        log_success "Backup created in $BACKUP_DIR"
    fi
}

# Deploy application
deploy_application() {
    log_info "Starting deployment for $ENVIRONMENT environment..."
    
    cd "$PROJECT_ROOT"
    
    # Fetch latest code
    log_info "Fetching latest code from Git..."
    git fetch --all
    git checkout "$VERSION"
    
    if [[ "$VERSION" != "main" && "$VERSION" != "master" ]]; then
        # If it's a tag, verify it exists
        if ! git tag -l | grep -q "^$VERSION$"; then
            log_error "Git tag $VERSION does not exist."
            exit 1
        fi
    fi
    
    # Build Docker image
    if [[ "$NO_BUILD" != true ]]; then
        log_info "Building Docker image..."
        docker build -t "$DOCKER_IMAGE_NAME:$VERSION" .
        docker tag "$DOCKER_IMAGE_NAME:$VERSION" "$DOCKER_IMAGE_NAME:latest"
        log_success "Docker image built successfully."
    fi
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose -f "$COMPOSE_FILE" down || true
    
    # Start services
    log_info "Starting services..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Wait for database to be ready
    log_info "Waiting for database to be ready..."
    sleep 10
    
    # Run database migrations
    if [[ "$NO_MIGRATE" != true ]]; then
        log_info "Running database migrations..."
        docker-compose -f "$COMPOSE_FILE" exec wabot npm run migrate || {
            log_warning "Database migration failed. This might be normal for first deployment."
        }
    fi
    
    # Check service health
    log_info "Checking service health..."
    sleep 15
    
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        log_success "Deployment completed successfully!"
        
        # Show service status
        echo ""
        log_info "Service Status:"
        docker-compose -f "$COMPOSE_FILE" ps
        
        # Show logs
        echo ""
        log_info "Recent logs:"
        docker-compose -f "$COMPOSE_FILE" logs --tail=20 wabot
        
    else
        log_error "Deployment failed. Services are not running properly."
        echo ""
        log_info "Service Status:"
        docker-compose -f "$COMPOSE_FILE" ps
        echo ""
        log_info "Error logs:"
        docker-compose -f "$COMPOSE_FILE" logs wabot
        exit 1
    fi
}

# Rollback function
rollback_deployment() {
    log_info "Rolling back deployment..."
    
    cd "$PROJECT_ROOT"
    
    # Get previous version from Git
    PREVIOUS_VERSION=$(git describe --tags --abbrev=0 HEAD~1 2>/dev/null || echo "main")
    
    log_info "Rolling back to version: $PREVIOUS_VERSION"
    
    # Deploy previous version
    VERSION="$PREVIOUS_VERSION"
    deploy_application
}

# Confirmation prompt
confirm_deployment() {
    if [[ "$FORCE" != true ]]; then
        echo ""
        log_warning "Deployment Configuration:"
        echo "  Environment: $ENVIRONMENT"
        echo "  Version: $VERSION"
        echo "  Compose file: $COMPOSE_FILE"
        echo "  Environment file: $ENV_FILE"
        echo "  Backup: $BACKUP"
        echo ""
        
        read -p "Do you want to continue with this deployment? (y/N): " -n 1 -r
        echo ""
        
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Deployment cancelled."
            exit 0
        fi
    fi
}

# Cleanup function
cleanup() {
    log_info "Cleaning up old Docker images..."
    docker system prune -f
    docker image prune -f
}

# Main execution
main() {
    log_info "WhatsApp Bot Deployment Script"
    log_info "================================"
    
    if [[ "$ROLLBACK" == true ]]; then
        rollback_deployment
    else
        check_prerequisites
        confirm_deployment
        create_backup
        deploy_application
        cleanup
    fi
    
    log_success "Deployment process completed!"
}

# Trap errors and cleanup
trap 'log_error "Deployment failed!"; exit 1' ERR

# Run main function
main "$@"
