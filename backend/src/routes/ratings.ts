import { Router } from 'express';
import {
  getLabourRatings,
  getJobRating,
  getClientRatings,
  getLabourRatingStats,
} from '../controllers/ratingController';
import { authenticate } from '../middleware/auth';
import { validateMongoId } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get ratings for a specific labour
router.get('/labour/:labourId/ratings', validateMongoId('labourId'), getLabourRatings);

// Get rating statistics for a labour
router.get('/labour/:labourId/stats', validateMongoId('labourId'), getLabourRatingStats);

// Get rating for a specific job
router.get('/job/:jobId/rating', validateMongoId('jobId'), getJobRating);

// Get all ratings by a specific client
router.get('/client/:clientId/ratings', validateMongoId('clientId'), getClientRatings);

export default router;
