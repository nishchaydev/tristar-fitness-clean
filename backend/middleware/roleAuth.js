// Role-based authentication middleware

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      message: 'Please provide a valid authentication token'
    });
  }

  // Enhanced token validation (in production, use proper JWT)
  try {
    // For demo purposes, validate token format
    if (!token || token.length < 10) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid or expired'
      });
    }
    
    // In production, verify JWT here
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded;
    
    // Demo mode: set user context
    req.user = { id: '1', role: 'owner', name: 'Demo User' };
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Invalid token',
      message: 'The provided token is invalid or expired'
    });
  }
};

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
  authenticateToken,
  requireManager,
  requireOwner,
  requireAuth
};