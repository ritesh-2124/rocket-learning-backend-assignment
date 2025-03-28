const { sequelize } = require("../config/database");
const User = require("./User");
const Flight = require("./Flight");
const Booking = require("./Booking");

// Sync all models to DB
const syncDatabase = async () => {
  await sequelize.sync({ alter: true });
  console.log("All tables synced successfully!");
};

module.exports = { sequelize, syncDatabase, User, Flight, Booking };
