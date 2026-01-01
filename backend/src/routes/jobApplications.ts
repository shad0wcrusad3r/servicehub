import { Router } from 'express';
import { 
  submitJobApplication,
  getJobApplications,
  acceptJobApplication,
  rejectJobApplication,
  getMyApplications
} from '../controllers/jobApplicationController';
import { authenticate, authorize } from '../middleware/auth';
import { body } from 'express-validator';
import { handleValidationErrors, validateMongoId } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Labour: Submit application for a job
router.post(
  '/:id/apply',
  authorize(['labour']),
  validateMongoId('id'),
  [
    body('message')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Message must be less than 500 characters'),
    handleValidationErrors
  ],
  submitJobApplication
);

// Labour: Get my applications
router.get(
  '/my-applications',
  authorize(['labour']),
  getMyApplications
);

// Client: Get applications for a specific job
router.get(
  '/:id/applications',
  authorize(['client']),
  validateMongoId('id'),
  getJobApplications
);

// Client: Accept an application
router.patch(
  '/applications/:id/accept',
  authorize(['client']),
  validateMongoId('id'),
  acceptJobApplication
);

// Client: Reject an application
router.patch(
  '/applications/:id/reject',
  authorize(['client']),
  validateMongoId('id'),
  rejectJobApplication
);

export default router;
