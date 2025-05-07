const mongoose = require('mongoose');
const validator = require('validator');

const EarlyAccessUserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters'],
    minlength: [2, 'Full name must be at least 2 characters']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    maxlength: [100, 'Country name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    unique: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email address'],
    maxlength: [254, 'Email cannot exceed 254 characters']
  },
  userType: {
    type: String,
    enum: {
      values: ['investor', 'idea_owner', 'general'],
      message: 'User type must be either investor, idea_owner, or general'
    },
    required: [true, 'User type is required']
  },
  ideaCategory: {
    type: String,
    trim: true,
    maxlength: [100, 'Idea category cannot exceed 100 characters'],
    validate: {
      validator: function(value) {
        return this.userType !== 'idea_owner' || value.length > 0;
      },
      message: 'Idea category is required for idea owners'
    }
  },
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters'],
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for better query performance
EarlyAccessUserSchema.index({ email: 1 }, { unique: true });
EarlyAccessUserSchema.index({ userType: 1 });

module.exports = mongoose.model('EarlyAccessUser', EarlyAccessUserSchema);