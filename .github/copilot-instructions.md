# Copilot Custom Instructions for WhatsApp Bot Project

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a WhatsApp Bot TypeScript project using @open-wa/wa-automate library with PostgreSQL database integration. This bot includes user registration, N8N integration, and implements various user access levels with limits.

## Project Structure
- `src/`: Main source code
  - `database/`: Database models, migrations, and configuration
  - `handlers/`: Event handlers for the bot
  - `commands/`: Bot command implementations
  - `middlewares/`: Middleware functions
  - `utils/`: Utility functions

## Key Features
- User registration system
- PostgreSQL database integration
- N8N workflow integration with usage limits
- User level system (Free, Premium, Admin)
- Group tracking and special group features
- Reset limit functionality (automatic and manual)
- Command with multiple prefixes

Please follow TypeScript best practices when generating code for this project.
