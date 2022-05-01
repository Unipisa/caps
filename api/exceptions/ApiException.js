class ApiError extends Error {
    constructor(message, code=500) {
        super(message);
        this.name = "ApiException";
        this.code = code;
    }
}
exports.ApiError = ApiError;

class BadRequestError extends ApiError {
    constructor(message = "Bad Request") {
        super(message, 400);
    }
}

exports.BadRequestError = BadRequestError;

class NotFoundError extends ApiError {
    constructor(message = "Not Found") {
        super(message, 404);
    }
}

exports.NotFoundError = NotFoundError;

class NotImplementedError extends ApiError {
    constructor(message = "Not Implemented") {
        super(message, 501);
    }
}
exports.NotImplementedError = NotImplementedError;

function apiErrors(err, req, res, next) {
    if (err instanceof ApiError) {
        res.status(err.code).send({
            code: err.code,
            message: err.message
        })
    } else {
        next(err);
    }
}
exports.apiErrors = apiErrors;
