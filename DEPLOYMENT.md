# Docker Deployment Guide for EasyPanel

This guide will help you deploy the WhatsApp Bot to EasyPanel using GitHub integration and Docker.

## 🚀 Quick Deployment Steps

### 1. Prepare Your Repository

Make sure your GitHub repository contains all the files created by this setup:
- `Dockerfile`
- `docker-compose.yml`
- `scripts/deploy.sh`
- `.env.example`

### 2. EasyPanel Setup

1. **Create New Application in EasyPanel**
   - Choose "GitHub" as source
   - Connect your repository: `your-username/wabot-typescript-dmr`
   - Set build context to root directory (`/`)

2. **Configure Environment Variables**
   
   Copy the values from `.env.example` and set these in EasyPanel:
   
   ```bash
   # Database (EasyPanel will provide PostgreSQL)
   DB_HOST=postgres
   DB_PORT=5432
   DB_NAME=wabot_db
   DB_USER=postgres
   DB_PASSWORD=your_strong_password
   DB_SSL=false
   
   # Bot Configuration
   BOT_NAME=DMR Bot
   OWNER_NUMBER=6281319916659
   WA_SESSION_NAME=dmr-bot
   
   # Docker Settings
   NODE_ENV=production
   PORT=3000
   HEADLESS=true
   USE_CHROME=true
   CHROME_PATH=/usr/bin/chromium-browser
   WA_HEADLESS=true
   SESSION_DATA_PATH=/app/data
   
   # Timezone
   TZ=Asia/Jakarta
   
   # N8N Integration (if used)
   N8N_BASE_URL=https://your-n8n-instance.com
   N8N_API_KEY=your_api_key
   ```

3. **Database Setup**
   
   In EasyPanel:
   - Add PostgreSQL service if not already available
   - Or create a new PostgreSQL database
   - Note the connection details and update environment variables

4. **Port Configuration**
   - Set exposed port to `3000`
   - Configure domain/subdomain as needed

### 3. Deployment Process

The deployment script (`scripts/deploy.sh`) will automatically:

1. ✅ Check PostgreSQL connection
2. ✅ Install PostgreSQL client if needed
3. ✅ Run database migrations
4. ✅ Create necessary directories
5. ✅ Start the WhatsApp Bot

### 4. Database Migration Details

The deployment includes automatic database setup:

**Tables Created:**
- `users` - User registration and levels
- `groups` - WhatsApp group tracking
- `usages` - Feature usage tracking (N8N, reminders, etc.)
- `reminders` - User reminders system

**Migration Files:**
- `20250523175952-create-users.js`
- `20250523180000-create-groups.js`
- `20250523180007-create-usages.js`
- `20250523180016-create-reminders.js`
- `20250524000001-add-language-to-users.js`
- `20250524120000-rename-tables-to-lowercase.js`

## 🔧 Manual Database Setup (If Needed)

If automatic migration fails, you can run manually:

```bash
# Connect to your container
docker exec -it wabot-app sh

# Run migrations
npm run migrate:cli

# Or run seeders (development only)
npm run seed
```

## 📊 Monitoring & Logs

### Health Check
The application includes a health check endpoint:
```bash
curl http://your-domain:3000/health
```

### View Logs
```bash
# Application logs
docker logs wabot-app

# Database logs  
docker logs wabot-postgres

# Follow logs in real-time
docker logs -f wabot-app
```

### Container Status
```bash
# Check running containers
docker ps

# Check resource usage
docker stats
```

## 🐛 Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   ```bash
   # Check PostgreSQL is running
   docker ps | grep postgres
   
   # Check database logs
   docker logs wabot-postgres
   
   # Test connection manually
   docker exec -it wabot-postgres psql -U postgres -d wabot_db
   ```

2. **WhatsApp Session Issues**
   ```bash
   # Clear session data
   docker exec -it wabot-app rm -rf /app/data/*
   
   # Restart container
   docker restart wabot-app
   ```

3. **Migration Errors**
   ```bash
   # Run migrations manually
   docker exec -it wabot-app npm run migrate:cli
   
   # Check migration status
   docker exec -it wabot-app npx sequelize-cli db:migrate:status
   ```

4. **Chrome/Puppeteer Issues**
   ```bash
   # Check Chrome installation
   docker exec -it wabot-app which chromium-browser
   
   # Test Chrome
   docker exec -it wabot-app chromium-browser --version
   ```

## 🔄 Updates & Redeploy

To update your bot:

1. Push changes to GitHub
2. EasyPanel will automatically redeploy
3. Database migrations will run automatically
4. No data loss (migrations preserve existing data)

## 🛡️ Security Recommendations

1. **Environment Variables**
   - Use strong passwords for database
   - Keep API keys secure
   - Don't commit `.env` file to repository

2. **Database Security**
   - Enable SSL in production if available
   - Use database user with limited privileges
   - Regular backups

3. **Application Security**
   - Keep dependencies updated
   - Monitor logs for suspicious activity
   - Use HTTPS for webhooks

## 📱 WhatsApp Bot Features

Your deployed bot will include:

- ✅ User registration system
- ✅ Multiple user levels (Free, Premium, Admin)
- ✅ N8N workflow integration
- ✅ Usage tracking and limits
- ✅ Reminder system
- ✅ Group management
- ✅ Multi-language support (Indonesian/English)
- ✅ Automatic limit resets
- ✅ Command system with multiple prefixes

## 🎯 Next Steps

After successful deployment:

1. **QR Code Scanning**: Check logs for WhatsApp QR code
2. **Test Commands**: Send test messages to verify functionality
3. **Monitor Usage**: Check database for user registrations
4. **Configure N8N**: Set up your N8N workflows if used
5. **Backup Setup**: Configure regular database backups

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review application logs
3. Verify environment variables
4. Check database connectivity

For additional help, ensure all environment variables match your EasyPanel setup and database configuration.