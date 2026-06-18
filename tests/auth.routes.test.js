const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('../routes/authRoutes');
const userService = require('../services/user.service');
const { verifyToken } = require('../middleware/auth');

jest.mock('../services/user.service');
jest.mock('../middleware/auth');

describe('Authentication Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', authRoutes);
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register - Positive Cases', () => {
    it('should register user successfully with 201 status', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123',
        age: 25,
        address: '123 Main St'
      };

      userService.registerUser.mockResolvedValue({
        message: 'User registered successfully',
        user: {
          _id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user'
        },
        token: 'valid-jwt-token'
      });

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.token).toBe('valid-jwt-token');
      expect(userService.registerUser).toHaveBeenCalledWith(userData);
    });

    it('should return user data without password', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123'
      };

      userService.registerUser.mockResolvedValue({
        message: 'User registered successfully',
        user: {
          _id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com'
        },
        token: 'token'
      });

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Assert
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return valid JWT token', async () => {
      // Arrange
      userService.registerUser.mockResolvedValue({
        message: 'User registered successfully',
        user: {},
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      });

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePass123'
        });

      // Assert
      expect(response.body.token).toBeTruthy();
      expect(typeof response.body.token).toBe('string');
    });
  });

  describe('POST /api/auth/register - Negative Cases', () => {
    it('should return 400 for invalid password', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'weak'
      };

      const error = new Error('Password does not meet requirements');
      error.status = 400;
      error.details = ['Password must be at least 8 characters'];
      userService.registerUser.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Password does not meet requirements');
      expect(response.body.details).toBeDefined();
    });

    it('should return 400 if email already exists', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'SecurePass123'
      };

      const error = new Error('User with this email already exists');
      error.status = 400;
      userService.registerUser.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('email already exists');
    });

    it('should return 503 if database is not connected', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123'
      };

      const error = new Error('Database not connected');
      error.status = 503;
      userService.registerUser.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Assert
      expect(response.status).toBe(503);
      expect(response.body.message).toBe('Database not connected');
    });

    it('should handle unexpected errors with 400 status', async () => {
      // Arrange
      userService.registerUser.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePass123'
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Unexpected error');
    });
  });

  describe('POST /api/auth/login - Positive Cases', () => {
    it('should login user successfully with 200 status', async () => {
      // Arrange
      const loginData = {
        email: 'john@example.com',
        password: 'SecurePass123'
      };

      userService.loginUser.mockResolvedValue({
        message: 'Login successful',
        user: {
          _id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user'
        },
        token: 'valid-jwt-token'
      });

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeTruthy();
      expect(userService.loginUser).toHaveBeenCalledWith(loginData);
    });

    it('should not return password in login response', async () => {
      // Arrange
      userService.loginUser.mockResolvedValue({
        message: 'Login successful',
        user: {
          _id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com'
        },
        token: 'token'
      });

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'SecurePass123'
        });

      // Assert
      expect(response.body.user).not.toHaveProperty('password');
    });
  });

  describe('POST /api/auth/login - Negative Cases', () => {
    it('should return 401 for invalid credentials', async () => {
      // Arrange
      const error = new Error('Invalid email or password');
      error.status = 401;
      userService.loginUser.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'WrongPassword'
        });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should return 400 if email is missing', async () => {
      // Arrange
      const error = new Error('Email and password are required');
      error.status = 400;
      userService.loginUser.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'SecurePass123'
        });

      // Assert
      expect(response.status).toBe(400);
    });

    it('should return 400 if password is missing', async () => {
      // Arrange
      const error = new Error('Email and password are required');
      error.status = 400;
      userService.loginUser.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com'
        });

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/auth/test-token - Positive Cases', () => {
    it('should validate token and return user info', async () => {
      // Arrange
      verifyToken.mockImplementation((req, res, next) => {
        req.user = {
          userId: '507f1f77bcf86cd799439011',
          email: 'john@example.com'
        };
        next();
      });

      // Act
      const response = await request(app)
        .get('/api/auth/test-token')
        .set('Authorization', 'Bearer valid-token');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Token is valid');
      expect(response.body.user).toBeDefined();
    });
  });

  describe('GET /api/auth/test-token - Negative Cases', () => {
    it('should return 401 for missing token', async () => {
      // Arrange
      verifyToken.mockImplementation((req, res, next) => {
        res.status(401).json({
          message: 'Access denied. No token provided.'
        });
      });

      // Act
      const response = await request(app)
        .get('/api/auth/test-token');

      // Assert
      expect(response.status).toBe(401);
    });

    it('should return 401 for invalid token', async () => {
      // Arrange
      verifyToken.mockImplementation((req, res, next) => {
        res.status(401).json({
          message: 'Invalid token.'
        });
      });

      // Act
      const response = await request(app)
        .get('/api/auth/test-token')
        .set('Authorization', 'Bearer invalid-token');

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/profile - Positive Cases', () => {
    it('should return user profile when authenticated', async () => {
      // Arrange
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: '507f1f77bcf86cd799439011' };
        next();
      });

      // Act
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token');

      // Assert
      expect(verifyToken).toHaveBeenCalled();
    });
  });

  describe('PUT /api/auth/profile - Positive Cases', () => {
    it('should update user profile successfully', async () => {
      // Arrange
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: '507f1f77bcf86cd799439011' };
        next();
      });

      userService.updateCurrentUser.mockResolvedValue({
        message: 'Profile updated successfully',
        user: {
          _id: '507f1f77bcf86cd799439011',
          name: 'Updated Name'
        }
      });

      // Act
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: 'Updated Name' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Profile updated successfully');
    });
  });

  describe('DELETE /api/auth/profile - Positive Cases', () => {
    it('should delete user account successfully', async () => {
      // Arrange
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: '507f1f77bcf86cd799439011' };
        next();
      });

      userService.deleteCurrentUser.mockResolvedValue({
        message: 'Account deleted successfully'
      });

      // Act
      const response = await request(app)
        .delete('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Account deleted successfully');
    });
  });

  describe('POST /api/auth/refresh-token - Positive Cases', () => {
    it('should refresh token successfully', async () => {
      // Arrange
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: '507f1f77bcf86cd799439011' };
        next();
      });

      userService.refreshToken.mockResolvedValue({
        message: 'Token refreshed successfully',
        token: 'new-jwt-token',
        user: {
          _id: '507f1f77bcf86cd799439011',
          email: 'john@example.com'
        }
      });

      // Act
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .set('Authorization', 'Bearer valid-token');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Token refreshed successfully');
      expect(response.body.token).toBeTruthy();
    });
  });
});
