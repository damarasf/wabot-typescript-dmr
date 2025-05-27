#!/bin/bash

# =============================================================================
# WhatsApp Bot Monitoring Script
# =============================================================================
# This script monitors the WhatsApp Bot application health and status
# Usage: ./monitor.sh [--detailed] [--logs] [--metrics]
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
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Options
DETAILED=false
SHOW_LOGS=false
SHOW_METRICS=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --detailed)
            DETAILED=true
            shift
            ;;
        --logs)
            SHOW_LOGS=true
            shift
            ;;
        --metrics)
            SHOW_METRICS=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [--detailed] [--logs] [--metrics]"
            echo "  --detailed  Show detailed information"
            echo "  --logs      Show recent logs"
            echo "  --metrics   Show detailed metrics"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

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

log_header() {
    echo -e "${PURPLE}=== $1 ===${NC}"
}

log_subheader() {
    echo -e "${CYAN}--- $1 ---${NC}"
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running!"
        exit 1
    fi
}

# Show basic status
show_basic_status() {
    log_header "WhatsApp Bot Status Report"
    echo "Generated: $(date)"
    echo "Server: $(hostname)"
    echo ""
    
    cd "$PROJECT_ROOT"
    
    # Git information
    if [[ -d .git ]]; then
        echo "Git Branch: $(git branch --show-current 2>/dev/null || echo 'Unknown')"
        echo "Git Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'Unknown')"
        echo "Last Update: $(git log -1 --format=%cd --date=short 2>/dev/null || echo 'Unknown')"
        echo ""
    fi
}

# Show Docker services status
show_services_status() {
    log_header "Docker Services Status"
    
    cd "$PROJECT_ROOT"
    
    if [[ -f docker-compose.yml ]]; then
        # Show service status
        docker-compose ps
        echo ""
        
        # Check if services are healthy
        local services_up=0
        local total_services=0
        
        while IFS= read -r line; do
            if [[ $line == *"Up"* ]]; then
                services_up=$((services_up + 1))
            fi
            if [[ $line != *"Name"* ]] && [[ $line != *"----"* ]] && [[ -n $line ]]; then
                total_services=$((total_services + 1))
            fi
        done < <(docker-compose ps)
        
        if [[ $services_up -eq $total_services ]] && [[ $total_services -gt 0 ]]; then
            log_success "All services are running ($services_up/$total_services)"
        elif [[ $services_up -gt 0 ]]; then
            log_warning "Some services are running ($services_up/$total_services)"
        else
            log_error "No services are running"
        fi
    else
        log_error "docker-compose.yml not found"
    fi
    echo ""
}

# Show application health
show_application_health() {
    log_header "Application Health Check"
    
    cd "$PROJECT_ROOT"
    
    # Check if wabot container is running
    if docker-compose ps wabot | grep -q "Up"; then
        log_success "WhatsApp Bot container is running"
        
        # Try to get application status from logs
        local recent_logs=$(docker-compose logs --tail=5 wabot 2>/dev/null || echo "No logs available")
        
        if echo "$recent_logs" | grep -q -i "error\|failed\|exception"; then
            log_warning "Recent errors detected in application logs"
        else
            log_success "No recent errors detected"
        fi
        
        # Check if bot is responsive (if health endpoint exists)
        if docker-compose exec -T wabot curl -f http://localhost:3000/health >/dev/null 2>&1; then
            log_success "Application health endpoint is responding"
        else
            log_warning "Application health endpoint is not responding (this may be normal)"
        fi
    else
        log_error "WhatsApp Bot container is not running"
    fi
    
    # Check database connection
    if docker-compose ps postgres | grep -q "Up"; then
        log_success "PostgreSQL container is running"
        
        # Test database connection
        if docker-compose exec -T postgres pg_isready -U "${DB_USER:-wabot_user}" -d "${DB_NAME:-wabot_db}" >/dev/null 2>&1; then
            log_success "Database is accepting connections"
        else
            log_warning "Database connection test failed"
        fi
    else
        log_error "PostgreSQL container is not running"
    fi
    
    # Check Redis (if used)
    if docker-compose ps redis | grep -q "Up" 2>/dev/null; then
        log_success "Redis container is running"
        
        if docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
            log_success "Redis is responding to ping"
        else
            log_warning "Redis ping test failed"
        fi
    fi
    
    echo ""
}

# Show resource usage
show_resource_usage() {
    log_header "Resource Usage"
    
    # Docker container stats
    log_subheader "Container Resource Usage"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}" | grep -E "(CONTAINER|wabot|postgres|redis)"
    echo ""
    
    # Disk usage
    log_subheader "Disk Usage"
    df -h "$PROJECT_ROOT" | head -2
    echo ""
    
    # Show Docker system info if detailed
    if [[ "$DETAILED" == true ]]; then
        log_subheader "Docker System Information"
        docker system df
        echo ""
    fi
}

# Show recent logs
show_recent_logs() {
    if [[ "$SHOW_LOGS" == true ]]; then
        log_header "Recent Application Logs"
        
        cd "$PROJECT_ROOT"
        
        log_subheader "WhatsApp Bot Logs (Last 20 lines)"
        docker-compose logs --tail=20 wabot
        echo ""
        
        if [[ "$DETAILED" == true ]]; then
            log_subheader "PostgreSQL Logs (Last 10 lines)"
            docker-compose logs --tail=10 postgres
            echo ""
            
            if docker-compose ps redis >/dev/null 2>&1; then
                log_subheader "Redis Logs (Last 10 lines)"
                docker-compose logs --tail=10 redis
                echo ""
            fi
        fi
    fi
}

