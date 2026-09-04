import { Router } from 'express';
import keyController from '../controllers/keyController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/initiate', keyController.initiateKeyExchange);
router.post('/complete', keyController.completeKeyExchange);
router.get('/pending', keyController.getPendingExchanges);

export default router;
