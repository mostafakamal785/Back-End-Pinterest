// This file is deprecated - like functionality moved to like.Controller.js
// Keeping for backward compatibility but should be removed

export const like = async (req, res, next) => {
  return next({ message: 'Use /api/:id/like instead', status: 410 });
};

export const unlike = async (req, res, next) => {
  return next({ message: 'Use /api/:id/unlike instead', status: 410 });
};

export const getLikes = async (req, res, next) => {
  return next({ message: 'Use /api/:id/likes instead', status: 410 });
};

export default { like, unlike, getLikes };
