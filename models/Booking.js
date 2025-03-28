const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Flight = require("./Flight");
const User = require("./User");

const Booking = sequelize.define(
  "Booking",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    flightId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Flight,
        key: "id",
      },
    },
    seatsBooked: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
  }
);

// Define associations
User.hasMany(Booking, { foreignKey: "userId" });
Booking.belongsTo(User, { foreignKey: "userId" });

Flight.hasMany(Booking, { foreignKey: "flightId" });
Booking.belongsTo(Flight, { foreignKey: "flightId" });

module.exports = Booking;
