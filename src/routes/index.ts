import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import messageRoutes from './messages';
import keyRoutes from './keys';
import conversationRoutes from './conversations';


const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/messages', messageRoutes);
router.use('/keys', keyRoutes);
router.use('/conversations', conversationRoutes);

export default router;
