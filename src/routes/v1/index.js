const express = require('express');
const { BookingController } = require('../../controllers/index');

const router = express.Router();

router.get('/', (req, res) => {
    res.send("Welcome to v1 Home");
});

router.post('/bookings', BookingController.create);

module.exports = router;