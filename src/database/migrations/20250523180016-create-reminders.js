'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('reminders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      groupId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'groups',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      scheduledTime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      isCompleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('reminders', ['userId']);
    await queryInterface.addIndex('reminders', ['groupId']);
    await queryInterface.addIndex('reminders', ['scheduledTime']);
    await queryInterface.addIndex('reminders', ['isActive']);
    await queryInterface.addIndex('reminders', ['isCompleted']);
    await queryInterface.addIndex('reminders', ['scheduledTime', 'isCompleted']);
    await queryInterface.addIndex('reminders', ['scheduledTime', 'isActive']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('reminders');
  }
};
