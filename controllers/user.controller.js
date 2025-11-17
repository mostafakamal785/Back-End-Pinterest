import User from "../models/User.js";
import Follow from "../models/Follow.js";
import bcrypt from "bcrypt";

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.params.id;
    const user = await User.findById(userId).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    const followers = await Follow.find({ following: userId }).populate(
      "follower",
      "username profilePicture"
    );
    const following = await Follow.find({ follower: userId }).populate(
      "following",
      "username profilePicture"
    );
    res.status(200).json({
      user,
      followers,
      following,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    if (req.params.id != req.user.id) {
      return res
        .status(403)
        .json({ message: "You can update only your account" });
    }
    const newData = { ...req.body };
    if (newData.password) {
      newData.password = await bcrypt.hash(newData.password, 10);
    }
    const ubdateUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: newData },
      { new: true }
    ).select("-password");
    res.status(200).json(ubdateUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


