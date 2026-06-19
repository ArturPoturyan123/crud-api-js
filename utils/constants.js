/**
 * Application constants
 * Reusable values across the application
 */

const HTTP_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Email is invalid',
  INVALID_PASSWORD: 'Password is invalid',
  WEAK_PASSWORD: 'Password does not meet requirements',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  USER_EXISTS: 'User with this email already exists',
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid email or password',
  INVALID_AGE: 'Age must be between 18 and 120',
  INVALID_NAME: 'Name is invalid',
  DB_CONNECTION: 'Database not connected',
  DB_ERROR: 'Database error occurred',
  SERVER_ERROR: 'Internal server error',
  ACCESS_DENIED: 'Access denied',
  ADMIN_ONLY: 'Admin access required',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions'
};

const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRES_UPPERCASE: true,
  REQUIRES_LOWERCASE: true,
  REQUIRES_NUMBER: true,
  MESSAGE: 'Password must be at least 8 characters with uppercase, lowercase, and number'
};

const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator'
};

const API_ROUTES = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  ADMIN: '/api/admin',
  PRODUCTS: '/api/products',
  HEALTH: '/api/health'
};

const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NAME_REGEX: /^[a-zA-Z\s'-]{2,50}$/,
  PHONE_REGEX: /^\d{10,15}$/,
  STRONG_PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

const TOKEN = {
  EXPIRY: '24h',
  REFRESH_EXPIRY: '7d',
  ALGORITHM: 'HS256'
};

const RESPONSE_MESSAGES = {
  SUCCESS: 'Operation successful',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTRATION_SUCCESS: 'Registration successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  ACCOUNT_DELETED: 'Account deleted successfully',
  TOKEN_REFRESHED: 'Token refreshed successfully'
};

module.exports = {
  HTTP_CODES,
  ERROR_MESSAGES,
  PASSWORD_REQUIREMENTS,
  USER_ROLES,
  API_ROUTES,
  VALIDATION_RULES,
  PAGINATION,
  TOKEN,
  RESPONSE_MESSAGES
};
