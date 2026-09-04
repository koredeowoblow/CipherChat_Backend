import { Router } from 'express';
import userController from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Protect all user routes
router.use(authMiddleware);

router.get('/profile', asyncHandler(userController.getProfile));
router.get('/public-key/:userId', asyncHandler(userController.getPublicKey));
router.get('/search', asyncHandler(userController.searchUsers));
router.post('/block', asyncHandler(userController.blockUser));
router.post('/unblock', asyncHandler(userController.unblockUser));

export default router;
