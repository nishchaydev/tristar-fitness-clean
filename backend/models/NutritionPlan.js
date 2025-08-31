const mongoose = require('mongoose');

const nutritionPlanSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: [true, 'Member is required']
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: [true, 'Trainer is required']
  },
  title: {
    type: String,
    required: [true, 'Plan title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  goal: {
    type: String,
    enum: [
      'weight_loss',
      'weight_gain',
      'muscle_gain',
      'maintenance',
      'performance',
      'health_improvement',
      'medical_condition'
    ],
    required: [true, 'Goal is required']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  targetMetrics: {
    dailyCalories: {
      type: Number,
      min: [800, 'Daily calories must be at least 800'],
      max: [5000, 'Daily calories cannot exceed 5000']
    },
    protein: {
      type: Number, // in grams
      min: [0, 'Protein cannot be negative']
    },
    carbohydrates: {
      type: Number, // in grams
      min: [0, 'Carbohydrates cannot be negative']
    },
    fats: {
      type: Number, // in grams
      min: [0, 'Fats cannot be negative']
    },
    fiber: {
      type: Number, // in grams
      min: [0, 'Fiber cannot be negative']
    },
    water: {
      type: Number, // in liters
      min: [0, 'Water cannot be negative']
    }
  },
  restrictions: [{
    type: String,
    enum: [
      'vegetarian',
      'vegan',
      'gluten_free',
      'dairy_free',
      'nut_free',
      'shellfish_free',
      'low_sodium',
      'low_sugar',
      'keto',
      'paleo',
      'mediterranean'
    ]
  }],
  allergies: [{
    allergen: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    notes: String
  }],
  mealPlans: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    meals: [{
      type: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout']
      },
      time: String,
      foods: [{
        name: String,
        quantity: Number,
        unit: String,
        calories: Number,
        protein: Number,
        carbohydrates: Number,
        fats: Number,
        fiber: Number
      }],
      totalCalories: Number,
      notes: String
    }]
  }],
  supplements: [{
    name: String,
    dosage: String,
    frequency: String,
    purpose: String,
    startDate: Date,
    endDate: Date,
    notes: String
  }],
  progress: [{
    date: {
      type: Date,
      default: Date.now
    },
    weight: Number,
    bodyFat: Number,
    measurements: {
      chest: Number,
      waist: Number,
      hips: Number,
      arms: Number,
      thighs: Number
    },
    energy: {
      type: Number,
      min: [1, 'Energy level must be at least 1'],
      max: [10, 'Energy level cannot exceed 10']
    },
    adherence: {
      type: Number,
      min: [0, 'Adherence cannot be negative'],
      max: [100, 'Adherence cannot exceed 100']
    },
    notes: String
  }],
  recommendations: [{
    category: {
      type: String,
      enum: ['meal_timing', 'portion_control', 'hydration', 'supplementation', 'exercise_nutrition']
    },
    description: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    isImplemented: {
      type: Boolean,
      default: false
    }
  }],
  notes: String,
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for plan duration
nutritionPlanSchema.virtual('duration').get(function() {
  if (!this.endDate) return null;
  const diffTime = this.endDate - this.startDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for current progress
nutritionPlanSchema.virtual('currentProgress').get(function() {
  if (this.progress.length === 0) return null;
  return this.progress[this.progress.length - 1];
});

// Virtual for average adherence
nutritionPlanSchema.virtual('averageAdherence').get(function() {
  if (this.progress.length === 0) return 0;
  const totalAdherence = this.progress.reduce((sum, p) => sum + p.adherence, 0);
  return Math.round(totalAdherence / this.progress.length);
});

// Indexes for better query performance
nutritionPlanSchema.index({ member: 1 });
nutritionPlanSchema.index({ trainer: 1 });
nutritionPlanSchema.index({ status: 1 });
nutritionPlanSchema.index({ goal: 1 });
nutritionPlanSchema.index({ startDate: 1 });

// Pre-save middleware to validate dates
nutritionPlanSchema.pre('save', function(next) {
  if (this.endDate && this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Method to add progress entry
nutritionPlanSchema.methods.addProgress = function(progressData) {
  this.progress.push(progressData);
  return this.save();
};

// Method to update target metrics
nutritionPlanSchema.methods.updateTargetMetrics = function(newMetrics) {
  this.targetMetrics = { ...this.targetMetrics, ...newMetrics };
  return this.save();
};

// Method to add meal plan
nutritionPlanSchema.methods.addMealPlan = function(day, meals) {
  const existingDayIndex = this.mealPlans.findIndex(mp => mp.day === day);
  
  if (existingDayIndex !== -1) {
    this.mealPlans[existingDayIndex].meals = meals;
  } else {
    this.mealPlans.push({ day, meals });
  }
  
  return this.save();
};

// Method to calculate daily nutrition totals
nutritionPlanSchema.methods.calculateDailyNutrition = function(day) {
  const mealPlan = this.mealPlans.find(mp => mp.day === day);
  if (!mealPlan) return null;
  
  const totals = {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fats: 0,
    fiber: 0
  };
  
  mealPlan.meals.forEach(meal => {
    meal.foods.forEach(food => {
      totals.calories += food.calories || 0;
      totals.protein += food.protein || 0;
      totals.carbohydrates += food.carbohydrates || 0;
      totals.fats += food.fats || 0;
      totals.fiber += food.fiber || 0;
    });
  });
  
  return totals;
};

// Method to check adherence to targets
nutritionPlanSchema.methods.checkAdherence = function(day) {
  const dailyNutrition = this.calculateDailyNutrition(day);
  if (!dailyNutrition || !this.targetMetrics.dailyCalories) return 0;
  
  const calorieAdherence = Math.min(100, (dailyNutrition.calories / this.targetMetrics.dailyCalories) * 100);
  return Math.round(calorieAdherence);
};

const NutritionPlan = mongoose.model('NutritionPlan', nutritionPlanSchema);

module.exports = NutritionPlan;

