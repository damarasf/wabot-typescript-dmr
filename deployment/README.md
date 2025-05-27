# =============================================================================
# WhatsApp Bot Deployment Guide
# =============================================================================

This document provides instructions for deploying the WhatsApp Bot application using Docker and the provided deployment scripts.

## Prerequisites

### System Requirements
- Linux server (Ubuntu 20.04+ recommended)
- Docker 20.10+
- Docker Compose 2.0+
- Git
- At least 2GB RAM
- At least 10GB free disk space

### Installation Commands (Ubuntu/Debian)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install git -y

# Logout and login again to apply Docker group changes
```

## Deployment Process

### 1. Clone Repository

```bash
git clone https://your-git-repository-url.git
cd wabot-typescript-dmr
```

### 2. Setup Environment

```bash
# Make scripts executable
chmod +x deployment/*.sh

# Run environment setup
./deployment/setup-environment.sh production
```

### 3. Configure Environment Variables

Edit the `.env` file with your configuration:

```bash
nano .env
```

Required variables:
```env
# Database Configuration
DB_HOST=postgres
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
```

### 4. Deploy Application

```bash
# Deploy with backup
./deployment/deploy.sh --backup production

# Or deploy without confirmation
./deployment/deploy.sh --force production

# Deploy specific version
./deployment/deploy.sh production v1.2.0
```

### 5. Verify Deployment

```bash
# Check application status
./deployment/monitor.sh

# Check detailed status with logs
./deployment/monitor.sh --detailed --logs

# Check if services are running
docker-compose ps
```

## Management Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f wabot
```

### Access Container Shell
```bash
docker-compose exec wabot /bin/sh
```

## Backup and Restore

### Create Backup
```bash
# Create automatic backup
./deployment/backup.sh

# Create named backup
./deployment/backup.sh my_backup_name
```

### Restore from Backup
```bash
# Stop services
docker-compose down

# Extract backup
cd backups
tar -xzf backup_YYYYMMDD_HHMMSS.tar.gz

# Restore database
docker-compose up -d postgres
sleep 10
docker-compose exec -T postgres psql -U wabot_user -d wabot_db < backup_YYYYMMDD_HHMMSS/database_backup.sql

# Restore application data
cp -r backup_YYYYMMDD_HHMMSS/_IGNORE_dmr-bot .
cp -r backup_YYYYMMDD_HHMMSS/logs .

# Start all services
docker-compose up -d
```

## Monitoring

### Basic Monitoring
```bash
./deployment/monitor.sh
```

### Detailed Monitoring
```bash
./deployment/monitor.sh --detailed --logs --metrics
```

### Real-time Resource Usage
```bash
docker stats
```

### Check Application Health
```bash
# Check if containers are running
docker-compose ps

# Check application logs
docker-compose logs wabot | tail -50

# Check database connectivity
docker-compose exec postgres pg_isready -U wabot_user -d wabot_db
```

## Troubleshooting

### Common Issues

1. **Container won't start**
   ```bash
   # Check logs
   docker-compose logs wabot
   
   # Check if port is already in use
   sudo netstat -tulpn | grep :3000
   ```

2. **Database connection issues**
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Test database connection
   docker-compose exec postgres psql -U wabot_user -d wabot_db -c "SELECT 1;"
   ```

3. **WhatsApp connection issues**
   ```bash
   # Clear session data
   sudo rm -rf _IGNORE_dmr-bot/*
   docker-compose restart wabot
   ```

4. **Out of disk space**
   ```bash
   # Clean Docker system
   docker system prune -a
   
   # Clean old backups
   find backups/ -name "*.tar.gz" -mtime +7 -delete
   
   # Clean logs
   docker-compose logs wabot > /dev/null 2>&1
   ```

### Log Locations

- Application logs: `logs/`
- Docker logs: `docker-compose logs [service]`
- System logs: `/var/log/syslog`

### Performance Optimization

1. **Increase memory limits**
   ```yaml
   # In docker-compose.yml
   services:
     wabot:
       deploy:
         resources:
           limits:
             memory: 1G
   ```

2. **Enable log rotation**
   ```yaml
   # In docker-compose.yml
   services:
     wabot:
       logging:
         driver: "json-file"
         options:
           max-size: "10m"
           max-file: "3"
   ```

## Security Considerations

1. **Use strong passwords** for database and environment variables
2. **Regularly update** Docker images and system packages
3. **Limit network access** using Docker networks and firewall rules
4. **Regular backups** and test restore procedures
5. **Monitor logs** for suspicious activities

## Systemd Service (Optional)

To run the bot as a system service:

```bash
# Copy service file
sudo cp deployment/wabot.service /etc/systemd/system/

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable wabot
sudo systemctl start wabot

# Check status
sudo systemctl status wabot
```

## Maintenance Schedule

### Daily
- Monitor application health
- Check disk space
- Review error logs

### Weekly
- Create backup
- Update system packages
- Clean old Docker images

### Monthly
- Review and rotate logs
- Test restore procedures
- Security updates

## Support

For issues and support:
1. Check application logs: `docker-compose logs wabot`
2. Check monitoring output: `./deployment/monitor.sh --detailed`
3. Review this deployment guide
4. Check Docker and system resources

## Environment-Specific Deployments

### Development
```bash
./deployment/setup-environment.sh development
./deployment/deploy.sh development
```

### Staging
```bash
./deployment/setup-environment.sh staging
./deployment/deploy.sh staging
```

### Production
```bash
./deployment/setup-environment.sh production
./deployment/deploy.sh --backup production
```
