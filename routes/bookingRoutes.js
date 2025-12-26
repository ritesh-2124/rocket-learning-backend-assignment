const express = require("express");
const {bookFlight, getFlightBookings , cancelBooking , getAllUserBookings} = require("../controllers/bookingController");
const { authenticateUser } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authenticateUser, bookFlight);
router.get("/users", authenticateUser, getAllUserBookings);

router.get("/:id", authenticateUser, getFlightBookings);
router.post("/cancel/:id", authenticateUser, cancelBooking);

module.exports = router;
