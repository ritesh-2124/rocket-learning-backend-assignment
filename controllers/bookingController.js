const { body, validationResult } = require("express-validator");
const { User, Flight, Booking, Seats, sequelize } = require("../models");
const { sendBookingToQueue } = require("../services/emailService");

/**
 * BOOK FLIGHT
 */
const bookFlight = [
  body("flightId").notEmpty().withMessage("Flight ID is required"),
  body("seatsBooked").notEmpty().withMessage("Seats booked is required"),

  async (req, res) => {
    const t = await sequelize.transaction();

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await t.rollback();
        return res.status(400).json({ errors: errors.array() });
      }

      const { flightId, seatsBooked } = req.body;
      const userId = req.user.id;

      const flight = await Flight.findByPk(flightId, { transaction: t });
      if (!flight) {
        await t.rollback();
        return res.status(404).json({ message: "Flight not found" });
      }

      if (flight.available_seats <= 0) {
        await t.rollback();
        return res.status(400).json({ message: "Not enough available seats" });
      }

      const seat = await Seats.findOne({
        where: { id: seatsBooked, is_booked: 0 },
        transaction: t,
      });

      if (!seat) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "Selected seat is already booked" });
      }

      // Update seat + flight
      await seat.update({ is_booked: 1 }, { transaction: t });
      await flight.update(
        { available_seats: flight.available_seats - 1 },
        { transaction: t }
      );

      // Create booking
      const booking = await Booking.create(
        { userId, flightId, seatsBooked },
        { transaction: t }
      );

      await t.commit();

      const user = await User.findByPk(userId);

      await sendBookingToQueue(
        {
          name: user.name,
          email: user.email,
          flight_no: flight.flight_no,
          source: flight.source,
          destination: flight.destination,
          date: flight.date,
          seatsBooked: seat.seat_number,
          flight_status: booking.status,
        },
        userId
      );

      res.status(201).json({
        message: "Flight booked successfully",
        status: booking.status,
        bookingId: booking.id,
      });
    } catch (error) {
      await t.rollback();
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  },
];

/**
 * GET SINGLE BOOKING (BY ID)
 */
const getFlightBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingId = req.params.id;

    const booking = await Booking.findOne({
      where: { id: bookingId, userId },
      include: [
        {
          model: Flight,
          attributes: ["flight_no", "source", "destination", "date"],
        },
        {
          model: Seats,
          as: "seat",
          attributes: ["seat_number"],
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({
      message: "Booking fetched successfully",
      booking: {
        bookingId: booking.id,
        status: booking.status,
        flight: booking.Flight,
        seat: booking.seat.seat_number,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * CANCEL BOOKING
 */
const cancelBooking = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const booking = await Booking.findByPk(req.params.id, { transaction: t });
    if (!booking) {
      await t.rollback();
      return res.status(404).json({ message: "Booking not found" });
    }

    const flight = await Flight.findByPk(booking.flightId, { transaction: t });
    const seat = await Seats.findByPk(booking.seatsBooked, {
      transaction: t,
    });

    await seat.update({ is_booked: 0 }, { transaction: t });
    await flight.update(
      { available_seats: flight.available_seats + 1 },
      { transaction: t }
    );
    await booking.update({ status: "cancelled" }, { transaction: t });

    await t.commit();

    const user = await User.findByPk(booking.userId);

    await sendBookingToQueue(
      {
        name: user.name,
        email: user.email,
        flight_no: flight.flight_no,
        source: flight.source,
        destination: flight.destination,
        date: flight.date,
        seatsBooked: seat.seat_number,
        flight_status: "cancelled",
      },
      booking.userId
    );

    res.json({ message: "Booking canceled successfully" });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET ALL BOOKINGS OF LOGGED-IN USER
 */
const getAllUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.findAll({
      where: { userId },
      include: [
        {
          model: Flight,
          attributes: ["flight_no", "source", "destination", "date", "price"],
        },
        {
          model: Seats,
          as: "seat",
          attributes: ["seat_number"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found" });
    }

    res.json({
      message: "User bookings fetched successfully",
      totalBookings: bookings.length,
      bookings: bookings.map((b) => ({
        bookingId: b.id,
        status: b.status,
        bookedAt: b.createdAt,
        flight: b.Flight,
        seat: b.seat.seat_number,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  bookFlight,
  getFlightBookings,
  cancelBooking,
  getAllUserBookings,
};
