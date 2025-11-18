import { Router } from 'express';
import * as pinController from '../controllers/pin.controller.js';
import authMiddleware from '../middleware/authenticate.js';

const router = Router();

// Like a pin
router.post('/:id/like', authMiddleware, pinController.like);

// Unlike a pin
router.post('/:id/unlike', authMiddleware, pinController.unlike);

// Get likes for a pin
router.get('/:id/likes', pinController.getLikes);

export default router;
