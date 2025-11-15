const router = require("express").Router();
const {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.Controller");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

// Reset Password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
