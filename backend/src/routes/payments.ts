import { Router } from 'express';
import { mockPayment } from '../controllers/paymentController';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

router.post('/mock-pay', [
  body('jobId').isMongoId().withMessage('Valid job ID required'),
  body('amount').isFloat({ min: 1 }).withMessage('Valid amount required'),
  body('paymentMethod').optional().isString(),
  handleValidationErrors
], mockPayment);

export default router;