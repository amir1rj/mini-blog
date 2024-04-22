'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Articles', 'author', 'authorId');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Articles', 'authorId', 'author');
  }
};
