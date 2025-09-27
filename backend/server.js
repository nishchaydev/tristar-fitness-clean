const express = require('express');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const SQLiteDatabase = require('./database/sqlite');
const logger = require('./config/logger');
const { createRateLimiters, securityMiddleware, corsOptions, requestLimits } = require('./middleware/security');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
require('dotenv').config();

console.log('🚀 Starting TriStar Fitness Backend Server...');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 6868;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log(`📋 Environment: ${NODE_ENV}`);
console.log(`🔌 Port: ${PORT}`);

// Initialize SQLite database
const db = new SQLiteDatabase();
db.initialize().then(() => {
  logger.info('✅ SQLite database connected successfully');
  // Make database available to routes
  app.locals.db = db;
}).catch(err => {
  console.error('❌ Database connection error:', err);
  logger.error('Database initialization failed:', err);
});

// Initialize cache (optional for now) - disabled for demo mode
console.log('⚠️  Redis cache disabled for demo mode');

// Create rate limiters
const rateLimiters = createRateLimiters();

console.log('🔒 Security middleware initialized');

// Security middleware
app.use(securityMiddleware);

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Request parsing middleware
app.use(express.json(requestLimits.json));
app.use(express.urlencoded(requestLimits.urlencoded));

// Enhanced logging with Winston
app.use(morgan('combined', { stream: logger.stream }));

// API logging middleware
app.use(logger.logAPI);

console.log('📝 Logging middleware initialized');

// Rate limiting
app.use('/api/', rateLimiters.general);
app.use('/api/auth', rateLimiters.auth);
app.use('/api/upload', rateLimiters.upload);

// Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'TriStar Fitness API Documentation',
}));

console.log('📚 Swagger documentation initialized');

