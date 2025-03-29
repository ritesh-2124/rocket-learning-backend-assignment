const { Sequelize } = require("sequelize");

const testDB = new Sequelize("sqlite::memory:", {
    logging: false,
});

module.exports = testDB;
