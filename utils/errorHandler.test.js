const {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  formatErrorResponse,
  validateData,
  createErrorResponse
} = require('./errorHandler.js');

const { HTTP_CODES } = require('./constants.js');

describe('Error Handler Utilities', () => {
  describe('AppError', () => {
    it('should create error with message and status', () => {
      const error = new AppError('Test error', HTTP_CODES.BAD_REQUEST);

      expect(error.message).toBe('Test error');
      expect(error.status).toBe(HTTP_CODES.BAD_REQUEST);
      expect(error.name).toBe('AppError');
    });

    it('should include details in error', () => {
      const details = { field: 'email' };
      const error = new AppError('Validation failed', HTTP_CODES.BAD_REQUEST, details);

      expect(error.details).toEqual(details);
    });

    it('should use default status if not provided', () => {
      const error = new AppError('Test error');

      expect(error.status).toBe(HTTP_CODES.INTERNAL_ERROR);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid email');

      expect(error.message).toBe('Invalid email');
      expect(error.status).toBe(HTTP_CODES.BAD_REQUEST);
      expect(error.name).toBe('ValidationError');
    });

    it('should include validation details', () => {
      const details = ['Email is required', 'Email format is invalid'];
      const error = new ValidationError('Validation failed', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error', () => {
      const error = new AuthenticationError('Invalid credentials');

      expect(error.message).toBe('Invalid credentials');
      expect(error.status).toBe(HTTP_CODES.UNAUTHORIZED);
      expect(error.name).toBe('AuthenticationError');
    });

    it('should use default message', () => {
      const error = new AuthenticationError();

      expect(error.message).toBe('Authentication failed');
    });
  });

  describe('AuthorizationError', () => {
    it('should create authorization error', () => {
      const error = new AuthorizationError('Admin access required');

      expect(error.message).toBe('Admin access required');
      expect(error.status).toBe(HTTP_CODES.FORBIDDEN);
      expect(error.name).toBe('AuthorizationError');
    });

    it('should use default message', () => {
      const error = new AuthorizationError();

      expect(error.message).toBe('Access denied');
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error', () => {
      const error = new NotFoundError('User not found');

      expect(error.message).toBe('User not found');
      expect(error.status).toBe(HTTP_CODES.NOT_FOUND);
      expect(error.name).toBe('NotFoundError');
    });
  });

  describe('ConflictError', () => {
    it('should create conflict error', () => {
      const error = new ConflictError('User already exists');

      expect(error.message).toBe('User already exists');
      expect(error.status).toBe(HTTP_CODES.CONFLICT);
      expect(error.name).toBe('ConflictError');
    });
  });

  describe('DatabaseError', () => {
    it('should create database error', () => {
      const error = new DatabaseError('Connection failed');

      expect(error.message).toBe('Connection failed');
      expect(error.status).toBe(HTTP_CODES.INTERNAL_ERROR);
      expect(error.name).toBe('DatabaseError');
    });

    it('should include database details', () => {
      const details = { code: 'ECONNREFUSED' };
      const error = new DatabaseError('Connection failed', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('formatErrorResponse', () => {
    it('should format AppError', () => {
      const error = new ValidationError('Invalid input', ['Field required']);
      const response = formatErrorResponse(error);

      expect(response.message).toBe('Invalid input');
      expect(response.status).toBe(HTTP_CODES.BAD_REQUEST);
      expect(response.details).toEqual(['Field required']);
      expect(response.name).toBe('ValidationError');
    });

    it('should format regular Error', () => {
      const error = new Error('Test error');
      const response = formatErrorResponse(error);

      expect(response.message).toBe('Test error');
      expect(response.status).toBe(HTTP_CODES.INTERNAL_ERROR);
    });

    it('should format SyntaxError', () => {
      const error = new SyntaxError('Invalid JSON');
      const response = formatErrorResponse(error);

      expect(response.message).toBe('Invalid request format');
      expect(response.status).toBe(HTTP_CODES.BAD_REQUEST);
    });

    it('should handle error without message', () => {
      const error = new Error();
      const response = formatErrorResponse(error);

      expect(response.message).toBe('Internal server error');
      expect(response.status).toBe(HTTP_CODES.INTERNAL_ERROR);
    });
  });

  describe('validateData', () => {
    it('should validate required fields', () => {
      const data = { name: '', email: 'test@example.com' };
      const rules = {
        name: { required: true },
        email: { required: true }
      };

      const errors = validateData(data, rules);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('name');
    });

    it('should validate field types', () => {
      const data = { age: 'not a number' };
      const rules = { age: { type: 'number' } };

      const errors = validateData(data, rules);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate field length', () => {
      const data = { name: 'Jo' };
      const rules = { name: { minLength: 3 } };

      const errors = validateData(data, rules);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate field pattern', () => {
      const data = { email: 'invalid-email' };
      const rules = {
        email: {
          pattern: /^.+@.+\..+$/,
          message: 'Email format invalid'
        }
      };

      const errors = validateData(data, rules);

      expect(errors).toContain('Email format invalid');
    });

    it('should validate multiple rules', () => {
      const data = { age: 200 };
      const rules = { age: { min: 18, max: 120 } };

      const errors = validateData(data, rules);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should not error for optional fields', () => {
      const data = { name: 'John', optional: '' };
      const rules = {
        name: { required: true },
        optional: { required: false }
      };

      const errors = validateData(data, rules);

      expect(errors.length).toBe(0);
    });
  });

  describe('createErrorResponse', () => {
    it('should create formatted error response', () => {
      const error = new ValidationError('Invalid input');
      const response = createErrorResponse(error);

      expect(response.success).toBe(false);
      expect(response.message).toBe('Invalid input');
      expect(response.status).toBe(HTTP_CODES.BAD_REQUEST);
      expect(response.timestamp).toBeDefined();
    });

    it('should use custom status code', () => {
      const error = new Error('Test');
      const response = createErrorResponse(error, HTTP_CODES.NOT_FOUND);

      expect(response.status).toBe(HTTP_CODES.NOT_FOUND);
    });

    it('should include error details if present', () => {
      const error = new ValidationError('Invalid', ['Field required']);
      const response = createErrorResponse(error);

      expect(response.details).toEqual(['Field required']);
    });

    it('should not include details if not present', () => {
      const error = new Error('Test');
      const response = createErrorResponse(error);

      expect(response.details).toBeUndefined();
    });
  });
});
