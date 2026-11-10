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
    constructor(message = 'Пользователь не авторизован') {
        super(message, 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Нет доступа') {
        super(message, 403);
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Не найдено') {
        super(message, 404);
    }
}

export class ValidationError extends AppError {
    constructor(
        message = 'Ошибка валидации',
        public fields?: Record<string, string>,
    ) {
        super(message, 400);
    }
}

export class DatabaseError extends AppError {
    constructor(message = 'Ошибка работы с базой данных') {
        super(message, 503);
    }
}
