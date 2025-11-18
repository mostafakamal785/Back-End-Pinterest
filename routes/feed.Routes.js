import { Router } from 'express';
import { getHomeFeed } from '../controllers/feed.Controller.js';
import authMiddleware from '../middleware/authenticate.js';

const router = Router();

router.get('/', authMiddleware, getHomeFeed);

export default router;
