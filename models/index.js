const { sequelize } = require("../config/database");
const User = require("./User");
const Flight = require("./Flight");
const Booking = require("./Booking");
const Seats = require("./Seats");

// Sync all models to DB
const syncDatabase = async () => {
  await sequelize.sync({ alter: false });
  console.log("All tables synced successfully!");
};

module.exports = { sequelize, syncDatabase, User, Flight, Booking ,Seats };
