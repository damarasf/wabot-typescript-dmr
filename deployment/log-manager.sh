#!/bin/bash

# =============================================================================
# WhatsApp Bot Log Management and Cleanup Script
# =============================================================================
# This script manages log files, performs cleanup, and manages disk space
# Usage: ./log-manager.sh [rotate|cleanup|archive|analyze] [--dry-run]
# =============================================================================

set -e

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DRY_RUN=false

# Default retention periods (days)
LOG_RETENTION_DAYS=30
BACKUP_RETENTION_DAYS=7
DOCKER_LOG_RETENTION_DAYS=7

# Log file size limits (MB)
MAX_LOG_SIZE=100
MAX_TOTAL_LOG_SIZE=1000

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
ACTION=""
while [[ $# -gt 0 ]]; do
    case $1 in
        rotate|cleanup|archive|analyze)
            ACTION=$1
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --retention-days=*)
            LOG_RETENTION_DAYS="${1#*=}"
            shift
            ;;
        -h|--help)
            cat << EOF
WhatsApp Bot Log Manager

USAGE:
    ./log-manager.sh [ACTION] [OPTIONS]

ACTIONS:
    rotate      Rotate current log files
    cleanup     Clean up old log files
    archive     Archive old logs to compressed files
    analyze     Analyze log files for issues

OPTIONS:
    --dry-run               Show what would be done without executing
    --retention-days=N      Set log retention period [default: 30]
    -h, --help             Show this help message

EXAMPLES:
    ./log-manager.sh rotate             # Rotate log files
    ./log-manager.sh cleanup --dry-run  # Show what would be cleaned
    ./log-manager.sh archive            # Archive old logs
    ./log-manager.sh analyze            # Analyze logs for issues

EOF
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Default action if none specified
if [[ -z "$ACTION" ]]; then
    ACTION="cleanup"
fi

# Execute or show command based on dry run mode
execute_command() {
    local cmd="$1"
    local description="$2"
    
    if [[ "$DRY_RUN" == true ]]; then
        log_info "[DRY RUN] $description"
        log_info "[DRY RUN] Would execute: $cmd"
    else
        log_info "$description"
        eval "$cmd"
    fi
}

# Get human readable file size
get_file_size() {
    local file="$1"
    if [[ -f "$file" ]]; then
        du -h "$file" | cut -f1
    else
        echo "0B"
    fi
}

# Get file size in MB
get_file_size_mb() {
    local file="$1"
    if [[ -f "$file" ]]; then
        echo $(( $(stat --format="%s" "$file" 2>/dev/null || echo "0") / 1024 / 1024 ))
    else
        echo "0"
    fi
}

# Rotate application logs
rotate_application_logs() {
    log_info "Rotating application logs..."
    
    local log_dir="$PROJECT_ROOT/logs"
    
    if [[ ! -d "$log_dir" ]]; then
        log_warning "Log directory $log_dir does not exist"
        return
    fi
    
    cd "$log_dir"
    
    # Rotate each log file
    for log_file in *.log; do
        if [[ -f "$log_file" ]]; then
            local size_mb=$(get_file_size_mb "$log_file")
            
            if [[ $size_mb -gt $MAX_LOG_SIZE ]]; then
                local timestamp=$(date +%Y%m%d_%H%M%S)
                local rotated_name="${log_file%.log}_${timestamp}.log"
                
                execute_command "mv '$log_file' '$rotated_name'" "Rotating $log_file (${size_mb}MB)"
                execute_command "touch '$log_file'" "Creating new $log_file"
                execute_command "gzip '$rotated_name'" "Compressing $rotated_name"
            else
                log_info "$log_file size (${size_mb}MB) is below rotation threshold"
            fi
        fi
    done
}

# Rotate Docker logs
rotate_docker_logs() {
    log_info "Managing Docker logs..."
    
    cd "$PROJECT_ROOT"
    
    if [[ ! -f docker-compose.yml ]]; then
        log_warning "docker-compose.yml not found"
        return
    fi
    
    # Get container names
    local containers=$(docker-compose ps --services 2>/dev/null || echo "")
    
    for container in $containers; do
        local container_id=$(docker-compose ps -q "$container" 2>/dev/null || echo "")
        
        if [[ -n "$container_id" ]]; then
            # Get log file path
            local log_path=$(docker inspect "$container_id" --format='{{.LogPath}}' 2>/dev/null || echo "")
            
            if [[ -n "$log_path" && -f "$log_path" ]]; then
                local size_mb=$(get_file_size_mb "$log_path")
                
                if [[ $size_mb -gt $MAX_LOG_SIZE ]]; then
                    log_info "Docker log for $container is ${size_mb}MB, truncating..."
                    
                    if [[ "$DRY_RUN" != true ]]; then
                        # Truncate log file (Docker will recreate it)
                        echo "" > "$log_path"
                    fi
                fi
            fi
        fi
    done
}

