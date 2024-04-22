"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename userId to UserId
    await queryInterface.renameColumn("Bookmarks", "userId", "UserId", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // Rename articleId to ArticleId
    await queryInterface.renameColumn("Bookmarks", "articleId", "ArticleId", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('Bookmarks', 'UserId', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // Rename ArticleId back to articleId
    await queryInterface.renameColumn('Bookmarks', 'ArticleId', 'articleId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
