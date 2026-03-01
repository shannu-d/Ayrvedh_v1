import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/role', adminController.updateUserRole);
router.get('/herbs', adminController.getHerbs);
router.post('/herbs', adminController.addHerb);
router.patch('/herbs/:id', adminController.updateHerb);
router.delete('/herbs/:id', adminController.deleteHerb);


export default router;
