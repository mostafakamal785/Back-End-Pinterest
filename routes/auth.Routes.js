import express from 'express';
import {
  logInUser,
  registerUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  verifyUser,
} from '../controllers/auth.Controller.js';
import { body, param } from 'express-validator';
import handleValidate from '../middleware/handleValidate.js';
import authenticate from '../middleware/authenticate.js';
import User from '../models/users.model.js';

const router = express.Router();

router.post(
  '/login',
  [
    body('email').trim().isEmail().normalizeEmail().withMessage('INVALIDE_EMAIL_OR_PASSWORD'),
    body('password').trim().notEmpty().withMessage('INVALIDE_EMAIL_OR_PASSWORD'),
  ],
  handleValidate,
  logInUser
);
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('username').trim().notEmpty().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
    body('email').trim().isEmail().normalizeEmail().withMessage('Invalid email format'),
    body('password')
      .trim()
      .isStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage('Password must be at least 6 characters with uppercase, lowercase, number and symbol'),
    body('role').optional().trim().isIn(['user', 'admin']).withMessage('Invalid role'),
  ],
  handleValidate,
  registerUser
);

router.get(
  '/verify/:token',
  param('token').trim().notEmpty().escape().withMessage('TOKEN_REQUIRED'),
  handleValidate,
  verifyUser
);

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -resetCode -resetCodeExp');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/logout', logoutUser);

router.post(
  '/forgot-password',
  [body('email').trim().isEmail().normalizeEmail().withMessage('INVALIDE_EMAIL_FORMAT')],
  handleValidate,
  forgotPassword
);

router.post(
  '/reset-password/:resetToken',
  [
    body('password')
      .trim()
      .isStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage('Password must be at least 6 characters with uppercase, lowercase, number and symbol'),
    param('resetToken').notEmpty().trim().escape().withMessage('Invalid token'),
  ],
  handleValidate,
  resetPassword
);

// router.get('/refresh-token',)

export default router;
