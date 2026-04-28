import { getUserRole } from '../services/userService.js';

export const requireRole = (...roles) => {
  // Handle both array input and rest parameters
  const allowedRoles = Array.isArray(roles[0]) ? roles[0] : roles;

  return async (req, res, next) => {
    try {
      const role = await getUserRole(req.user.uid);

      if (!role || !allowedRoles.includes(role)) {
        return res.status(403).json({ 
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
        });
      }

      req.user.role = role;
      next();
    } catch (err) {
      console.error('Role check error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
};