// Enhanced in-memory data store with persistence simulation
const dataStore = {
  members: [
    {
      id: '1',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@email.com',
      phone: '+91 98765 43210',
      membershipType: 'monthly',
      startDate: '2024-01-01',
      expiryDate: '2024-02-01',
      status: 'active',
      lastVisit: '2024-01-15T10:30:00',
      totalVisits: 12,
      assignedTrainer: '1',
      emergencyContact: '+91 98765 43211',
      address: '123 Fitness Street, Gym City',
      medicalConditions: 'None',
      goals: 'Weight loss and muscle gain',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'Priya Patel',
      email: 'priya.patel@email.com',
      phone: '+91 98765 43211',
      membershipType: 'quarterly',
      startDate: '2024-01-01',
      expiryDate: '2024-04-01',
      status: 'active',
      lastVisit: '2024-01-14T15:45:00',
      totalVisits: 8,
      assignedTrainer: '2',
      emergencyContact: '+91 98765 43212',
      address: '456 Health Avenue, Fitness Town',
      medicalConditions: 'Asthma (mild)',
      goals: 'Cardiovascular fitness',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-14T15:45:00Z'
    },
    {
      id: '3',
      name: 'Amit Kumar',
      email: 'amit.kumar@email.com',
      phone: '+91 98765 43212',
      membershipType: 'annual',
      startDate: '2024-01-01',
      expiryDate: '2025-01-01',
      status: 'active',
      lastVisit: '2024-01-13T09:15:00',
      totalVisits: 25,
      assignedTrainer: '1',
      emergencyContact: '+91 98765 43213',
      address: '789 Strength Road, Power City',
      medicalConditions: 'None',
      goals: 'Bodybuilding and strength training',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-13T09:15:00Z'
    },
    {
      id: '4',
      name: 'Neha Singh',
      email: 'neha.singh@email.com',
      phone: '+91 98765 43213',
      membershipType: 'monthly',
      startDate: '2024-01-01',
      expiryDate: '2024-02-01',
      status: 'active',
      lastVisit: '2024-01-12T14:20:00',
      totalVisits: 15,
      assignedTrainer: '2',
      emergencyContact: '+91 98765 43214',
      address: '321 Wellness Way, Health Village',
      medicalConditions: 'None',
      goals: 'Flexibility and yoga',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-12T14:20:00Z'
    },
    {
      id: '5',
      name: 'Vikram Malhotra',
      email: 'vikram.malhotra@email.com',
      phone: '+91 98765 43214',
      membershipType: 'quarterly',
      startDate: '2024-01-01',
      expiryDate: '2024-04-01',
      status: 'active',
      lastVisit: '2024-01-11T11:00:00',
      totalVisits: 18,
      assignedTrainer: '1',
      emergencyContact: '+91 98765 43215',
      address: '654 Energy Lane, Vitality Town',
      medicalConditions: 'Diabetes (controlled)',
      goals: 'Weight management and diabetes control',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-11T11:00:00Z'
    }
  ],
  trainers: [
    {
      id: '1',
      name: 'Yash',
      phone: '+91 98765 43220',
      email: 'yash@tristarfitness.com',
      specialization: 'Strength Training & Bodybuilding',
      checkInTime: '2024-01-15T08:00:00',
      checkOutTime: null,
      status: 'available',
      currentSessions: 2,
      totalSessions: 150,
      joinDate: '2023-01-01',
      salary: 35000,
      certifications: ['ACE Personal Trainer', 'NASM Certified'],
      experience: '5 years',
      bio: 'Specialized in strength training and bodybuilding with 5+ years of experience.',
      schedule: {
        monday: { start: '06:00', end: '22:00' },
        tuesday: { start: '06:00', end: '22:00' },
        wednesday: { start: '06:00', end: '22:00' },
        thursday: { start: '06:00', end: '22:00' },
        friday: { start: '06:00', end: '22:00' },
        saturday: { start: '08:00', end: '20:00' },
        sunday: { start: '08:00', end: '18:00' }
      },
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2024-01-15T08:00:00Z'
    },
    {
      id: '2',
      name: 'Mohit Sen',
      phone: '+91 98765 43221',
      email: 'mohit@tristarfitness.com',
      specialization: 'Cardio & Functional Training',
      checkInTime: '2024-01-15T07:30:00',
      checkOutTime: null,
      status: 'busy',
      currentSessions: 1,
      totalSessions: 120,
      joinDate: '2023-03-01',
      salary: 32000,
      certifications: ['ISSA Personal Trainer', 'CrossFit Level 1'],
      experience: '3 years',
      bio: 'Expert in cardiovascular training and functional fitness.',
      schedule: {
        monday: { start: '06:00', end: '22:00' },
        tuesday: { start: '06:00', end: '22:00' },
        wednesday: { start: '06:00', end: '22:00' },
        thursday: { start: '06:00', end: '22:00' },
        friday: { start: '06:00', end: '22:00' },
        saturday: { start: '08:00', end: '20:00' },
        sunday: { start: '08:00', end: '18:00' }
      },
      createdAt: '2023-03-01T00:00:00Z',
      updatedAt: '2024-01-15T07:30:00Z'
    },
    {
      id: '3',
      name: 'Palak Dubey',
      phone: '+91 98765 43222',
      email: 'palak@tristarfitness.com',
      specialization: 'Yoga & Flexibility',
      checkInTime: '2024-01-15T09:00:00',
      checkOutTime: null,
      status: 'available',
      currentSessions: 0,
      totalSessions: 80,
      joinDate: '2023-06-01',
      salary: 28000,
      certifications: ['RYT-200', 'Pilates Instructor'],
      experience: '2 years',
      bio: 'Certified yoga instructor specializing in flexibility and mindfulness.',
      schedule: {
        monday: { start: '07:00', end: '21:00' },
        tuesday: { start: '07:00', end: '21:00' },
        wednesday: { start: '07:00', end: '21:00' },
        thursday: { start: '07:00', end: '21:00' },
        friday: { start: '07:00', end: '21:00' },
        saturday: { start: '08:00', end: '18:00' },
        sunday: { start: '08:00', end: '16:00' }
      },
      createdAt: '2023-06-01T00:00:00Z',
      updatedAt: '2024-01-15T09:00:00Z'
    }
  ],
  sessions: [
    {
      id: '1',
      trainerId: '1',
      trainerName: 'Yash',
      memberName: 'Rahul Sharma',
      startTime: '2024-01-15T10:00:00',
      endTime: null,
      type: 'personal',
      status: 'in-progress',
      notes: 'Focus on upper body strength',
      memberId: '1',
      createdAt: '2024-01-15T09:45:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    }
  ],
  visitors: [
    {
      id: '1',
      name: 'Rajesh Kumar',
      phone: '+91 98765 43230',
      email: 'rajesh.kumar@email.com',
      checkInTime: '2024-01-15T09:00:00',
      checkOutTime: null,
      purpose: 'Trial session',
      status: 'checked-in',
      hostMember: 'Rahul Sharma',
      notes: 'Interested in strength training',
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-01-15T09:00:00Z'
    }
  ],
  invoices: [
    {
      id: 'INV-001',
      memberId: '1',
      memberName: 'Amit Kumar',
      amount: 1299,
      description: 'Monthly membership renewal',
      dueDate: '2025-02-15',
      status: 'pending',
      createdAt: '2025-01-15T10:00:00Z',
      items: [
        {
          id: '1',
          description: 'Monthly Membership',
          quantity: 1,
          price: 999,
          total: 999
        }
      ],
      subtotal: 999,
      tax: 180,
      total: 1179,
      updatedAt: '2025-01-15T10:00:00Z'
    },
    {
      id: 'INV-002',
      memberId: '2',
      memberName: 'Priya Patel',
      amount: 2499,
      description: 'Quarterly membership payment',
      dueDate: '2025-02-01',
      status: 'paid',
      createdAt: '2025-01-10T10:00:00Z',
      items: [
        {
          id: '2',
          description: 'Quarterly Membership',
          quantity: 1,
          price: 2499,
          total: 2499
        }
      ],
      subtotal: 2499,
      tax: 450,
      total: 2949,
      updatedAt: '2025-01-10T10:00:00Z'
    },
    {
      id: 'INV-003',
      memberId: '3',
      memberName: 'Neha Singh',
      amount: 8999,
      description: 'Annual membership payment',
      dueDate: '2025-01-31',
      status: 'overdue',
      createdAt: '2025-01-05T10:00:00Z',
      items: [
        {
          id: '3',
          description: 'Annual Membership',
          quantity: 1,
          price: 8999,
          total: 8999
        }
      ],
      subtotal: 8999,
      tax: 1620,
      total: 10619,
      updatedAt: '2025-01-05T10:00:00Z'
    }
  ],
  followUps: [
    {
      id: '1',
      memberId: '3',
      memberName: 'Neha Singh',
      type: 'payment_reminder',
      status: 'pending',
      dueDate: '2024-01-20',
      notes: 'Annual membership payment overdue',
      createdAt: '2024-01-15T09:00:00Z',
      completedAt: null
    },
    {
      id: '2',
      memberId: '1',
      memberName: 'Rahul Sharma',
      type: 'membership_expiry',
      status: 'pending',
      dueDate: '2024-02-01',
      notes: 'Monthly membership expires soon',
      createdAt: '2024-01-15T10:00:00Z',
      completedAt: null
    }
  ],
  activities: [
    {
      id: '1',
      type: 'member',
      action: 'Member checked in',
      name: 'Rahul Sharma',
      time: '2024-01-15T10:30:00Z',
      details: 'Checked in for personal training session',
      memberId: '1',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      type: 'visitor',
      action: 'Visitor checked in',
      name: 'Rajesh Kumar',
      time: '2024-01-15T09:00:00Z',
      details: 'Trial session - interested in strength training',
      visitorId: '1',
      createdAt: '2024-01-15T09:00:00Z'
    },
    {
      id: '3',
      type: 'trainer',
      action: 'Trainer checked in',
      name: 'Yash',
      time: '2024-01-15T08:00:00Z',
      details: 'Started shift',
      trainerId: '1',
      createdAt: '2024-01-15T08:00:00Z'
    },
    {
      id: '4',
      type: 'invoice',
      action: 'Invoice generated',
      name: 'INV-001 - Amit Kumar',
      time: '2024-01-15T10:00:00Z',
      details: 'Amount: ₹1,179',
      memberId: '1',
      invoiceId: 'INV-001',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '5',
      type: 'followup',
      action: 'Follow-up created',
      name: 'Neha Singh',
      time: '2024-01-15T09:00:00Z',
      details: 'Payment reminder - overdue',
      memberId: '3',
      createdAt: '2024-01-15T09:00:00Z'
    },
    {
      id: '6',
      type: 'member',
      action: 'Membership renewed',
      name: 'Priya Patel',
      time: '2024-01-10T10:00:00Z',
      details: 'Quarterly membership renewed',
      memberId: '2',
      createdAt: '2024-01-10T10:00:00Z'
    },
    {
      id: '7',
      type: 'trainer',
      action: 'Session started',
      name: 'Yash → Rahul Sharma',
      time: '2024-01-15T10:00:00Z',
      details: 'Personal training session - upper body focus',
      trainerId: '1',
      memberId: '1',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '8',
      type: 'member',
      action: 'Member checked in',
      name: 'Amit Kumar',
      time: '2024-01-13T09:15:00Z',
      details: 'Regular workout session',
      memberId: '3',
      createdAt: '2024-01-13T09:15:00Z'
    },
    {
      id: '9',
      type: 'member',
      action: 'Member checked in',
      name: 'Neha Singh',
      time: '2024-01-12T14:20:00Z',
      details: 'Yoga session with Palak',
      memberId: '4',
      trainerId: '3',
      createdAt: '2024-01-12T14:20:00Z'
    }
  ]
};

// Enhanced authentication middleware
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

// Enhanced error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.details
    });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      error: 'Not Found',
      message: err.message
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong on the server',
    timestamp: new Date().toISOString()
  });
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
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
    },
    documentation: '/api/docs'
  });
});

