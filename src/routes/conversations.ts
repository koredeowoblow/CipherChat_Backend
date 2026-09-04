import { Router } from 'express';
import conversationController from '../controllers/conversationController';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.post('/direct', asyncHandler(conversationController.createDirectConversation));
router.get('/', asyncHandler(conversationController.getConversations));
router.post('/:conversationId/accept', asyncHandler(conversationController.acceptConversation));
router.post('/:conversationId/reject', asyncHandler(conversationController.rejectConversation));

export default router;

