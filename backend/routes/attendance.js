const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const Session = require('../models/Session');
const { authenticateToken } = require('../middleware/auth');
const { validateAttendance } = require('../middleware/validation');
const cacheManager = require('../config/cache');
const logger = require('../config/logger');

/**
 * @swagger
 * components:
 *   schemas:
 *     Attendance:
 *       type: object
 *       required:
 *         - member
 *         - checkInTime
 *       properties:
 *         member:
 *           type: string
 *           description: Member ID
 *         date:
 *           type: string
 *           format: date
 *           description: Attendance date
 *         checkInTime:
 *           type: string
 *           format: date-time
 *           description: Check-in time
 *         checkOutTime:
 *           type: string
 *           format: date-time
 *           description: Check-out time
 *         session:
 *           type: string
 *           description: Session ID
 *         trainer:
 *           type: string
 *           description: Trainer ID
 *         status:
 *           type: string
 *           enum: [checked_in, checked_out, no_show, cancelled]
 *           description: Attendance status
 *         workoutType:
 *           type: string
 *           enum: [strength_training, cardio, flexibility, sports, group_class, personal_training, rehabilitation, general_fitness]
 *           description: Type of workout
 *         intensity:
 *           type: string
 *           enum: [low, moderate, high]
 *           description: Workout intensity
 *         caloriesBurned:
 *           type: number
 *           description: Calories burned during workout
 */

/**
 * @swagger
 * /api/v1/attendance:
 *   get:
 *     summary: Get all attendance records with pagination
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: member
 *         schema:
 *           type: string
 *         description: Filter by member ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [checked_in, checked_out, no_show, cancelled]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of attendance records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Attendance'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const startTime = Date.now();
    const { page = 1, limit = 10, member, date, status } = req.query;
    
    // Build filter
    const filter = {};
    if (member) filter.member = member;
    if (date) filter.date = { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) };
    if (status) filter.status = status;

    // Check cache first
    const cacheKey = `attendance:${JSON.stringify(filter)}:${page}:${limit}`;
    const cachedData = await cacheManager.get(cacheKey);
    
    if (cachedData) {
      logger.logPerformance('Attendance List Cache Hit', Date.now() - startTime);
      return res.json(cachedData);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute queries
    const [attendance, total] = await Promise.all([
      Attendance.find(filter)
        .populate('member', 'name email')
        .populate('session', 'title type')
        .populate('trainer', 'name')
        .sort({ checkInTime: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Attendance.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));
    
    const result = {
      success: true,
      data: attendance,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: totalPages
      }
    };

    // Cache the result
    await cacheManager.set(cacheKey, result, 300); // 5 minutes

    logger.logPerformance('Attendance List Query', Date.now() - startTime);
    res.json(result);
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance records'
    });
  }
});

/**
 * @swagger
 * /api/v1/attendance/checkin:
 *   post:
 *     summary: Check in a member
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - memberId
 *             properties:
 *               memberId:
 *                 type: string
 *                 description: Member ID to check in
 *               sessionId:
 *                 type: string
 *                 description: Optional session ID
 *               trainerId:
 *                 type: string
 *                 description: Optional trainer ID
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       201:
 *         description: Member checked in successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/checkin', authenticateToken, validateAttendance, async (req, res) => {
  try {
    const { memberId, sessionId, trainerId, notes } = req.body;

    // Check if member is already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendance = await Attendance.findOne({
      member: memberId,
      date: { $gte: today, $lt: tomorrow },
      status: 'checked_in'
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Member is already checked in today'
      });
    }

    // Create attendance record
    const attendance = new Attendance({
      member: memberId,
      date: today,
      checkInTime: new Date(),
      session: sessionId,
      trainer: trainerId,
      notes,
      status: 'checked_in'
    });

    await attendance.save();

    // Update member's last visit and total visits
    await Member.findByIdAndUpdate(memberId, {
      lastVisit: new Date(),
      $inc: { totalVisits: 1 }
    });

    // Invalidate related cache
    await cacheManager.invalidatePattern('attendance:*');

    logger.info(`Member ${memberId} checked in successfully`);
    
    res.status(201).json({
      success: true,
      message: 'Member checked in successfully',
      data: attendance
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      message: 'Failed to check in member'
    });
  }
});

/**
 * @swagger
 * /api/v1/attendance/{id}/checkout:
 *   put:
 *     summary: Check out a member
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendance record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workoutType:
 *                 type: string
 *                 enum: [strength_training, cardio, flexibility, sports, group_class, personal_training, rehabilitation, general_fitness]
 *               intensity:
 *                 type: string
 *                 enum: [low, moderate, high]
 *               caloriesBurned:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Member checked out successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Attendance record not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/checkout', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { workoutType, intensity, caloriesBurned, notes } = req.body;

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    if (attendance.status !== 'checked_in') {
      return res.status(400).json({
        success: false,
        message: 'Member is not currently checked in'
      });
    }

    // Update attendance record
    attendance.checkOutTime = new Date();
    attendance.status = 'checked_out';
    attendance.workoutType = workoutType;
    attendance.intensity = intensity;
    attendance.caloriesBurned = caloriesBurned;
    if (notes) attendance.notes = notes;

    await attendance.save();

    // Invalidate related cache
    await cacheManager.invalidatePattern('attendance:*');

    logger.info(`Member ${attendance.member} checked out successfully`);
    
    res.json({
      success: true,
      message: 'Member checked out successfully',
      data: attendance
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      message: 'Failed to check out member'
    });
  }
});

/**
 * @swagger
 * /api/v1/attendance/{id}:
 *   get:
 *     summary: Get attendance record by ID
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendance record ID
 *     responses:
 *       200:
 *         description: Attendance record details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Attendance record not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findById(id)
      .populate('member', 'name email phone')
      .populate('session', 'title type startTime endTime')
      .populate('trainer', 'name')
      .populate('equipment.equipment', 'name category');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance record'
    });
  }
});

/**
 * @swagger
 * /api/v1/attendance/{id}:
 *   put:
 *     summary: Update attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendance record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Attendance'
 *     responses:
 *       200:
 *         description: Attendance record updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Attendance record not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticateToken, validateAttendance, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const attendance = await Attendance.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Invalidate related cache
    await cacheManager.invalidatePattern('attendance:*');

    res.json({
      success: true,
      message: 'Attendance record updated successfully',
      data: attendance
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      message: 'Failed to update attendance record'
    });
  }
});

/**
 * @swagger
 * /api/v1/attendance/{id}:
 *   delete:
 *     summary: Delete attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendance record ID
 *     responses:
 *       200:
 *         description: Attendance record deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Attendance record not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findByIdAndDelete(id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Invalidate related cache
    await cacheManager.invalidatePattern('attendance:*');

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      message: 'Failed to delete attendance record'
    });
  }
});

/**
 * @swagger
 * /api/v1/attendance/stats/daily:
 *   get:
 *     summary: Get daily attendance statistics
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date for statistics (defaults to today)
 *     responses:
 *       200:
 *         description: Daily attendance statistics
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/stats/daily', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const stats = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: targetDate, $lt: nextDay }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = stats.reduce((sum, stat) => sum + stat.count, 0);
    const checkedIn = stats.find(s => s._id === 'checked_in')?.count || 0;
    const checkedOut = stats.find(s => s._id === 'checked_out')?.count || 0;

    res.json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        total,
        checkedIn,
        checkedOut,
        active: checkedIn - checkedOut,
        breakdown: stats
      }
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch daily statistics'
    });
  }
});

module.exports = router;

