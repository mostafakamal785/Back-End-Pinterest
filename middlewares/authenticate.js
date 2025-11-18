const jwt = require("jsonwebtoken");
const User = require("../models/users.model");

module.exports = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token)
      return res.status(401).json({ message: "Not authorized. Token missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
