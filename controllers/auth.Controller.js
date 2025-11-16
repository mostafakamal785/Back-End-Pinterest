// Minimal auth controller stubs so route registrations receive functions.
// Replace these with real implementations as needed.

export const login = async (req, res, next) => {
  try {
    res.status(501).json({ message: 'Not implemented: login' });
  } catch (err) {
    next(err);
  }
};

export const register = async (req, res, next) => {
  try {
    res.status(501).json({ message: 'Not implemented: register' });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.status(501).json({ message: 'Not implemented: logout' });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    res.status(501).json({ message: 'Not implemented: forgotPassword' });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    res.status(501).json({ message: 'Not implemented: resetPassword' });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    res.status(501).json({ message: 'Not implemented: verifyEmail' });
  } catch (err) {
    next(err);
  }
};

export default { login, register, logout, forgotPassword, resetPassword, verifyEmail };
