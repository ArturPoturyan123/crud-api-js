/**
 * Validation utility functions
 * Pure functions for validating user input
 */

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  let strength = 0;
  const errors = [];

  if (!password) {
    return { isValid: false, errors: ['Password is required'], strength: 0, message: 'Weak' };
  }

  if (password.length >= 8) strength += 25;
  else errors.push('At least 8 characters');

  if (/[a-z]/.test(password)) strength += 25;
  else errors.push('Lowercase letter required');

  if (/[A-Z]/.test(password)) strength += 25;
  else errors.push('Uppercase letter required');

  if (/[0-9]/.test(password)) strength += 25;
  else errors.push('Number required');

  const message = strength === 100 ? 'Strong' : strength >= 75 ? 'Good' : strength >= 50 ? 'Fair' : 'Weak';

  return { isValid: strength === 100, errors, strength, message };
};

const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

const validateAge = (age, minAge = 18, maxAge = 120) => {
  const numAge = parseInt(age, 10);
  return !isNaN(numAge) && numAge >= minAge && numAge <= maxAge;
};

const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
  return nameRegex.test(name);
};

const validatePhone = (phone) => {
  const phoneRegex = /^\d{10,15}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

module.exports = {
  validateEmail,
  validatePassword,
  validateRequired,
  validateAge,
  validatePasswordMatch,
  validateName,
  validatePhone
};
