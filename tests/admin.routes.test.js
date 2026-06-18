const request = require('supertest');
const express = require('express');
const adminRoutes = require('../routes/adminRoutes');
const User = require('../models/user.model');
const { verifyToken } = require('../middleware/auth');

jest.mock('../models/user.model');
jest.mock('../middleware/auth');

describe('Admin Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', adminRoutes);
    jest.clearAllMocks();
  });

  describe('DELETE /api/admin/users - Positive Cases', () => {
    it('should delete all users successfully as admin', async () => {
      // Arrange
      const adminUser = {
        _id: '507f1f77bcf86cd799439010',
        role: 'admin'
      };

      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: adminUser._id };
        next();
      });

      User.findById.mockResolvedValue(adminUser);
      User.deleteMany.mockResolvedValue({ deletedCount: 5 });

      // Act
      const response = await request(app)
        .delete('/api/admin/users')
        .set('Authorization', 'Bearer admin-token');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('successfully');
      expect(response.body.usersDeleted).toBe(5);
    });

    it('should return deletion count in response', async () => {
      // Arrange
      const adminUser = { _id: '507f1f77bcf86cd799439010', role: 'admin' };

      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: adminUser._id };
        next();
      });

      User.findById.mockResolvedValue(adminUser);
      User.deleteMany.mockResolvedValue({ deletedCount: 10 });

      // Act
      const response = await request(app)
        .delete('/api/admin/users')
        .set('Authorization', 'Bearer admin-token');

      // Assert
      expect(response.body.usersDeleted).toBe(10);
    });
  });

  describe('DELETE /api/admin/users - Negative Cases', () => {
    it('should return 403 if user is not admin', async () => {
      // Arrange
      const regularUser = {
        _id: '507f1f77bcf86cd799439011',
        role: 'user'
      };

      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: regularUser._id };
        next();
      });

      User.findById.mockResolvedValue(regularUser);

      // Act
      const response = await request(app)
        .delete('/api/admin/users')
        .set('Authorization', 'Bearer user-token');

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Admin role required');
    });

    it('should return 401 if token is missing', async () => {
      // Arrange
      verifyToken.mockImplementation((req, res, next) => {
        res.status(401).json({
          message: 'Access denied. No token provided.'
        });
      });

      // Act
      const response = await request(app)
        .delete('/api/admin/users');

      // Assert
      expect(response.status).toBe(401);
    });

    it('should return 500 if database deletion fails', async () => {
      // Arrange
      const adminUser = {
        _id: '507f1f77bcf86cd799439010',
        role: 'admin'
      };

      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: adminUser._id };
        next();
      });

      User.findById.mockResolvedValue(adminUser);
      User.deleteMany.mockRejectedValue(new Error('Database error'));

      // Act
      const response = await request(app)
        .delete('/api/admin/users')
        .set('Authorization', 'Bearer admin-token');

      // Assert
      expect(response.status).toBe(500);
    });

    it('should not delete users if user not found', async () => {
      // Arrange
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'nonexistent-id' };
        next();
      });

      User.findById.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .delete('/api/admin/users')
        .set('Authorization', 'Bearer token');

      // Assert
      expect(response.status).toBe(403);
      expect(User.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/admin/users/:id - Positive Cases', () => {
    it('should delete specific user by ID', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const mockDeletedUser = {
        _id: userId,
        name: 'John Doe',
        email: 'john@example.com'
      };

      User.findByIdAndDelete.mockResolvedValue(mockDeletedUser);

      // Act
      const response = await request(app)
        .delete(`/api/admin/users/${userId}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted successfully');
      expect(User.findByIdAndDelete).toHaveBeenCalledWith(userId);
    });

    it('should pass userId to delete operation', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      User.findByIdAndDelete.mockResolvedValue({ _id: userId });

      // Act
      await request(app)
        .delete(`/api/admin/users/${userId}`);

      // Assert
      expect(User.findByIdAndDelete).toHaveBeenCalledWith(userId);
    });
  });

  describe('DELETE /api/admin/users/:id - Negative Cases', () => {
    it('should return 404 if user not found', async () => {
      // Arrange
      const userId = 'nonexistent-id';
      User.findByIdAndDelete.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .delete(`/api/admin/users/${userId}`);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.message).toContain('User not found');
    });

    it('should return 500 for database errors', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      User.findByIdAndDelete.mockRejectedValue(new Error('Database connection error'));

      // Act
      const response = await request(app)
        .delete(`/api/admin/users/${userId}`);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.message).toBeTruthy();
    });

    it('should handle invalid userId format', async () => {
      // Arrange
      const invalidUserId = 'invalid-format';
      User.findByIdAndDelete.mockRejectedValue(new Error('Invalid ID format'));

      // Act
      const response = await request(app)
        .delete(`/api/admin/users/${invalidUserId}`);

      // Assert
      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/auth/users - Positive Cases', () => {
    it('should return all users with proper authentication', async () => {
      // Arrange
      const mockUsers = [
        { _id: '1', name: 'User 1', email: 'user1@example.com' },
        { _id: '2', name: 'User 2', email: 'user2@example.com' }
      ];

      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: '507f1f77bcf86cd799439010' };
        next();
      });

      User.find.mockResolvedValue(mockUsers);

      // Act
      const response = await request(app)
        .get('/api/auth/users')
        .set('Authorization', 'Bearer token');

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it('should call User.find with empty filter', async () => {
      // Arrange
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'user-id' };
        next();
      });

      User.find.mockResolvedValue([]);

      // Act
      await request(app)
        .get('/api/auth/users')
        .set('Authorization', 'Bearer token');

      // Assert
      expect(User.find).toHaveBeenCalledWith({});
    });
  });

  describe('GET /api/auth/users - Negative Cases', () => {
    it('should return 401 without token', async () => {
      // Arrange
      verifyToken.mockImplementation((req, res, next) => {
        res.status(401).json({
          message: 'Access denied. No token provided.'
        });
      });

      // Act
      const response = await request(app)
        .get('/api/auth/users');

      // Assert
      expect(response.status).toBe(401);
    });

    it('should return 500 on database error', async () => {
      // Arrange
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'user-id' };
        next();
      });

      User.find.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const response = await request(app)
        .get('/api/auth/users')
        .set('Authorization', 'Bearer token');

      // Assert
      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/auth/users/:id - Positive Cases', () => {
    it('should return user by ID', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const mockUser = {
        _id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user'
      };

      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'other-user' };
        next();
      });

      User.findById.mockResolvedValue(mockUser);

      // Act
      const response = await request(app)
        .get(`/api/auth/users/${userId}`)
        .set('Authorization', 'Bearer token');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body._id).toBe(userId);
      expect(User.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('GET /api/auth/users/:id - Negative Cases', () => {
    it('should return 404 if user not found', async () => {
      // Arrange
      const userId = 'nonexistent-id';

      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'other-user' };
        next();
      });

      User.findById.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .get(`/api/auth/users/${userId}`)
        .set('Authorization', 'Bearer token');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.message).toContain('User not found');
    });

    it('should return 401 without token', async () => {
      // Arrange
      verifyToken.mockImplementation((req, res, next) => {
        res.status(401).json({
          message: 'Access denied. No token provided.'
        });
      });

      // Act
      const response = await request(app)
        .get('/api/auth/users/507f1f77bcf86cd799439011');

      // Assert
      expect(response.status).toBe(401);
    });

    it('should return 500 on database error', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';

      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'other-user' };
        next();
      });

      User.findById.mockRejectedValue(new Error('Database error'));

      // Act
      const response = await request(app)
        .get(`/api/auth/users/${userId}`)
        .set('Authorization', 'Bearer token');

      // Assert
      expect(response.status).toBe(500);
    });
  });
});
