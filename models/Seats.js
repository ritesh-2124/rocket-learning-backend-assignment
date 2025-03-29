const { DataTypes } = require("sequelize");

module.exports = (sequelizeInstance, Flight) => {
    const Seat = sequelizeInstance.define("Seat", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        flight_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: Flight, key: "id" },
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

    // Define associations
    Flight.hasMany(Seat, { foreignKey: "flight_id", onDelete: "CASCADE" });
    Seat.belongsTo(Flight, { foreignKey: "flight_id", onDelete: "CASCADE" });

    return Seat;
};
