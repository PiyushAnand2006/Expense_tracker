import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { forgotPassword, resetPassword } from '../controllers/passwordController.js';
import validate from '../middleware/validate.js';
import protect from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

const registerValidation = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginValidation = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotPasswordValidation = z.object({
  email: z.string().email(),
});

const resetPasswordValidation = z.object({
  password: z.string().min(6),
});

router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.post('/forgot-password', validate(forgotPasswordValidation), forgotPassword);
router.put('/reset-password/:token', validate(resetPasswordValidation), resetPassword);
router.get('/me', protect, getMe);

export default router;
