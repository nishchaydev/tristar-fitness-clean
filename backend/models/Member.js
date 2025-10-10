const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
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
  membershipType: {
    type: String,
    enum: ['monthly', 'quarterly', 'semi-annual', 'annual', 'lifetime'],
    required: [true, 'Membership type is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'expired'],
    default: 'active'
  },
  lastVisit: {
    type: Date
  },
  totalVisits: {
    type: Number,
    default: 0,
    min: [0, 'Total visits cannot be negative']
  },
  assignedTrainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer'
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  medicalConditions: [{
    condition: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    notes: String
  }],
  goals: [{
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'cardiovascular_fitness', 'flexibility', 'strength', 'endurance', 'general_fitness']
  }],
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  preferredWorkoutTime: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night']
  },
  membershipFee: {
    type: Number,
    required: [true, 'Membership fee is required'],
    min: [0, 'Membership fee cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending'
  },
  notes: String,
  profilePicture: String,
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

// Virtual for membership status
memberSchema.virtual('isExpired').get(function() {
  return this.expiryDate < new Date();
});

// Virtual for days until expiry
memberSchema.virtual('daysUntilExpiry').get(function() {
  const today = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Indexes for better query performance
memberSchema.index({ email: 1 });
memberSchema.index({ status: 1 });
memberSchema.index({ membershipType: 1 });
memberSchema.index({ assignedTrainer: 1 });
memberSchema.index({ expiryDate: 1 });

// Pre-save middleware to validate expiry date
memberSchema.pre('save', function(next) {
  if (this.expiryDate <= this.startDate) {
    next(new Error('Expiry date must be after start date'));
  }
  next();
});

// Method to check if membership is active
memberSchema.methods.isMembershipActive = function() {
  return this.status === 'active' && this.expiryDate > new Date();
};

// Method to extend membership
memberSchema.methods.extendMembership = function(months) {
  const currentExpiry = new Date(this.expiryDate);
  currentExpiry.setMonth(currentExpiry.getMonth() + months);
  this.expiryDate = currentExpiry;
  return this.save();
};

// Method to record visit
memberSchema.methods.recordVisit = function() {
  this.lastVisit = new Date();
  this.totalVisits += 1;
  return this.save();
};

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;
