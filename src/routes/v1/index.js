const express = require('express');
const { BookingController } = require('../../controllers/index');
const { bookingMiddleware } = require('../../middlewares/index');

const router = express.Router();

router.get('/', (req, res) => {
    res.send("Welcome to v1 Home");
});

router.post('/bookings', BookingController.create);
router.patch('/bookings/:id', bookingMiddleware.validBookingId, bookingMiddleware.validUpdate, BookingController.update);
router.get('/bookings/:id', bookingMiddleware.validBookingId, BookingController.get);
router.delete('/bookings/:id', bookingMiddleware.validBookingId, BookingController.cancel);
module.exports = router;