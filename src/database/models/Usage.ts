import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

// Feature types for usage limit tracking
export enum FeatureType {
  N8N = 'n8n',
  REMINDER = 'reminder',
  TAG_ALL = 'tag_all',
  // Add more features as needed
}

// Interface for Usage attributes
interface UsageAttributes {
  id: number;
  userId: number;
  feature: string;
  count: number;
  customLimit: number | null;
  date: Date;
  lastReset: Date;
}

// Interface for Usage creation attributes
interface UsageCreationAttributes extends Optional<UsageAttributes, 'id' | 'customLimit' | 'lastReset'> {}

// Usage model
class Usage extends Model<UsageAttributes, UsageCreationAttributes> implements UsageAttributes {
  public id!: number;
  public userId!: number;
  public feature!: string;
  public count!: number;
  public customLimit!: number | null;
  public date!: Date;
  public lastReset!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize Usage model
Usage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },    },
    feature: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    customLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    lastReset: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'usages',
    modelName: 'Usage',
  }
);

// Create relationship
Usage.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Usage, { foreignKey: 'userId' });

export default Usage;
