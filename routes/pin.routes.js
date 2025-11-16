import { Router } from 'express';
import * as pinController from '../controllers/pin.controller.js';
import authenticateToken from '../middlewares/authenticate.js';

const router = Router();

// Like a pin
router.post('/:id/like', authenticateToken, pinController.like);

// Unlike a pin
router.post('/:id/unlike', authenticateToken, pinController.unlike);

// Get likes for a pin
router.get('/:id/likes', pinController.getLikes);

export default router;
