import { Router } from 'express';
import { likePin, unlikePin, getLikes } from '../controllers/like.Controller.js';
import authMiddleware from '../middleware/authenticate.js';

const router = Router();

router.post('/:id/like', authMiddleware, likePin);
router.post('/:id/unlike', authMiddleware, unlikePin);
router.get('/:id/likes', getLikes);

export default router;
