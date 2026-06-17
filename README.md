# User Management API

A Node.js Express REST API for user authentication and management with MongoDB.

## Features

- ✅ User registration with password strength validation
- ✅ User login with JWT authentication
- ✅ Profile management (view, update, delete)
- ✅ Token refresh mechanism
- ✅ Admin operations (user listing, deletion)
- ✅ Role-based access control
- ✅ Password hashing with bcryptjs
- ✅ Comprehensive error handling

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20+ | Runtime |
| Express | 4.21.2 | Web framework |
| MongoDB | 8.15.2 | Database (Mongoose ODM) |
| bcryptjs | 3.0.2 | Password hashing |
| jsonwebtoken | 9.0.2 | JWT tokens |
| dotenv | 17.4.2 | Environment config |
| EJS | 3.1.10 | Template engine |
| Nodemon | 3.1.10 | Dev auto-reload |

## Project Structure

```
crud-api-js/
├── models/
│   └── user.model.js          # User schema with validation
├── controllers/
│   └── userController.js       # Request handlers
├── services/
│   └── user.service.js         # Business logic
├── routes/
│   ├── authRoutes.js           # Auth endpoints
│   └── adminRoutes.js          # Admin endpoints
├── middleware/
│   └── auth.js                 # JWT verification
├── views/
│   ├── home.ejs
│   ├── login.ejs
│   ├── register.ejs
│   └── profile.ejs
├── app.js                      # Express app setup
└── package.json
```

## Installation

```bash
# Install dependencies
npm install

# Create .env file
echo "MONGO_URI=mongodb://localhost:27017/crud-db" > .env
echo "JWT_SECRET=your-secret-key" >> .env
echo "PORT=3000" >> .env
```

## Running the Application

### Development (with auto-reload)
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### Authentication (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

### User Profile (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/profile` | Get current user profile |
| PUT | `/api/auth/profile` | Update current user profile |
| DELETE | `/api/auth/profile` | Delete current user account |
| POST | `/api/auth/refresh-token` | Refresh JWT token |

### Admin Operations (Protected + Admin Role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/users` | Get all users |
| GET | `/api/auth/users/:id` | Get user by ID |
| DELETE | `/api/admin/users` | Delete all users (admin) |
| DELETE | `/api/admin/users/:id` | Delete specific user |

### Utility

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check (includes DB status) |
| GET | `/api/auth/test-token` | Verify token validity |

## Password Requirements

Passwords must meet the following criteria:
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)

## Security Features

1. **Password Hashing:** bcryptjs with salt rounds = 10
2. **JWT Tokens:** 24-hour expiration
3. **Role-Based Access:** Admin vs User roles
4. **Input Validation:** Email, password, age validation
5. **Password Not Returned:** Sensitive data excluded from responses
6. **Environment Variables:** Sensitive keys in .env

## Architecture

### Service Layer Pattern
- **Controllers:** Handle HTTP requests/responses
- **Services:** Contain business logic
- **Models:** Define database schemas
- **Middleware:** Handle cross-cutting concerns (auth, errors)

### Error Handling
- Centralized error handler
- Consistent error response format
- Proper HTTP status codes

### Security
- Passwords hashed before storage
- JWT for stateless authentication
- Role-based access control
- Input validation

## Database Schema

### User Model
```javascript
{
  name: String (optional),
  email: String (required, unique),
  password: String (hashed, required),
  age: Number (optional, 1-120),
  address: String (optional),
  role: String (enum: ["user", "admin"], default: "user"),
  createdAt: Date,
  updatedAt: Date
}
```

## Development

- All business logic in services
- Controllers only handle HTTP
- Mongoose for database operations
- dotenv for configuration

## License

ISC
