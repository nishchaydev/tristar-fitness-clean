const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// In-memory storage
let sessions = [
  {
    id: '1',
    trainerId: 'trainer1',
    trainerName: 'Yash',
    memberName: 'Amit Kumar',
    startTime: '2024-01-20T10:00:00Z',
    endTime: null,
    type: 'personal',
    status: 'in-progress'
  }
];

// Get all sessions
router.get('/', (req, res) => {
  try {
    const { status, trainerId } = req.query;
    let filteredSessions = [...sessions];

    if (status) {
      filteredSessions = filteredSessions.filter(s => s.status === status);
    }

    if (trainerId) {
      filteredSessions = filteredSessions.filter(s => s.trainerId === trainerId);
    }

    res.json({
      success: true,
      data: filteredSessions,
      count: filteredSessions.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Create new session
router.post('/', [
  body('trainerId').notEmpty().withMessage('Trainer ID is required'),
  body('trainerName').notEmpty().withMessage('Trainer name is required'),
  body('memberName').notEmpty().withMessage('Member name is required'),
  body('type').isIn(['personal', 'group', 'consultation']).withMessage('Invalid session type')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newSession = {
      id: uuidv4(),
      ...req.body,
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'scheduled'
    };

    sessions.push(newSession);

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: newSession
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Update session status
router.put('/:id/status', [
  body('status').isIn(['scheduled', 'in-progress', 'completed', 'cancelled']).withMessage('Invalid status')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const sessionIndex = sessions.findIndex(s => s.id === req.params.id);
    if (sessionIndex === -1) {
      return res.status(404).json({ error: 'Session not found' });
    }

    sessions[sessionIndex].status = req.body.status;
    
    if (req.body.status === 'completed') {
      sessions[sessionIndex].endTime = new Date().toISOString();
    }

    res.json({
      success: true,
      message: 'Session status updated successfully',
      data: sessions[sessionIndex]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update session status' });
  }
});

module.exports = router;

