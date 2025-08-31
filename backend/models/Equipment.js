const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Equipment name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  category: {
    type: String,
    enum: [
      'cardio',
      'strength_training',
      'free_weights',
      'machines',
      'accessories',
      'yoga_equipment',
      'sports_equipment',
      'rehabilitation'
    ],
    required: [true, 'Category is required']
  },
  brand: {
    type: String,
    required: [true, 'Brand is required']
  },
  model: String,
  serialNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Purchase date is required']
  },
  warrantyExpiry: Date,
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  status: {
    type: String,
    enum: ['available', 'in_use', 'maintenance', 'out_of_order', 'retired'],
    default: 'available'
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'critical'],
    default: 'good'
  },
  maintenanceSchedule: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'annual'],
      default: 'monthly'
    },
    lastMaintenance: Date,
    nextMaintenance: Date,
    maintenanceNotes: String
  },
  usage: {
    totalHours: {
      type: Number,
      default: 0,
      min: [0, 'Total hours cannot be negative']
    },
    dailyUsage: {
      type: Number,
      default: 0,
      min: [0, 'Daily usage cannot be negative']
    },
    maxDailyUsage: {
      type: Number,
      default: 24,
      min: [0, 'Max daily usage cannot be negative']
    }
  },
  specifications: {
    weight: Number, // in kg
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    powerRequirements: String,
    features: [String]
  },
  cost: {
    purchasePrice: {
      type: Number,
      required: [true, 'Purchase price is required'],
      min: [0, 'Purchase price cannot be negative']
    },
    currentValue: {
      type: Number,
      min: [0, 'Current value cannot be negative']
    },
    depreciationRate: {
      type: Number,
      default: 0.1, // 10% per year
      min: [0, 'Depreciation rate cannot be negative']
    }
  },
  assignedTrainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer'
  },
  notes: String,
  images: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  documents: [{
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

// Virtual for equipment age
equipmentSchema.virtual('age').get(function() {
  const now = new Date();
  const purchase = new Date(this.purchaseDate);
  const diffTime = now - purchase;
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  return Math.floor(diffYears);
});

// Virtual for maintenance status
equipmentSchema.virtual('maintenanceStatus').get(function() {
  if (!this.maintenanceSchedule.nextMaintenance) return 'No schedule';
  
  const now = new Date();
  const nextMaintenance = new Date(this.maintenanceSchedule.nextMaintenance);
  
  if (nextMaintenance < now) return 'Overdue';
  if (nextMaintenance - now < 7 * 24 * 60 * 60 * 1000) return 'Due Soon'; // 7 days
  return 'Scheduled';
});

// Virtual for depreciation
equipmentSchema.virtual('depreciatedValue').get(function() {
  const age = this.age;
  const depreciation = this.cost.purchasePrice * this.cost.depreciationRate * age;
  return Math.max(0, this.cost.purchasePrice - depreciation);
});

// Indexes for better query performance
equipmentSchema.index({ category: 1 });
equipmentSchema.index({ status: 1 });
equipmentSchema.index({ condition: 1 });
equipmentSchema.index({ location: 1 });
equipmentSchema.index({ 'maintenanceSchedule.nextMaintenance': 1 });

// Pre-save middleware to calculate next maintenance
equipmentSchema.pre('save', function(next) {
  if (this.maintenanceSchedule.frequency && this.maintenanceSchedule.lastMaintenance) {
    const lastMaintenance = new Date(this.maintenanceSchedule.lastMaintenance);
    let nextMaintenance = new Date(lastMaintenance);
    
    switch (this.maintenanceSchedule.frequency) {
      case 'daily':
        nextMaintenance.setDate(nextMaintenance.getDate() + 1);
        break;
      case 'weekly':
        nextMaintenance.setDate(nextMaintenance.getDate() + 7);
        break;
      case 'monthly':
        nextMaintenance.setMonth(nextMaintenance.getMonth() + 1);
        break;
      case 'quarterly':
        nextMaintenance.setMonth(nextMaintenance.getMonth() + 3);
        break;
      case 'semi_annual':
        nextMaintenance.setMonth(nextMaintenance.getMonth() + 6);
        break;
      case 'annual':
        nextMaintenance.setFullYear(nextMaintenance.getFullYear() + 1);
        break;
    }
    
    this.maintenanceSchedule.nextMaintenance = nextMaintenance;
  }
  
  // Calculate current value based on depreciation
  if (this.cost.purchasePrice && this.cost.depreciationRate) {
    this.cost.currentValue = this.depreciatedValue;
  }
  
  next();
});

// Method to record usage
equipmentSchema.methods.recordUsage = function(hours) {
  this.usage.totalHours += hours;
  this.usage.dailyUsage += hours;
  
  if (this.usage.dailyUsage > this.usage.maxDailyUsage) {
    this.usage.dailyUsage = this.usage.maxDailyUsage;
  }
  
  return this.save();
};

// Method to perform maintenance
equipmentSchema.methods.performMaintenance = function(notes) {
  this.maintenanceSchedule.lastMaintenance = new Date();
  this.maintenanceSchedule.maintenanceNotes = notes;
  this.condition = 'good'; // Reset condition after maintenance
  this.status = 'available';
  
  return this.save();
});

// Method to update condition
equipmentSchema.methods.updateCondition = function(newCondition) {
  this.condition = newCondition;
  
  if (newCondition === 'critical') {
    this.status = 'out_of_order';
  } else if (newCondition === 'poor') {
    this.status = 'maintenance';
  }
  
  return this.save();
};

// Method to assign to trainer
equipmentSchema.methods.assignToTrainer = function(trainerId) {
  this.assignedTrainer = trainerId;
  return this.save();
};

const Equipment = mongoose.model('Equipment', equipmentSchema);

module.exports = Equipment;

