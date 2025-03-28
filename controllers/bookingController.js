const Booking = require("../models/Booking");
const Flight = require("../models/Flight");

const bookFlight = async (req, res) => {
  try {
    const { flightId, seatsBooked } = req.body;
    const userId = req.user.id; // Extracted from JWT token

    const flight = await Flight.findByPk(flightId);
    if (!flight) return res.status(404).json({ message: "Flight not found" });

    if (flight.seats < seatsBooked) {
      return res.status(400).json({ message: "Not enough available seats" });
    }

    // Reduce available seats
    flight.seats -= seatsBooked;
    await flight.save();

    // Store booking details
    const booking = await Booking.create({ userId, flightId, seatsBooked });

    res.status(201).json({ message: "Flight booked successfully", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { bookFlight };
