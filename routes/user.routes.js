import express from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller.js';
import authMiddleware from '../middleware/authenticate.js';

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);

router.get('/:id', getProfile);

router.put('/:id', authMiddleware, updateProfile);
export default router;
