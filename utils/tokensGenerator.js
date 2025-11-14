import jwt from 'jsonwebtoken';

const generateToken = (payload, secret, options = {}) => {
  return jwt.sign(payload, secret, options);
};
export default generateToken;