// Import and use routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/members', authenticateToken, require('./routes/members'));
app.use('/api/trainers', authenticateToken, require('./routes/trainers'));
app.use('/api/visitors', authenticateToken, require('./routes/visitors'));
app.use('/api/invoices', authenticateToken, require('./routes/invoices'));
app.use('/api/sessions', authenticateToken, require('./routes/sessions'));
app.use('/api/followups', authenticateToken, require('./routes/followups'));
app.use('/api/activities', authenticateToken, require('./routes/activities'));

// Analytics endpoint
app.get('/api/analytics', authenticateToken, (req, res) => {
  try {
    const analytics = {
      members: {
        total: dataStore.members.length,
        active: dataStore.members.filter(m => m.status === 'active').length,
        expiring: dataStore.members.filter(m => {
          const expiryDate = new Date(m.expiryDate);
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          return expiryDate <= thirtyDaysFromNow && m.status === 'active';
        }).length
      },
      trainers: {
        total: dataStore.trainers.length,
        available: dataStore.trainers.filter(t => t.status === 'available').length,
        busy: dataStore.trainers.filter(t => t.status === 'busy').length
      },
      revenue: {
        total: dataStore.invoices
          .filter(inv => inv.status === 'paid')
          .reduce((sum, inv) => sum + inv.total, 0),
        pending: dataStore.invoices
          .filter(inv => inv.status === 'pending')
          .reduce((sum, inv) => sum + inv.total, 0),
        overdue: dataStore.invoices
          .filter(inv => inv.status === 'overdue')
          .reduce((sum, inv) => sum + inv.total, 0)
      },
      activities: {
        today: dataStore.activities.filter(a => {
          const today = new Date().toDateString();
          return new Date(a.time).toDateString() === today;
        }).length,
        thisWeek: dataStore.activities.filter(a => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(a.time) >= weekAgo;
        }).length
      },
      visitors: {
        today: dataStore.visitors.filter(v => {
          const today = new Date().toDateString();
          return new Date(v.checkInTime).toDateString() === today;
        }).length
      }
    };

    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      error: 'Failed to generate analytics',
      message: error.message
    });
  }
});

// Enhanced 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/health',
      '/api',
      '/api/auth',
      '/api/members',
      '/api/trainers',
      '/api/visitors',
      '/api/invoices',
      '/api/sessions',
      '/api/followups',
      '/api/activities',
      '/api/analytics'
    ]
  });
});

// Apply error handling middleware
app.use(errorHandler);

// Enhanced server startup
const server = app.listen(PORT, () => {
  console.log(`🚀 TriStar Fitness API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API info: http://localhost:${PORT}/api`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = { app, dataStore };
