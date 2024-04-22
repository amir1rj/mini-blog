const Sequelize = require("sequelize");

const db = new Sequelize(
  "blogdb", 
  "tecmint",
  "securep@wd", 
  {
    host: "localhost",
    port: 5432, // 
    dialect: "postgres", // 
  }
);

module.exports = db;