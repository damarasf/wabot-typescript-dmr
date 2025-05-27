#!/bin/bash

# =============================================================================
# WhatsApp Bot Health Check Script
# =============================================================================
# This script performs comprehensive health checks for the WhatsApp Bot
# Can be used with monitoring systems like Nagios, Zabbix, etc.
# Usage: ./health-check.sh [--json] [--quiet] [--timeout=30]
# =============================================================================

set -e

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TIMEOUT=30
JSON_OUTPUT=false
QUIET=false

# Exit codes
EXIT_OK=0
EXIT_WARNING=1
EXIT_CRITICAL=2
EXIT_UNKNOWN=3

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --json)
            JSON_OUTPUT=true
            shift
            ;;
        --quiet)
            QUIET=true
            shift
            ;;
        --timeout=*)
            TIMEOUT="${1#*=}"
            shift
            ;;
        -h|--help)
            cat << EOF
WhatsApp Bot Health Check Script

USAGE:
    ./health-check.sh [OPTIONS]

OPTIONS:
    --json          Output results in JSON format
    --quiet         Suppress output (useful for monitoring)
    --timeout=N     Set timeout in seconds [default: 30]
    -h, --help      Show this help message

EXIT CODES:
    0   OK - All checks passed
    1   WARNING - Minor issues detected
    2   CRITICAL - Major issues detected
    3   UNKNOWN - Unable to determine status

EXAMPLES:
    ./health-check.sh                   # Basic health check
    ./health-check.sh --json           # JSON output for monitoring
    ./health-check.sh --quiet          # Silent check
    ./health-check.sh --timeout=60     # Custom timeout

EOF
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit $EXIT_UNKNOWN
            ;;
    esac
done

# Health check results
declare -A CHECKS
declare -A CHECK_STATUS
declare -A CHECK_MESSAGES

# Initialize check results
init_checks() {
    CHECKS=(
        ["docker_running"]="Docker Service"
        ["containers_running"]="Container Status"
        ["database_connection"]="Database Connection"
        ["application_health"]="Application Health"
        ["disk_space"]="Disk Space"
        ["memory_usage"]="Memory Usage"
        ["log_errors"]="Recent Errors"
    )
    
    for check in "${!CHECKS[@]}"; do
        CHECK_STATUS[$check]="UNKNOWN"
        CHECK_MESSAGES[$check]="Not checked"
    done
}

# Output functions
log_result() {
    if [[ "$QUIET" != true ]]; then
        echo "$1"
    fi
}

# Check if Docker is running
check_docker_running() {
    local check="docker_running"
    
    if docker info >/dev/null 2>&1; then
        CHECK_STATUS[$check]="OK"
        CHECK_MESSAGES[$check]="Docker is running"
    else
        CHECK_STATUS[$check]="CRITICAL"
        CHECK_MESSAGES[$check]="Docker is not running"
    fi
}

# Check container status
check_containers_running() {
    local check="containers_running"
    
    cd "$PROJECT_ROOT"
    
    if [[ ! -f docker-compose.yml ]]; then
        CHECK_STATUS[$check]="UNKNOWN"
        CHECK_MESSAGES[$check]="docker-compose.yml not found"
        return
    fi
    
    local running_containers=$(docker-compose ps --services --filter "status=running" | wc -l)
    local total_containers=$(docker-compose ps --services | wc -l)
    
    if [[ $running_containers -eq $total_containers ]] && [[ $total_containers -gt 0 ]]; then
        CHECK_STATUS[$check]="OK"
        CHECK_MESSAGES[$check]="All containers running ($running_containers/$total_containers)"
    elif [[ $running_containers -gt 0 ]]; then
        CHECK_STATUS[$check]="WARNING"
        CHECK_MESSAGES[$check]="Some containers running ($running_containers/$total_containers)"
    else
        CHECK_STATUS[$check]="CRITICAL"
        CHECK_MESSAGES[$check]="No containers running"
    fi
}

