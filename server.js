require("dotenv").config();
const express = require("express");
const { connectDB } = require("./config/database");
const { syncDatabase } = require("./models");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  await connectDB();
  await syncDatabase();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
