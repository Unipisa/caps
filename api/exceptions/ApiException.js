class ApiError extends Error {
    constructor(message, code=500, issues=null) {
        super(message);
        this.name = "ApiException";
        this.code = code;
        this.issues = issues;
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

class ValidationError extends ApiError {
    constructor(issues, message = "Validation Error") {
        super(message, 403, issues);
    }
}

exports.ValidationError = ValidationError;

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
            message: err.message,
            issues: err.issues
        })
    } else {
        err.message = JSON.stringify({
            code: err?.code,
            message: err.message,
            issues: []
        });
        next(err);
    }
}
exports.apiErrors = apiErrors;
