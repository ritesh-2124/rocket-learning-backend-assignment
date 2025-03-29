const Flight = require("../models/Flight");
const Seat = require("../models/Seats");
const Booking = require("../models/Booking");
const User = require("../models/User");
const { sendBookingToQueue } = require("../services/emailService");
const { Op } = require("sequelize");
const { client } = require("../config/redis");
const searchFlights = async (req, res) => {
  try {
    const { source, destination, date, page = 1, pageSize = 10 } = req.query;


    if (!source || !destination || !date) {
      return res.status(400).json({ message: `missing required parameters` });
    }

    const pageNumber = parseInt(page, 10);
    const size = parseInt(pageSize, 10);
    const offset = (pageNumber - 1) * size;

    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);

    const cacheKey = `flights:${source}:${destination}:${date}:page:${pageNumber}:size:${size}`;

    const cachedFlights = await client.get(cacheKey);
    if (cachedFlights) {
      return res.json(JSON.parse(cachedFlights));
    }

    const { count, rows: flights } = await Flight.findAndCountAll({
      where: {
        source,
        destination,
        date: { [Op.between]: [startDate, endDate] },
        available_seats: {
          [Op.gt]: 0,
        }
      },
      raw : true,
      limit: size,
      offset: offset,
    });

    if (flights.length === 0) {
      return res.status(404).json({ message: "No flights found" });
    }
    const totalPages = Math.ceil(count / size);
    const response = {
      totalFlights: count,
      totalPages: totalPages,
      currentPage: pageNumber,
      pageSize: size,
      flights: flights,
    };
    await client.setEx(cacheKey, 3600, JSON.stringify(response));
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getAvailableSeats = async (req, res) => {
  try {
    const { id } = req.params;

    const seats = await Seat.findAll({
      where: { flight_id: id , is_booked : false},
    });

    res.json(seats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addFlight = async (req, res) => {
  try {
    const { airline, source, destination,flight_no, date, total_seats, price , arrival_time, departure_time} = req.body;

    const flight = await Flight.create({
      airline,
      source,
      flight_no,
      destination,
      date,
      total_seats,
      arrival_time,
      departure_time,
      available_seats: total_seats,
      price,
    });

    const seats = [];
    for (let i = 1; i <= total_seats; i++) {
      seats.push({
        flight_id: flight.id,
        seat_number: `S${i}`,
        is_booked: false,
      });
    }

    await Seat.bulkCreate(seats);


    await deleteFlightCache(source, destination, date);


    res.status(201).json({
      message: "Flight added successfully with seats",
      flight,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const updateFlight = async (req, res) => {
    try {
      const { id } = req.params;
      const flight = await Flight.findByPk(id);
      if (!flight) return res.status(404).json({ message: "Flight not found" });
  
      if(req.body.total_seats || req.body.available_seats){
        return res.status(400).json({ message: "Total seats and available seats cannot be updated directly" });
      }
  
      await flight.update(req.body);
  
      res.json({ message: "Flight updated successfully", flight });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  const deleteFlight = async (req, res) => {
    try {
      const { id } = req.params;
      const flight = await Flight.findByPk(id);
      if (!flight) return res.status(404).json({ message: "Flight not found" });
  
      await flight.destroy();
      res.json({ message: "Flight deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  const rescheduleFlight = async (req, res) => {
    try {
      const { id } = req.params;
      const flight = await Flight.findByPk(id);
      if (!flight) return res.status(404).json({ message: "Flight not found" });
  
      if(req.body.flight_no || req.body.airline){
        return res.status(400).json({ message: "Flight number and airline cannot be updated while rescheduling" });
      }
      if(req.body.source || req.body.destination){
        return res.status(400).json({ message: "Source and destination cannot be updated while rescheduling" });
      }
      if(req.body.total_seats || req.body.available_seats){
        return res.status(400).json({ message: "Total seats and available seats cannot be updated while rescheduling" });
      }
      if(!req.body.date || !req.body.departure_time || !req.body.arrival_time){
        return res.status(400).json({ message: "Date and time are required for rescheduling" });
      }
  
      await flight.update(req.body);

      //inform users about rescheduling
      const users = await Booking.findAll({ where: { flightId: flight.id } });
      for (const user of users) {
        const userObject = await User.findByPk(user.userId);
        let flightDetails = {
          name: userObject.name,
          email: userObject.email,
          flight_no: flight.flight_no,
          source: flight.source,
          destination: flight.destination,
          date: flight.date,
          seatsBooked: user.seatsBooked,
          flight_status: "rescheduled",
        };
        await sendBookingToQueue(flightDetails, user.userId);
      }

      res.json({ message: "Flight rescheduled successfully", flight });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };


  const deleteFlightCache = async (source, destination, date) => {
    console.log("Deleting cache for flights");
    const pattern = `flights:${source}:${destination}:${date}*`;
    const keys = await client.keys(pattern);
    console.log(`Found cache keys: ${keys}`);
    if (keys.length > 0) {
      await client.del(...keys);
      console.log(`Deleted cache keys: ${keys}`);
    }
  };

module.exports = { searchFlights , addFlight, updateFlight, deleteFlight ,getAvailableSeats ,rescheduleFlight};