# Check database connection
check_database_connection() {
    local check="database_connection"
    
    cd "$PROJECT_ROOT"
    
    if ! docker-compose ps postgres | grep -q "Up"; then
        CHECK_STATUS[$check]="CRITICAL"
        CHECK_MESSAGES[$check]="PostgreSQL container not running"
        return
    fi
    
    # Test database connection
    if timeout $TIMEOUT docker-compose exec -T postgres pg_isready -U "${DB_USER:-wabot_user}" -d "${DB_NAME:-wabot_db}" >/dev/null 2>&1; then
        CHECK_STATUS[$check]="OK"
        CHECK_MESSAGES[$check]="Database connection successful"
    else
        CHECK_STATUS[$check]="CRITICAL"
        CHECK_MESSAGES[$check]="Database connection failed"
    fi
}

# Check application health
check_application_health() {
    local check="application_health"
    
    cd "$PROJECT_ROOT"
    
    if ! docker-compose ps wabot | grep -q "Up"; then
        CHECK_STATUS[$check]="CRITICAL"
        CHECK_MESSAGES[$check]="WhatsApp Bot container not running"
        return
    fi
    
    # Check if application is responsive
    if timeout $TIMEOUT docker-compose exec -T wabot node -e "console.log('Health check passed')" >/dev/null 2>&1; then
        CHECK_STATUS[$check]="OK"
        CHECK_MESSAGES[$check]="Application is responsive"
    else
        CHECK_STATUS[$check]="WARNING"
        CHECK_MESSAGES[$check]="Application not responding to health check"
    fi
}

# Check disk space
check_disk_space() {
    local check="disk_space"
    
    local disk_usage=$(df "$PROJECT_ROOT" | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [[ $disk_usage -lt 80 ]]; then
        CHECK_STATUS[$check]="OK"
        CHECK_MESSAGES[$check]="Disk usage: ${disk_usage}%"
    elif [[ $disk_usage -lt 90 ]]; then
        CHECK_STATUS[$check]="WARNING"
        CHECK_MESSAGES[$check]="Disk usage: ${disk_usage}% (high)"
    else
        CHECK_STATUS[$check]="CRITICAL"
        CHECK_MESSAGES[$check]="Disk usage: ${disk_usage}% (critical)"
    fi
}

# Check memory usage
check_memory_usage() {
    local check="memory_usage"
    
    cd "$PROJECT_ROOT"
    
    if ! docker-compose ps wabot | grep -q "Up"; then
        CHECK_STATUS[$check]="UNKNOWN"
        CHECK_MESSAGES[$check]="WhatsApp Bot container not running"
        return
    fi
    
    # Get memory usage from docker stats
    local memory_info=$(docker stats --no-stream --format "{{.MemPerc}}" $(docker-compose ps -q wabot) 2>/dev/null | head -1 | sed 's/%//')
    
    if [[ -n "$memory_info" ]]; then
        local memory_usage=${memory_info%.*}  # Remove decimal part
        
        if [[ $memory_usage -lt 80 ]]; then
            CHECK_STATUS[$check]="OK"
            CHECK_MESSAGES[$check]="Memory usage: ${memory_usage}%"
        elif [[ $memory_usage -lt 90 ]]; then
            CHECK_STATUS[$check]="WARNING"
            CHECK_MESSAGES[$check]="Memory usage: ${memory_usage}% (high)"
        else
            CHECK_STATUS[$check]="CRITICAL"
            CHECK_MESSAGES[$check]="Memory usage: ${memory_usage}% (critical)"
        fi
    else
        CHECK_STATUS[$check]="UNKNOWN"
        CHECK_MESSAGES[$check]="Unable to get memory usage"
    fi
}

# Check for recent errors in logs
check_log_errors() {
    local check="log_errors"
    
    cd "$PROJECT_ROOT"
    
    if ! docker-compose ps wabot | grep -q "Up"; then
        CHECK_STATUS[$check]="UNKNOWN"
        CHECK_MESSAGES[$check]="WhatsApp Bot container not running"
        return
    fi
    
    # Check for errors in recent logs (last 50 lines)
    local error_count=$(docker-compose logs --tail=50 wabot 2>/dev/null | grep -i -c "error\|exception\|failed" || echo "0")
    
    if [[ $error_count -eq 0 ]]; then
        CHECK_STATUS[$check]="OK"
        CHECK_MESSAGES[$check]="No recent errors detected"
    elif [[ $error_count -lt 5 ]]; then
        CHECK_STATUS[$check]="WARNING"
        CHECK_MESSAGES[$check]="$error_count recent errors detected"
    else
        CHECK_STATUS[$check]="CRITICAL"
        CHECK_MESSAGES[$check]="$error_count recent errors detected (high)"
    fi
}

# Determine overall status
determine_overall_status() {
    local critical_count=0
    local warning_count=0
    local ok_count=0
    local unknown_count=0
    
    for check in "${!CHECKS[@]}"; do
        case "${CHECK_STATUS[$check]}" in
            "CRITICAL")
                critical_count=$((critical_count + 1))
                ;;
            "WARNING")
                warning_count=$((warning_count + 1))
                ;;
            "OK")
                ok_count=$((ok_count + 1))
                ;;
            "UNKNOWN")
                unknown_count=$((unknown_count + 1))
                ;;
        esac
    done
    
    if [[ $critical_count -gt 0 ]]; then
        echo $EXIT_CRITICAL
    elif [[ $warning_count -gt 0 ]]; then
        echo $EXIT_WARNING
    elif [[ $unknown_count -gt 0 ]]; then
        echo $EXIT_UNKNOWN
    else
        echo $EXIT_OK
    fi
}

