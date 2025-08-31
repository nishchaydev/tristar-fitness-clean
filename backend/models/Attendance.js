const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: [true, 'Member is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  checkInTime: {
    type: Date,
    required: [true, 'Check-in time is required']
  },
  checkOutTime: Date,
  duration: Number, // in minutes
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer'
  },
  status: {
    type: String,
    enum: ['checked_in', 'checked_out', 'no_show', 'cancelled'],
    default: 'checked_in'
  },
  notes: String,
  equipment: [{
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment'
    },
    usageTime: Number, // in minutes
    notes: String
  }],
  workoutType: {
    type: String,
    enum: [
      'strength_training',
      'cardio',
      'flexibility',
      'sports',
      'group_class',
      'personal_training',
      'rehabilitation',
      'general_fitness'
    ]
  },
  intensity: {
    type: String,
    enum: ['low', 'moderate', 'high'],
    default: 'moderate'
  },
  caloriesBurned: Number,
  heartRate: {
    average: Number,
    max: Number,
    min: Number
  },
  mood: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  energy: {
    type: Number,
    min: [1, 'Energy level must be at least 1'],
    max: [10, 'Energy level cannot exceed 10']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for visit duration
attendanceSchema.virtual('visitDuration').get(function() {
  if (!this.checkOutTime) return null;
  const diffTime = this.checkOutTime - this.checkInTime;
  return Math.round(diffTime / (1000 * 60)); // Convert to minutes
});

// Virtual for is currently checked in
attendanceSchema.virtual('isCurrentlyCheckedIn').get(function() {
  return this.status === 'checked_in' && !this.checkOutTime;
});

// Indexes for better query performance
attendanceSchema.index({ member: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });
attendanceSchema.index({ session: 1 });
attendanceSchema.index({ trainer: 1 });

// Compound index for member and date
attendanceSchema.index({ member: 1, date: 1 }, { unique: true });

// Pre-save middleware to calculate duration
attendanceSchema.pre('save', function(next) {
  if (this.checkOutTime && this.checkInTime) {
    const diffTime = this.checkOutTime - this.checkInTime;
    this.duration = Math.round(diffTime / (1000 * 60)); // Convert to minutes
  }
  next();
});

// Method to check out
attendanceSchema.methods.checkOut = function() {
  this.checkOutTime = new Date();
  this.status = 'checked_out';
  return this.save();
};

// Method to add equipment usage
attendanceSchema.methods.addEquipmentUsage = function(equipmentId, usageTime, notes) {
  this.equipment.push({
    equipment: equipmentId,
    usageTime,
    notes
  });
  return this.save();
};

// Method to update workout details
attendanceSchema.methods.updateWorkoutDetails = function(workoutType, intensity, caloriesBurned) {
  this.workoutType = workoutType;
  this.intensity = intensity;
  this.caloriesBurned = caloriesBurned;
  return this.save();
};

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;

