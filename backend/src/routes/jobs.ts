import { Router } from 'express';
import { 
  createJob,
  getAvailableJobs,
  acceptJob,
  markWorkDone,
  markPaymentReceived,
  rateAndCompleteJob,
  getUserJobs 
} from '../controllers/jobController';
import { authenticate, authorize } from '../middleware/auth';
import { validateJobCreate, validateRating, validateMongoId } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Common routes
router.get('/my-jobs', getUserJobs);

// Client routes
router.post('/', authorize(['client']), validateJobCreate, createJob);
router.patch('/:id/work-done', authorize(['client']), validateMongoId('id'), markWorkDone);
router.post('/:id/rate', authorize(['client']), validateMongoId('id'), validateRating, rateAndCompleteJob);

// Labour routes
router.get('/available', authorize(['labour']), getAvailableJobs);
router.patch('/:id/accept', authorize(['labour']), validateMongoId('id'), acceptJob);
router.patch('/:id/payment-received', authorize(['labour']), validateMongoId('id'), markPaymentReceived);

export default router;