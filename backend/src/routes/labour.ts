import { Router } from 'express';
import { 
  getLabourProfiles,
  getLabourProfile,
  getUnapprovedLabours,
  updateLabourApproval 
} from '../controllers/labourController';
import { authenticate, authorize } from '../middleware/auth';
import { validateLabourQuery, validateMongoId } from '../middleware/validation';

const router = Router();

// Public routes
router.get('/', validateLabourQuery, getLabourProfiles);
router.get('/:id', validateMongoId('id'), getLabourProfile);

// Admin routes
router.get('/admin/unapproved', authenticate, authorize(['admin']), getUnapprovedLabours);
router.patch('/:id/approval', authenticate, authorize(['admin']), validateMongoId('id'), updateLabourApproval);

export default router;