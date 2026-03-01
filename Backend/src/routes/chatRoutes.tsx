import { Router } from 'express';
import { chatController } from '../controllers/chatController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Public — anyone can chat (history only saved when logged in)
router.post('/', chatController.sendMessage);

// Protected — history management
router.get('/history', authMiddleware, chatController.getHistory);
router.delete('/history', authMiddleware, chatController.clearHistory);

export default router;
