const { DataTypes } = require("sequelize");

module.exports = (sequelizeInstance, User, Flight) => {
    const Booking = sequelizeInstance.define(
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
                type: DataTypes.STRING,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM("booked", "cancelled"),
                defaultValue: "booked",
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

    return Booking;
};
