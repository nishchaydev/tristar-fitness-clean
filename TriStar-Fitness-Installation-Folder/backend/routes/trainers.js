const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// In-memory storage (replace with database)
let trainers = [
  {
    id: 'trainer1',
    name: 'Yash',
    phone: '+91 98765 43212',
    email: 'yash@tristarfitness.com',
    specialization: 'Weight Training',
    checkInTime: '2024-01-20T08:00:00Z',
    checkOutTime: null,
    status: 'available',
    currentSessions: 2,
    totalSessions: 150,
    joinDate: '2023-01-01',
    salary: 25000
  },
  {
    id: 'trainer2',
    name: 'Mohit Sen',
    phone: '+91 98765 43213',
    email: 'mohit@tristarfitness.com',
    specialization: 'Cardio & Yoga',
    checkInTime: '2024-01-20T09:00:00Z',
    checkOutTime: null,
    status: 'busy',
    currentSessions: 1,
    totalSessions: 120,
    joinDate: '2023-03-01',
    salary: 22000
  },
  {
    id: 'trainer3',
    name: 'Palak Dubey',
    phone: '+91 98765 43214',
    email: 'palak@tristarfitness.com',
    specialization: 'Zumba & Dance',
    checkInTime: null,
    checkOutTime: null,
    status: 'offline',
    currentSessions: 0,
    totalSessions: 80,
    joinDate: '2023-06-01',
    salary: 20000
  }
];

// Get all trainers
router.get('/', (req, res) => {
  try {
    const { status } = req.query;
    let filteredTrainers = [...trainers];

    if (status) {
      filteredTrainers = filteredTrainers.filter(t => t.status === status);
    }

    res.json({
      success: true,
      data: filteredTrainers,
      count: filteredTrainers.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trainers' });
  }
});

// Get trainer by ID
router.get('/:id', (req, res) => {
  try {
    const trainer = trainers.find(t => t.id === req.params.id);
    if (!trainer) {
      return res.status(404).json({ error: 'Trainer not found' });
    }
    res.json({ success: true, data: trainer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trainer' });
  }
});

// Create new trainer
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('specialization').notEmpty().withMessage('Specialization is required'),
  body('salary').isNumeric().withMessage('Salary must be a number')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newTrainer = {
      id: uuidv4(),
      ...req.body,
      status: 'offline',
      currentSessions: 0,
      totalSessions: 0,
      joinDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    trainers.push(newTrainer);

    res.status(201).json({
      success: true,
      message: 'Trainer created successfully',
      data: newTrainer
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create trainer' });
  }
});

// Update trainer
router.put('/:id', (req, res) => {
  try {
    const trainerIndex = trainers.findIndex(t => t.id === req.params.id);
    if (trainerIndex === -1) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    trainers[trainerIndex] = {
      ...trainers[trainerIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Trainer updated successfully',
      data: trainers[trainerIndex]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update trainer' });
  }
});

// Check-in trainer
router.post('/:id/checkin', (req, res) => {
  try {
    const trainerIndex = trainers.findIndex(t => t.id === req.params.id);
    if (trainerIndex === -1) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    trainers[trainerIndex].checkInTime = new Date().toISOString();
    trainers[trainerIndex].checkOutTime = null;
    trainers[trainerIndex].status = 'available';

    res.json({
      success: true,
      message: 'Trainer checked in successfully',
      data: trainers[trainerIndex]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check in trainer' });
  }
});

// Check-out trainer
router.post('/:id/checkout', (req, res) => {
  try {
    const trainerIndex = trainers.findIndex(t => t.id === req.params.id);
    if (trainerIndex === -1) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    trainers[trainerIndex].checkOutTime = new Date().toISOString();
    trainers[trainerIndex].status = 'offline';
    trainers[trainerIndex].currentSessions = 0;

    res.json({
      success: true,
      message: 'Trainer checked out successfully',
      data: trainers[trainerIndex]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check out trainer' });
  }
});

// Delete trainer
router.delete('/:id', (req, res) => {
  try {
    const trainerIndex = trainers.findIndex(t => t.id === req.params.id);
    if (trainerIndex === -1) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    const deletedTrainer = trainers.splice(trainerIndex, 1)[0];

    res.json({
      success: true,
      message: 'Trainer deleted successfully',
      data: deletedTrainer
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete trainer' });
  }
});

// Get trainer statistics
router.get('/stats/summary', (req, res) => {
  try {
    const totalTrainers = trainers.length;
    const availableTrainers = trainers.filter(t => t.status === 'available').length;
    const busyTrainers = trainers.filter(t => t.status === 'busy').length;
    const offlineTrainers = trainers.filter(t => t.status === 'offline').length;
    
    const totalSessions = trainers.reduce((sum, t) => sum + t.totalSessions, 0);
    const currentSessions = trainers.reduce((sum, t) => sum + t.currentSessions, 0);

    res.json({
      success: true,
      data: {
        totalTrainers,
        availableTrainers,
        busyTrainers,
        offlineTrainers,
        totalSessions,
        currentSessions
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trainer statistics' });
  }
});

module.exports = router;

