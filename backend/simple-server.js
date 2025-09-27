const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 6868;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: 'development',
    version: '1.0.0'
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'TriStar Fitness API',
    version: '1.0.0',
    description: 'Gym Management System API',
    endpoints: {
      auth: '/api/auth',
      members: '/api/members',
      trainers: '/api/trainers',
      visitors: '/api/visitors',
      invoices: '/api/invoices',
      sessions: '/api/sessions',
      followups: '/api/followups',
      activities: '/api/activities',
      analytics: '/api/analytics'
    }
  });
});

// Simple auth endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Demo users
  const users = {
    'owner': { id: '1', username: 'owner', role: 'owner', name: 'Nikhil Verma' },
    'nikhil': { id: '1', username: 'nikhil', role: 'owner', name: 'Nikhil Verma' },
    'manager': { id: '2', username: 'manager', role: 'semi-admin', name: 'Manager' },
    'raj': { id: '2', username: 'raj', role: 'semi-admin', name: 'Manager' }
  };
  
  if (users[username] && password === 'demo123') {
    res.json({
      success: true,
      user: users[username],
      token: 'demo-token-' + Date.now()
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Simple auth verify endpoint
app.get('/api/auth/verify', (req, res) => {
  res.json({
    success: true,
    user: { id: '1', username: 'owner', role: 'owner', name: 'Nikhil Verma' }
  });
});

// Simple members endpoint
app.get('/api/members', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'Rajesh Kumar',
        email: 'rajesh@email.com',
        phone: '+91 98765 43210',
        membershipType: '12 Months',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
        trainer: 'Yash',
        notes: 'Regular member, very dedicated'
      }
    ]
  });
});

// Simple invoices endpoint
app.get('/api/invoices', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'INV-001',
        memberId: '1',
        memberName: 'Rajesh Kumar',
        amount: 12000,
        status: 'paid',
        dueDate: '2024-01-01',
        paidDate: '2024-01-01',
        description: '12 Months Membership - Paid'
      }
    ]
  });
});

// Simple analytics endpoint
app.get('/api/analytics', (req, res) => {
  res.json({
    success: true,
    data: {
      members: {
        total: 1,
        active: 1,
        expiring: 0
      },
      revenue: {
        total: 12000,
        pending: 0,
        overdue: 0
      }
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple TriStar Fitness API Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API info: http://localhost:${PORT}/api`);
});

module.exports = app;

