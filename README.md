# User Authentication API

A Node.js Express API with MongoDB database for user authentication and profile management.

## Features

- User registration and login with JWT authentication
- Password hashing with bcrypt
- Protected routes with token verification
- Profile management (view, update, delete)
- Token refresh functionality
- Web interface with EJS templates

## Project Structure

```
├── app.js                 # Main application file
├── package.json          # Project dependencies
├── routes/               # Route packages
│   └── authRoutes.js     # Authentication routes
├── controllers/          # Controller files
│   └── userController.js # User controller
├── middleware/           # Middleware files
│   └── auth.js          # JWT token verification
├── models/              # Database models
│   └── user.model.js    # User model
└── views/               # EJS templates
    ├── home.ejs
    ├── login.ejs
    ├── register.ejs
    └── profile.ejs
```

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Public Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

#### Protected Routes (require JWT token)
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update current user profile
- `DELETE /api/auth/profile` - Delete current user account
- `GET /api/auth/refresh-token` - Refresh JWT token
- `GET /api/auth/test-token` - Test token validity

### Web Routes
- `GET /` - Home page
- `GET /login` - Login page
- `GET /register` - Registration page
- `GET /profile` - Profile page

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on port 3000.

## Usage

### Authentication Flow

1. **Register a new user:**
   ```bash
   POST /api/auth/register
   Content-Type: application/json
   
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "password123",
     "age": 25,
     "address": "123 Main St"
   }
   ```

2. **Login:**
   ```bash
   POST /api/auth/login
   Content-Type: application/json
   
   {
     "email": "john@example.com",
     "password": "password123"
   }
   ```

3. **Use the returned token for protected routes:**
   ```bash
   PUT /api/auth/profile
   Authorization: Bearer YOUR_JWT_TOKEN
   Content-Type: application/json
   
   {
     "name": "Updated Name",
     "age": 30
   }
   ```

## Database

The application connects to MongoDB Atlas. The connection string is configured in `app.js`.

## Security Features

- JWT tokens with 24-hour expiration
- Password hashing with bcrypt
- Token-based authentication for protected routes
- Input validation and error handling 