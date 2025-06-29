import { Router } from 'express';
import { 
  getSubscriptions, 
  createSubscription, 
  cancelSubscription 
} from '../controllers/subscriptionController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', getSubscriptions);
router.post('/', createSubscription);
router.put('/:id/cancel', cancelSubscription);

export default router; 