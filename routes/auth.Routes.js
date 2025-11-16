import * as authController from '../controllers/auth.Controller.js';
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import handleValidate from '../middlewares/handleValidate.js';
import errorMessage from '../utils/errors.js';
import User from '../models/users.model.js';
const router = Router();

router.post(
  '/login',
  [
    body('email').isEmail().withMessage(errorMessage.INVALID_EMAIL_OR_PASSWORD).custom(async (email) => {
      const user = await User.findOne({ email });
      if (!user) {
        return Promise.reject(errorMessage.INVALID_EMAIL_OR_PASSWORD);
      }
    }),
    body('password')
      .isLength({ min: 9, max: 32 })
      .withMessage(errorMessage.INVALID_EMAIL_OR_PASSWORD),
  ],
  handleValidate,
  authController.login
);
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage(errorMessage.INVALID_EMAIL)
      .custom(async (email) => {
        const user = await User.findOne({ email });
        if (user) {
          return Promise.reject(errorMessage.EMAIL_IN_USE);
        }
      }),
    body('password')
      .isLength({
        min: 9,
        max: 32,
      })
      .withMessage(errorMessage.PASSWORD_LENGTH)
      .isStrongPassword({
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(errorMessage.PASSWORD_TOO_WEEK),
    body('name').notEmpty().withMessage(errorMessage.ENVALID_NAME),
    body('age').optional().isInt({ min: 12 }).withMessage(errorMessage.ENVALID_AGE),
  ],
  handleValidate,
  authController.register
);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/verify-email', authController.verifyEmail);

export default router;
