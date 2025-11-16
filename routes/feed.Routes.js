import { Router } from 'express';
import { getHomeFeed } from '../controllers/feedController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', auth, getHomeFeed);

export default router;