# Show detailed metrics
show_detailed_metrics() {
    if [[ "$SHOW_METRICS" == true ]]; then
        log_header "Detailed Metrics"
        
        cd "$PROJECT_ROOT"
        
        # Database metrics
        if docker-compose ps postgres | grep -q "Up"; then
            log_subheader "Database Metrics"
            
            # Database size
            local db_size=$(docker-compose exec -T postgres psql -U "${DB_USER:-wabot_user}" -d "${DB_NAME:-wabot_db}" -t -c "SELECT pg_size_pretty(pg_database_size('${DB_NAME:-wabot_db}'));" 2>/dev/null | xargs || echo "Unknown")
            echo "Database Size: $db_size"
            
            # Connection count
            local connections=$(docker-compose exec -T postgres psql -U "${DB_USER:-wabot_user}" -d "${DB_NAME:-wabot_db}" -t -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null | xargs || echo "Unknown")
            echo "Active Connections: $connections"
            
            # Table sizes (if accessible)
            echo ""
            echo "Top 5 Largest Tables:"
            docker-compose exec -T postgres psql -U "${DB_USER:-wabot_user}" -d "${DB_NAME:-wabot_db}" -c "
                SELECT 
                    schemaname,
                    tablename,
                    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
                FROM pg_tables 
                WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
                ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC 
                LIMIT 5;
            " 2>/dev/null || echo "Unable to retrieve table information"
            echo ""
        fi
        
        # Application metrics
        log_subheader "Application Metrics"
        
        # Uptime
        local uptime=$(docker-compose ps wabot --format "table {{.Status}}" | tail -n +2 | grep -o "Up.*" || echo "Not running")
        echo "Application Uptime: $uptime"
        
        # Log file sizes
        if [[ -d "$PROJECT_ROOT/logs" ]]; then
            echo ""
            echo "Log File Sizes:"
            du -h "$PROJECT_ROOT/logs"/* 2>/dev/null || echo "No log files found"
        fi
        
        # Session data size
        if [[ -d "$PROJECT_ROOT/_IGNORE_dmr-bot" ]]; then
            local session_size=$(du -sh "$PROJECT_ROOT/_IGNORE_dmr-bot" 2>/dev/null | cut -f1 || echo "Unknown")
            echo "WhatsApp Session Data Size: $session_size"
        fi
        
        echo ""
    fi
}

# Show system health summary
show_health_summary() {
    log_header "Health Summary"
    
    local issues=0
    local warnings=0
    
    cd "$PROJECT_ROOT"
    
    # Check critical services
    if ! docker-compose ps wabot | grep -q "Up"; then
        echo "❌ WhatsApp Bot is not running"
        issues=$((issues + 1))
    else
        echo "✅ WhatsApp Bot is running"
    fi
    
    if ! docker-compose ps postgres | grep -q "Up"; then
        echo "❌ PostgreSQL is not running"
        issues=$((issues + 1))
    else
        echo "✅ PostgreSQL is running"
    fi
    
    # Check disk space
    local disk_usage=$(df "$PROJECT_ROOT" | tail -1 | awk '{print $5}' | sed 's/%//')
    if [[ $disk_usage -gt 90 ]]; then
        echo "❌ Disk usage is critical (${disk_usage}%)"
        issues=$((issues + 1))
    elif [[ $disk_usage -gt 80 ]]; then
        echo "⚠️ Disk usage is high (${disk_usage}%)"
        warnings=$((warnings + 1))
    else
        echo "✅ Disk usage is normal (${disk_usage}%)"
    fi
    
    # Check for recent errors in logs
    if docker-compose logs --tail=50 wabot 2>/dev/null | grep -q -i "error\|failed\|exception"; then
        echo "⚠️ Recent errors detected in logs"
        warnings=$((warnings + 1))
    else
        echo "✅ No recent errors in logs"
    fi
    
    echo ""
    
    # Summary
    if [[ $issues -eq 0 ]] && [[ $warnings -eq 0 ]]; then
        log_success "System is healthy! No issues detected."
    elif [[ $issues -eq 0 ]] && [[ $warnings -gt 0 ]]; then
        log_warning "System is mostly healthy with $warnings warning(s)."
    else
        log_error "System has $issues critical issue(s) and $warnings warning(s)."
    fi
    
    echo ""
}

# Main monitoring function
main() {
    check_docker
    
    show_basic_status
    show_services_status
    show_application_health
    show_resource_usage
    show_recent_logs
    show_detailed_metrics
    show_health_summary
    
    # Show additional info if detailed mode
    if [[ "$DETAILED" == true ]]; then
        log_header "Additional Information"
        echo "For more detailed logs, use: docker-compose logs -f wabot"
        echo "To access container shell, use: docker-compose exec wabot /bin/sh"
        echo "To restart services, use: docker-compose restart"
        echo "To view real-time stats, use: docker stats"
        echo ""
    fi
}

# Run main function
main "$@"
