const { Router } = require("express");
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const router = Router();

// Public auth routes
router.post('/api/auth/register', userController.registerUser);
router.post('/api/auth/login', userController.loginUser);

// Protected user listing (admin/debug)
router.get('/api/auth/users', verifyToken, userController.getAllUsers);
router.get('/api/auth/users/:id', verifyToken, userController.getUserById);

// Test endpoint for token validation
router.get('/api/auth/test-token', verifyToken, (req, res) => {
  res.status(200).json({
    message: "Token is valid",
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Refresh token endpoint
router.get('/api/auth/refresh-token', verifyToken, userController.refreshToken);

// Protected routes (require authentication)
router.get('/api/auth/profile', verifyToken, userController.getCurrentUser);
router.put('/api/auth/profile', verifyToken, userController.updateCurrentUser);
router.delete('/api/auth/profile', verifyToken, userController.deleteCurrentUser);

module.exports = router;
