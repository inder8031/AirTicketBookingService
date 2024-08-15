const { StatusCodes } = require("http-status-codes")

const validUpdate = ( req, res, next ) => {
    if(isNaN(req.params.id)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            data: {},
            success: false,
            message: 'Incorrect Id',
            error: 'Ids must be numeric in nature'
        });
    }

    if(!req.body.flightId || !req.body.noOfSeats) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            data: {},
            success: false,
            message: 'Insufficient Data',
            error: 'Either flightId or noOfSeats is missing'
        });
    }

    if(isNaN(req.body.flightId) || isNaN(req.body.noOfSeats)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            data: {},
            success: false,
            message: 'Non-numeric Data',
            error: 'Either flightId or noOfSeats is non numeric'
        });
    }

    next();
}

const validBookingId = (req, res, next) => {
    let bookingId = req.params.id;
    bookingId = bookingId.trim();

    if(bookingId.length == 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            data: {},
            success: false,
            message: 'User must provide booking id',
            error: 'Booking id found empty'
        });
    }

    if(isNaN(req.params.id)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            data: {},
            success: false,
            message: 'Incorrect Booking Id',
            error: 'Ids must be numeric in nature'
        });
    }

    next();
}

module.exports = {
    validUpdate,
    validBookingId
}