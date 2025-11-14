import jwt from 'jsonwebtoken';
import generateToken from '../utils/tokensGenerator.js';
const Refesh = (req, res, next) => { 
  const refreshToken = req.cookies['refresh_token'];
  if (!refreshToken) {
    next({
      message: 'Refresh token is missing',
      status: 401,
    });
    return;
  }
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  if (!decoded) {
    next({
      message: 'Invalid refresh token',
      status: 401,
    });
    return;
  }
    const accessToken = generateToken(
      { id: user._id, email: user.email },
      process.env.ACCESS_TOKEN,
      {
        expiresIn: '15m',
      }
  );  
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 15 * 60 * 1000,
  });
  req.user = decoded;
  next();
  
}
const authenticateToken = (req, res, next) => {
  const accessToken = req.cookies['access_token'];

  if (!accessToken) {
    next({
      message: 'Access token is missing',
      status: 401,
    });
    return;
  }
  const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  if (!decoded) {
    Refesh(req, res, next);
    return;
  }
  req.user = decoded;
  next();

};

export default authenticateToken;