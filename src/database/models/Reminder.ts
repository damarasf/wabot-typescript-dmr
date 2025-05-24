import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Group from './Group';

// Interface for Reminder attributes
interface ReminderAttributes {
  id: number;
  userId: number;
  groupId: number | null;
  message: string;
  scheduledTime: Date;
  isActive: boolean;
  isCompleted: boolean;
}

// Interface for Reminder creation attributes
interface ReminderCreationAttributes extends Optional<ReminderAttributes, 'id' | 'isCompleted'> {}

// Reminder model
class Reminder extends Model<ReminderAttributes, ReminderCreationAttributes> implements ReminderAttributes {
  public id!: number;
  public userId!: number;
  public groupId!: number | null;
  public message!: string;
  public scheduledTime!: Date;
  public isActive!: boolean;
  public isCompleted!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize Reminder model
Reminder.init(
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
      },
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Group,
        key: 'id',
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    scheduledTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'reminders',
    modelName: 'Reminder',
  }
);

// Create relationships
Reminder.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Reminder, { foreignKey: 'userId' });

Reminder.belongsTo(Group, { foreignKey: 'groupId' });
Group.hasMany(Reminder, { foreignKey: 'groupId' });

export default Reminder;