# Output results in text format
output_text() {
    local overall_status=$(determine_overall_status)
    local status_text
    
    case $overall_status in
        $EXIT_OK)
            status_text="OK"
            ;;
        $EXIT_WARNING)
            status_text="WARNING"
            ;;
        $EXIT_CRITICAL)
            status_text="CRITICAL"
            ;;
        $EXIT_UNKNOWN)
            status_text="UNKNOWN"
            ;;
    esac
    
    log_result "WhatsApp Bot Health Check - $status_text"
    log_result "========================================"
    log_result "Timestamp: $(date)"
    log_result ""
    
    for check in "${!CHECKS[@]}"; do
        local status="${CHECK_STATUS[$check]}"
        local message="${CHECK_MESSAGES[$check]}"
        local check_name="${CHECKS[$check]}"
        
        log_result "[$status] $check_name: $message"
    done
    
    return $overall_status
}

# Output results in JSON format
output_json() {
    local overall_status=$(determine_overall_status)
    local status_text
    
    case $overall_status in
        $EXIT_OK)
            status_text="OK"
            ;;
        $EXIT_WARNING)
            status_text="WARNING"
            ;;
        $EXIT_CRITICAL)
            status_text="CRITICAL"
            ;;
        $EXIT_UNKNOWN)
            status_text="UNKNOWN"
            ;;
    esac
    
    echo "{"
    echo "  \"timestamp\": \"$(date -Iseconds)\","
    echo "  \"overall_status\": \"$status_text\","
    echo "  \"exit_code\": $overall_status,"
    echo "  \"checks\": {"
    
    local first=true
    for check in "${!CHECKS[@]}"; do
        if [[ "$first" != true ]]; then
            echo ","
        fi
        first=false
        
        local status="${CHECK_STATUS[$check]}"
        local message="${CHECK_MESSAGES[$check]}"
        local check_name="${CHECKS[$check]}"
        
        echo "    \"$check\": {"
        echo "      \"name\": \"$check_name\","
        echo "      \"status\": \"$status\","
        echo "      \"message\": \"$message\""
        echo -n "    }"
    done
    
    echo ""
    echo "  }"
    echo "}"
    
    return $overall_status
}

# Main health check function
main() {
    # Initialize
    init_checks
    
    # Load environment variables if available
    if [[ -f "$PROJECT_ROOT/.env" ]]; then
        source "$PROJECT_ROOT/.env"
    fi
    
    # Run all health checks
    check_docker_running
    check_containers_running
    check_database_connection
    check_application_health
    check_disk_space
    check_memory_usage
    check_log_errors
    
    # Output results
    if [[ "$JSON_OUTPUT" == true ]]; then
        output_json
    else
        output_text
    fi
}

# Run main function and capture exit code
main "$@"
exit_code=$?

exit $exit_code
