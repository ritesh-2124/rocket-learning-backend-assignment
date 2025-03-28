const { createClient } = require('redis');
require("dotenv").config();

const client = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

// Function to establish Redis connection
const clientConnection = async () => {
    try {
        await client.connect();
        console.log("Redis connected successfully");
    } catch (error) {
        console.error("Unable to connect to Redis:", error);
    }
};

// Event listeners for debugging
client.on('error', (err) => {
    console.error("Redis Error:", err);
});

module.exports = { client, clientConnection };
