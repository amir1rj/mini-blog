'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Categories', 'slug', {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  });

  // Add slug field to Article table
  await queryInterface.addColumn('Articles', 'slug', {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  });
},

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Categories', 'slug');

    // Remove slug field from Article table
    await queryInterface.removeColumn('Articles', 'slug');
  
  }
};
