# WhatsApp Bot Command Documentation

This document provides an overview of all available commands in the WhatsApp Bot.

## Command Categories

The bot's commands are organized into the following categories:

1. **Umum** - Common commands for all users
2. **Grup** - Commands for group management
3. **N8N** - Commands for N8N workflow integration
4. **Utilitas** - Utility commands for various tasks
5. **Admin** - Administrative commands for bot management
6. **Owner** - Owner-only commands for complete control

## Command List

### Umum (General Commands)

| Command | Description | Usage |
|---------|-------------|-------|
| help | Display list of available commands | !help [command] |
| register | Register as a bot user | !register |
| profile | View your user profile | !profile |
| language | Change bot language | !language [id/en] |
| limit | View feature usage limits | !limit |

### Grup (Group Commands)

| Command | Description | Usage |
|---------|-------------|-------|
| tagall | Mention all group members | !tagall [message] |

### N8N (Workflow Commands)

| Command | Description | Usage |
|---------|-------------|-------|
| n8n | Execute N8N workflows | !n8n [workflow_id] [parameters] |

### Utilitas (Utility Commands)

| Command | Description | Usage |
|---------|-------------|-------|
| reminder | Create personal or group reminders | !reminder [time] [message] |

### Admin (Administrative Commands)

| Command | Description | Usage |
|---------|-------------|-------|
| upgrade | Upgrade user to Premium level | !upgrade @user |
| setlimit | Set custom limits for users | !setlimit @user [feature] [limit] |
| resetlimit | Reset usage limits | !resetlimit [all/@user/phone] |

### Owner (Owner-only Commands)

| Command | Description | Usage |
|---------|-------------|-------|
| broadcast | Send broadcast messages to users | !broadcast [message] [level] |
| setadmin | Promote user to Admin level | !setadmin @user |
| restart | Safely restart the bot | !restart [confirm] |
| clearall | Clear all WhatsApp chat history | !clearall CONFIRM |

## User Levels

The bot supports the following user levels:

1. **Unregistered** - Users who haven't registered yet
2. **Free** - Standard registered users
3. **Premium** - Premium users with higher limits
4. **Admin** - Administrative users who can manage other users
5. **Owner** - Bot owner with full access to all commands

## Language Support

The bot supports the following languages:

- 🇮🇩 **Indonesian** (default)
- 🇬🇧 **English**

To change language, use: `!language [id/en]`
