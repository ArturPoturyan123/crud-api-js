# Unit Tests - Best Practices Guide

This test suite demonstrates **senior engineer** testing practices with comprehensive coverage of positive and negative test cases.

## 📊 Test Structure

```
tests/
├── user.service.test.js    # Service layer tests (business logic)
├── auth.routes.test.js     # Auth route tests (HTTP layer)
├── admin.routes.test.js    # Admin route tests (HTTP layer)
└── README.md              # This file
```

---

## 🎯 Test Statistics

| File | Tests | Coverage |
|------|-------|----------|
| user.service.test.js | 40+ tests | Service logic |
| auth.routes.test.js | 25+ tests | Auth endpoints |
| admin.routes.test.js | 20+ tests | Admin endpoints |
| **Total** | **85+ tests** | **Comprehensive** |

---

## 🏗️ Testing Architecture

### Senior Engineer Practices Applied

#### 1. **AAA Pattern (Arrange-Act-Assert)**
Every test follows the AAA pattern for clarity:

```javascript
it('should register user successfully', async () => {
  // ARRANGE - Setup test data and mocks
  const userData = { ... };
  User.findOne.mockResolvedValue(null);
  
  // ACT - Execute the function
  const result = await userService.registerUser(userData);
  
  // ASSERT - Verify results
  expect(result.message).toBe('User registered successfully');
});
```

#### 2. **Meaningful Test Names**
Test names clearly describe what is being tested:

```javascript
✅ GOOD:
it('should return 401 for invalid email or password', async () => {})

❌ BAD:
it('should test login', async () => {})
```

#### 3. **Mock Management**
Proper mocking of external dependencies:

```javascript
// Mock external dependencies
jest.mock('../models/user.model');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

#### 4. **Positive + Negative Cases**
Every feature tested in both scenarios:

```javascript
describe('registerUser - Positive Cases', () => {
  it('should register user successfully', ...);
});

describe('registerUser - Negative Cases', () => {
  it('should throw error if email already exists', ...);
});
```

#### 5. **Error Testing**
Explicit error code and message validation:

```javascript
it('should throw error if email already exists', async () => {
  User.findOne.mockResolvedValue(mockUser);
  
  const error = await expect(userService.registerUser(userData))
    .rejects.toThrow('User with this email already exists');
  
  expect(error).rejects.toMatchObject({ status: 400 });
});
```

#### 6. **Test Isolation**
Each test is independent and doesn't rely on others:

```javascript
// Each test:
// - Has its own data setup
// - Clears mocks before running
// - Doesn't depend on test execution order
// - Can run in any order
```

#### 7. **DRY Principle**
Common setup extracted to beforeEach:

```javascript
beforeEach(() => {
  // Common setup for all tests
  jest.clearAllMocks();
  mockUser = { ... };
  mongoose.connection = { readyState: 1 };
});
```

---

## 🔍 Test Coverage Breakdown

### User Service Tests

#### Authentication
- ✅ Successful registration
- ✅ Password hashing validation
- ✅ JWT token generation
- ✅ Email uniqueness check
- ❌ Missing email/password
- ❌ Weak password
- ❌ Database connection failure
- ✅ Successful login
- ❌ Invalid credentials
- ❌ User not found

#### Profile Management
- ✅ Update profile successfully
- ✅ Age validation
- ✅ Partial updates
- ❌ Invalid age
- ❌ Missing userId
- ❌ User not found during update
- ✅ Delete account
- ❌ Delete non-existent user

#### Token Handling
- ✅ Token refresh
- ❌ Refresh with invalid userId

#### Password Validation
- ✅ Valid password
- ❌ Too short
- ❌ Missing uppercase
- ❌ Missing lowercase
- ❌ Missing number
- ✅ Multiple error reporting

### Auth Routes Tests

#### Registration Endpoint (POST /api/auth/register)
- ✅ 201 Created on success
- ✅ User data without password
- ✅ Valid JWT token returned
- ❌ 400 for weak password
- ❌ 400 for duplicate email
- ❌ 503 for database error
- ❌ Proper error details

#### Login Endpoint (POST /api/auth/login)
- ✅ 200 on successful login
- ✅ No password in response
- ❌ 401 for invalid credentials
- ❌ 400 for missing email/password

#### Token Validation (GET /api/auth/test-token)
- ✅ 200 with valid token
- ❌ 401 for missing token
- ❌ 401 for invalid token

#### Profile Endpoints
- ✅ Get profile (authenticated)
- ✅ Update profile
- ✅ Delete profile
- ✅ Refresh token

### Admin Routes Tests

#### Delete All Users (DELETE /api/admin/users)
- ✅ 200 on success
- ✅ Return deletion count
- ❌ 403 for non-admin
- ❌ 401 for missing token
- ❌ 500 on database error

#### Delete Specific User (DELETE /api/admin/users/:id)
- ✅ Delete by ID
- ✅ Correct ID passed to DB
- ❌ 404 if user not found
- ❌ 500 on database error
- ❌ Invalid ID format

#### Get All Users (GET /api/auth/users)
- ✅ Return all users
- ✅ Correct filter passed
- ❌ 401 without token
- ❌ 500 on database error

#### Get User by ID (GET /api/auth/users/:id)
- ✅ Return user by ID
- ❌ 404 if user not found
- ❌ 401 without token
- ❌ 500 on database error

---

## 🚀 Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode (during development)
```bash
npm run test:watch
```

### Run tests with verbose output
```bash
npm run test:verbose
```

### Run specific test file
```bash
npm test user.service.test.js
npm test auth.routes.test.js
npm test admin.routes.test.js
```

### Run tests with coverage report
```bash
npm test -- --coverage
```

---

## 📈 Coverage Report

After running tests with coverage, view the report:

```bash
npm test -- --coverage

