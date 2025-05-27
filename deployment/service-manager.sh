#!/bin/bash

# =============================================================================
# WhatsApp Bot System Service Management Script
# =============================================================================
# This script manages the WhatsApp Bot as a systemd service
# Usage: ./service-manager.sh [install|uninstall|start|stop|restart|status]
# =============================================================================

set -e

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SERVICE_NAME="wabot"
SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"

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

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Install systemd service
install_service() {
    log_info "Installing WhatsApp Bot systemd service..."
    
    # Create service file
    cat > "$SERVICE_FILE" << EOF
[Unit]
Description=WhatsApp Bot Application
Documentation=https://github.com/youruser/wabot-typescript-dmr
Requires=docker.service
After=docker.service network.target
StartLimitIntervalSec=0

[Service]
Type=oneshot
RemainAfterExit=yes
User=root
Group=root
WorkingDirectory=$PROJECT_ROOT
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ExecStartPre=-/usr/bin/docker-compose down
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
ExecReload=/usr/bin/docker-compose restart
TimeoutStartSec=300
TimeoutStopSec=60
Restart=on-failure
RestartSec=30

[Install]
WantedBy=multi-user.target
EOF
    
    # Reload systemd
    systemctl daemon-reload
    
    log_success "Service installed successfully"
    log_info "To enable auto-start on boot: sudo systemctl enable $SERVICE_NAME"
}

# Uninstall systemd service
uninstall_service() {
    log_info "Uninstalling WhatsApp Bot systemd service..."
    
    # Stop and disable service
    systemctl stop "$SERVICE_NAME" 2>/dev/null || true
    systemctl disable "$SERVICE_NAME" 2>/dev/null || true
    
    # Remove service file
    if [[ -f "$SERVICE_FILE" ]]; then
        rm "$SERVICE_FILE"
        systemctl daemon-reload
        log_success "Service uninstalled successfully"
    else
        log_warning "Service file not found"
    fi
}

# Start service
start_service() {
    log_info "Starting WhatsApp Bot service..."
    systemctl start "$SERVICE_NAME"
    log_success "Service started"
}

# Stop service
stop_service() {
    log_info "Stopping WhatsApp Bot service..."
    systemctl stop "$SERVICE_NAME"
    log_success "Service stopped"
}

# Restart service
restart_service() {
    log_info "Restarting WhatsApp Bot service..."
    systemctl restart "$SERVICE_NAME"
    log_success "Service restarted"
}

# Check service status
check_status() {
    log_info "WhatsApp Bot service status:"
    systemctl status "$SERVICE_NAME" --no-pager -l
}

# Enable auto-start
enable_service() {
    log_info "Enabling WhatsApp Bot service auto-start..."
    systemctl enable "$SERVICE_NAME"
    log_success "Service enabled for auto-start"
}

# Disable auto-start
disable_service() {
    log_info "Disabling WhatsApp Bot service auto-start..."
    systemctl disable "$SERVICE_NAME"
    log_success "Service disabled from auto-start"
}

# Show help
show_help() {
    cat << EOF
WhatsApp Bot Service Manager

USAGE:
    sudo ./service-manager.sh [COMMAND]

COMMANDS:
    install     Install systemd service
    uninstall   Uninstall systemd service
    start       Start the service
    stop        Stop the service
    restart     Restart the service
    status      Show service status
    enable      Enable auto-start on boot
    disable     Disable auto-start on boot
    logs        Show service logs
    help        Show this help message

EXAMPLES:
    sudo ./service-manager.sh install
    sudo ./service-manager.sh start
    sudo ./service-manager.sh enable
    sudo ./service-manager.sh status

NOTE:
    This script must be run with sudo privileges.
EOF
}

# Show service logs
show_logs() {
    log_info "WhatsApp Bot service logs:"
    journalctl -u "$SERVICE_NAME" -f --no-pager
}

# Main function
main() {
    case "${1:-help}" in
        install)
            check_root
            install_service
            ;;
        uninstall)
            check_root
            uninstall_service
            ;;
        start)
            check_root
            start_service
            ;;
        stop)
            check_root
            stop_service
            ;;
        restart)
            check_root
            restart_service
            ;;
        status)
            check_status
            ;;
        enable)
            check_root
            enable_service
            ;;
        disable)
            check_root
            disable_service
            ;;
        logs)
            show_logs
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
