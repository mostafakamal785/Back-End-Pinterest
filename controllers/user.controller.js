import User from '../models/users.model.js';
import Pin from '../models/pin.model.js';

export const follow = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const currentUserId = req.user && (req.user.id || req.user._id || req.user);
    if (!currentUserId) {
      return next({ message: 'Unauthorized', status: 401 });
    }
    if (currentUserId.toString() === targetId.toString()) {
      return next({ message: "You can't follow yourself", status: 400 });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetId),
    ]);

    if (!targetUser) return next({ message: 'Target user not found', status: 404 });
    if (!currentUser) return next({ message: 'Current user not found', status: 404 });

    const alreadyFollowing = currentUser.following.some(
      (id) => id.toString() === targetUser._id.toString()
    );
    if (alreadyFollowing) {
      return res.status(200).json({ message: 'Already following' });
    }

    currentUser.following.push(targetUser._id);
    targetUser.followers.push(currentUser._id);

    await Promise.all([currentUser.save(), targetUser.save()]);

    return res.status(200).json({ message: 'Followed successfully' });
  } catch (err) {
    next(err);
  }
};

export const unfollow = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const currentUserId = req.user && (req.user.id || req.user._id || req.user);
    if (!currentUserId) {
      return next({ message: 'Unauthorized', status: 401 });
    }
    if (currentUserId.toString() === targetId.toString()) {
      return next({ message: "You can't unfollow yourself", status: 400 });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetId),
    ]);

    if (!targetUser) return next({ message: 'Target user not found', status: 404 });
    if (!currentUser) return next({ message: 'Current user not found', status: 404 });

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUser._id.toString()
    );
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== currentUser._id.toString()
    );

    await Promise.all([currentUser.save(), targetUser.save()]);

    return res.status(200).json({ message: 'Unfollowed successfully' });
  } catch (err) {
    next(err);
  }
};

export const getFollowers = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).populate(
      'followers',
      'username firstName lastName avatar'
    );
    if (!user) return next({ message: 'User not found', status: 404 });
    return res.status(200).json({ count: user.followers.length, followers: user.followers });
  } catch (err) {
    next(err);
  }
};

export const getFollowing = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).populate(
      'following',
      'username firstName lastName avatar'
    );
    if (!user) return next({ message: 'User not found', status: 404 });
    return res.status(200).json({ count: user.following.length, following: user.following });
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select(
      '-password -emailVerificationCodeHash -passwordResetTokenHash'
    );
    if (!user) return next({ message: 'User not found', status: 404 });
    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

export const getUserPins = async (req, res, next) => {
  try {
    const userId = req.params.id;
    // find pins published by user
    const pins = await Pin.find({ publisher: userId }).sort({ createdAt: -1 });
    return res.status(200).json({ count: pins.length, pins });
  } catch (err) {
    next(err);
  }
};

export const getUserLiked = async (req, res, next) => {
  try {
    const userId = req.params.id;
    // find pins where likers include user
    const pins = await Pin.find({ likers: userId }).sort({ createdAt: -1 });
    return res.status(200).json({ count: pins.length, pins });
  } catch (err) {
    next(err);
  }
};
export default {
  follow,
  unfollow,
  getFollowers,
  getFollowing,
  getUser,
  getUserPins,
  getUserLiked,
};
