const { StatusCodes } = require('http-status-codes');

class ValidationError extends Error {
    constructor(error) {
        super();
        
        const reasons = [];
        error.errors.forEach((err) => {
            reasons.push(err.message);
        });

        this.name = "validationError";
        this.message = "Not able to validate req data";
        this.statusCode = StatusCodes.BAD_REQUEST;
        this.reason = reasons;
    }
}

module.exports = ValidationError;