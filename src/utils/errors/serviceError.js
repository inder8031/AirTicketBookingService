const { StatusCodes } = require('http-status-codes');

class ServiceError extends Error {
    constructor(
        message = "Something went wrong",
        reason = "Error in Service layer",
        statusCode = StatusCodes.INTERNAL_SERVER_ERROR
    ) {
        super();
        this.name = 'serviceError';
        this.message = message;
        this.reason = reason;
        this.statusCode = statusCode;
    }
}

module.exports = ServiceError;