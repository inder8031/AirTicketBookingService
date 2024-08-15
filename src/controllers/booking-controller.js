const { StatusCodes } = require('http-status-codes');
const { BookingService } = require('../services/index');

const bookingService = new BookingService();

const create = async (req, res) => {
    try {
        const booking = await bookingService.createBooking(req.body);
        return res.status(StatusCodes.OK).json({
            data: booking,
            success: true,
            message: "Booking Successful",
            error: {}
        });
    } catch (error) {
        return res.status(error.statusCode).json({
            data: {},
            success: false,
            message: error.message,
            error: error.reason
        });
    }
}

const update = async (req, res) => {
    try {
        const booking = await bookingService.updateBooking(req.params.id, req.body);
        return res.status(StatusCodes.OK).json({
            data: booking,
            success: true,
            message: "Booking updation Successful",
            error: {}
        });
    } catch (error) {
        return res.status(error.statusCode).json({
            data: {},
            success: false,
            message: error.message,
            error: error.reason
        });
    }
}

const get = async (req, res) => {
    try {
        const booking = await bookingService.getBooking(req.params.id);
        return res.status(StatusCodes.OK).json({
            data: booking,
            success: true,
            message: "Successfully fetched booking details",
            error: {}
        });
    } catch (error) {
        return res.status(error.statusCode).json({
            data: {},
            success: false,
            message: error.message,
            error: error.reason
        });
    }
}

const cancel = async (req, res) => {
    try {
        await bookingService.cancelBooking(req.params.id);
        return res.status(StatusCodes.OK).json({
            data: {},
            success: true,
            message: "Booking cancellation successful",
            error: {}
        });
    } catch (error) {
        return res.status(error.statusCode).json({
            data: {},
            success: false,
            message: error.message,
            error: error.reason
        });
    }
}

module.exports = {
    create,
    update,
    get,
    cancel
}