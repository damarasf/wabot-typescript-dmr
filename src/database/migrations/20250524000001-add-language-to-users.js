'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'language', {
      type: Sequelize.STRING(5),
      allowNull: false,
      defaultValue: 'id', // Indonesian as default
      comment: 'User preferred language: id (Indonesian) or en (English)'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'language');
  }
};
