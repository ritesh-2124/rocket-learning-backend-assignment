const { sequelize } = require("../config/database");

// =======================
// Initialize Models
// =======================
const User = require("./User")(sequelize);
const Flight = require("./Flight")(sequelize);
const Seats = require("./Seats")(sequelize, Flight);
const Booking = require("./Booking")(sequelize, User, Flight);

// =======================
// Define Associations
// =======================

// User ↔ Booking
User.hasMany(Booking, { foreignKey: "userId" });
Booking.belongsTo(User, { foreignKey: "userId" });

// Flight ↔ Booking
Flight.hasMany(Booking, { foreignKey: "flightId" });
Booking.belongsTo(Flight, { foreignKey: "flightId" });

// Seat ↔ Booking (IMPORTANT)
Seats.hasMany(Booking, { foreignKey: "seatsBooked" });
Booking.belongsTo(Seats, {
  foreignKey: "seatsBooked",
  as: "seat",
});

// =======================
// Sync DB
// =======================
const syncDatabase = async () => {
  await sequelize.sync({ alter: false });
  console.log("All tables synced successfully!");
};

module.exports = {
  sequelize,
  syncDatabase,
  User,
  Flight,
  Seats,
  Booking,
};
