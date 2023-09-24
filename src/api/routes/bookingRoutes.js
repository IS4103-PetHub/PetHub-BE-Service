const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController')

router.get('/health-check', async (req, res, next) => {
    res.send({ message: 'Ok Booking API is working 🚀' });
});

function registerBookingRoutes(controller) {
    router.post(`/`, controller.createBooking);
    router.patch(`/:bookingId`, controller.updateBooking);
}

registerBookingRoutes(bookingController);

module.exports = router;