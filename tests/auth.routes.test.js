const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/authRoutes');
const userService = require('../services/user.service');
const { verifyToken } = require('../middleware/auth');

jest.mock('../services/user.service');
jest.mock('../middleware/auth');

describe('Authentication Routes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/', authRoutes);
  }, 10000);

  describe('POST /api/auth/register', () => {
    it('should register user successfully', async () => {
      userService.registerUser.mockResolvedValue({
        message: 'User registered successfully',
        user: { _id: '1', email: 'test@example.com' },
        token: 'jwt-token'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePass123'
        });

      expect(response.status).toBe(201);
      expect(response.body.token).toBeTruthy();
    });

    it('should return 400 for weak password', async () => {
      const error = new Error('Password does not meet requirements');
      error.status = 400;
      userService.registerUser.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak'
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for duplicate email', async () => {
      const error = new Error('User with this email already exists');
      error.status = 400;
      userService.registerUser.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'SecurePass123'
        });

      expect(response.status).toBe(400);
    });

    it('should return 503 if database not connected', async () => {
      const error = new Error('Database not connected');
      error.status = 503;
      userService.registerUser.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123'
        });

      expect(response.status).toBe(503);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully', async () => {
      userService.loginUser.mockResolvedValue({
        message: 'Login successful',
        user: { _id: '1', email: 'test@example.com' },
        token: 'jwt-token'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'SecurePass123'
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeTruthy();
    });

    it('should return 401 for invalid credentials', async () => {
      const error = new Error('Invalid email or password');
      error.status = 401;
      userService.loginUser.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'WrongPassword'
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 if email missing', async () => {
      const error = new Error('Email and password are required');
      error.status = 400;
      userService.loginUser.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'test' });

      expect(response.status).toBe(400);
    });

    it('should return 400 if password missing', async () => {
      const error = new Error('Email and password are required');
      error.status = 400;
      userService.loginUser.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/auth/test-token', () => {
    it('should validate token', (done) => {
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: '1' };
        next();
      });

      request(app)
        .get('/api/auth/test-token')
        .set('Authorization', 'Bearer token')
        .expect(200)
        .end((err) => {
          if (err) return done(err);
          done();
        });
    });

    it('should return 401 without token', (done) => {
      verifyToken.mockImplementation((req, res) => {
        res.status(401).json({ message: 'Access denied' });
      });

      request(app)
        .get('/api/auth/test-token')
        .expect(401)
        .end((err) => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return user profile', (done) => {
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: '1' };
        next();
      });

      request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer token')
        .end((err) => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update profile', async () => {
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: '1' };
        next();
      });

      userService.updateCurrentUser.mockResolvedValue({
        message: 'Profile updated successfully',
        user: { _id: '1' }
      });

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', 'Bearer token')
        .send({ name: 'New Name' });

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/auth/profile', () => {
    it('should delete account', async () => {
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: '1' };
        next();
      });

      userService.deleteCurrentUser.mockResolvedValue({
        message: 'Account deleted successfully'
      });

      const response = await request(app)
        .delete('/api/auth/profile')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should refresh token', async () => {
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: '1' };
        next();
      });

      userService.refreshToken.mockResolvedValue({
        message: 'Token refreshed successfully',
        token: 'new-token'
      });

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.token).toBeTruthy();
    });
  });
});
