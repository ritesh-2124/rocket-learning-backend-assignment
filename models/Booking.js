const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./User");
const Flight = require("./Flight");

const Booking = sequelize.define("Booking", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  seat_number: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM("confirmed", "canceled"), defaultValue: "confirmed" },
});

// Relations
User.hasMany(Booking, { foreignKey: "user_id" });
Booking.belongsTo(User, { foreignKey: "user_id" });

Flight.hasMany(Booking, { foreignKey: "flight_id" });
Booking.belongsTo(Flight, { foreignKey: "flight_id" });

module.exports = Booking;
