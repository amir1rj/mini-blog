const Sequelize = require("sequelize");
const db = require("../db");

const Activity = db.define("Activity", {
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  action: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  entityType: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  entityId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
});

module.exports = Activity;