const {
  formatDate,
  formatDateTime,
  generateId,
  isEmpty,
  sanitizeUser,
  formatError,
  getPaginationParams,
  hashString,
  sleep,
  generateToken,
  verifyToken
} = require('./helpers.js');

describe('Helper Utility Functions', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-06-19');
      expect(formatDate(date)).toMatch(/2024-06-19/);
    });

    it('should handle date string input', () => {
      const result = formatDate('2024-06-19');
      expect(result).toMatch(/2024-06-19/);
    });

    it('should pad single digit months and days', () => {
      const date = new Date('2024-01-05');
      expect(formatDate(date)).toMatch(/2024-01-05/);
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time correctly', () => {
      const date = new Date('2024-06-19T14:30:45');
      const result = formatDateTime(date);
      expect(result).toMatch(/2024-06-19/);
      expect(result).toContain(':');
    });

    it('should pad all time components', () => {
      const date = new Date('2024-01-05T09:05:03');
      const result = formatDateTime(date);
      expect(result).toContain('09:05:03');
    });
  });

  describe('generateId', () => {
    it('should generate random IDs of correct length', () => {
      const id10 = generateId(10);
      const id20 = generateId(20);

      expect(id10.length).toBe(10);
      expect(id20.length).toBe(20);
    });

    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
    });

    it('should use default length of 10', () => {
      const id = generateId();
      expect(id.length).toBe(10);
    });
  });

  describe('isEmpty', () => {
    it('should identify empty values', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
    });

    it('should identify non-empty values', () => {
      expect(isEmpty('text')).toBe(false);
      expect(isEmpty([1, 2])).toBe(false);
      expect(isEmpty({ key: 'value' })).toBe(false);
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(false)).toBe(false);
    });
  });

  describe('sanitizeUser', () => {
    it('should remove password from user object', () => {
      const user = { id: '123', email: 'test@example.com', password: 'secret' };
      const sanitized = sanitizeUser(user);

      expect(sanitized).not.toHaveProperty('password');
      expect(sanitized.email).toBe('test@example.com');
    });

    it('should handle user with toObject method', () => {
      const user = {
        email: 'test@example.com',
        password: 'secret',
        toObject: function() {
          return { email: this.email, password: this.password };
        }
      };
      const sanitized = sanitizeUser(user);

      expect(sanitized).not.toHaveProperty('password');
    });

    it('should handle null user', () => {
      expect(sanitizeUser(null)).toBe(null);
    });
  });

  describe('formatError', () => {
    it('should format error object', () => {
      const error = { message: 'Test error', status: 400 };
      const formatted = formatError(error);

      expect(formatted.message).toBe('Test error');
      expect(formatted.status).toBe(400);
    });

    it('should format string error', () => {
      const formatted = formatError('Simple error');

      expect(formatted.message).toBe('Simple error');
      expect(formatted.status).toBe(400);
    });

    it('should use default status for missing status', () => {
      const error = new Error('Test error');
      const formatted = formatError(error);

      expect(formatted.status).toBe(500);
    });
  });

  describe('getPaginationParams', () => {
    it('should calculate pagination correctly', () => {
      const params = getPaginationParams(100, 1, 10);

      expect(params.page).toBe(1);
      expect(params.limit).toBe(10);
      expect(params.skip).toBe(0);
      expect(params.total).toBe(100);
      expect(params.totalPages).toBe(10);
    });

    it('should handle page 2', () => {
      const params = getPaginationParams(100, 2, 10);

      expect(params.skip).toBe(10);
      expect(params.page).toBe(2);
    });

    it('should enforce max limit', () => {
      const params = getPaginationParams(100, 1, 200);

      expect(params.limit).toBe(100);
    });

    it('should use default page and limit', () => {
      const params = getPaginationParams(100);

      expect(params.page).toBe(1);
      expect(params.limit).toBe(10);
    });

    it('should calculate correct total pages', () => {
      const params = getPaginationParams(25, 1, 10);

      expect(params.totalPages).toBe(3);
    });
  });

  describe('hashString', () => {
    it('should generate hash for string', () => {
      const hash1 = hashString('test');
      const hash2 = hashString('test');

      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe('string');
      expect(hash1.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for different strings', () => {
      const hash1 = hashString('test1');
      const hash2 = hashString('test2');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('sleep', () => {
    it('should delay execution', async () => {
      const start = Date.now();
      await sleep(100);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(100);
    });
  });

  describe('generateToken and verifyToken', () => {
    it('should generate and verify token', () => {
      const payload = { userId: '123', email: 'test@example.com' };
      const token = generateToken(payload);

      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('should verify valid token', () => {
      const payload = { userId: '123', email: 'test@example.com' };
      const token = generateToken(payload);
      const verified = verifyToken(token);

      expect(verified).not.toBe(null);
      expect(verified.userId).toBe('123');
      expect(verified.email).toBe('test@example.com');
    });

    it('should reject invalid token', () => {
      const verified = verifyToken('invalid.token.here');

      expect(verified).toBe(null);
    });

    it('should support custom expiry', () => {
      const payload = { userId: '123' };
      const token = generateToken(payload, '1h');

      expect(typeof token).toBe('string');
      const verified = verifyToken(token);
      expect(verified).not.toBe(null);
    });
  });
});
