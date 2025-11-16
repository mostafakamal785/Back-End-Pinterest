import { Router } from 'express';
import { likePin, unlikePin, getLikes } from '../controllers/likeController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.post('/:id/like', auth, likePin);
router.post('/:id/unlike', auth, unlikePin);
router.get('/:id/likes', getLikes);

export default router;
