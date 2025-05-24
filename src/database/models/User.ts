import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { Client, ContactId } from '@open-wa/wa-automate';
import logger from '../../utils/logger';

// Define user levels
export enum UserLevel {
  UNREGISTERED = 0,
  FREE = 1,
  PREMIUM = 2,
  ADMIN = 3
  // Owner is not stored in database, checked from config
}

// Define supported languages
export enum Language {
  INDONESIAN = 'id',
  ENGLISH = 'en'
}

// Interface for User attributes
interface UserAttributes {
  id: number;
  phoneNumber: string;
  level: UserLevel;
  language: Language;
  registeredAt: Date;
  lastActivity: Date;
}

// Interface for User creation attributes
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

// User model
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {  public id!: number;
  public phoneNumber!: string;
  public level!: UserLevel;
  public language!: Language;
  public registeredAt!: Date;
  public lastActivity!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Method to get user's display name from WhatsApp
  public async getDisplayName(client?: Client): Promise<string> {
    if (!client) return this.phoneNumber;
    
    try {
      const contactId = `${this.phoneNumber}@c.us` as ContactId;
      const contact = await client.getContact(contactId);
      return contact?.name || contact?.pushname || this.phoneNumber;    } catch (error) {
      logger.error('Error getting user display name:', { 
        error: error instanceof Error ? error.message : error,
        phoneNumber: this.phoneNumber 
      });
      return this.phoneNumber;
    }
  }

  // Check if user is owner based on config
  public isOwner(): boolean {
    const config = require('../../utils/config').default;
    return this.phoneNumber === config.ownerNumber;
  }

  // Get user level name
  public getLevelName(): string {
    if (this.isOwner()) return 'Owner';
    
    switch (this.level) {
      case UserLevel.UNREGISTERED: return 'Unregistered';
      case UserLevel.FREE: return 'Free';
      case UserLevel.PREMIUM: return 'Premium';
      case UserLevel.ADMIN: return 'Admin';
      default: return 'Unknown';
    }
  }
}

// Initialize User model
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: UserLevel.UNREGISTERED,
    },
    language: {
      type: DataTypes.STRING(5),
      allowNull: false,
      defaultValue: Language.INDONESIAN,
    },
    registeredAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },lastActivity: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
  }
);

export default User;
