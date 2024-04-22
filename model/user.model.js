const Sequelize = require("sequelize");
const db = require("../db");
const bcrypt = require("bcryptjs");

const User = db.define(
  "User",
  {
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    fullname: {
      type: Sequelize.STRING, 
      allowNull: true, 
    },
    status: {
      type: Sequelize.ENUM("active", "inactive", "admin"), // Using ENUM for limited options
      allowNull: false,
      defaultValue: "active", 
    },
  },
  {
    timestamps: true,
    hooks: {
      // Hook to hash the password before creating or updating a user
      beforeCreate: async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

module.exports = User;