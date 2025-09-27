const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';

// Login endpoint
router.post('/login', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ 
                error: 'Authentication failed',
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                error: 'Authentication failed',
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

            // Generate JWT token
        const token = jwt.sign(
          { userId: user.id, role: user.role, name: user.name },
          process.env.JWT_SECRET || 'change-this-in-production',
          { expiresIn: '24h' }
        );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    try {
      // Try to verify JWT token first
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change-this-in-production');
      
      // Find user in database
      const user = await User.findById(decoded.userId);
      if (user) {
        return res.json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            email: user.email
          }
        });
      }
    } catch (jwtError) {
      // JWT verification failed, check if it's a demo token
      if (token.startsWith('demo-token-')) {
        // Extract user info from demo token or use a default user
        const demoUser = {
          id: '1',
          username: 'owner',
          name: 'Demo User',
          role: 'owner',
          email: 'demo@tristarfitness.com'
        };
        
        return res.json({
          success: true,
          user: demoUser
        });
      }
    }

    res.status(401).json({ error: 'Invalid token' });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Demo authentication endpoint for when database is not available
router.post('/demo-login', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Demo user validation
        const demoUsers = {
            'owner@tristar.com': { id: '1', username: 'owner@tristar.com', name: 'Nikhil Verma', role: 'owner', email: 'owner@tristar.com' },
            'manager@tristar.com': { id: '2', username: 'manager@tristar.com', name: 'Manager', role: 'manager', email: 'manager@tristar.com' },
            'owner': { id: '1', username: 'owner', name: 'Nikhil Verma', role: 'owner', email: 'owner@tristarfitness.com' },
            'manager': { id: '2', username: 'manager', name: 'Manager', role: 'manager', email: 'manager@tristarfitness.com' },
            'nikhil': { id: '3', username: 'nikhil', name: 'Nikhil Verma', role: 'owner', email: 'nikhil@tristarfitness.com' },
            'raj': { id: '4', username: 'raj', name: 'Manager', role: 'manager', email: 'raj@tristarfitness.com' }
        };
        
        if (demoUsers[username] && password === 'demo123') {
            const user = demoUsers[username];
            const token = jwt.sign(
                { userId: user.id, role: user.role, name: user.name },
                process.env.JWT_SECRET || 'change-this-in-production',
                { expiresIn: '24h' }
            );
            
            res.json({
                success: true,
                token,
                user
            });
        } else {
            res.status(401).json({
                error: 'Authentication failed',
                message: 'Invalid credentials'
            });
        }
    } catch (error) {
        console.error('Demo login error:', error);
        res.status(500).json({ error: 'Demo login failed' });
    }
});

// Change password endpoint
router.post('/change-password', [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error('Password confirmation does not match');
        }
        return true;
    })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { currentPassword, newPassword } = req.body;
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        try {
            // Verify JWT token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change-this-in-production');
            
            // Find user in database
            const user = await User.findById(decoded.userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Verify current password
            const isValidPassword = await user.comparePassword(currentPassword);
            if (!isValidPassword) {
                return res.status(401).json({ 
                    error: 'Invalid current password' 
                });
            }

            // Update password
            user.password = newPassword;
            await user.save();

            res.json({ 
                success: true, 
                message: 'Password updated successfully' 
            });
        } catch (jwtError) {
            // Handle demo tokens
            if (token.startsWith('demo-token-')) {
                res.json({ 
                    success: true, 
                    message: 'Password updated successfully (demo mode)' 
                });
            } else {
                throw jwtError;
            }
        }
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
