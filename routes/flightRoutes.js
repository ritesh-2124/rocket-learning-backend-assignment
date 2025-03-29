const express = require("express");
const { authenticateUser, authorizeRoles } = require("../middleware/authMiddleware");
const { addFlight, searchFlights, updateFlight, deleteFlight ,getAvailableSeats ,rescheduleFlight} = require("../controllers/flightController");

const router = express.Router();

router.get("/", searchFlights)
router.get("/getAvailableSeats/:id" , getAvailableSeats);
router.post("/", authenticateUser, authorizeRoles("admin"), addFlight);
router.put("/:id", authenticateUser, authorizeRoles("admin"), updateFlight);
router.delete("/:id", authenticateUser, authorizeRoles("admin"), deleteFlight);
router.post("/reschedule/:id", authenticateUser, authorizeRoles("admin"), rescheduleFlight);



module.exports = router;