# Output shows:
# - Statements: % of code executed
# - Branches: % of conditional branches tested
# - Functions: % of functions called
# - Lines: % of lines executed
```

---

## 🎓 Testing Best Practices Demonstrated

### 1. **Test Naming Convention**
```javascript
describe('[Feature]', () => {
  describe('[Method] - Positive Cases', () => {
    it('should [expected outcome] when [condition]', () => {});
  });
  
  describe('[Method] - Negative Cases', () => {
    it('should [throw/return error] when [condition]', () => {});
  });
});
```

### 2. **Mock Setup**
```javascript
beforeEach(() => {
  jest.clearAllMocks();  // Reset mocks
  // Setup test fixtures
});

afterEach(() => {
  // Cleanup if needed
});
```

### 3. **Error Assertions**
```javascript
// Test error message
await expect(fn()).rejects.toThrow('Error message');

// Test error properties
try {
  await fn();
} catch (err) {
  expect(err.status).toBe(400);
  expect(err.details).toBeDefined();
}
```

### 4. **HTTP Status Code Testing**
```javascript
expect(response.status).toBe(201);  // Created
expect(response.status).toBe(200);  // OK
expect(response.status).toBe(400);  // Bad Request
expect(response.status).toBe(401);  // Unauthorized
expect(response.status).toBe(403);  // Forbidden
expect(response.status).toBe(404);  // Not Found
expect(response.status).toBe(500);  // Server Error
expect(response.status).toBe(503);  // Service Unavailable
```

### 5. **Response Validation**
```javascript
expect(response.body).toHaveProperty('token');
expect(response.body.user).not.toHaveProperty('password');
expect(response.body.message).toContain('successfully');
```

---

## 🔧 Debugging Tests

### Run single test
```bash
npm test -- --testNamePattern="should register user successfully"
```

### Enable verbose logging
```bash
npm run test:verbose
```

### Debug with Node Inspector
```bash
node --inspect-brk ./node_modules/jest/bin/jest.js --runInBand
```

---

## ✅ Test Checklist for New Endpoints

When adding new endpoints, ensure:

- [ ] Positive case test (happy path)
- [ ] Negative case tests (error scenarios)
- [ ] Input validation tests
- [ ] Database error handling
- [ ] Authentication tests (if protected)
- [ ] Authorization tests (if role-based)
- [ ] Response format validation
- [ ] HTTP status code validation
- [ ] Error message clarity
- [ ] Edge cases covered

---

## 📝 Example: Adding a New Test

```javascript
describe('newFeature', () => {
  describe('positive cases', () => {
    it('should [expected outcome] with valid input', async () => {
      // Arrange
      const input = { ... };
      Mock.mockResolvedValue(expectedOutput);
      
      // Act
      const result = await functionUnderTest(input);
      
      // Assert
      expect(result).toBe(expectedOutput);
    });
  });
  
  describe('negative cases', () => {
    it('should throw error when [condition]', async () => {
      // Arrange
      const input = { invalid: data };
      
      // Act & Assert
      await expect(functionUnderTest(input)).rejects.toThrow('Error message');
    });
  });
});
```

---

## 🎯 Interview Points

When discussing these tests:

1. **Test Pyramid**: Unit → Integration → E2E
   - "These are unit tests focusing on isolated functions"

2. **Mocking Strategy**: 
   - "We mock external dependencies (DB, JWT, bcrypt) to isolate logic"

3. **Coverage**:
   - "We test both success and failure paths"

4. **Senior Practices**:
   - "Following AAA pattern for clarity"
   - "Descriptive test names as documentation"
   - "Proper test isolation and cleanup"

5. **Scalability**:
   - "Easy to add tests for new endpoints"
   - "Tests serve as code documentation"
   - "Prevents regressions during refactoring"

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Happy Testing!** 🚀
