# WhatsApp Bot DMR

A comprehensive TypeScript WhatsApp Bot with user management, N8N integration, and PostgreSQL-based level system.

## 🚀 Key Features

- **Multi-Level User System** - Free, Premium, Admin with different limits
- **N8N Integration** - Execute automated workflows
- **Database Management** - PostgreSQL with Sequelize migrations
- **Group Features** - Tag all members, group reminders
- **Auto Management** - Daily limit reset, anti-spam protection
- **Broadcast System** - Send mass messages with level filtering
- **Logging System** - Comprehensive logging with Winston, file rotation, and media protection

## 📋 Quick Start

1. **Clone & Install**
   ```bash
   git clone https://github.com/damarasf/wabot-typescript-dmr.git
   cd wabot-typescript-dmr
   npm install
   ```

2. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb wabot_db
   ```

3. **Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your data
   ```

4. **Run Migration & Start**
   ```bash
   npm run migrate:cli
   npm run dev
   ```

> 📖 **Need detailed setup instructions?** Check out our [Complete Setup Guide](SETUP.md) for step-by-step instructions, troubleshooting, and production deployment.


## 🛠️ Development

```bash
# Development mode
npm run dev

# Build production
npm run build

# Database operations
npm run migrate:cli          # Run migrations
npm run migrate:cli:undo     # Rollback migration
npm run seed                 # Run seeders

# Testing & Logging
npm test                     # Run test files
node test/test-logger.js     # Test logging system
```

## 📁 Project Structure

```
src/
├── commands/        # Bot commands implementation
├── database/        # Models, migrations, seeders
├── handlers/        # Message & command handlers
├── middlewares/     # Command parser & validation
├── utils/           # Helper functions & logger
test/                # Test files and logging tests
```

## 📝 Logging System

This project includes a comprehensive logging system with Winston:

- **Log Levels**: error, warn, info, debug
- **File Rotation**: Automatic log rotation (5MB max, 5 files)
- **Media Protection**: Sensitive data and media content filtering
- **Structured Logging**: Specialized methods for different operations

### Log Files
- `logs/error.log` - Error logs only
- `logs/combined.log` - All log levels

### Configuration
Set logging preferences in `.env`:
```env
LOG_LEVEL=info
LOG_DIR=logs
LOG_MAX_SIZE=5m
LOG_MAX_FILES=5
```

### Testing Logging
```bash
# Test the logging system
node test/test-logger.js
```

## 🔧 Tech Stack

- **TypeScript** - Type-safe development
- **@open-wa/wa-automate** - WhatsApp automation
- **Sequelize** - PostgreSQL ORM
- **Moment.js** - Date/time handling
- **Axios** - HTTP requests for N8N

## 📝 Language Policy

This project follows a consistent language policy:
- **Documentation & Code**: English (README, comments, variables)
- **User Messages**: Indonesian (WhatsApp responses, command descriptions)

See [LANGUAGE_POLICY.md](LANGUAGE_POLICY.md) for detailed guidelines.

---

**License:** MIT | **Author:** DMR Team
