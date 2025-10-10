const express = require('express');
const { body, validationResult, param, query } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { requireManager } = require('../middleware/roleAuth');
const router = express.Router();

// Get the dataStore from the main server file
let dataStore;
try {
  const serverModule = require('../server');
  dataStore = serverModule.dataStore;
} catch (error) {
  // Fallback for development
  dataStore = {
    members: [],
    activities: []
  };
}

// Validation middleware
const validateMember = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  
  body('membershipType')
    .isIn(['monthly', 'quarterly', 'annual'])
    .withMessage('Membership type must be monthly, quarterly, or annual'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('expiryDate')
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),
  
  body('status')
    .optional()
    .isIn(['active', 'expired', 'pending', 'suspended'])
    .withMessage('Status must be active, expired, pending, or suspended'),
  
  body('emergencyContact')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Emergency contact must be a valid phone number'),
  
  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address must be less than 200 characters'),
  
  body('medicalConditions')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Medical conditions must be less than 500 characters'),
  
  body('goals')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Goals must be less than 200 characters')
];

// Get all members with filtering and pagination
router.get('/', requireManager, [
  query('status').optional().isIn(['active', 'expired', 'pending', 'suspended']),
  query('membershipType').optional().isIn(['monthly', 'quarterly', 'annual']),
  query('trainerId').optional().isUUID(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isLength({ min: 2, max: 50 }),
  query('sortBy').optional().isIn(['name', 'createdAt', 'expiryDate', 'totalVisits']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    let { status, membershipType, trainerId, page = 1, limit = 20, search, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    let filteredMembers = [...dataStore.members];

    // Apply filters
    if (status) {
      filteredMembers = filteredMembers.filter(member => member.status === status);
    }

    if (membershipType) {
      filteredMembers = filteredMembers.filter(member => member.membershipType === membershipType);
    }

    if (trainerId) {
      filteredMembers = filteredMembers.filter(member => member.assignedTrainer === trainerId);
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filteredMembers = filteredMembers.filter(member => 
        searchRegex.test(member.name) || 
        searchRegex.test(member.email) || 
        searchRegex.test(member.phone)
      );
    }

    // Apply sorting
    filteredMembers.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'expiryDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const totalCount = filteredMembers.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedMembers,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      filters: {
        status,
        membershipType,
        trainerId,
        search
      }
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({
      error: 'Failed to fetch members',
      message: error.message
    });
  }
});

// Get member by ID
router.get('/:id', [
  param('id').isUUID().withMessage('Invalid member ID')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const member = dataStore.members.find(m => m.id === req.params.id);
    if (!member) {
      return res.status(404).json({
        error: 'Member not found',
        message: 'The requested member does not exist'
      });
    }

    // Get member's recent activities
    const recentActivities = dataStore.activities
      .filter(activity => activity.memberId === member.id)
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10);

    // Get member's sessions
    const sessions = dataStore.sessions
      .filter(session => session.memberId === member.id)
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    // Get member's invoices
    const invoices = dataStore.invoices
      .filter(invoice => invoice.memberId === member.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: {
        ...member,
        recentActivities,
        sessions,
        invoices
      }
    });
  } catch (error) {
    console.error('Get member error:', error);
    res.status(500).json({
      error: 'Failed to fetch member',
      message: error.message
    });
  }
});

