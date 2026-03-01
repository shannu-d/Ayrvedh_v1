import { Router } from 'express';
import { symptomController } from '../controllers/symptomController';

const router = Router();

// Public — no auth required for symptom checker
router.post('/analyze', symptomController.analyze);

export default router;
