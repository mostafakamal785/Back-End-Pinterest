import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Log error with context
  logger.error(`[${req.method}] ${req.url} - ${status} - ${message}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?._id,
    stack: err.stack,
    field: err.field
  });

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(status).json({
    success: false,
    message: isDevelopment ? message : 'Something went wrong',
    field: err.field || null,
    ...(isDevelopment && { stack: err.stack }),
  });
};

export default errorHandler;
