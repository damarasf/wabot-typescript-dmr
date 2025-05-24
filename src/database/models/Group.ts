import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { Client, GroupChatId } from '@open-wa/wa-automate';
import logger from '../../utils/logger';

// Interface for Group attributes
interface GroupAttributes {
  id: number;
  groupId: string;
  joinedAt: Date;
  isActive: boolean;
}

// Interface for Group creation attributes
interface GroupCreationAttributes extends Optional<GroupAttributes, 'id'> {}

// Group model
class Group extends Model<GroupAttributes, GroupCreationAttributes> implements GroupAttributes {
  public id!: number;
  public groupId!: string;
  public joinedAt!: Date;
  public isActive!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  // Method to get group's display name from WhatsApp
  public async getDisplayName(client?: Client): Promise<string> {
    if (!client) return this.groupId;
    
    try {
      const groupInfo = await client.getGroupInfo(this.groupId as GroupChatId);
      return groupInfo?.title || this.groupId;    } catch (error) {
      logger.error('Error getting group display name:', { 
        error: error instanceof Error ? error.message : error,
        groupId: this.groupId 
      });
      return this.groupId;
    }
  }

  // Method to get group member count
  public async getMemberCount(client?: Client): Promise<number> {
    if (!client) return 0;
    
    try {
      const groupInfo = await client.getGroupInfo(this.groupId as GroupChatId);
      return groupInfo?.participants?.length || 0;    } catch (error) {
      logger.error('Error getting group member count:', { 
        error: error instanceof Error ? error.message : error,
        groupId: this.groupId 
      });
      return 0;
    }
  }
}

// Initialize Group model
Group.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    groupId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'Groups',
    modelName: 'Group',
  }
);

export default Group;
