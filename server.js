require("dotenv").config();
const express = require("express");
const { connectDB } = require("./config/database");
const {clientConnection} = require("./config/redis");
const { syncDatabase } = require("./models");
const allRoutes = require("./routes/allRoutes");
const cors = require("cors");


const app = express();
app.use(express.json());

// Middleware
app.use(cors());


const PORT = process.env.PORT || 5055;

app.use("/api", allRoutes);

// Start server
const startServer = async () => {
  await connectDB();
  await syncDatabase();
  await clientConnection();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