// Create new member
router.post('/', validateMember, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const {
      name, email, phone, membershipType, startDate, expiryDate,
      emergencyContact, address, medicalConditions, goals, assignedTrainer
    } = req.body;

    // Check if email already exists
    const existingMember = dataStore.members.find(m => m.email === email);
    if (existingMember) {
      return res.status(409).json({
        error: 'Email already exists',
        message: 'A member with this email address already exists'
      });
    }

    // Check if phone already exists
    const existingPhone = dataStore.members.find(m => m.phone === phone);
    if (existingPhone) {
      return res.status(409).json({
        error: 'Phone number already exists',
        message: 'A member with this phone number already exists'
      });
    }

    const newMember = {
      id: uuidv4(),
      name,
      email,
      phone,
      membershipType,
      startDate,
      expiryDate,
      status: 'active',
      lastVisit: null,
      totalVisits: 0,
      assignedTrainer: assignedTrainer || null,
      emergencyContact: emergencyContact || null,
      address: address || null,
      medicalConditions: medicalConditions || 'None',
      goals: goals || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dataStore.members.push(newMember);

    // Add activity log
    dataStore.activities.push({
      id: uuidv4(),
      type: 'member',
      action: 'Member registered',
      name: newMember.name,
      time: new Date().toISOString(),
      memberId: newMember.id,
      details: `New ${membershipType} membership created`
    });

    res.status(201).json({
      success: true,
      message: 'Member created successfully',
      data: newMember
    });
  } catch (error) {
    console.error('Create member error:', error);
    res.status(500).json({
      error: 'Failed to create member',
      message: error.message
    });
  }
});

// Update member
router.put('/:id', [
  param('id').isUUID().withMessage('Invalid member ID'),
  ...validateMember
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const memberIndex = dataStore.members.findIndex(m => m.id === req.params.id);
    if (memberIndex === -1) {
      return res.status(404).json({
        error: 'Member not found',
        message: 'The requested member does not exist'
      });
    }

    const oldMember = dataStore.members[memberIndex];
    const updatedMember = {
      ...oldMember,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    dataStore.members[memberIndex] = updatedMember;

    // Add activity log
    dataStore.activities.push({
      id: uuidv4(),
      type: 'member',
      action: 'Member updated',
      name: updatedMember.name,
      time: new Date().toISOString(),
      memberId: updatedMember.id,
      details: 'Member information updated'
    });

    res.json({
      success: true,
      message: 'Member updated successfully',
      data: updatedMember
    });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({
      error: 'Failed to update member',
      message: error.message
    });
  }
});

// Delete member
router.delete('/:id', [
  param('id').isUUID().withMessage('Invalid member ID')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const memberIndex = dataStore.members.findIndex(m => m.id === req.params.id);
    if (memberIndex === -1) {
      return res.status(404).json({
        error: 'Member not found',
        message: 'The requested member does not exist'
      });
    }

    const deletedMember = dataStore.members[memberIndex];
    dataStore.members.splice(memberIndex, 1);

    // Add activity log
    dataStore.activities.push({
      id: uuidv4(),
      type: 'member',
      action: 'Member deleted',
      name: deletedMember.name,
      time: new Date().toISOString(),
      details: 'Member removed from system'
    });

    res.json({
      success: true,
      message: 'Member deleted successfully',
      data: deletedMember
    });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({
      error: 'Failed to delete member',
      message: error.message
    });
  }
});

// Get expiring memberships
router.get('/expiring/soon', [
  query('days').optional().isInt({ min: 1, max: 90 }).withMessage('Days must be between 1 and 90')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const days = parseInt(req.query.days) || 30;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    const expiringMembers = dataStore.members.filter(member => {
      if (member.status !== 'active') return false;
      
      const expiryDate = new Date(member.expiryDate);
      return expiryDate <= targetDate;
    }).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    res.json({
      success: true,
      data: expiringMembers,
      count: expiringMembers.length,
      daysThreshold: days
    });
  } catch (error) {
    console.error('Get expiring members error:', error);
    res.status(500).json({
      error: 'Failed to fetch expiring members',
      message: error.message
    });
  }
});

