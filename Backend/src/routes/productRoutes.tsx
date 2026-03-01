import { Router } from 'express';
import { productController } from '../controllers/productController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', productController.getAll);
router.get('/featured', productController.getFeatured);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getById);

// Admin-only routes
router.post('/', authMiddleware, adminMiddleware, productController.create);
router.patch('/:id', authMiddleware, adminMiddleware, productController.update);
router.delete('/:id', authMiddleware, adminMiddleware, productController.remove);

export default router;
