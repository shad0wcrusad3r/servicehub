import { Router } from 'express';
import { 
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory 
} from '../controllers/categoryController';
import { authenticate, authorize } from '../middleware/auth';
import { validateMongoId } from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();

// Public routes
router.get('/', getCategories);

// Admin routes
router.post('/', 
  authenticate, 
  authorize(['admin']),
  [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('description').optional().trim().isLength({ max: 200 }).withMessage('Description must be max 200 characters')
  ],
  createCategory
);

router.patch('/:id', 
  authenticate, 
  authorize(['admin']),
  validateMongoId('id'),
  updateCategory
);

router.delete('/:id', 
  authenticate, 
  authorize(['admin']),
  validateMongoId('id'),
  deleteCategory
);

export default router;