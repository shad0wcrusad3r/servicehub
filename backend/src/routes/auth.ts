import { Router } from 'express';
import { 
  labourRequestOTP,
  labourSignup,
  clientSignup,
  login,
  getMe 
} from '../controllers/authController';
import { body } from 'express-validator';
import { 
  validateClientSignup,
  validateLogin,
  validateOTPRequest,
  handleValidationErrors 
} from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

// Labour authentication
router.post('/labour/request-otp', validateOTPRequest, labourRequestOTP);
router.post('/labour/signup', [
  body('phone').matches(/^[6789]\d{9}$/).withMessage('Valid 10-digit Indian phone number required'),
  body('otp').isLength({ min: 4, max: 4 }).isNumeric().withMessage('OTP must be 4 digits'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('categories').isArray({ min: 1 }).withMessage('At least one category required'),
  body('hourlyRate').isFloat({ min: 50, max: 2000 }).withMessage('Hourly rate must be between 50-2000'),
  body('city').isIn(['Hubli', 'Dharwad']).withMessage('City must be Hubli or Dharwad'),
  handleValidationErrors
], labourSignup);

// Client authentication  
router.post('/client/signup', validateClientSignup, clientSignup);

// Common login
router.post('/login', validateLogin, login);

// Get current user (protected route for token verification)
router.get('/me', authenticate, getMe);

export default router;