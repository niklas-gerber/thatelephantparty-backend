class AppError extends Error {
  constructor(message, statusCode, errorType) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.isOperational = true; // Marks known error types (vs. bugs)
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types (extend AppError)
class ValidationError extends AppError {
  constructor(message, details) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details || {};
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class AuthError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'AUTH_ERROR');
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(message, 400, 'BAD_REQUEST');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Bad Request') {
    super(message, 409, 'CONFLICT');
  }
}

class DuplicateEmailError extends AppError {
  constructor() {
    super('Email already used for another purchase', 409, 'DUPLICATE_EMAIL');
  }
}

class DuplicateReferenceError extends AppError {
  constructor() {
    super('Reference number already used', 409, 'DUPLICATE_REFERENCE');
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  AuthError,
  ConflictError,
  DuplicateEmailError,
  DuplicateReferenceError,
  BadRequestError
};