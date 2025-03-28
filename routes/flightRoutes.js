const express = require("express");
const { authenticateUser, authorizeRoles } = require("../middleware/authMiddleware");
const { addFlight, searchFlights, updateFlight, deleteFlight ,getAvailableSeats} = require("../controllers/flightController");

const router = express.Router();

router.get("/search", searchFlights)
router.get("/getAvailableSeats/:id" , getAvailableSeats);
router.post("/", authenticateUser, authorizeRoles("admin"), addFlight);
router.put("/:id", authenticateUser, authorizeRoles("admin"), updateFlight);
router.delete("/:id", authenticateUser, authorizeRoles("admin"), deleteFlight);


module.exports = router;
