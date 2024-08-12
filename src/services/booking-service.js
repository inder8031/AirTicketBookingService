const axios = require('axios');

const { BookingRepository } = require('../repository/index');
const { FLIGHT_SERVICE_PATH, UPDATE_FLIGHT_SERVICE_PATH, AUTH_SERVICE_PATH } = require('../config/serverConfig');
const { ServiceError, AppError } = require('../utils/index');
const { StatusCodes } = require('http-status-codes');

class BookingService {
    constructor() {
        this.bookingRepository = new BookingRepository();
    }

    async createBooking(data) {
        try {
            const flightId = data.flightId;
            const flightServiceGetReqURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;
            const response = await axios.get(flightServiceGetReqURL);
            const flightDetails = response.data.data; //1st data for axios , 2nd data because it also contains message, success, error, hence two times these properties are occuring which is not required.
            if(!flightDetails) {
                throw new AppError(
                    'ClientError',
                    'Booking Failed',
                    'Incorrect flightId',
                    StatusCodes.BAD_REQUEST
                );
            }
            const userServiceGetURL = `${AUTH_SERVICE_PATH}/api/v1/users/${data.userId}`;
            let { data: { data: user } } = await axios.get(userServiceGetURL);
            if(!user) {
                throw new AppError(
                    'ClientError',
                    'Register First',
                    'User not Registered',
                    StatusCodes.UNAUTHORIZED
                );
            }
            let priceOfFlight = flightDetails.price;
            console.log(priceOfFlight);
            if(data.noOfSeats > flightDetails.totalSeats) {
                throw new ServiceError(
                    'Booking failed',
                    'Insufficient seats'
                );
            }
            const totalCost = data.noOfSeats * priceOfFlight;
            const payLoad = { ...data, totalCost}; 
            const booking = await this.bookingRepository.create(payLoad);
            const flightServiceUpdateReqURL = `${UPDATE_FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;
            await axios.patch(flightServiceUpdateReqURL, {
                totalSeats: flightDetails.totalSeats - data.noOfSeats
            });
            return booking; 
        } catch (error) {
            if(error.name == 'RepositoryError' || error.name == 'ValidationError' || error.name == 'ClientError') {
                throw error;
            }

            throw new ServiceError();
        } 
    }
}

module.exports = BookingService;