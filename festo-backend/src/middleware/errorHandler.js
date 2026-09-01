import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict detected with current resource state') {
    super(message, 409);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = null) {
    super(message, 400);
    this.errors = errors;
  }
}

export const errorHandler = (err, _req, res, _next) => {
  // Zod Validation Error handling
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: err.errors[0]?.message || 'Validation error',
    });
    return;
  }

  // Known AppError handling
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Existing services use standard Error instances with a statusCode.
  if (err.statusCode) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Postgres unique constraint violation (code 23505)
  if (err.code === '23505') {
    res.status(409).json({
      success: false,
      message: 'A duplicate record already exists.',
    });
    return;
  }

  // Unhandled / server errors
  console.error('💥 Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred',
  });
};
