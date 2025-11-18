import { successResponse, errorResponse } from '../utils/response.util.js';
import User from '../models/users.model.js';
import Follow from '../models/follow.model.js';
import bcrypt from 'bcrypt';

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.params.id;
    const user = await User.findById(userId).select('-password -resetCode -resetCodeExp');

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const followers = await Follow.find({ following: userId }).populate(
      'follower',
      'username profilePicture name'
    );
    const following = await Follow.find({ follower: userId }).populate(
      'following',
      'username profilePicture name'
    );

    return successResponse(res, {
      user,
      followers: followers.map(f => f.follower),
      following: following.map(f => f.following),
      stats: {
        followersCount: followers.length,
        followingCount: following.length,
      },
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return errorResponse(res, 'Failed to fetch profile', 500);
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (req.params.id !== req.user._id.toString()) {
      return errorResponse(res, 'You can only update your own profile', 403);
    }

    const allowedFields = ['name', 'username', 'bio', 'profilePicture', 'profilePic'];
    const updateData = {};

    // Only allow updating specified fields
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    // Check if username is being updated and if it's unique
    if (updateData.username) {
      const existingUser = await User.findOne({
        username: updateData.username,
        _id: { $ne: req.params.id }
      });
      if (existingUser) {
        return errorResponse(res, 'Username already taken', 409);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -resetCode -resetCodeExp');

    if (!updatedUser) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, { user: updatedUser }, 'Profile updated successfully');
  } catch (error) {
    console.error('Update Profile Error:', error);
    return errorResponse(res, 'Failed to update profile', 500);
  }
};
