'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const now = new Date();
    
    await queryInterface.bulkInsert('Users', [
      {
        phoneNumber: process.env.OWNER_NUMBER || '6281319916659',
        level: 3, // Admin level (owner is checked from config)
        registeredAt: now,
        lastActivity: now,
        createdAt: now,
        updatedAt: now
      },
      {
        phoneNumber: '628123456789',
        level: 3, // Admin level
        registeredAt: now,
        lastActivity: now,
        createdAt: now,
        updatedAt: now
      },
      {
        phoneNumber: '628234567890',
        level: 2, // Premium level
        registeredAt: now,
        lastActivity: now,
        createdAt: now,
        updatedAt: now
      },
      {
        phoneNumber: '628345678901',
        level: 1, // Free level
        registeredAt: now,
        lastActivity: now,
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
