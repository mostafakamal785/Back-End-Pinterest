const authurization = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      next({ status: 403, message: 'Forbidden: You do not have the required permissions.' });
    }
  }
}
export default authurization;