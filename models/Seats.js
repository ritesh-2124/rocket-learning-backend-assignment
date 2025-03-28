const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Flight = require("./Flight"); // Ensure Flight is imported before defining Seat

const Seat = sequelize.define("Seat", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  flight_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Flights", key: "id" }, // Ensure model name matches table name
  },
  seat_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_booked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
});


// Ensure Associations are set **AFTER** both models are defined
Flight.hasMany(Seat, { foreignKey: "flight_id", onDelete: "CASCADE" });
Seat.belongsTo(Flight, { foreignKey: "flight_id", onDelete: "CASCADE" });

module.exports = Seat;
