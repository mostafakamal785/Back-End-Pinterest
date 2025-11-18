import { successResponse, errorResponse } from '../utils/response.util.js';
import Follow from '../models/follow.model.js';
import User from '../models/users.model.js';
import { notifyFollow, notifyUnfollow } from './notifications.controller.js';

export const follow = async (req, res) => {
  try {
    const followerId = req.user._id;
    const followingId = req.params.id;

    // Prevent self-following
    if (followerId.toString() === followingId) {
      return errorResponse(res, 'You cannot follow yourself', 400);
    }

    // Check if users exist
    const [follower, following] = await Promise.all([
      User.findById(followerId),
      User.findById(followingId)
    ]);

    if (!follower || !following) {
      return errorResponse(res, 'User not found', 404);
    }

    const exists = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });

    if (exists) {
      await Follow.findByIdAndDelete(exists._id);

      // Update follower counts
      await User.findByIdAndUpdate(followerId, { $pull: { following: followingId } });
      await User.findByIdAndUpdate(followingId, { $inc: { followerCount: -1 } });

      // Send unfollow notification
      await notifyUnfollow(followingId, followerId);

      return successResponse(res, null, 'Unfollowed successfully');
    }

    const newFollow = new Follow({
      follower: followerId,
      following: followingId,
    });

    await newFollow.save();

    // Update follower counts
    await User.findByIdAndUpdate(followerId, { $addToSet: { following: followingId } });
    await User.findByIdAndUpdate(followingId, { $inc: { followerCount: 1 } });

    // Send follow notification
    await notifyFollow(followingId, followerId);

    return successResponse(res, null, 'Followed successfully');
  } catch (error) {
    console.error('Follow Error:', error);
    return errorResponse(res, 'Failed to process follow request', 500);
  }
};

export const getFollowers = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const followers = await Follow.find({ following: userId }).populate(
      'follower',
      'username profilePicture name'
    );

    return successResponse(res, {
      count: followers.length,
      followers: followers.map(f => f.follower),
    });
  } catch (error) {
    console.error('Get Followers Error:', error);
    return errorResponse(res, 'Failed to fetch followers', 500);
  }
};

export const getFollowing = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const following = await Follow.find({ follower: userId }).populate(
      'following',
      'username profilePicture name'
    );

    return successResponse(res, {
      count: following.length,
      following: following.map(f => f.following),
    });
  } catch (error) {
    console.error('Get Following Error:', error);
    return errorResponse(res, 'Failed to fetch following', 500);
  }
};
