const express = require('express');
const userRoute = require('../routes/userRoutes');
const flightRoute = require('../routes/flightRoutes');
const router = express.Router();


router.use('/users', userRoute);
router.use('/flights', flightRoute);



module.exports = router;