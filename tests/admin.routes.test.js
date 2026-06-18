const request = require('supertest');
const express = require('express');
const adminRoutes = require('../routes/adminRoutes');
const User = require('../models/user.model');
const { verifyToken } = require('../middleware/auth');

jest.mock('../models/user.model');
jest.mock('../middleware/auth');

jest.setTimeout(10000);

describe('Admin Routes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/', adminRoutes);
  });

  describe('DELETE /api/admin/users', () => {
    it('should delete all users as admin', (done) => {
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'admin-id' };
        next();
      });

      User.findById.mockResolvedValue({ _id: 'admin-id', role: 'admin' });
      User.deleteMany.mockResolvedValue({ deletedCount: 5 });

      request(app)
        .delete('/api/admin/users')
        .set('Authorization', 'Bearer token')
        .expect(200)
        .expect((res) => {
          if (res.body.usersDeleted !== 5) {
            throw new Error(`Expected 5 users deleted, got ${res.body.usersDeleted}`);
          }
        })
        .end(done);
    });

    it('should return 403 for non-admin user', (done) => {
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'user-id' };
        next();
      });

      User.findById.mockResolvedValue({ _id: 'user-id', role: 'user' });

      request(app)
        .delete('/api/admin/users')
        .set('Authorization', 'Bearer token')
        .expect(403)
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
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'admin-id' };
        next();
      });

      User.findById.mockResolvedValue({ _id: 'admin-id', role: 'admin' });
      User.deleteMany.mockRejectedValue(new Error('Database error'));

      request(app)
        .delete('/api/admin/users')
        .set('Authorization', 'Bearer token')
        .expect(500)
        .end(done);
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    it('should delete specific user', (done) => {
      User.findByIdAndDelete.mockResolvedValue({
        _id: 'user-id',
        name: 'John'
      });

      request(app)
        .delete('/api/admin/users/user-id')
        .expect(200)
        .end(done);
    });

    it('should return 404 if user not found', (done) => {
      User.findByIdAndDelete.mockResolvedValue(null);

      request(app)
        .delete('/api/admin/users/nonexistent-id')
        .expect(404)
        .end(done);
    });

    it('should return 500 on database error', (done) => {
      User.findByIdAndDelete.mockRejectedValue(new Error('DB error'));

      request(app)
        .delete('/api/admin/users/user-id')
        .expect(500)
        .end(done);
    });
  });

  describe('GET /api/auth/users', () => {
    it('should return all users', (done) => {
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'user-id' };
        next();
      });

      User.find.mockResolvedValue([
        { _id: '1', name: 'User 1' },
        { _id: '2', name: 'User 2' }
      ]);

      request(app)
        .get('/api/auth/users')
        .set('Authorization', 'Bearer token')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          if (!Array.isArray(res.body) || res.body.length !== 2) {
            return done(new Error('Expected 2 users'));
          }
          done();
        });
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

  describe('GET /api/auth/users/:id', () => {
    it('should return user by ID', (done) => {
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'user-id' };
        next();
      });

      User.findById.mockResolvedValue({
        _id: 'user-123',
        name: 'John Doe'
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
