const { Booking } = require('../models/index');
const { ValidationError, AppError } = require('../utils/index');
const { StatusCodes } = require('http-status-codes');

class BookingRepository {
    async create(data) {
        try {
           const booking = await Booking.create(data);
           return booking; 
        } catch (error) {
            if(error.name == 'SequelizeValidationError') {
                throw new ValidationError(error);
            }

            throw new AppError(
                'RepositoryError',
                'Booking failed',
                'An error occured during booking, Please try again later',
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async update(bookingId, data) {
        try {
            // await Booking.update(data, {
            //     where: {
            //         id: bookingId
            //     }
            // });
            const booking = await Booking.findByPk(bookingId);
            if(data.status) {
                booking.status = data.status;
            }
            if(data.flightId) {
                booking.flightId = data.flightId;
            }
            if(data.noOfSeats) {
                booking.noOfSeats = data.noOfSeats;
            }
            if(data.totalCost) {
                booking.totalCost = data.totalCost;
            }
            booking.save();
            return booking;
        } catch (error) {
            throw new AppError(
                'RepositoryError',
                'Booking Updation failed',
                'An error occured during updation, Please try again later',
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getById(bookingId) {
        try {
            const booking = await Booking.findByPk(bookingId);
            return booking;
        } catch (error) {
            throw new AppError(
                'RepositoryError',
                'Could not fetch booking details',
                'An error occured during retrieving booking details, Please try again later',
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }
}

module.exports = BookingRepository;