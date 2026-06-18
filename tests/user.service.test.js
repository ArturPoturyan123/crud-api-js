const userService = require('../services/user.service');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../models/user.model');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

describe('User Service Tests', () => {
  let mockUser;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock mongoose connection state
    mongoose.connection.readyState = 1;

    mockUser = {
      _id: 'test-user-id',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword123',
      age: 25,
      address: '123 Main St',
      role: 'user',
      toObject: jest.fn().mockReturnValue({
        _id: 'test-user-id',
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
        address: '123 Main St',
        role: 'user'
      })
    };
  });

  describe('registerUser', () => {
    describe('positive cases', () => {
      it('should register user successfully with valid data', async () => {
        const userData = {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePass123',
          age: 25
        };

        User.findOne.mockResolvedValue(null);
        bcrypt.genSalt.mockResolvedValue('salt');
        bcrypt.hash.mockResolvedValue('hashed');
        User.create.mockResolvedValue(mockUser);
        jwt.sign.mockReturnValue('token');

        const result = await userService.registerUser(userData);

        expect(result.message).toBe('User registered successfully');
        expect(result.user).toBeDefined();
        expect(result.token).toBe('token');
      });

      it('should hash password correctly', async () => {
        const userData = {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePass123'
        };

        User.findOne.mockResolvedValue(null);
        bcrypt.genSalt.mockResolvedValue('salt');
        bcrypt.hash.mockResolvedValue('hashed');
        User.create.mockResolvedValue(mockUser);
        jwt.sign.mockReturnValue('token');

        await userService.registerUser(userData);

        expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
        expect(bcrypt.hash).toHaveBeenCalled();
      });

      it('should generate JWT token', async () => {
        const userData = {
          email: 'john@example.com',
          password: 'SecurePass123'
        };

        User.findOne.mockResolvedValue(null);
        bcrypt.genSalt.mockResolvedValue('salt');
        bcrypt.hash.mockResolvedValue('hashed');
        User.create.mockResolvedValue(mockUser);
        jwt.sign.mockReturnValue('valid-token');

        const result = await userService.registerUser(userData);

        expect(jwt.sign).toHaveBeenCalled();
        expect(result.token).toBe('valid-token');
      });
    });

    describe('negative cases', () => {
      it('should throw error if database not connected', async () => {
        mongoose.connection.readyState = 0;

        await expect(
          userService.registerUser({ email: 'test@example.com', password: 'Pass123' })
        ).rejects.toThrow('Database not connected');
      });

      it('should throw error if email is missing', async () => {
        await expect(
          userService.registerUser({ password: 'SecurePass123' })
        ).rejects.toThrow('Email and password are required');
      });

      it('should throw error if password is missing', async () => {
        await expect(
          userService.registerUser({ email: 'test@example.com' })
        ).rejects.toThrow('Email and password are required');
      });

      it('should throw error for weak password', async () => {
        User.findOne.mockResolvedValue(null);

        await expect(
          userService.registerUser({
            email: 'test@example.com',
            password: 'weak'
          })
        ).rejects.toThrow('Password does not meet requirements');
      });

      it('should throw error if email already exists', async () => {
        User.findOne.mockResolvedValue(mockUser);

        await expect(
          userService.registerUser({
            email: 'john@example.com',
            password: 'SecurePass123'
          })
        ).rejects.toThrow('User with this email already exists');
      });
    });
  });

  describe('loginUser', () => {
    describe('positive cases', () => {
      it('should login successfully with valid credentials', async () => {
        User.findOne.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('token');

        const result = await userService.loginUser({
          email: 'john@example.com',
          password: 'SecurePass123'
        });

        expect(result.message).toBe('Login successful');
        expect(result.token).toBe('token');
      });

      it('should not return password in response', async () => {
        User.findOne.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('token');

        const result = await userService.loginUser({
          email: 'john@example.com',
          password: 'SecurePass123'
        });

        expect(result.user).not.toHaveProperty('password');
      });
    });

    describe('negative cases', () => {
      it('should throw error for missing email', async () => {
        await expect(
          userService.loginUser({ password: 'test' })
        ).rejects.toThrow('Email and password are required');
      });

      it('should throw error for missing password', async () => {
        await expect(
          userService.loginUser({ email: 'test@example.com' })
        ).rejects.toThrow('Email and password are required');
      });

      it('should throw error if user not found', async () => {
        User.findOne.mockResolvedValue(null);

        await expect(
          userService.loginUser({
            email: 'nonexistent@example.com',
            password: 'SecurePass123'
          })
        ).rejects.toThrow('Invalid email or password');
      });

      it('should throw error if password is incorrect', async () => {
        User.findOne.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(false);

        await expect(
          userService.loginUser({
            email: 'john@example.com',
            password: 'WrongPassword'
          })
        ).rejects.toThrow('Invalid email or password');
      });
    });
  });

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = userService.validatePassword('ValidPass123');
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should reject short password', () => {
      const result = userService.validatePassword('Short1');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject password without uppercase', () => {
      const result = userService.validatePassword('lowercase123');
      expect(result.isValid).toBe(false);
    });

    it('should reject password without lowercase', () => {
      const result = userService.validatePassword('UPPERCASE123');
      expect(result.isValid).toBe(false);
    });

    it('should reject password without number', () => {
      const result = userService.validatePassword('NoNumbers');
      expect(result.isValid).toBe(false);
    });
  });

  describe('updateCurrentUser', () => {
    it('should update user profile successfully', async () => {
      User.findById.mockResolvedValue(mockUser);
      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const result = await userService.updateCurrentUser('test-user-id', {
        name: 'Updated Name'
      });

      expect(result.message).toBe('Profile updated successfully');
    });

    it('should throw error if userId missing', async () => {
      await expect(
        userService.updateCurrentUser(null, { name: 'test' })
      ).rejects.toThrow('Authentication failed');
    });

    it('should throw error if user not found', async () => {
      User.findById.mockResolvedValue(null);

      await expect(
        userService.updateCurrentUser('nonexistent-id', { name: 'test' })
      ).rejects.toThrow('User not found');
    });

    it('should reject invalid age', async () => {
      User.findById.mockResolvedValue(mockUser);

      await expect(
        userService.updateCurrentUser('test-user-id', { age: 150 })
      ).rejects.toThrow('Invalid age value');
    });
  });

  describe('deleteCurrentUser', () => {
    it('should delete user successfully', async () => {
      User.findByIdAndDelete.mockResolvedValue(mockUser);

      const result = await userService.deleteCurrentUser('test-user-id');

      expect(result.message).toBe('Account deleted successfully');
    });

    it('should throw error if userId missing', async () => {
      await expect(
        userService.deleteCurrentUser(null)
      ).rejects.toThrow('Authentication failed');
    });

    it('should throw error if user not found', async () => {
      User.findByIdAndDelete.mockResolvedValue(null);

      await expect(
        userService.deleteCurrentUser('nonexistent-id')
      ).rejects.toThrow('User not found');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      jwt.sign.mockReturnValue('new-token');

      const result = await userService.refreshToken('test-user-id');

      expect(result.message).toBe('Token refreshed successfully');
      expect(result.token).toBe('new-token');
    });

    it('should throw error if user not found', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await expect(
        userService.refreshToken('nonexistent-id')
      ).rejects.toThrow('User not found');
    });
  });
});
