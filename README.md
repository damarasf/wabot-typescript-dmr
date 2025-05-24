# WhatsApp Bot DMR

Bot WhatsApp TypeScript dengan fitur lengkap untuk manajemen pengguna, integrasi N8N, dan sistem level berbasis PostgreSQL.

## 🚀 Fitur Utama

- **Multi-Level User System** - Free, Premium, Admin dengan limit berbeda
- **N8N Integration** - Jalankan workflow otomatis
- **Database Management** - PostgreSQL dengan migrasi Sequelize
- **Group Features** - Tag all, reminder grup
- **Auto Management** - Reset limit harian, anti spam
- **Broadcast System** - Kirim pesan massal dengan filter level

## 📋 Quick Start

1. **Clone & Install**
   ```bash
   git clone https://github.com/damarasf/wabot-typescript-dmr.git
   cd wabot-typescript-dmr
   npm install
   ```

2. **Setup Database**
   ```bash
   # Buat database PostgreSQL
   createdb wabot_db
   ```

3. **Configuration**
   ```bash
   cp .env.example .env
   # Edit .env dengan data Anda
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
```

## 📁 Project Structure

```
src/
├── commands/        # Bot commands
├── database/        # Models, migrations, seeders
├── handlers/        # Message & command handlers
├── middlewares/     # Command parser & validation
└── utils/           # Helper functions
```

## 🔧 Tech Stack

- **TypeScript** - Type-safe development
- **@open-wa/wa-automate** - WhatsApp automation
- **Sequelize** - PostgreSQL ORM
- **Moment.js** - Date/time handling
- **Axios** - HTTP requests for N8N

---

**License:** MIT | **Author:** DMR Team
