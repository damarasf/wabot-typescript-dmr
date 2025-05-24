'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const now = new Date();
    
    await queryInterface.bulkInsert('Groups', [
      {
        groupId: '628123456789-123456789@g.us',
        joinedAt: now,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        groupId: '628234567890-987654321@g.us',
        joinedAt: now,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        groupId: '628345678901-555666777@g.us',
        joinedAt: now,
        isActive: false,
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Groups', null, {});
  }
};
