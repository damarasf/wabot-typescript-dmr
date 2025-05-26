# WhatsApp Bot DMR

A comprehensive TypeScript WhatsApp Bot with user management, N8N integration, and PostgreSQL-based level system.

## 🚀 Key Features

- **Multi-Level User System** - Free, Premium, Admin with different limits
- **Bilingual Support** - Indonesian and English with user preference switching
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

## 🌐 Language Support

This bot supports **bilingual operation** with Indonesian and English:

### Language Switching
- **Command**: `!language [id/en]` or `!bahasa [id/en]`
- **Aliases**: `!lang`, `!bahasa`
- **Examples**:
  - `!language en` - Switch to English
  - `!bahasa id` - Switch to Indonesian
  - `!language` - Show current language and help

### Features
- **User Preference Storage** - Each user's language choice is saved in the database
- **Complete Translation** - All bot responses available in both languages
- **Real-time Switching** - Instant language change without restart
- **Fallback System** - Graceful handling of missing translations
- **Dynamic Content** - User data (names, numbers, dates) properly integrated

### Available Languages
- 🇮🇩 **Indonesian** (`id`) - Default language
- 🇺🇸 **English** (`en`) - Full English support

All commands, help messages, error messages, and system notifications are available in both languages.

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
├── test/            # Test files and logging tests
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

## 🔧 Tech Stack

- **TypeScript** - Type-safe development
- **@open-wa/wa-automate** - WhatsApp automation
- **Sequelize** - PostgreSQL ORM
- **Moment.js** - Date/time handling
- **Axios** - HTTP requests for N8N

---

**License:** MIT | **Author:** DMR Team
