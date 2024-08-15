const { StatusCodes } = require("http-status-codes")

const validUpdate = ( req, res, next ) => {
    if(isNaN(req.params.id)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            data: { type: typeof req.params.id, val: isNaN(req.params.id), num: req.params.id },
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

module.exports = {
    validUpdate
}