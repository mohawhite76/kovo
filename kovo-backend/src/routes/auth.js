import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { registerValidation, loginValidation } from '../utils/validators.js';
import { body } from 'express-validator';
import { validateRequest } from '../utils/validators.js';

const router = express.Router();

router.post('/register', authLimiter, registerValidation, authController.register);

router.post('/login', authLimiter, loginValidation, authController.login);

router.post('/verify-email', [
  body('email').isEmail().normalizeEmail(),
  body('code').isLength({ min: 6, max: 6 }),
  validateRequest
], authController.verifyEmail);

router.post('/resend-code', [
  body('email').isEmail().normalizeEmail(),
  validateRequest
], authController.resendVerificationCode);

router.post('/request-password-reset', [
  body('email').isEmail().normalizeEmail(),
  validateRequest
], authController.requestPasswordReset);

router.post('/reset-password', [
  body('token').notEmpty(),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  validateRequest
], authController.resetPassword);

router.get('/me', authenticateToken, authController.getProfile);

export default router;
