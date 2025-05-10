const express = require('express');
const router = express.Router();
const EarlyAccessUser = require('../models/Users');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateUser = [
  body('fullName').trim().notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2-100 characters'),
  body('country').trim().notEmpty().withMessage('Country is required')
    .isLength({ max: 100 }).withMessage('Country name too long'),
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('userType').isIn(['investor', 'idea_owner', 'general'])
    .withMessage('Invalid user type'),
  body('ideaCategory').if(body('userType').equals('idea_owner'))
    .notEmpty().withMessage('Idea category is required for idea owners')
    .trim(),
  body('message').optional().trim().isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters')
];

router.post('/register', validateUser, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }

    const { fullName, country, email, userType, ideaCategory, message } = req.body;

    // Check if user already exists
    const existingUser = await EarlyAccessUser.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        error: 'Email already registered',
        message: 'This email address is already registered'
      });
    }

    // Create new user
    const newUser = new EarlyAccessUser({
      fullName,
      country,
      email,
      userType,
      ideaCategory: userType === 'idea_owner' ? ideaCategory : undefined,
      message: message || undefined
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Thanks for joining Fikra Market! We will contact you soon.',
      data: {
        id: newUser._id,
        email: newUser.email,
        userType: newUser.userType
      }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
});

module.exports = router;
