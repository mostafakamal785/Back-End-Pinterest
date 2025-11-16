import { Router } from 'express';
import {
  getTrendingPins,
  getRandomPins,
  getTopCreators,
} from '../controllers/explore.controller.js';

const router = Router();

router.get('/trending', getTrendingPins);
router.get('/random', getRandomPins);
router.get('/top-creators', getTopCreators);

export default router;
