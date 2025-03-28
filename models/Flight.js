const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Flight = sequelize.define("Flight", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  airline: { type: DataTypes.STRING, allowNull: false },
  source: { type: DataTypes.STRING, allowNull: false },
  destination: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATE, allowNull: false },
  seats: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
});

module.exports = Flight;
