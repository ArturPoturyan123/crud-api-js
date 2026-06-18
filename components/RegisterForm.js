import React, { useState } from 'react';
import { registerUser } from '../services/api';

/**
 * RegisterForm Component
 * Handles user registration with password strength validation and confirmation
 */
const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    const errors = [];

    if (!password) {
      return { strength: 0, errors: ['Password is required'], message: 'Weak' };
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

    return { strength, errors, message };
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const pwdValidation = calculatePasswordStrength(formData.password);
      if (pwdValidation.strength !== 100) {
        newErrors.password = 'Password does not meet requirements';
      }
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Please confirm your password';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { passwordConfirm, ...registrationData } = formData;
      const result = await registerUser(registrationData);
      setSuccessMessage('Registration successful');
      localStorage.setItem('token', result.token);
      setFormData({ name: '', email: '', password: '', passwordConfirm: '' });
      setPasswordStrength(null);
      // Redirect to login or dashboard
    } catch (err) {
      setErrors({ form: err.message || 'Network error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
        />
        {errors.name && <span>{errors.name}</span>}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
        />
        {errors.email && <span>{errors.email}</span>}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
        />
        {passwordStrength && (
          <div>
            <div>Strength: {passwordStrength.message}</div>
            {passwordStrength.errors.length > 0 && (
              <ul>
                {passwordStrength.errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        {errors.password && <span>{errors.password}</span>}
      </div>

      <div>
        <label htmlFor="passwordConfirm">Confirm Password</label>
        <input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          value={formData.passwordConfirm}
          onChange={handleChange}
          disabled={isLoading}
        />
        {errors.passwordConfirm && <span>{errors.passwordConfirm}</span>}
      </div>

      {successMessage && <div>{successMessage}</div>}
      {errors.form && <div>{errors.form}</div>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

export default RegisterForm;
