import { Router } from 'express';
import Joi from 'joi';
import authController from '../controllers/authController';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middleware/validation';

const router = Router();

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  publicKey: Joi.string().required(),
  keyFingerprint: Joi.string().required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

router.post('/register', validate(registerSchema), asyncHandler(authController.register));
router.post('/login', validate(loginSchema), asyncHandler(authController.login));

export default router;