// Member check-in
router.post('/:id/checkin', [
  param('id').isUUID().withMessage('Invalid member ID')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const member = dataStore.members.find(m => m.id === req.params.id);
    if (!member) {
      return res.status(404).json({
        error: 'Member not found',
        message: 'The requested member does not exist'
      });
    }

    if (member.status !== 'active') {
      return res.status(400).json({
        error: 'Membership not active',
        message: 'Member cannot check in with inactive membership'
      });
    }

    // Update member's last visit and total visits
    member.lastVisit = new Date().toISOString();
    member.totalVisits += 1;
    member.updatedAt = new Date().toISOString();

    // Add activity log
    dataStore.activities.push({
      id: uuidv4(),
      type: 'member',
      action: 'Member checked in',
      name: member.name,
      time: new Date().toISOString(),
      memberId: member.id,
      details: `Visit #${member.totalVisits}`
    });

    res.json({
      success: true,
      message: 'Member checked in successfully',
      data: {
        member,
        checkInTime: member.lastVisit,
        totalVisits: member.totalVisits
      }
    });
  } catch (error) {
    console.error('Member check-in error:', error);
    res.status(500).json({
      error: 'Failed to check in member',
      message: error.message
    });
  }
});

// Renew membership
router.post('/:id/renew', [
  param('id').isUUID().withMessage('Invalid member ID'),
  body('membershipType').isIn(['monthly', 'quarterly', 'annual']).withMessage('Invalid membership type'),
  body('startDate').isISO8601().withMessage('Start date must be a valid date')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const member = dataStore.members.find(m => m.id === req.params.id);
    if (!member) {
      return res.status(404).json({
        error: 'Member not found',
        message: 'The requested member does not exist'
      });
    }

    const { membershipType, startDate } = req.body;
    
    // Calculate new expiry date
    const newStartDate = new Date(startDate);
    let newExpiryDate = new Date(newStartDate);
    
    switch (membershipType) {
      case 'monthly':
        newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
        break;
      case 'quarterly':
        newExpiryDate.setMonth(newExpiryDate.getMonth() + 3);
        break;
      case 'annual':
        newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
        break;
    }

    // Update member
    member.membershipType = membershipType;
    member.startDate = newStartDate.toISOString().split('T')[0];
    member.expiryDate = newExpiryDate.toISOString().split('T')[0];
    member.status = 'active';
    member.updatedAt = new Date().toISOString();

    // Add activity log
    dataStore.activities.push({
      id: uuidv4(),
      type: 'member',
      action: 'Membership renewed',
      name: member.name,
      time: new Date().toISOString(),
      memberId: member.id,
      details: `Renewed to ${membershipType} membership until ${member.expiryDate}`
    });

    res.json({
      success: true,
      message: 'Membership renewed successfully',
      data: member
    });
  } catch (error) {
    console.error('Renew membership error:', error);
    res.status(500).json({
      error: 'Failed to renew membership',
      message: error.message
    });
  }
});

// Get member statistics
router.get('/:id/stats', [
  param('id').isUUID().withMessage('Invalid member ID')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const member = dataStore.members.find(m => m.id === req.params.id);
    if (!member) {
      return res.status(404).json({
        error: 'Member not found',
        message: 'The requested member does not exist'
      });
    }

    // Calculate statistics
    const memberSessions = dataStore.sessions.filter(s => s.memberId === member.id);
    const memberInvoices = dataStore.invoices.filter(i => i.memberId === member.id);
    const memberActivities = dataStore.activities.filter(a => a.memberId === member.id);

    const stats = {
      totalVisits: member.totalVisits,
      totalSessions: memberSessions.length,
      completedSessions: memberSessions.filter(s => s.status === 'completed').length,
      totalInvoices: memberInvoices.length,
      paidInvoices: memberInvoices.filter(i => i.status === 'paid').length,
      totalRevenue: memberInvoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + i.total, 0),
      pendingAmount: memberInvoices
        .filter(i => i.status === 'pending')
        .reduce((sum, i) => sum + i.total, 0),
      membershipDays: Math.ceil((new Date(member.expiryDate) - new Date(member.startDate)) / (1000 * 60 * 60 * 24)),
      daysUntilExpiry: Math.ceil((new Date(member.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)),
      recentActivity: memberActivities
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 5)
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get member stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch member statistics',
      message: error.message
    });
  }
});

module.exports = router;

