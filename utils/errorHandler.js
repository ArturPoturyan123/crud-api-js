/**
 * Error handling utilities
 * Custom error classes and handlers
 */

const { HTTP_CODES } = require('./constants.js');

class AppError extends Error {
  constructor(message, status = HTTP_CODES.INTERNAL_ERROR, details = null) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, HTTP_CODES.BAD_REQUEST, details);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, HTTP_CODES.UNAUTHORIZED);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, HTTP_CODES.FORBIDDEN);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, HTTP_CODES.NOT_FOUND);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, HTTP_CODES.CONFLICT);
    this.name = 'ConflictError';
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database error occurred', details = null) {
    super(message, HTTP_CODES.INTERNAL_ERROR, details);
    this.name = 'DatabaseError';
  }
}

const formatErrorResponse = (error) => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      status: error.status,
      details: error.details,
      name: error.name
    };
  }

  if (error instanceof SyntaxError) {
    return {
      message: 'Invalid request format',
      status: HTTP_CODES.BAD_REQUEST,
      details: error.message
    };
  }

  return {
    message: error.message || 'Internal server error',
    status: HTTP_CODES.INTERNAL_ERROR,
    details: process.env.NODE_ENV === 'development' ? error.stack : null
  };
};

const catchAsyncError = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const validateData = (data, rules) => {
  const errors = [];

  Object.entries(rules).forEach(([field, rule]) => {
    const value = data[field];

    if (rule.required && (!value || value.toString().trim() === '')) {
      errors.push(`${field} is required`);
    }

    if (value && rule.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== rule.type) {
        errors.push(`${field} must be ${rule.type}`);
      }
    }

    if (value && rule.pattern && !rule.pattern.test(value)) {
      errors.push(rule.message || `${field} format is invalid`);
    }

    if (value && rule.minLength && value.length < rule.minLength) {
      errors.push(`${field} must be at least ${rule.minLength} characters`);
    }

    if (value && rule.maxLength && value.length > rule.maxLength) {
      errors.push(`${field} must not exceed ${rule.maxLength} characters`);
    }

    if (value && rule.min && value < rule.min) {
      errors.push(`${field} must be at least ${rule.min}`);
    }

    if (value && rule.max && value > rule.max) {
      errors.push(`${field} must not exceed ${rule.max}`);
    }
  });

  return errors;
};

const logError = (error, context = '') => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    name: error.name,
    message: error.message,
    status: error.status || 500,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };

  console.error('ERROR:', JSON.stringify(errorInfo, null, 2));
};

const createErrorResponse = (error, statusCode = HTTP_CODES.INTERNAL_ERROR) => {
  return {
    success: false,
    message: error.message || 'An error occurred',
    status: error.status || statusCode,
    ...(error.details && { details: error.details }),
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  formatErrorResponse,
  catchAsyncError,
  validateData,
  logError,
  createErrorResponse
};
