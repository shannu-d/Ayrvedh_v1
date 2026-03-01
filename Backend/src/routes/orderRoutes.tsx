import { Router } from 'express';
import { orderController } from '../controllers/orderController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/authMiddleware';

const router = Router();

// User routes (protected)
router.post('/', authMiddleware, orderController.create);
router.get('/my', authMiddleware, orderController.getMyOrders);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, orderController.getAll);
router.patch('/:id/status', authMiddleware, adminMiddleware, orderController.updateStatus);

export default router;
