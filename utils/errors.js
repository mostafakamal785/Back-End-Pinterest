const ERRORS = {
  // 🔹 Authentication & Authorization
  INVALID_TOKEN: {
    message: 'Invalid or expired token',
    status: 401,
    field: 'token',
  },
  UNAUTHORIZED: {
    message: 'You are not authorized to access this resource',
    status: 403,
    field: null,
  },
  LOGIN_FAILED: {
    message: 'Invalid email or password',
    status: 401,
    field: 'email',
  },

  // 🔹 Validation & Input
  EMAIL_IN_USE: {
    message: 'E-mail already in use',
    status: 400,
    field: 'email',
  },
  INVALID_EMAIL: {
    message: 'Invalid email format',
    status: 400,
    field: 'email',
  },
  INVALID_EMAIL_OR_PASSWORD: {
    message: 'Invalid email or password',
    status: 400,
    field: 'email,password',
  },
  PASSWORD_TOO_SHORT: {
    message: 'Password must be at least 8 characters long',
    status: 400,
    field: 'password',
  },
  PASSWORD_TOO_WEEK: {
    message: 'Password must be include uppercase, lowercase, number, and symbol',
    status: 400,
    field: 'password',
  },
  PASSWORDS_NOT_MATCH: {
    message: 'Passwords do not match',
    status: 400,
    field: 'confirmPassword',
  },
  PASSWORD_LENGTH: {
    message: 'Passwords must be between 9 and 32 characters long',
    status: 400,
    field: 'confirmPassword',
  },
  ENVALID_AGE: {
    message: 'Age must be a number and at least 12',
    status: 400,
    field: 'age',
  },
  ENVALID_NAME: {
    message: 'Name is required',
    status: 400,
    field: 'name',
  },

  // 🔹 Gallery & Image Specific Errors
  INVALID_IMAGE_ID: {
    message: 'Invalid image ID format',
    status: 400,
    field: 'id',
  },
  IMAGE_NOT_FOUND: {
    message: 'Image not found',
    status: 404,
    field: 'id',
  },
  NO_IMAGES_UPLOADED: {
    message: 'No images were uploaded',
    status: 400,
    field: 'images',
  },
  INVALID_PAGINATION_PAGE: {
    message: 'Page must be a positive integer',
    status: 400,
    field: 'page',
  },
  INVALID_PAGINATION_LIMIT: {
    message: 'Limit must be between 1 and 50',
    status: 400,
    field: 'limit',
  },
  UPLOAD_LIMIT_EXCEEDED: {
    message: 'Maximum upload limit exceeded',
    status: 400,
    field: 'images',
  },

  MISSING_FIELDS: {
    message: 'Required fields are missing',
    status: 400,
    field: null,
  },

  // 🔹 Database & Server
  DB_CONNECTION_FAILED: {
    message: 'Failed to connect to database',
    status: 500,
    field: null,
  },
  DUPLICATE_KEY: {
    message: 'Duplicate key error',
    status: 409,
    field: null,
  },
  RESOURCE_NOT_FOUND: {
    message: 'Requested resource not found',
    status: 404,
    field: null,
  },

  // 🔹 File Uploads
  FILE_TOO_LARGE: {
    message: 'Uploaded file exceeds size limit',
    status: 400,
    field: 'file',
  },
  INVALID_FILE_TYPE: {
    message: 'Invalid file type',
    status: 400,
    field: 'file',
  },
  NO_FILE_UPLOADED: {
    message: 'No file was uploaded',
    status: 400,
    field: 'file',
  },

  // 🔹 Fallback
  INTERNAL_SERVER_ERROR: {
    message: 'Internal Server Error',
    status: 500,
    field: null,
  },
};

export default ERRORS;
