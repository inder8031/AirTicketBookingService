class AppError extends Error {
    constructor(
        name, 
        message,
        reason,
        statusCode
    ) {
        super();
        this.name = name;
        this.message = message;
        this.reason = reason;
        this.statusCode = statusCode;
    }
}

module.exports = AppError;