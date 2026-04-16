const { adminAuth } = require('../config/firebase');

// Verify Firebase token on every protected request
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token with Firebase
    const decoded = await adminAuth.verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

// Check user role from Firebase custom claims
const requireRole = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user.role;

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${roles.join(' or ')}` 
      });
    }
    next();
  };
};

module.exports = { protect, requireRole };