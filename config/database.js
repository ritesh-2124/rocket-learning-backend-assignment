const { Sequelize } = require("sequelize");
require("dotenv").config();

const isTestEnv = process.env.NODE_ENV === "test";

const sequelize = isTestEnv
  ? new Sequelize("sqlite::memory:", { logging: false })
  : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
      host: process.env.DB_HOST,
      dialect: "mysql",
      logging: false, 
    });

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Database connected successfully (${isTestEnv ? "TEST DB" : "MySQL"})`);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = { sequelize, connectDB };
