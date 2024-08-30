const { StatusCodes } = require('http-status-codes');

const { BookingService } = require('../services/index');
const { createChannel, publishMessage } = require('../utils/messageQueue');
const { REMINDER_BINDING_KEY } = require('../config/serverConfig');

const bookingService = new BookingService();

const sendMessageQueue = async (req, res) => {
    try {
        const channel = await createChannel();
        const payload = {
            service : "CREATE_NOTIFICATION",
            data : {
                subject: "Testing Message Queue",
                content: "Testing if message queue setup is done correctly or not.",
                recepientEmail: "reminderservice12@gmail.com",
                notificationTime: "2024-08-31T03:56:00"
            }
        };
        publishMessage(channel, REMINDER_BINDING_KEY, JSON.stringify(payload));
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Successfully published the event",
            error: {}
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to publish the event",
            error: error
        });
    }
}

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
    cancel,
    sendMessageQueue
}