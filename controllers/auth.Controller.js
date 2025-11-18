const User = require("../models/users.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Generate Tokens
const createAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });

const createRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

// --------------------- REGISTER ---------------------

exports.register = async (req, res, next) => {
  try {
    const { username, firstName, lastName, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ msg: "Email already exists" });

    const hashedPass = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      firstName,
      lastName,
      email,
      password: hashedPass,
      provider: "local",
      isEmailVerified: false,
    });

    res.json({
      msg: "User registered successfully",
      userId: user._id,
    });
  } catch (err) {
    next(err);
  }
};

// --------------------- LOGIN ---------------------
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .select("+password +passwordResetTokenHash");

    if (!user) return res.status(400).json({ msg: "Invalid email" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ msg: "Invalid password" });

    const accessToken = createAccessToken({
      id: user._id,
      role: user.role,
    });

    const refreshToken = createRefreshToken({
      id: user._id,
      tokenVersion: user.tokenVersion,
    });

    res.json({ accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

// --------------------- REFRESH TOKEN ---------------------
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken)
      return res.status(401).json({ msg: "Missing refresh token" });

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err) return res.status(403).json({ msg: "Invalid token" });

        const user = await User.findById(decoded.id);

        if (!user)
          return res.status(404).json({ msg: "User not found" });

        if (decoded.tokenVersion !== user.tokenVersion)
          return res.status(403).json({ msg: "Token expired" });

        const accessToken = createAccessToken({
          id: user._id,
          role: user.role,
        });

        res.json({ accessToken });
      }
    );
  } catch (err) {
    next(err);
  }
};

// --------------------- FORGOT PASSWORD ---------------------
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).select(
      "+passwordResetTokenHash"
    );

    if (!user)
      return res.status(404).json({ msg: "No user with this email" });

    // Generate Token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetTokenHash = hashedToken;
    user.passwordResetExpiresAt = Date.now() + 10 * 60 * 1000; // 10 min
    user.passwordResetLastSentAt = new Date();

    await user.save();

    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/reset-password/${resetToken}`;

    res.json({ msg: "Reset link generated", resetURL });
  } catch (err) {
    next(err);
  }
};

// --------------------- RESET PASSWORD ---------------------
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;

    const hashed = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetTokenHash: hashed,
      passwordResetExpiresAt: { $gt: Date.now() },
    }).select("+passwordResetTokenHash");

    if (!user)
      return res.status(400).json({ msg: "Invalid or expired token" });

    const hashedPass = await bcrypt.hash(req.body.password, 10);

    user.password = hashedPass;
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;

    user.tokenVersion += 1; // invalidate old refresh tokens

    await user.save();

    res.json({ msg: "Password reset successfully" });
  } catch (err) {
    next(err);
  }
};
