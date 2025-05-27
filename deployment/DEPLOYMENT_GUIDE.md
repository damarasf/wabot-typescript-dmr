# WhatsApp Bot TypeScript - Deployment Scripts

Kumpulan script untuk deployment dan manajemen WhatsApp Bot TypeScript menggunakan Docker di server Linux.

## 📋 Daftar Script

| Script | Deskripsi | Penggunaan |
|--------|-----------|------------|
| `quick-setup.sh` | Setup cepat environment | `./quick-setup.sh` |
| `deploy.sh` | Deploy aplikasi | `./deploy.sh [environment] [version]` |
| `monitor.sh` | Monitor status aplikasi | `./monitor.sh [--detailed] [--logs]` |
| `backup.sh` | Backup data aplikasi | `./backup.sh [backup_name]` |
| `update.sh` | Update aplikasi ke versi baru | `./update.sh [version]` |
| `health-check.sh` | Health check komprehensif | `./health-check.sh [--json]` |
| `log-manager.sh` | Manajemen log files | `./log-manager.sh [action]` |
| `service-manager.sh` | Manajemen systemd service | `./service-manager.sh [command]` |
| `setup-environment.sh` | Setup environment spesifik | `./setup-environment.sh [env]` |

## 🚀 Quick Start

### 1. Setup Awal
```bash
# Clone repository
git clone https://your-repo-url.git
cd wabot-typescript-dmr

# Setup environment
./deployment/quick-setup.sh
```

### 2. Konfigurasi Environment
```bash
# Copy template environment
cp .env.production.template .env

# Edit konfigurasi
nano .env
```

### 3. Deploy Aplikasi
```bash
# Deploy dengan backup
./deployment/deploy.sh --backup production

# Atau deploy langsung
./deployment/deploy.sh production
```

### 4. Monitor Aplikasi
```bash
# Basic monitoring
./deployment/monitor.sh

# Detailed monitoring
./deployment/monitor.sh --detailed --logs --metrics
```

## 📊 Monitoring & Maintenance

### Health Check
```bash
# Basic health check
./deployment/health-check.sh

# JSON output untuk monitoring tools
./deployment/health-check.sh --json
```

### Log Management
```bash
# Rotate logs
./deployment/log-manager.sh rotate

# Cleanup old logs
./deployment/log-manager.sh cleanup

# Analyze logs for issues
./deployment/log-manager.sh analyze
```

### Backup & Restore
```bash
# Create backup
./deployment/backup.sh

# Create named backup
./deployment/backup.sh "backup_before_update"

# Backups tersimpan di folder: backups/
```

## 🔄 Update Process

### Update ke Versi Baru
```bash
# Update ke versi latest
./deployment/update.sh

# Update ke versi spesifik
./deployment/update.sh v1.2.0

# Update dengan backup otomatis
./deployment/update.sh --backup v1.2.0
```

### Rollback
```bash
# Deploy script dengan rollback option
./deployment/deploy.sh --rollback
```

## ⚙️ Systemd Service

### Install Service
```bash
sudo ./deployment/service-manager.sh install
sudo ./deployment/service-manager.sh enable
sudo ./deployment/service-manager.sh start
```

### Manage Service
```bash
# Check status
sudo ./deployment/service-manager.sh status

# Restart service
sudo ./deployment/service-manager.sh restart

# View logs
sudo ./deployment/service-manager.sh logs
```

## 🐳 Docker Commands

### Direct Docker Management
```bash
# Build image
npm run docker:build

# Start services
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

### Manual Docker Commands
```bash
# Build dan start
docker-compose up -d --build

# View status
docker-compose ps

# View logs
docker-compose logs -f wabot

# Stop semua
docker-compose down
```

## 📈 Monitoring Integration

### Prometheus/Grafana
Script health-check dapat diintegrasikan dengan monitoring tools:

```bash
# Output JSON untuk Prometheus
./deployment/health-check.sh --json

# Crontab untuk monitoring regular
*/5 * * * * /path/to/deployment/health-check.sh --quiet
```

### Log Aggregation
```bash
# Export logs untuk ELK stack
docker-compose logs --no-color wabot > /var/log/wabot.log
```

## 🔧 Troubleshooting

### Common Issues

1. **Container tidak start**
   ```bash
   # Check logs
   ./deployment/monitor.sh --detailed --logs
   
   # Check Docker status
   docker-compose ps
   docker-compose logs wabot
   ```

2. **Database connection error**
   ```bash
   # Check database
   docker-compose exec postgres pg_isready -U wabot_user -d wabot_db
   
   # Restart services
   docker-compose restart
   ```

3. **Disk space issues**
   ```bash
   # Clean logs and old images
   ./deployment/log-manager.sh cleanup
   docker system prune -a
   ```

4. **WhatsApp session issues**
   ```bash
   # Clear session data
   rm -rf _IGNORE_dmr-bot/*
   docker-compose restart wabot
   ```

### Performance Tuning

1. **Memory optimization**
   ```yaml
   # docker-compose.yml
   services:
     wabot:
       deploy:
         resources:
           limits:
             memory: 1G
   ```

2. **Log rotation**
   ```yaml
   # docker-compose.yml
   services:
     wabot:
       logging:
         driver: "json-file"
         options:
           max-size: "10m"
           max-file: "3"
   ```

## 📋 Environment Variables

Konfigurasi utama yang harus diatur di file `.env`:

```env
# Database
DB_HOST=postgres
DB_NAME=wabot_db
DB_USER=wabot_user
DB_PASSWORD=your_password

# Bot Configuration
BOT_NAME=DMR Bot
OWNER_NUMBER=62xxx

# N8N Integration
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/
N8N_API_KEY=your_api_key

# Limits
DAILY_LIMIT_FREE=10
DAILY_LIMIT_PREMIUM=100
```

## 🔐 Security Best Practices

1. **Strong passwords** untuk database dan environment variables
2. **Regular updates** untuk Docker images dan system packages
3. **Network security** menggunakan Docker networks dan firewall
4. **Regular backups** dan test restore procedures
5. **Monitor logs** untuk aktivitas mencurigakan

## 📅 Maintenance Schedule

### Harian
- Monitor application health
- Check disk space
- Review error logs

### Mingguan
- Create backup
- Update system packages
- Clean old Docker images

### Bulanan
- Review dan rotate logs
- Test restore procedures
- Security updates

## 🆘 Support

Untuk bantuan dan troubleshooting:

1. **Check logs**: `./deployment/monitor.sh --detailed`
2. **Health check**: `./deployment/health-check.sh`
3. **System resources**: `docker stats`
4. **Application logs**: `docker-compose logs wabot`

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Systemd Service Management](https://systemd.io/)
- [Linux Log Management](https://www.rsyslog.com/)
