const Booking = require("../models/Booking");
const Flight = require("../models/Flight");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const Seats = require("../models/Seats");
const {sendBookingToQueue} = require("../services/emailService");

const bookFlight =[ 
  body("flightId").notEmpty().withMessage("Flight ID is required"),
  body("seatsBooked").notEmpty().withMessage("Seats booked is required"),
  async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { flightId, seatsBooked } = req.body;
    const userId = req.user.id; // Extracted from JWT token

    const flight = await Flight.findByPk(flightId);
    if (!flight) return res.status(404).json({ message: "Flight not found" });

    if (flight.available_seats == 0) {
      return res.status(400).json({ message: "Not enough available seats" });
    }
    const seats = await Seats.findAll({ where: { id: seatsBooked  , is_booked: 1} });
    if(seats.length > 0){
      return res.status(400).json({ message: "Selected seats are already booked" });
    }

    flight.available_seats = flight.available_seats - 1;
    await flight.save();

    // Store booking details
    const booking = await Booking.create({ userId, flightId, seatsBooked });
    const updateSeat = await Seats.update(
      { is_booked: 1 },
      { where: { id: seatsBooked } }
    );
    const user = await User.findByPk(userId);
    let flightDetails = {
      name: user.name,
      flight_no: flight.flight_no,
      source: flight.source,
      destination: flight.destination,
      date: flight.date,
      seatsBooked: seats.seat_number,
      email: user.email,
      flight_status: booking.status,
    };
    await sendBookingToQueue(flightDetails, userId);

    res.status(201).json({ message: "Flight booked successfully", status:booking.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
]

const getFlightBookings = async (req, res) => {
  try {

    const userId = req.user.id; // Extracted from JWT token
    if(!userId) return res.status(400).json({ message: "User ID is required" });

    const bookings = await Booking.findAll({ where: { id: req.params.id , userId } });
    if (bookings.length == 0) return res.status(404).json({ message: "No bookings found" });

    const flight = await Flight.findByPk(bookings[0].dataValues.flightId);
    if (!flight) return res.status(404).json({ message: "Flight not found" });


    const seat = await Seats.findByPk(bookings[0].dataValues.seatsBooked);
    if (!seat) return res.status(404).json({ message: "Seat not found" });

    const user = await User.findByPk(userId);
    let flightDetails = {
      name: user.name,
      email: user.email,
      flight_no: flight.flight_no,
      source: flight.source,
      destination: flight.destination,
      date: flight.date,
      seatsBooked: seat.seat_number,
      flight_status: bookings[0].dataValues.status,
    };


    res.json({ message: "Bookings fetched successfully", flightDetails });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};


const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const flight = await Flight.findByPk(booking.flightId);
    if (!flight) return res.status(404).json({ message: "Flight not found" });

    flight.available_seats = flight.available_seats + 1;
    await flight.save();

    await booking.update({ status: "cancelled" });
    await Seats.update(
      { is_booked: 0 },
      { where: { id: booking.seatsBooked } }
    );

    const user = await User.findByPk(booking.userId);
    let flightDetails = {
      name: user.name,
      email: user.email,
      flight_no: flight.flight_no,
      source: flight.source,
      destination: flight.destination,
      date: flight.date,
      seatsBooked: booking.seatsBooked,
      flight_status: "cancelled",
    };
    await sendBookingToQueue(flightDetails, booking.userId);

    res.json({ message: "Booking canceled successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



module.exports = { bookFlight ,getFlightBookings  ,cancelBooking};
