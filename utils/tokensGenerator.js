import jwt from 'jsonwebtoken';

export const generateAccesToken = (userId, userRole) => {
  return jwt.sign({ id: userId, role: userRole }, process.env.ACCESS_TOKEN, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId, userRole) => {
  return jwt.sign({ id: userId, role: userRole }, process.env.REFRESH_TOKEN, { expiresIn: '30d' });
};

export const generateResetToken = (userId, userRole) => {
  return jwt.sign({ id: userId, role: userRole }, process.env.RESET_TOKEN, { expiresIn: '5m' });
};

export const generateVerifyToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.VERIFY_TOKEN, { expiresIn: '10m' });
};
