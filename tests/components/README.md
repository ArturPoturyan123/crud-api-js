# Frontend Component Tests

Comprehensive React component tests using Jest and React Testing Library.

## Test Files

### LoginForm.test.js
Tests for the user login component.

**Positive Cases:**
- ✅ Form renders with all fields
- ✅ User can enter email and password
- ✅ Form submits with valid credentials
- ✅ Success message displays
- ✅ Submit button disables during loading

**Negative Cases:**
- ❌ Error if email missing
- ❌ Error if password missing
- ❌ Error for invalid email format
- ❌ Error on login failure (401)
- ❌ Error on network failure
- ❌ No submission if validation fails

**Total Tests:** 12

### RegisterForm.test.js
Tests for the user registration component.

**Positive Cases:**
- ✅ Form renders with all fields
- ✅ Password strength indicator works
- ✅ User can fill all fields
- ✅ Successful registration with valid data
- ✅ Success message displays

**Negative Cases:**
- ❌ Error if required fields empty
- ❌ Error if passwords don't match
- ❌ Error for weak password
- ❌ Error for invalid email
- ❌ Error if email already exists
- ❌ Error on server error
- ❌ No submission if validation fails

**Total Tests:** 12

## Running Tests

```bash
# Run all frontend component tests
npm test components

# Run specific test file
npm test LoginForm.test.js
npm test RegisterForm.test.js

# Run with coverage
npm test components -- --coverage

# Watch mode
npm run test:watch
```

## Test Framework & Libraries

- **Jest**: Test runner
- **React Testing Library**: Component testing
- **userEvent**: User interaction simulation

## Best Practices Applied

✅ AAA Pattern (Arrange-Act-Assert)
✅ User-centric testing (query by label, role)
✅ Mock external dependencies
✅ Async/await handling
✅ Error scenario coverage
✅ Both positive and negative cases
✅ Descriptive test names

## Mock Setup

External API calls are mocked using `jest.mock()`:

```javascript
jest.mock('../../services/api', () => ({
  loginUser: jest.fn(),
  registerUser: jest.fn(),
}));
```

## Query Selectors

Tests use accessible queries:

```javascript
// Good - accessible selectors
screen.getByLabelText(/email/i)
screen.getByRole('button', { name: /login/i })

// Avoid - implementation details
container.querySelector('#email')
wrapper.find('.login-button')
```

## Async Testing

Proper handling of async operations:

```javascript
await userEvent.type(input, 'text');
await userEvent.click(button);

await waitFor(() => {
  expect(mockFunction).toHaveBeenCalled();
});
```
