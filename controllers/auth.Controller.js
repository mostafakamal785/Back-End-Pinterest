import User from '../models/users.model.js';
import {
  generateAccesToken,
  generateRefreshToken,
  generateVerifyToken,
} from '../utils/tokensGenerator.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import jwt from 'jsonwebtoken';
import { successResponse } from '../utils/response.util.js';

export const logInUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const newUser = await User.findOne({ email });

    if (!newUser) {
      return next({
        status: 401,
        field: 'email',
        message: 'Invalid email or password',
      });
    }

    if (!newUser.isVerified) {
      return next({
        status: 403,
        message: 'Please verify your email to log in',
        field: 'email',
      });
    }

    const isMatch = await bcrypt.compare(password, newUser.password);
    if (!isMatch) {
      return next({
        status: 401,
        field: 'password',
        message: 'Invalid email or password',
      });
    }

    res.cookie('access-token', generateAccesToken(newUser._id, newUser.role), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.cookie('refresh-token', generateRefreshToken(newUser._id, newUser.role), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    successResponse(res, {
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
      },
    }, 'User logged in successfully');
  } catch (error) {
    next({
      status: 500,
      field: 'login',
      message: error.message,
    });
  }
};

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, username, role } = req.body;
    const isRepet = await User.findOne({ $or: [{ email }, { username }] });

    if (isRepet) {
      return next({
        status: 409,
        field: isRepet.email === email ? 'email' : 'username',
        message: isRepet.email === email ? 'Email already exists' : 'Username already exists',
      });
    }

    const hashdPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      username,
      role: role || 'user',
      password: hashdPassword,
      isVerified: false,
    });

    const verifyToken = generateVerifyToken(newUser._id);

    const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${verifyToken}`;
    const message = `Please click the link to verify your email: ${verifyUrl}`;

    await sendEmail(newUser.email, 'Email Verification', message);

    successResponse(res, {
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
      },
    }, 'User registered successfully. Please check your email to verify your account.', 201);
  } catch (error) {
    next(error);
  }
};

export const verifyUser = async (req, res, next) => {
  try {
    const token = req.params.token;

    const decoded = jwt.verify(token, process.env.VERIFY_TOKEN);

    const user = await User.findById(decoded.id);

    if (!user) {
      return next({ status: 404, message: 'User not found' });
    }

    user.isVerified = true;
    user.verifyToken = null;
    await user.save();

    successResponse(res, null, 'Email verified successfully. You can now log in.');
  } catch (error) {
    next({ status: 400, message: 'Invalid or expired verification token', field: 'token' });
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    res.clearCookie('access-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.clearCookie('refresh-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });

    if (!user) {
      return next({
        status: 404,
        field: 'email',
        message: 'No user found with this email',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetCode = hashedToken;
    user.resetCodeExp = Date.now() + 10 * 60 * 1000;
    await user.save();

    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
    const message = `You requested a password reset. Please use this link: ${resetUrl}`;

    await sendEmail(user.email, 'Password Reset Request', message);

    successResponse(res, null, 'Password reset email sent successfully');
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const resetToken = req.params.resetToken;

    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
      resetCode: hashedToken,
      resetCodeExp: { $gt: Date.now() },
    });

    if (!user) {
      return next({
        status: 400,
        message: 'Invalid or expired password reset token',
        field: 'resetToken',
      });
    }

    const hashdPassword = await bcrypt.hash(password, 10);
    user.password = hashdPassword;
    user.resetCode = '';
    user.resetCodeExp = null;

    await user.save();
    successResponse(res, null, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};
