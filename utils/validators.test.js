const {
  validateEmail,
  validatePassword,
  validateRequired,
  validateAge,
  validatePasswordMatch,
  validateName,
  validatePhone
} = require('./validators.js');

describe('Validators Utility Functions', () => {
  describe('validateEmail', () => {
    it('should accept valid email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('john.doe@company.co.uk')).toBe(true);
      expect(validateEmail('test+tag@domain.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('notanemail')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('user@domain')).toBe(false);
      expect(validateEmail('user @domain.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = validatePassword('StrongPass123');
      expect(result.isValid).toBe(true);
      expect(result.strength).toBe(100);
      expect(result.message).toBe('Strong');
      expect(result.errors.length).toBe(0);
    });

    it('should reject password without uppercase', () => {
      const result = validatePassword('lowercase123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Uppercase letter required');
    });

    it('should reject password without lowercase', () => {
      const result = validatePassword('UPPERCASE123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Lowercase letter required');
    });

    it('should reject password without number', () => {
      const result = validatePassword('NoNumbers');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Number required');
    });

    it('should reject password shorter than 8 characters', () => {
      const result = validatePassword('Short1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least 8 characters');
    });

    it('should reject empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Weak');
    });

    it('should calculate correct strength levels', () => {
      const weak = validatePassword('pass');
      const fair = validatePassword('lowercase123');
      const strong = validatePassword('StrongPass123');

      expect(weak.strength).toBeLessThan(50);
      expect(fair.strength).toBeGreaterThanOrEqual(50);
      expect(fair.strength).toBeLessThan(100);
      expect(strong.strength).toBe(100);
    });
  });

  describe('validateRequired', () => {
    it('should accept non-empty values', () => {
      expect(validateRequired('John', 'Name')).toBe(null);
      expect(validateRequired('test@example.com', 'Email')).toBe(null);
    });

    it('should reject empty strings', () => {
      expect(validateRequired('', 'Email')).toBe('Email is required');
    });

    it('should reject whitespace only', () => {
      expect(validateRequired('   ', 'Password')).toBe('Password is required');
    });

    it('should include field name in error message', () => {
      const error = validateRequired('', 'Username');
      expect(error).toContain('Username');
    });

    it('should reject null and undefined', () => {
      expect(validateRequired(null, 'Field')).toBe('Field is required');
      expect(validateRequired(undefined, 'Field')).toBe('Field is required');
    });
  });

  describe('validateAge', () => {
    it('should accept valid ages', () => {
      expect(validateAge(18)).toBe(true);
      expect(validateAge(25)).toBe(true);
      expect(validateAge(65)).toBe(true);
      expect(validateAge(120)).toBe(true);
    });

    it('should reject ages below minimum', () => {
      expect(validateAge(17)).toBe(false);
      expect(validateAge(0)).toBe(false);
      expect(validateAge(-5)).toBe(false);
    });

    it('should reject ages above maximum', () => {
      expect(validateAge(121)).toBe(false);
      expect(validateAge(150)).toBe(false);
    });

    it('should handle custom min and max ages', () => {
      expect(validateAge(16, 16, 65)).toBe(true);
      expect(validateAge(15, 16, 65)).toBe(false);
      expect(validateAge(66, 16, 65)).toBe(false);
    });

    it('should reject non-numeric values', () => {
      expect(validateAge('abc')).toBe(false);
      expect(validateAge(null)).toBe(false);
    });
  });

  describe('validatePasswordMatch', () => {
    it('should accept matching passwords', () => {
      expect(validatePasswordMatch('SecurePass123', 'SecurePass123')).toBe(null);
    });

    it('should reject non-matching passwords', () => {
      expect(validatePasswordMatch('SecurePass123', 'DifferentPass123')).toBe('Passwords do not match');
    });

    it('should be case-sensitive', () => {
      expect(validatePasswordMatch('Password123', 'password123')).toBe('Passwords do not match');
    });
  });

  describe('validateName', () => {
    it('should accept valid names', () => {
      expect(validateName('John Doe')).toBe(true);
      expect(validateName("Mary O'Brien")).toBe(true);
      expect(validateName('Jean-Paul')).toBe(true);
    });

    it('should reject invalid names', () => {
      expect(validateName('J')).toBe(false);
      expect(validateName('123')).toBe(false);
      expect(validateName('John@Doe')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should accept valid phone numbers', () => {
      expect(validatePhone('1234567890')).toBe(true);
      expect(validatePhone('+1-234-567-8900')).toBe(true);
      expect(validatePhone('12345678901234')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('abcdef')).toBe(false);
    });
  });
});
