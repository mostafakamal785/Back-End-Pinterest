import express from 'express';
import { follow, getFollowers, getFollowing } from '../controllers/follow.Controller.js';
import authMiddleware from '../middleware/authenticate.js';

const router = express.Router();

router.post('/:id/follow', authMiddleware, follow);
router.get('/:id/followers', getFollowers);

router.get('/:id/following', getFollowing);

export default router;
