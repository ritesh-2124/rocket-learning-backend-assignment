const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelizeInstance) => {
    const User = sequelizeInstance.define(
        "User",
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.STRING, allowNull: false },
            email: { type: DataTypes.STRING, unique: true, allowNull: false },
            password: { type: DataTypes.STRING, allowNull: false },
            role: { type: DataTypes.ENUM("user", "admin"), defaultValue: "user" },
        },
        {
            hooks: {
                beforeCreate: async (user) => {
                    user.password = await bcrypt.hash(user.password, 10);
                },
            },
        }
    );

    return User;
};
