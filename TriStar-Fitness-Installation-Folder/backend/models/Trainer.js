const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  specialization: [{
    type: String,
    enum: [
      'strength_training',
      'cardio_fitness',
      'yoga',
      'pilates',
      'crossfit',
      'weight_loss',
      'muscle_gain',
      'flexibility',
      'sports_training',
      'senior_fitness',
      'prenatal_fitness',
      'rehabilitation'
    ]
  }],
  certifications: [{
    name: String,
    issuingOrganization: String,
    issueDate: Date,
    expiryDate: Date,
    certificateNumber: String
  }],
  experience: {
    years: {
      type: Number,
      min: [0, 'Experience years cannot be negative']
    },
    description: String
  },
  education: [{
    degree: String,
    institution: String,
    year: Number,
    field: String
  }],
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Hourly rate is required'],
    min: [0, 'Hourly rate cannot be negative']
  },
  availability: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startTime: String,
    endTime: String,
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  maxClients: {
    type: Number,
    default: 10,
    min: [1, 'Max clients must be at least 1']
  },
  currentClients: {
    type: Number,
    default: 0,
    min: [0, 'Current clients cannot be negative']
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: [0, 'Total reviews cannot be negative']
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave', 'terminated'],
    default: 'active'
  },
  profilePicture: String,
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for availability status
trainerSchema.virtual('isAvailable').get(function() {
  return this.status === 'active' && this.currentClients < this.maxClients;
});

// Virtual for experience level
trainerSchema.virtual('experienceLevel').get(function() {
  if (this.experience.years < 2) return 'Junior';
  if (this.experience.years < 5) return 'Intermediate';
  if (this.experience.years < 10) return 'Senior';
  return 'Expert';
});

// Indexes for better query performance
trainerSchema.index({ email: 1 });
trainerSchema.index({ status: 1 });
trainerSchema.index({ specialization: 1 });
trainerSchema.index({ 'availability.day': 1 });

// Pre-save middleware to validate current clients
trainerSchema.pre('save', function(next) {
  if (this.currentClients > this.maxClients) {
    next(new Error('Current clients cannot exceed maximum clients'));
  }
  next();
});

// Method to check availability for a specific time
trainerSchema.methods.isAvailableAt = function(day, time) {
  const availability = this.availability.find(a => a.day === day && a.isAvailable);
  if (!availability) return false;
  
  const requestedTime = new Date(`2000-01-01 ${time}`);
  const startTime = new Date(`2000-01-01 ${availability.startTime}`);
  const endTime = new Date(`2000-01-01 ${availability.endTime}`);
  
  return requestedTime >= startTime && requestedTime <= endTime;
};

// Method to add client
trainerSchema.methods.addClient = function() {
  if (this.currentClients < this.maxClients) {
    this.currentClients += 1;
    return this.save();
  }
  throw new Error('Maximum clients reached');
};

// Method to remove client
trainerSchema.methods.removeClient = function() {
  if (this.currentClients > 0) {
    this.currentClients -= 1;
    return this.save();
  }
  throw new Error('No clients to remove');
};

// Method to update rating
trainerSchema.methods.updateRating = function(newRating) {
  const totalRating = this.rating.average * this.rating.totalReviews + newRating;
  this.rating.totalReviews += 1;
  this.rating.average = totalRating / this.rating.totalReviews;
  return this.save();
};

const Trainer = mongoose.model('Trainer', trainerSchema);

module.exports = Trainer;

