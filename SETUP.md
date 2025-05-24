# Setup Guide - WhatsApp Bot DMR

## Prerequisites
- Node.js 16+ 
- PostgreSQL 12+
- WhatsApp account
- N8N instance (optional)

## Step-by-Step Setup

### 1. Database Setup
```bash
# Install PostgreSQL and create database
createdb wabot_db

# Or using PostgreSQL client
psql -U postgres
CREATE DATABASE wabot_db;
\q
```

### 2. Environment Configuration
```bash
# Copy and edit environment file
cp .env.example .env
```

**Required environment variables:**
- `OWNER_NUMBER`: Your WhatsApp number (format: 628123456789)
- `DB_PASSWORD`: Your PostgreSQL password
- `N8N_TOKEN`: N8N API token (if using N8N integration)

### 3. Installation & Migration
```bash
# Install dependencies
npm install

# Run database migrations
npm run migrate:cli

# Optional: Seed demo data
npm run seed
```

### 4. First Run
```bash
# Start bot in development mode
npm run dev

# Scan QR code with your WhatsApp
# Bot will be ready when you see "WhatsApp Bot DMR is ready!"
```

### 5. Basic Usage Test
Send these commands to your bot:
- `!register` - Register as user
- `!help` - View all commands
- `!profile` - Check your profile

## N8N Integration Setup

1. **Install N8N**
   ```bash
   npm install n8n -g
   n8n start
   ```

2. **Get API Token**
   - Open N8N interface (usually http://localhost:5678)
   - Go to Settings > API Keys
   - Create new API key
   - Add to `.env` as `N8N_TOKEN`

3. **Create Workflow**
   - Create workflow in N8N
   - Note the workflow ID
   - Test with `!n8n <workflow_id>`

## Production Deployment

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Set environment**
   ```bash
   export NODE_ENV=production
   ```

3. **Use PM2 for process management**
   ```bash
   npm install pm2 -g
   pm2 start dist/index.js --name wabot-dmr
   ```

## Troubleshooting

### Common Issues:

**Database Connection Error**
- Check PostgreSQL is running
- Verify database credentials in `.env`
- Ensure database exists

**QR Code Not Showing**
- Check terminal output
- Ensure port 3000 is available
- Try restarting the bot

**Commands Not Working**
- Check prefix settings in `.env`
- Ensure user is registered (`!register`)
- Check user level and limits

**N8N Integration Fails**
- Verify N8N is running
- Check API token validity
- Confirm workflow ID exists

### Debug Mode
```bash
# Enable detailed logging
export DEBUG=*
npm run dev
```

## Support

For issues and questions:
- Check logs in console
- Verify environment configuration
- Test with minimal setup first
