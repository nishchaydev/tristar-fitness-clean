const Joi = require('joi');
const logger = require('../config/logger');

/**
 * Generic validation middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      
      logger.warn('Validation Error', {
        errors: error.details,
        body: req.body,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
      });

      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Replace req.body with validated data
    req.body = value;
    next();
  };
};

/**
 * Validation schemas
 */
const schemas = {
  // User validation
  user: Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().min(2).max(100).required(),
    role: Joi.string().valid('admin', 'trainer', 'staff').default('staff')
  }),

  // Member validation
  member: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).required(),
    membershipType: Joi.string().valid('monthly', 'quarterly', 'semi-annual', 'annual', 'lifetime').required(),
    startDate: Joi.date().required(),
    expiryDate: Joi.date().greater(Joi.ref('startDate')).required(),
    status: Joi.string().valid('active', 'inactive', 'suspended', 'expired').default('active'),
    assignedTrainer: Joi.string().hex().length(24).optional(),
    emergencyContact: Joi.object({
      name: Joi.string().required(),
      phone: Joi.string().required(),
      relationship: Joi.string().required()
    }).optional(),
    address: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      zipCode: Joi.string().optional(),
      country: Joi.string().default('India')
    }).optional(),
    medicalConditions: Joi.array().items(Joi.object({
      condition: Joi.string().required(),
      severity: Joi.string().valid('low', 'medium', 'high').required(),
      notes: Joi.string().optional()
    })).optional(),
    goals: Joi.array().items(Joi.string().valid(
      'weight_loss', 'muscle_gain', 'cardiovascular_fitness', 
      'flexibility', 'strength', 'endurance', 'general_fitness'
    )).optional(),
    fitnessLevel: Joi.string().valid('beginner', 'intermediate', 'advanced').default('beginner'),
    preferredWorkoutTime: Joi.string().valid('morning', 'afternoon', 'evening', 'night').optional(),
    membershipFee: Joi.number().min(0).required(),
    notes: Joi.string().max(1000).optional()
  }),

  // Trainer validation
  trainer: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).required(),
    specialization: Joi.array().items(Joi.string().valid(
      'strength_training', 'cardio_fitness', 'yoga', 'pilates', 'crossfit',
      'weight_loss', 'muscle_gain', 'flexibility', 'sports_training',
      'senior_fitness', 'prenatal_fitness', 'rehabilitation'
    )).min(1).required(),
    experience: Joi.object({
      years: Joi.number().min(0).required(),
      description: Joi.string().optional()
    }).required(),
    hourlyRate: Joi.number().min(0).required(),
    availability: Joi.array().items(Joi.object({
      day: Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').required(),
      startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      isAvailable: Joi.boolean().default(true)
    })).optional(),
    maxClients: Joi.number().min(1).default(10),
    bio: Joi.string().max(1000).optional(),
    notes: Joi.string().optional()
  }),

  // Session validation
  session: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().max(1000).optional(),
    type: Joi.string().valid(
      'personal_training', 'group_class', 'yoga_class', 'pilates_class',
      'strength_training', 'cardio_class', 'spinning', 'zumba', 'boxing',
      'crossfit', 'rehabilitation', 'consultation'
    ).required(),
    trainer: Joi.string().hex().length(24).required(),
    date: Joi.date().min('now').required(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    maxCapacity: Joi.number().min(1).required(),
    price: Joi.number().min(0).required(),
    location: Joi.string().required(),
    equipment: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      quantity: Joi.number().min(1).required(),
      isAvailable: Joi.boolean().default(true)
    })).optional(),
    requirements: Joi.array().items(Joi.string()).optional(),
    notes: Joi.string().optional()
  }),

  // Attendance validation
  attendance: Joi.object({
    memberId: Joi.string().hex().length(24).required(),
    sessionId: Joi.string().hex().length(24).optional(),
    trainerId: Joi.string().hex().length(24).optional(),
    notes: Joi.string().max(500).optional()
  }),

  // Equipment validation
  equipment: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    category: Joi.string().valid(
      'cardio', 'strength_training', 'free_weights', 'machines',
      'accessories', 'yoga_equipment', 'sports_equipment', 'rehabilitation'
    ).required(),
    brand: Joi.string().required(),
    model: Joi.string().optional(),
    serialNumber: Joi.string().optional(),
    purchaseDate: Joi.date().required(),
    warrantyExpiry: Joi.date().optional(),
    location: Joi.string().required(),
    purchasePrice: Joi.number().min(0).required(),
    notes: Joi.string().optional()
  }),

  // Invoice validation
  invoice: Joi.object({
    member: Joi.string().hex().length(24).required(),
    items: Joi.array().items(Joi.object({
      description: Joi.string().required(),
      quantity: Joi.number().min(1).required(),
      unitPrice: Joi.number().min(0).required()
    })).min(1).required(),
    dueDate: Joi.date().min('now').required(),
    paymentMethod: Joi.string().valid(
      'cash', 'credit_card', 'debit_card', 'bank_transfer', 'upi', 'cheque', 'online'
    ).required(),
    notes: Joi.string().optional(),
    terms: Joi.string().optional()
  }),

  // Nutrition plan validation
  nutritionPlan: Joi.object({
    member: Joi.string().hex().length(24).required(),
    trainer: Joi.string().hex().length(24).required(),
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().max(1000).optional(),
    goal: Joi.string().valid(
      'weight_loss', 'weight_gain', 'muscle_gain', 'maintenance',
      'performance', 'health_improvement', 'medical_condition'
    ).required(),
    endDate: Joi.date().greater(Joi.ref('startDate')).optional(),
    targetMetrics: Joi.object({
      dailyCalories: Joi.number().min(800).max(5000).required(),
      protein: Joi.number().min(0).optional(),
      carbohydrates: Joi.number().min(0).optional(),
      fats: Joi.number().min(0).optional(),
      fiber: Joi.number().min(0).optional(),
      water: Joi.number().min(0).optional()
    }).required(),
    restrictions: Joi.array().items(Joi.string().valid(
      'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free',
      'shellfish_free', 'low_sodium', 'low_sugar', 'keto', 'paleo', 'mediterranean'
    )).optional(),
    allergies: Joi.array().items(Joi.object({
      allergen: Joi.string().required(),
      severity: Joi.string().valid('mild', 'moderate', 'severe').required(),
      notes: Joi.string().optional()
    })).optional(),
    notes: Joi.string().optional()
  }),

  // Login validation
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Password change validation
  passwordChange: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  }),

  // Profile update validation
  profileUpdate: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
    bio: Joi.string().max(1000).optional()
  }),

  // Pagination validation
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().optional(),
    filter: Joi.object().optional()
  })
};

/**
 * Specific validation middlewares
 */
const validateUser = validate(schemas.user);
const validateMember = validate(schemas.member);
const validateTrainer = validate(schemas.trainer);
const validateSession = validate(schemas.session);
const validateAttendance = validate(schemas.attendance);
const validateEquipment = validate(schemas.equipment);
const validateInvoice = validate(schemas.invoice);
const validateNutritionPlan = validate(schemas.nutritionPlan);
const validateLogin = validate(schemas.login);
const validatePasswordChange = validate(schemas.passwordChange);
const validateProfileUpdate = validate(schemas.profileUpdate);
const validatePagination = validate(schemas.pagination);

/**
 * Custom validation for specific fields
 */
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  next();
};

const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }
    
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }
  }
  
  next();
};

const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'File is required'
    });
  }
  
  // Check file size (default 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: 'File size too large. Maximum size is 5MB'
    });
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'File type not allowed'
    });
  }
  
  next();
};

module.exports = {
  validate,
  schemas,
  validateUser,
  validateMember,
  validateTrainer,
  validateSession,
  validateAttendance,
  validateEquipment,
  validateInvoice,
  validateNutritionPlan,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate,
  validatePagination,
  validateObjectId,
  validateDateRange,
  validateFileUpload
};

