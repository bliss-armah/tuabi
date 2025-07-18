import { Router } from 'express';
import { body } from 'express-validator';
import { login, register } from '../controllers/authController';
import { validateRequest } from '../middleware/validation';

const router = Router();

router.post('/login', [
  body('username').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validateRequest
], login);

router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validateRequest
], register);

export default router; 