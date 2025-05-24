'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Usages', {
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
      feature: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'n8n, reminder, tagall'
      },
      count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      customLimit: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Custom limit set by admin, null = use default'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
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
    await queryInterface.addIndex('Usages', ['userId']);
    await queryInterface.addIndex('Usages', ['feature']);
    await queryInterface.addIndex('Usages', ['date']);
    await queryInterface.addIndex('Usages', ['userId', 'feature', 'date'], {
      unique: true,
      name: 'unique_user_feature_date'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Usages');
  }
};
