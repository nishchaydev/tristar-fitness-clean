const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// In-memory storage
let followUps = [
  {
    id: '1',
    memberId: '1',
    memberName: 'Amit Kumar',
    type: 'membership_expiry',
    status: 'pending',
    dueDate: '2024-02-01',
    notes: 'Membership expires on 01 Feb 2024',
    createdAt: '2024-01-20T09:00:00Z'
  }
];

// Get all follow-ups
router.get('/', (req, res) => {
  try {
    const { status, type } = req.query;
    let filteredFollowUps = [...followUps];

    if (status) {
      filteredFollowUps = filteredFollowUps.filter(f => f.status === status);
    }

    if (type) {
      filteredFollowUps = filteredFollowUps.filter(f => f.type === type);
    }

    res.json({
      success: true,
      data: filteredFollowUps,
      count: filteredFollowUps.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch follow-ups' });
  }
});

// Create new follow-up
router.post('/', [
  body('memberId').notEmpty().withMessage('Member ID is required'),
  body('memberName').notEmpty().withMessage('Member name is required'),
  body('type').isIn(['membership_expiry', 'payment_reminder', 'visit_reminder']).withMessage('Invalid follow-up type'),
  body('dueDate').notEmpty().withMessage('Due date is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newFollowUp = {
      id: uuidv4(),
      ...req.body,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    followUps.push(newFollowUp);

    res.status(201).json({
      success: true,
      message: 'Follow-up created successfully',
      data: newFollowUp
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create follow-up' });
  }
});

// Update follow-up status
router.put('/:id/status', [
  body('status').isIn(['pending', 'completed', 'snoozed']).withMessage('Invalid status')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const followUpIndex = followUps.findIndex(f => f.id === req.params.id);
    if (followUpIndex === -1) {
      return res.status(404).json({ error: 'Follow-up not found' });
    }

    followUps[followUpIndex].status = req.body.status;
    
    if (req.body.status === 'completed') {
      followUps[followUpIndex].completedAt = new Date().toISOString();
    }

    res.json({
      success: true,
      message: 'Follow-up status updated successfully',
      data: followUps[followUpIndex]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update follow-up status' });
  }
});

// Get pending follow-ups
router.get('/pending', (req, res) => {
  try {
    const pendingFollowUps = followUps.filter(f => f.status === 'pending');
    
    res.json({
      success: true,
      data: pendingFollowUps,
      count: pendingFollowUps.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending follow-ups' });
  }
});

module.exports = router;

