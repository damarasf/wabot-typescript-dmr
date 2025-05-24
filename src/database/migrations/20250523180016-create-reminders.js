'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Reminders', {
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
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      scheduledAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      isCompleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true
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
    await queryInterface.addIndex('Reminders', ['userId']);
    await queryInterface.addIndex('Reminders', ['scheduledAt']);
    await queryInterface.addIndex('Reminders', ['isCompleted']);
    await queryInterface.addIndex('Reminders', ['scheduledAt', 'isCompleted']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Reminders');
  }
};
