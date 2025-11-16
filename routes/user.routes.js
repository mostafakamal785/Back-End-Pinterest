import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import authenticateToken from '../middlewares/authenticate.js';

const router = Router();

// Get user profile
router.get('/:id', userController.getUser);

// Get pins published by user
router.get('/:id/pins', userController.getUserPins);

// Get pins liked by user
router.get('/:id/liked', userController.getUserLiked);

// Follow a user
router.post('/:id/follow', authenticateToken, userController.follow);

// Unfollow a user
router.post('/:id/unfollow', authenticateToken, userController.unfollow);

// Get followers of a user
router.get('/:id/followers', userController.getFollowers);

// Get users that a user is following
router.get('/:id/following', userController.getFollowing);

export default router;
