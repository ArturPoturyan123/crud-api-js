const request = require('supertest');
const express = require('express');
const adminRoutes = require('../routes/adminRoutes');
const authRoutes = require('../routes/authRoutes');
const User = require('../models/user.model');
const { verifyToken } = require('../middleware/auth');

jest.mock('../models/user.model');
jest.mock('../middleware/auth');

jest.setTimeout(15000);

describe('Admin Routes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/', adminRoutes);
    app.use('/', authRoutes);
  });

  describe('DELETE /api/admin/users (Admin Only)', () => {
    it('should delete all users as admin', (done) => {
      // Mock the admin user
      const adminUser = { _id: 'admin-id', role: 'admin' };

      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'admin-id' };
        next();
      });

      // First call returns admin user for role check
      // Second call returns result object
      User.findById.mockResolvedValue(adminUser);
      User.deleteMany.mockResolvedValue({ deletedCount: 5 });

      request(app)
        .delete('/api/admin/users')
        .set('Authorization', 'Bearer token')
        .expect(200)
        .expect((res) => {
          if (res.body.deletedCount !== 5) {
            throw new Error(`Expected deletedCount: 5, got ${res.body.deletedCount}`);
          }
        })
        .end(done);
    });

    it('should return 403 for non-admin user', (done) => {
      const regularUser = { _id: 'user-id', role: 'user' };

      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'user-id' };
        next();
      });

      User.findById.mockResolvedValue(regularUser);

      request(app)
        .delete('/api/admin/users')
        .set('Authorization', 'Bearer token')
        .expect(403)
        .expect((res) => {
          if (res.body.message !== 'Admin role required') {
            throw new Error('Expected admin role required message');
          }
        })
        .end(done);
    });

    it('should return 401 without token', (done) => {
      verifyToken.mockImplementation((req, res) => {
        res.status(401).json({ message: 'Access denied' });
      });

      request(app)
        .delete('/api/admin/users')
        .expect(401)
        .end(done);
    });

    it('should return 500 on database error', (done) => {
      const adminUser = { _id: 'admin-id', role: 'admin' };

      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'admin-id' };
        next();
      });

      User.findById.mockResolvedValue(adminUser);
      User.deleteMany.mockRejectedValue(new Error('Database error'));

      request(app)
        .delete('/api/admin/users')
        .set('Authorization', 'Bearer token')
        .expect(500)
        .end(done);
    });
  });

  describe('DELETE /api/admin/users/:id (Admin Only)', () => {
    it('should delete specific user by ID as admin', (done) => {
      const adminUser = { _id: 'admin-id', role: 'admin' };

      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'admin-id' };
        next();
      });

      User.findById.mockResolvedValue(adminUser);
      User.findByIdAndDelete.mockResolvedValue({
        _id: 'user-to-delete',
        name: 'John Doe'
      });

      request(app)
        .delete('/api/admin/users/user-to-delete')
        .set('Authorization', 'Bearer token')
        .expect(200)
        .expect((res) => {
          if (!res.body.message.includes('deleted successfully')) {
            throw new Error('Expected success message');
          }
        })
        .end(done);
    });

    it('should return 403 for non-admin user', (done) => {
      const regularUser = { _id: 'user-id', role: 'user' };

      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'user-id' };
        next();
      });

      User.findById.mockResolvedValue(regularUser);

      request(app)
        .delete('/api/admin/users/some-user-id')
        .set('Authorization', 'Bearer token')
        .expect(403)
        .end(done);
    });

    it('should return 404 if user not found', (done) => {
      const adminUser = { _id: 'admin-id', role: 'admin' };

      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'admin-id' };
        next();
      });

      User.findById.mockResolvedValue(adminUser);
      User.findByIdAndDelete.mockResolvedValue(null);

      request(app)
        .delete('/api/admin/users/nonexistent-id')
        .set('Authorization', 'Bearer token')
        .expect(404)
        .end(done);
    });

    it('should return 500 on database error', (done) => {
      const adminUser = { _id: 'admin-id', role: 'admin' };

      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'admin-id' };
        next();
      });

      User.findById.mockResolvedValue(adminUser);
      User.findByIdAndDelete.mockRejectedValue(new Error('Database error'));

      request(app)
        .delete('/api/admin/users/user-id')
        .set('Authorization', 'Bearer token')
        .expect(500)
        .end(done);
    });
  });
});

describe('Protected User Routes (in authRoutes)', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/', authRoutes);
  });

  describe('GET /api/auth/users (Protected)', () => {
    it('should return all users when authenticated', (done) => {
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'user-id' };
        next();
      });

      User.find.mockResolvedValue([
        { _id: '1', name: 'User 1', email: 'user1@example.com' },
        { _id: '2', name: 'User 2', email: 'user2@example.com' }
      ]);

      request(app)
        .get('/api/auth/users')
        .set('Authorization', 'Bearer token')
        .expect(200)
        .expect((res) => {
          if (!Array.isArray(res.body) || res.body.length !== 2) {
            throw new Error(`Expected array of 2 users, got ${res.body}`);
          }
        })
        .end(done);
    });

    it('should return 401 without token', (done) => {
      verifyToken.mockImplementation((req, res) => {
        res.status(401).json({ message: 'Access denied' });
      });

      request(app)
        .get('/api/auth/users')
        .expect(401)
        .end(done);
    });

    it('should return 500 on database error', (done) => {
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'user-id' };
        next();
      });

      User.find.mockRejectedValue(new Error('DB error'));

      request(app)
        .get('/api/auth/users')
        .set('Authorization', 'Bearer token')
        .expect(500)
        .end(done);
    });
  });

  describe('GET /api/auth/users/:id (Protected)', () => {
    it('should return user by ID when authenticated', (done) => {
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'user-id' };
        next();
      });

      User.findById.mockResolvedValue({
        _id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com'
      });

      request(app)
        .get('/api/auth/users/user-123')
        .set('Authorization', 'Bearer token')
        .expect(200)
        .expect((res) => {
          if (res.body._id !== 'user-123') {
            throw new Error('User ID mismatch');
          }
        })
        .end(done);
    });

    it('should return 404 if user not found', (done) => {
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'user-id' };
        next();
      });

      User.findById.mockResolvedValue(null);

      request(app)
        .get('/api/auth/users/nonexistent-id')
        .set('Authorization', 'Bearer token')
        .expect(404)
        .end(done);
    });

    it('should return 401 without token', (done) => {
      verifyToken.mockImplementation((req, res) => {
        res.status(401).json({ message: 'Access denied' });
      });

      request(app)
        .get('/api/auth/users/user-id')
        .expect(401)
        .end(done);
    });

    it('should return 500 on database error', (done) => {
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'user-id' };
        next();
      });

      User.findById.mockRejectedValue(new Error('DB error'));

      request(app)
        .get('/api/auth/users/user-id')
        .set('Authorization', 'Bearer token')
        .expect(500)
        .end(done);
    });
  });
});
