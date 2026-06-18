import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '../../components/RegisterForm';

jest.mock('../../services/api', () => ({
  registerUser: jest.fn(),
}));

const mockRegisterUser = require('../../services/api').registerUser;

describe('RegisterForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Positive Cases - Happy Path', () => {
    it('should render registration form with all fields', () => {
      render(<RegisterForm />);
      
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    it('should display password strength indicator', async () => {
      render(<RegisterForm />);
      
      const passwordInput = screen.getByLabelText(/^password/i);
      
      await userEvent.type(passwordInput, 'Weak');
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      
      await userEvent.clear(passwordInput);
      await userEvent.type(passwordInput, 'SecurePass123');
      expect(screen.queryByText(/password must be at least 8 characters/i)).not.toBeInTheDocument();
    });

    it('should allow user to fill all fields', async () => {
      render(<RegisterForm />);
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/^email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      
      await userEvent.type(firstNameInput, 'John');
      await userEvent.type(lastNameInput, 'Doe');
      await userEvent.type(emailInput, 'john@example.com');
      await userEvent.type(passwordInput, 'SecurePass123');
      await userEvent.type(confirmPasswordInput, 'SecurePass123');
      
      expect(firstNameInput).toHaveValue('John');
      expect(lastNameInput).toHaveValue('Doe');
      expect(emailInput).toHaveValue('john@example.com');
      expect(passwordInput).toHaveValue('SecurePass123');
      expect(confirmPasswordInput).toHaveValue('SecurePass123');
    });

    it('should successfully register user with valid data', async () => {
      mockRegisterUser.mockResolvedValue({
        message: 'User registered successfully',
        token: 'jwt-token-123',
        user: { id: '1', email: 'john@example.com', name: 'John Doe' }
      });

      render(<RegisterForm />);
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/^email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /register/i });
      
      await userEvent.type(firstNameInput, 'John');
      await userEvent.type(lastNameInput, 'Doe');
      await userEvent.type(emailInput, 'john@example.com');
      await userEvent.type(passwordInput, 'SecurePass123');
      await userEvent.type(confirmPasswordInput, 'SecurePass123');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockRegisterUser).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePass123'
        });
      });
    });

    it('should show success message after registration', async () => {
      mockRegisterUser.mockResolvedValue({
        message: 'User registered successfully',
        token: 'jwt-token-123'
      });

      render(<RegisterForm />);
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/^email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /register/i });
      
      await userEvent.type(firstNameInput, 'John');
      await userEvent.type(lastNameInput, 'Doe');
      await userEvent.type(emailInput, 'john@example.com');
      await userEvent.type(passwordInput, 'SecurePass123');
      await userEvent.type(confirmPasswordInput, 'SecurePass123');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/user registered successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Negative Cases - Error Handling', () => {
    it('should show error if required fields are empty', async () => {
      render(<RegisterForm />);
      
      const submitButton = screen.getByRole('button', { name: /register/i });
      await userEvent.click(submitButton);
      
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    it('should show error if passwords do not match', async () => {
      render(<RegisterForm />);
      
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /register/i });
      
      await userEvent.type(passwordInput, 'SecurePass123');
      await userEvent.type(confirmPasswordInput, 'DifferentPass123');
      await userEvent.click(submitButton);
      
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    it('should show error for weak password', async () => {
      render(<RegisterForm />);
      
      const passwordInput = screen.getByLabelText(/^password/i);
      
      await userEvent.type(passwordInput, 'weak');
      
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });

    it('should show error for invalid email format', async () => {
      render(<RegisterForm />);
      
      const emailInput = screen.getByLabelText(/^email/i);
      const submitButton = screen.getByRole('button', { name: /register/i });
      
      await userEvent.type(emailInput, 'invalid-email');
      await userEvent.click(submitButton);
      
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });

    it('should show error if email already exists', async () => {
      mockRegisterUser.mockRejectedValue({
        message: 'User with this email already exists'
      });

      render(<RegisterForm />);
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/^email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /register/i });
      
      await userEvent.type(firstNameInput, 'John');
      await userEvent.type(lastNameInput, 'Doe');
      await userEvent.type(emailInput, 'existing@example.com');
      await userEvent.type(passwordInput, 'SecurePass123');
      await userEvent.type(confirmPasswordInput, 'SecurePass123');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      });
    });

    it('should show error message on server error', async () => {
      mockRegisterUser.mockRejectedValue({
        message: 'Server error - please try again later'
      });

      render(<RegisterForm />);
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/^email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /register/i });
      
      await userEvent.type(firstNameInput, 'John');
      await userEvent.type(lastNameInput, 'Doe');
      await userEvent.type(emailInput, 'john@example.com');
      await userEvent.type(passwordInput, 'SecurePass123');
      await userEvent.type(confirmPasswordInput, 'SecurePass123');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });
    });

    it('should not submit if validation fails', async () => {
      render(<RegisterForm />);
      
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /register/i });
      
      await userEvent.type(passwordInput, 'weak');
      await userEvent.click(submitButton);
      
      expect(mockRegisterUser).not.toHaveBeenCalled();
    });
  });
});
