import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../../components/LoginForm';

jest.mock('../../services/api', () => ({
  loginUser: jest.fn(),
}));

const mockLoginUser = require('../../services/api').loginUser;

describe('LoginForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Positive Cases - Happy Path', () => {
    it('should render login form with all fields', () => {
      render(<LoginForm />);
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('should allow user to enter email and password', async () => {
      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await userEvent.type(emailInput, 'john@example.com');
      await userEvent.type(passwordInput, 'SecurePass123');
      
      expect(emailInput).toHaveValue('john@example.com');
      expect(passwordInput).toHaveValue('SecurePass123');
    });

    it('should submit form with valid credentials', async () => {
      mockLoginUser.mockResolvedValue({
        message: 'Login successful',
        token: 'jwt-token-123',
        user: { id: '1', email: 'john@example.com' }
      });

      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      await userEvent.type(emailInput, 'john@example.com');
      await userEvent.type(passwordInput, 'SecurePass123');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockLoginUser).toHaveBeenCalledWith({
          email: 'john@example.com',
          password: 'SecurePass123'
        });
      });
    });

    it('should show success message on successful login', async () => {
      mockLoginUser.mockResolvedValue({
        message: 'Login successful',
        token: 'jwt-token-123'
      });

      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      await userEvent.type(emailInput, 'john@example.com');
      await userEvent.type(passwordInput, 'SecurePass123');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/login successful/i)).toBeInTheDocument();
      });
    });
  });

  describe('Negative Cases - Error Handling', () => {
    it('should show error if email is missing', async () => {
      render(<LoginForm />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      await userEvent.type(passwordInput, 'SecurePass123');
      await userEvent.click(submitButton);
      
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    it('should show error if password is missing', async () => {
      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      await userEvent.type(emailInput, 'john@example.com');
      await userEvent.click(submitButton);
      
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    it('should show error for invalid email format', async () => {
      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      await userEvent.type(emailInput, 'invalid-email');
      await userEvent.click(submitButton);
      
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });

    it('should display error message on login failure (401)', async () => {
      mockLoginUser.mockRejectedValue({
        message: 'Invalid email or password'
      });

      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      await userEvent.type(emailInput, 'john@example.com');
      await userEvent.type(passwordInput, 'WrongPassword');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });

    it('should display network error message', async () => {
      mockLoginUser.mockRejectedValue(new Error('Network error'));

      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      await userEvent.type(emailInput, 'john@example.com');
      await userEvent.type(passwordInput, 'SecurePass123');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should not submit form if validation fails', async () => {
      render(<LoginForm />);
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      await userEvent.click(submitButton);
      
      expect(mockLoginUser).not.toHaveBeenCalled();
    });
  });
});
