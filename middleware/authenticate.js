
import jwt from 'jsonwebtoken';
import User from '../models/users.model.js';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies['access-token'] || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next({
        status: 401,
        message: 'Access token required',
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next({
        status: 401,
        message: 'Invalid token',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return next({
      status: 401,
      message: 'Invalid or expired token',
    });
  }
};

export default authMiddleware;
