import { errorResponse } from '../utils/response.util.js';

const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Admin access required', 403);
    }

    next();
  } catch (error) {
    console.error('Admin Middleware Error:', error);
    return errorResponse(res, 'Authorization error', 500);
  }
};

export default adminMiddleware;
