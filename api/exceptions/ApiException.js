class ApiError extends Error {
    constructor(message, code=500) {
        super(message);
        this.name = "ApiException";
        this.code = code;
    }
}
exports.ApiError = ApiError;

class BadRequestError extends ApiError {
    constructor(message) {
        super(message, 400);
    }
}
exports.BadRequestError = BadRequestError;

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
