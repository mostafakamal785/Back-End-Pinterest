export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res, error = 'Error', message = 'An error occurred', statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    error,
    message,
  });
};

export const validationError = (res, errors) => {
  return errorResponse(res, 'ValidationError', 'Validation failed', 422);
};
