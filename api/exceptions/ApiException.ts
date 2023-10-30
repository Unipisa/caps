type Issues = {
    [key: string]: string
}

export class ApiError extends Error {
    code: number
    issues: Issues | null
    constructor(message:string, code:number=500, issues:Issues|null=null) {
        super(message)
        this.name = "ApiException"
        this.code = code
        this.issues = issues
    }
}

export class BadRequestError extends ApiError {
    constructor(message = "Bad Request") {
        super(message, 400);
    }
}

export class NotFoundError extends ApiError {
    constructor(message = "Not Found") {
        super(message, 404);
    }
}

export class ValidationError extends ApiError {
    constructor(issues: Issues, message = "Validation Error") {
        super(message, 422, issues);
    }
}

export class NotImplementedError extends ApiError {
    constructor(message = "Not Implemented") {
        super(message, 501);
    }
}

export class ForbiddenError extends ApiError {
    constructor(message = "Forbidden") {
        super(message, 403);
    }
}

export function apiErrors(err: Error, req:any, res:any, next:any) {
    if (err instanceof ApiError) {
        res.status(err.code).send({
            code: err.code,
            message: err.message,
            issues: err.issues
        })
    } else {
        err.message = JSON.stringify(err)
        next(err);
    }
}
