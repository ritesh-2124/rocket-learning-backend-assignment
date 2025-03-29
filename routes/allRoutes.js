const express = require('express');
const userRoute = require('../routes/userRoutes');
const flightRoute = require('../routes/flightRoutes');
const bookingRoute = require('../routes/bookingRoutes');
const router = express.Router();


router.use('/users', userRoute);
router.use('/flights', flightRoute);
router.use('/bookings', bookingRoute);




module.exports = router;