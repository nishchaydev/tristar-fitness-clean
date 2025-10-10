// Role-based authentication middleware

const requireManager = (req, res, next) => {
  // For demo purposes, allow all authenticated users
  // In production, check user role from JWT token
  if (req.user) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};

const requireOwner = (req, res, next) => {
  // For demo purposes, allow all authenticated users
  // In production, check if user role is 'owner'
  if (req.user) {
    next();
  } else {
    res.status(401).json({ error: 'Owner access required' });
  }
};

const requireAuth = (req, res, next) => {
  // Basic authentication check
  if (req.user) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};

module.exports = {
  requireManager,
  requireOwner,
  requireAuth
};