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
}

module.exports = BookingRepository;