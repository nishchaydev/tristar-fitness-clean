const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Session title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: [
      'personal_training',
      'group_class',
      'yoga_class',
      'pilates_class',
      'strength_training',
      'cardio_class',
      'spinning',
      'zumba',
      'boxing',
      'crossfit',
      'rehabilitation',
      'consultation'
    ],
    required: [true, 'Session type is required']
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: [true, 'Trainer is required']
  },
  date: {
    type: Date,
    required: [true, 'Session date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required'],
    min: [15, 'Session must be at least 15 minutes'],
    max: [480, 'Session cannot exceed 8 hours']
  },
  maxCapacity: {
    type: Number,
    required: [true, 'Maximum capacity is required'],
    min: [1, 'Maximum capacity must be at least 1']
  },
  currentBookings: {
    type: Number,
    default: 0,
    min: [0, 'Current bookings cannot be negative']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'postponed'],
    default: 'scheduled'
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  equipment: [{
    name: String,
    quantity: Number,
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  requirements: [String],
  notes: String,
  attendees: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    },
    status: {
      type: String,
      enum: ['booked', 'attended', 'no_show', 'cancelled'],
      default: 'booked'
    },
    bookingDate: {
      type: Date,
      default: Date.now
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'refunded'],
      default: 'pending'
    }
  }],
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    pattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    },
    endDate: Date,
    daysOfWeek: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for session availability
sessionSchema.virtual('isAvailable').get(function() {
  return this.currentBookings < this.maxCapacity && this.status === 'scheduled';
});

// Virtual for session progress
sessionSchema.virtual('isInProgress').get(function() {
  const now = new Date();
  const sessionDate = new Date(this.date);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sessionDay = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());
  
  if (today.getTime() !== sessionDay.getTime()) return false;
  
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const startMinutes = parseInt(this.startTime.split(':')[0]) * 60 + parseInt(this.startTime.split(':')[1]);
  const endMinutes = parseInt(this.endTime.split(':')[0]) * 60 + parseInt(this.endTime.split(':')[1]);
  
  return currentTime >= startMinutes && currentTime <= endMinutes;
});

// Virtual for attendance rate
sessionSchema.virtual('attendanceRate').get(function() {
  if (this.currentBookings === 0) return 0;
  const attended = this.attendees.filter(a => a.status === 'attended').length;
  return Math.round((attended / this.currentBookings) * 100);
});

// Indexes for better query performance
sessionSchema.index({ trainer: 1 });
sessionSchema.index({ date: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ type: 1 });
sessionSchema.index({ 'attendees.member': 1 });

// Pre-save middleware to validate time and capacity
sessionSchema.pre('save', function(next) {
  // Validate end time is after start time
  const startMinutes = parseInt(this.startTime.split(':')[0]) * 60 + parseInt(this.startTime.split(':')[1]);
  const endMinutes = parseInt(this.endTime.split(':')[0]) * 60 + parseInt(this.endTime.split(':')[1]);
  
  if (endMinutes <= startMinutes) {
    next(new Error('End time must be after start time'));
  }
  
  // Validate current bookings don't exceed capacity
  if (this.currentBookings > this.maxCapacity) {
    next(new Error('Current bookings cannot exceed maximum capacity'));
  }
  
  // Calculate duration
  this.duration = endMinutes - startMinutes;
  
  next();
});

// Method to book a member
sessionSchema.methods.bookMember = function(memberId) {
  if (this.currentBookings >= this.maxCapacity) {
    throw new Error('Session is at full capacity');
  }
  
  if (this.status !== 'scheduled') {
    throw new Error('Cannot book for non-scheduled session');
  }
  
  // Check if member is already booked
  const existingBooking = this.attendees.find(a => a.member.toString() === memberId.toString());
  if (existingBooking) {
    throw new Error('Member is already booked for this session');
  }
  
  this.attendees.push({
    member: memberId,
    status: 'booked',
    paymentStatus: 'pending'
  });
  
  this.currentBookings += 1;
  return this.save();
};

// Method to cancel a booking
sessionSchema.methods.cancelBooking = function(memberId) {
  const bookingIndex = this.attendees.findIndex(a => a.member.toString() === memberId.toString());
  if (bookingIndex === -1) {
    throw new Error('Booking not found');
  }
  
  this.attendees.splice(bookingIndex, 1);
  this.currentBookings -= 1;
  return this.save();
};

// Method to mark attendance
sessionSchema.methods.markAttendance = function(memberId, status) {
  const booking = this.attendees.find(a => a.member.toString() === memberId.toString());
  if (!booking) {
    throw new Error('Booking not found');
  }
  
  booking.status = status;
  return this.save();
};

// Method to update session status
sessionSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;

