import logger from "./logger.js";

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  logger.error(`${req.method} ${req.url} - ${status} - ${err.message}`);
  res.status(status).json({
    success: false,
    field: err.field || null,
    message: err.message || 'Internal Server Error',
  });
};

export default errorHandler;
