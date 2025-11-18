import { body } from 'express-validator';

export const uploadMediaValidation = [
  body('type')
    .optional()
    .isIn(['image', 'video'])
    .withMessage('Type must be image or video')
    .default('image'),
];

// Middleware for file validation (used with multer)
export const validateFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'File is required',
      errors: [{ field: 'media', message: 'File is required' }],
    });
  }

  // Validate file type
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
  ];

  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'File type not supported',
      errors: [
        {
          field: 'media',
          message: 'File type not supported. Allowed: JPEG, PNG, GIF, WebP, MP4',
        },
      ],
    });
  }

  // Validate file size (20MB max)
  const maxSize = 20 * 1024 * 1024; // 20MB
  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: 'File too large',
      errors: [
        {
          field: 'media',
          message: 'File size must not exceed 20MB',
        },
      ],
    });
  }

  next();
};
