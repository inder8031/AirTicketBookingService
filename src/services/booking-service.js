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
            const finalBooking = await this.bookingRepository.update(booking.id, { status: "Booked"});
            return finalBooking; 
        } catch (error) {
            if(error.name == 'RepositoryError' || error.name == 'ValidationError' || error.name == 'ClientError') {
                throw error;
            }

            throw new ServiceError();
        } 
    }

    async updateBooking(bookingId, data) {
        try {
            const prevBooking = await this.bookingRepository.getById(bookingId);
            if(!prevBooking) {
                throw new AppError(
                    'ClientError',
                    'Booking not found',
                    'There was no such booking done previously. Book first.',
                    StatusCodes.BAD_REQUEST
                );
            }

            if(data.flightId == prevBooking.flightId && data.noOfSeats == prevBooking.noOfSeats) {
                console.log("2");
                return prevBooking;   
            }

            const flightId = data.flightId;
            const flightServiceGetReqURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;
            const { data: { data: flightDetails}} = await axios.get(flightServiceGetReqURL);
            if(!flightDetails) {
                throw new AppError(
                    'ClientError',
                    'Booking Failed',
                    'Incorrect flightId',
                    StatusCodes.BAD_REQUEST
                );
            }

            const flightServiceUpdateReqURL = `${UPDATE_FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;
            let totalSeats, prevTotalSeats;
            let flag = false;
            let updateObj = {};
            let finalObj = {};
            if(flightId == prevBooking.flightId) {
                if(prevBooking.noOfSeats < data.noOfSeats) {
                    if(flightDetails.totalSeats >= data.noOfSeats - prevBooking.noOfSeats) {
                        const amountToBePaid = flightDetails.price * (data.noOfSeats - prevBooking.noOfSeats);
                        updateObj.noOfSeats = data.noOfSeats;
                        updateObj.totalCost = prevBooking.totalCost + amountToBePaid;
                        finalObj.amountAlreadyPaid = prevBooking.totalCost;
                        finalObj.amountToBePaid = amountToBePaid;
                        totalSeats = flightDetails.totalSeats - (data.noOfSeats - prevBooking.noOfSeats);
                    } else {
                        throw new ServiceError(
                            'updation failed',
                            'There are not enough seats left'
                        );
                    }
                } else {
                    const noOfSeatsToBeDropped = prevBooking.noOfSeats - data.noOfSeats;
                    finalObj.amountAlreadyPaid = prevBooking.totalCost;
                    finalObj.refundAmount = (prevBooking.totalCost / prevBooking.noOfSeats) * noOfSeatsToBeDropped; 
                    updateObj.noOfSeats = data.noOfSeats;
                    updateObj.totalCost = prevBooking.totalCost - finalObj.refundAmount;
                    totalSeats = flightDetails.totalSeats + noOfSeatsToBeDropped;
                }
            } else {
                if(data.noOfSeats > flightDetails.totalSeats) {
                    throw new ServiceError(
                        'Booking failed',
                        'Insufficient seats in the flight requested'
                    );
                }

                const prevFlightServiceGetReqURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${prevBooking.flightId}`;
                const { data: { data: prevFlightDetails } } = await axios.get(prevFlightServiceGetReqURL);
            
                flag = true;
                prevTotalSeats = prevFlightDetails.totalSeats + prevBooking.noOfSeats;
                totalSeats = flightDetails.totalSeats - data.noOfSeats;
                const prevTotalCost = prevBooking.totalCost;
                const currTotalCost = flightDetails.price * data.noOfSeats;
                updateObj.totalCost = currTotalCost;
                updateObj.noOfSeats = data.noOfSeats;
                updateObj.flightId = flightId;
                finalObj.amountAlreadyPaid = prevBooking.totalCost;

                if(currTotalCost == prevTotalCost) {
                    finalObj.amountToBePaid = 0;
                } else if(currTotalCost < prevTotalCost) {
                    finalObj.refundAmount = prevTotalCost - currTotalCost;
                } else {
                    finalObj.amountToBePaid = currTotalCost - prevTotalCost;
                }
                
            }
            
            const response = await this.bookingRepository.update(bookingId, { ...updateObj, status: 'Booked' });
            if(flag) {
                const prevFlightServiceUpdateReqURL = `${UPDATE_FLIGHT_SERVICE_PATH}/api/v1/flights/${prevBooking.flightId}`;
                await axios.patch(prevFlightServiceUpdateReqURL, {
                    totalSeats: prevTotalSeats
                });
            }
            
            await axios.patch(flightServiceUpdateReqURL, {
                totalSeats: totalSeats
            });

            return { ...response, ...finalObj};

        } catch (error) {
            if(error.name == 'RepositoryError' || error.name == 'ValidationError' || error.name == 'ClientError') {
                throw error;
            }

            throw new ServiceError();
        }
    }

    async getBooking(bookingId) {
        try {
            const booking = await this.bookingRepository.getById(bookingId);
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