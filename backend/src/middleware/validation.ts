import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Handle validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void | Response => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Auth validations
export const validateLabourSignup = [
  body('phone')
    .matches(/^[6789]\d{9}$/)
    .withMessage('Valid 10-digit Indian phone number required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters'),
  body('categories')
    .isArray({ min: 1 })
    .withMessage('At least one category required'),
  body('hourlyRate')
    .isFloat({ min: 50, max: 2000 })
    .withMessage('Hourly rate must be between 50-2000'),
  body('city')
    .isIn(['Hubli', 'Dharwad'])
    .withMessage('City must be Hubli or Dharwad'),
  handleValidationErrors
];

export const validateClientSignup = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),
  body('phone')
    .matches(/^[6789]\d{9}$/)
    .withMessage('Valid 10-digit Indian phone number required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name must be max 100 characters'),
  handleValidationErrors
];

export const validateLogin = [
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password required'),
  handleValidationErrors
];

export const validateOTPRequest = [
  body('phone')
    .matches(/^[6789]\d{9}$/)
    .withMessage('Valid 10-digit Indian phone number required'),
  handleValidationErrors
];

export const validateOTPVerify = [
  body('phone')
    .matches(/^[6789]\d{9}$/)
    .withMessage('Valid 10-digit Indian phone number required'),
  body('otp')
    .isLength({ min: 4, max: 4 })
    .isNumeric()
    .withMessage('OTP must be 4 digits'),
  handleValidationErrors
];

// Job validations
export const validateJobCreate = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be 5-100 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be 20-1000 characters'),
  body('category')
    .isMongoId()
    .withMessage('Valid category ID required'),
  body('city')
    .isIn(['Hubli', 'Dharwad'])
    .withMessage('City must be Hubli or Dharwad'),
  body('estimatedHours')
    .isFloat({ min: 1, max: 100 })
    .withMessage('Estimated hours must be 1-100'),
  handleValidationErrors
];

export const validateRating = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be 1-5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment must be max 500 characters'),
  handleValidationErrors
];

// Query validations
export const validateLabourQuery = [
  query('category')
    .optional()
    .isMongoId()
    .withMessage('Valid category ID required'),
  query('city')
    .optional()
    .isIn(['Hubli', 'Dharwad'])
    .withMessage('City must be Hubli or Dharwad'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be 1-50'),
  handleValidationErrors
];

export const validateMongoId = (field: string = 'id') => [
  param(field)
    .isMongoId()
    .withMessage(`Valid ${field} required`),
  handleValidationErrors
];