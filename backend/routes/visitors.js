const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// In-memory storage
let visitors = [
  {
    id: '1',
    name: 'Rahul Singh',
    phone: '+91 98765 43215',
    email: 'rahul@example.com',
    checkInTime: '2024-01-20T10:00:00Z',
    checkOutTime: null,
    purpose: 'Gym tour',
    status: 'checked-in'
  }
];

// Get all visitors
router.get('/', (req, res) => {
  try {
    const { status } = req.query;
    let filteredVisitors = [...visitors];

    if (status) {
      filteredVisitors = filteredVisitors.filter(v => v.status === status);
    }

    res.json({
      success: true,
      data: filteredVisitors,
      count: filteredVisitors.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch visitors' });
  }
});

// Check-in visitor
router.post('/checkin', [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('purpose').notEmpty().withMessage('Purpose is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newVisitor = {
      id: uuidv4(),
      ...req.body,
      checkInTime: new Date().toISOString(),
      checkOutTime: null,
      status: 'checked-in'
    };

    visitors.push(newVisitor);

    res.status(201).json({
      success: true,
      message: 'Visitor checked in successfully',
      data: newVisitor
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check in visitor' });
  }
});

// Check-out visitor
router.put('/:id/checkout', (req, res) => {
  try {
    const visitorIndex = visitors.findIndex(v => v.id === req.params.id);
    if (visitorIndex === -1) {
      return res.status(404).json({ error: 'Visitor not found' });
    }

    visitors[visitorIndex].checkOutTime = new Date().toISOString();
    visitors[visitorIndex].status = 'checked-out';

    res.json({
      success: true,
      message: 'Visitor checked out successfully',
      data: visitors[visitorIndex]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check out visitor' });
  }
});

module.exports = router;

