const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Check for token in multiple locations
  const authHeader = req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '') || 
                req.cookies?.token || 
                req.body?.token;

  if (!token) {
    return res.status(401).json({ 
      message: 'Access denied. No token provided.',
      details: 'Please provide a valid authentication token in the Authorization header as "Bearer <token>"',
      help: 'Make sure to include: Authorization: Bearer YOUR_TOKEN_HERE'
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if token has expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ 
        message: 'Token has expired.',
        details: 'Please login again to get a new token'
      });
    }

    // Check if token has required fields
    if (!decoded.userId) {
      return res.status(401).json({ 
        message: 'Invalid token format.',
        details: 'Token does not contain required user information'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token.',
        details: 'The provided token is malformed or invalid',
        help: 'Make sure you copied the complete token from the login response'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token has expired.',
        details: 'Please login again to get a new token'
      });
    } else {
      return res.status(401).json({ 
        message: 'Token verification failed.',
        details: error.message
      });
    }
  }
};

module.exports = { verifyToken }; 