# Clean up old log files
cleanup_old_logs() {
    log_info "Cleaning up old log files..."
    
    # Clean application logs
    local log_dir="$PROJECT_ROOT/logs"
    if [[ -d "$log_dir" ]]; then
        log_info "Cleaning application logs older than $LOG_RETENTION_DAYS days..."
        
        execute_command "find '$log_dir' -name '*.log.gz' -mtime +$LOG_RETENTION_DAYS -type f -delete" \
                       "Removing compressed logs older than $LOG_RETENTION_DAYS days"
        
        execute_command "find '$log_dir' -name '*.log.*' -mtime +$LOG_RETENTION_DAYS -type f -delete" \
                       "Removing rotated logs older than $LOG_RETENTION_DAYS days"
    fi
    
    # Clean backup files
    local backup_dir="$PROJECT_ROOT/backups"
    if [[ -d "$backup_dir" ]]; then
        log_info "Cleaning backups older than $BACKUP_RETENTION_DAYS days..."
        
        execute_command "find '$backup_dir' -name '*.tar.gz' -mtime +$BACKUP_RETENTION_DAYS -type f -delete" \
                       "Removing backups older than $BACKUP_RETENTION_DAYS days"
    fi
    
    # Clean Docker system
    log_info "Cleaning Docker system..."
    execute_command "docker system prune -f --volumes" "Removing unused Docker resources"
}

# Archive old logs
archive_old_logs() {
    log_info "Archiving old log files..."
    
    local log_dir="$PROJECT_ROOT/logs"
    local archive_dir="$PROJECT_ROOT/logs/archive"
    
    if [[ ! -d "$log_dir" ]]; then
        log_warning "Log directory $log_dir does not exist"
        return
    fi
    
    # Create archive directory
    execute_command "mkdir -p '$archive_dir'" "Creating archive directory"
    
    cd "$log_dir"
    
    # Find logs older than 7 days but newer than retention period
    local archive_start=$((LOG_RETENTION_DAYS - 7))
    if [[ $archive_start -lt 7 ]]; then
        archive_start=7
    fi
    
    # Archive uncompressed old logs
    find . -name "*.log.*" -mtime +7 -mtime -$archive_start -type f | while read -r log_file; do
        if [[ ! "$log_file" =~ \.gz$ ]]; then
            local basename=$(basename "$log_file")
            execute_command "gzip '$log_file'" "Compressing $basename"
            execute_command "mv '${log_file}.gz' '$archive_dir/'" "Moving ${basename}.gz to archive"
        fi
    done
    
    # Create monthly archives
    local current_month=$(date +%Y%m)
    local archive_name="logs_${current_month}.tar.gz"
    
    if [[ ! -f "$archive_dir/$archive_name" ]]; then
        # Find logs from current month
        find . -name "*.log.gz" -newermt "$(date +%Y-%m-01)" -type f | while read -r log_file; do
            if [[ -n "$log_file" ]]; then
                execute_command "tar -czf '$archive_dir/$archive_name' $log_file" \
                               "Creating monthly archive $archive_name"
                break
            fi
        done
    fi
}

