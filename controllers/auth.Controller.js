export const authMiddleware = (req, res, next) => {
  // For now, we'll simulate a logged-in user
  // In real app, you'll verify JWT token here
  req.user = {
    _id: '65a1b2c3d4e5f67890123456', // Simulated user ID
    username: 'testuser',
  };
  next();
};

export const optionalAuthMiddleware = (req, res, next) => {
  // Optional auth - user might or might not be logged in
  req.user = req.user || null;
  next();
};
