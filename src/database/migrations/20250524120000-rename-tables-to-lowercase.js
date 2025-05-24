'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if tables exist before renaming to avoid errors
    const tableNames = await queryInterface.showAllTables();
    
    // Rename Users to users (if exists and users doesn't exist)
    if (tableNames.includes('Users') && !tableNames.includes('users')) {
      await queryInterface.renameTable('Users', 'users');
      console.log('Renamed table: Users -> users');
    }
    
    // Rename Groups to groups (if exists and groups doesn't exist)
    if (tableNames.includes('Groups') && !tableNames.includes('groups')) {
      await queryInterface.renameTable('Groups', 'groups');
      console.log('Renamed table: Groups -> groups');
    }
    
    // Rename Usages to usages (if exists and usages doesn't exist)
    if (tableNames.includes('Usages') && !tableNames.includes('usages')) {
      await queryInterface.renameTable('Usages', 'usages');
      console.log('Renamed table: Usages -> usages');
    }
    
    // Rename Reminders to reminders (if exists and reminders doesn't exist)
    if (tableNames.includes('Reminders') && !tableNames.includes('reminders')) {
      await queryInterface.renameTable('Reminders', 'reminders');
      console.log('Renamed table: Reminders -> reminders');
    }
    
    console.log('Table renaming completed successfully');
  },

  async down(queryInterface, Sequelize) {
    // Reverse the renaming process
    const tableNames = await queryInterface.showAllTables();
    
    // Rename back to PascalCase
    if (tableNames.includes('users') && !tableNames.includes('Users')) {
      await queryInterface.renameTable('users', 'Users');
    }
    
    if (tableNames.includes('groups') && !tableNames.includes('Groups')) {
      await queryInterface.renameTable('groups', 'Groups');
    }
    
    if (tableNames.includes('usages') && !tableNames.includes('Usages')) {
      await queryInterface.renameTable('usages', 'Usages');
    }
    
    if (tableNames.includes('reminders') && !tableNames.includes('Reminders')) {
      await queryInterface.renameTable('reminders', 'Reminders');
    }
    
    console.log('Table renaming rollback completed');
  }
};
