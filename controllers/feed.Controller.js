import { successResponse, errorResponse } from '../utils/response.util.js';
import Pin from '../models/pin.model.js';
import User from '../models/users.model.js';
import Follow from '../models/follow.model.js';

export const getHomeFeed = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    // Get users that the current user follows
    const following = await Follow.find({ follower: userId }).select('following');
    const followingIds = following.map(f => f.following);

    // Include user's own pins and pins from followed users
    const userIds = [userId, ...followingIds];

    // Get pins from followed users and own pins
    const pins = await Pin.find({ owner: { $in: userIds } })
      .populate('owner', 'username profilePicture name')
      .populate('board', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Pin.countDocuments({ owner: { $in: userIds } });

    return successResponse(res, {
      pins,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error('Get Home Feed Error:', error);
    return errorResponse(res, 'Failed to fetch home feed', 500);
  }
};
