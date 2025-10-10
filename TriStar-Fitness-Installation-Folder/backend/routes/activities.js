const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// In-memory storage
let activities = [
  {
    id: '1',
    type: 'member',
    action: 'Member registered',
    name: 'Amit Kumar',
    time: '2024-01-20T09:00:00Z',
    details: 'New monthly membership',
    memberId: '1'
  }
];

// Get all activities
router.get('/', (req, res) => {
  try {
    const { type, limit = 50 } = req.query;
    let filteredActivities = [...activities];

    if (type) {
      filteredActivities = filteredActivities.filter(a => a.type === type);
    }

    // Sort by time (newest first) and limit
    filteredActivities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    filteredActivities = filteredActivities.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: filteredActivities,
      count: filteredActivities.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Create new activity
router.post('/', [
  body('type').isIn(['member', 'visitor', 'trainer', 'invoice', 'followup']).withMessage('Invalid activity type'),
  body('action').notEmpty().withMessage('Action is required'),
  body('name').notEmpty().withMessage('Name is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newActivity = {
      id: uuidv4(),
      ...req.body,
      time: new Date().toISOString()
    };

    activities.push(newActivity);

    res.status(201).json({
      success: true,
      message: 'Activity logged successfully',
      data: newActivity
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

module.exports = router;