# Analyze logs for issues
analyze_logs() {
    log_info "Analyzing logs for issues..."
    
    local log_dir="$PROJECT_ROOT/logs"
    local analysis_file="$log_dir/log_analysis_$(date +%Y%m%d_%H%M%S).txt"
    
    if [[ ! -d "$log_dir" ]]; then
        log_warning "Log directory $log_dir does not exist"
        return
    fi
    
    cd "$log_dir"
    
    echo "Log Analysis Report - $(date)" > "$analysis_file"
    echo "========================================" >> "$analysis_file"
    echo "" >> "$analysis_file"
    
    # Analyze application logs
    echo "Application Log Analysis:" >> "$analysis_file"
    echo "------------------------" >> "$analysis_file"
    
    for log_file in *.log; do
        if [[ -f "$log_file" ]]; then
            echo "" >> "$analysis_file"
            echo "File: $log_file" >> "$analysis_file"
            echo "Size: $(get_file_size "$log_file")" >> "$analysis_file"
            echo "Last modified: $(stat --format="%y" "$log_file" 2>/dev/null || echo "Unknown")" >> "$analysis_file"
            
            # Count error types
            local error_count=$(grep -c -i "error" "$log_file" 2>/dev/null || echo "0")
            local warning_count=$(grep -c -i "warning" "$log_file" 2>/dev/null || echo "0")
            local exception_count=$(grep -c -i "exception" "$log_file" 2>/dev/null || echo "0")
            
            echo "Errors: $error_count" >> "$analysis_file"
            echo "Warnings: $warning_count" >> "$analysis_file"
            echo "Exceptions: $exception_count" >> "$analysis_file"
            
            # Recent errors (last 10)
            if [[ $error_count -gt 0 ]]; then
                echo "" >> "$analysis_file"
                echo "Recent errors:" >> "$analysis_file"
                grep -i "error" "$log_file" | tail -5 >> "$analysis_file" 2>/dev/null || true
            fi
        fi
    done
    
    # Analyze Docker logs
    echo "" >> "$analysis_file"
    echo "Docker Container Analysis:" >> "$analysis_file"
    echo "-------------------------" >> "$analysis_file"
    
    cd "$PROJECT_ROOT"
    
    if [[ -f docker-compose.yml ]]; then
        docker-compose ps >> "$analysis_file" 2>/dev/null || echo "Unable to get container status" >> "$analysis_file"
        
        echo "" >> "$analysis_file"
        echo "Recent container logs:" >> "$analysis_file"
        docker-compose logs --tail=10 wabot >> "$analysis_file" 2>/dev/null || echo "Unable to get container logs" >> "$analysis_file"
    fi
    
    # System resource usage
    echo "" >> "$analysis_file"
    echo "System Resource Usage:" >> "$analysis_file"
    echo "---------------------" >> "$analysis_file"
    df -h "$PROJECT_ROOT" >> "$analysis_file"
    echo "" >> "$analysis_file"
    
    if command -v free &> /dev/null; then
        free -h >> "$analysis_file"
    fi
    
    log_success "Log analysis completed: $analysis_file"
    
    # Show summary
    log_info "Analysis Summary:"
    if [[ -f "$analysis_file" ]]; then
        grep -E "(Errors:|Warnings:|Exceptions:)" "$analysis_file" | while read -r line; do
            log_info "  $line"
        done
    fi
}

# Check disk space and warn if needed
check_disk_space() {
    local disk_usage=$(df "$PROJECT_ROOT" | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [[ $disk_usage -gt 90 ]]; then
        log_error "Critical: Disk usage is at ${disk_usage}%"
        return 1
    elif [[ $disk_usage -gt 80 ]]; then
        log_warning "Warning: Disk usage is at ${disk_usage}%"
    else
        log_info "Disk usage is normal: ${disk_usage}%"
    fi
    
    return 0
}

# Show current log status
show_log_status() {
    log_info "Current log file status:"
    
    local log_dir="$PROJECT_ROOT/logs"
    if [[ -d "$log_dir" ]]; then
        cd "$log_dir"
        
        local total_size=0
        
        for log_file in *.log *.log.* *.log.gz; do
            if [[ -f "$log_file" ]]; then
                local size_mb=$(get_file_size_mb "$log_file")
                local size_human=$(get_file_size "$log_file")
                total_size=$((total_size + size_mb))
                
                echo "  $log_file: $size_human"
            fi
        done
        
        echo "  Total log size: ${total_size}MB"
        
        if [[ $total_size -gt $MAX_TOTAL_LOG_SIZE ]]; then
            log_warning "Total log size (${total_size}MB) exceeds limit (${MAX_TOTAL_LOG_SIZE}MB)"
        fi
    else
        log_info "  No log directory found"
    fi
}

# Main function
main() {
    log_info "WhatsApp Bot Log Manager"
    log_info "======================="
    
    if [[ "$DRY_RUN" == true ]]; then
        log_warning "DRY RUN MODE - No changes will be made"
    fi
    
    # Show current status
    show_log_status
    check_disk_space
    
    echo ""
    
    # Execute requested action
    case "$ACTION" in
        rotate)
            rotate_application_logs
            rotate_docker_logs
            ;;
        cleanup)
            cleanup_old_logs
            ;;
        archive)
            archive_old_logs
            ;;
        analyze)
            analyze_logs
            ;;
        *)
            log_error "Unknown action: $ACTION"
            exit 1
            ;;
    esac
    
    echo ""
    log_success "Log management completed: $ACTION"
    
    # Show final status
    show_log_status
}

# Run main function
main "$@"
