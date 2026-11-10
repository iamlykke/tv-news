export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
    ) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class UnauthenticatedError extends AppError {
    constructor(message = 'Not authenticated') {
        super(message, 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 403);
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Not found') {
        super(message, 404);
    }
}

export class ValidationError extends AppError {
    constructor(
        message = 'Validation error',
        public fields?: Record<string, string>,
    ) {
        super(message, 400);
    }
}

export class DatabaseError extends AppError {
    constructor(message = 'Database error') {
        super(message, 503);
    }
}
