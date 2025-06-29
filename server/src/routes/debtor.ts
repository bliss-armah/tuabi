import { Router } from 'express';
import { body } from 'express-validator';
import { 
  getAllDebtors, 
  getDebtorById, 
  createDebtor, 
  updateDebtor, 
  deleteDebtor 
} from '../controllers/debtorController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', getAllDebtors);
router.get('/:id', getDebtorById);

router.post('/', [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('amountOwed').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('description').optional().isString(),
  body('phoneNumber').optional().isString(),
  validateRequest
], createDebtor);

router.put('/:id', [
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Name cannot be empty'),
  body('amountOwed').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('description').optional().isString(),
  body('phoneNumber').optional().isString(),
  validateRequest
], updateDebtor);

router.delete('/:id', deleteDebtor);

export default router; 