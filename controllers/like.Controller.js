import { successResponse, errorResponse } from '../utils/response.util.js';
import Pin from '../models/pin.model.js';
import User from '../models/users.model.js';
import { notifyPinLike, notifyPinUnlike } from './notifications.controller.js';

export const likePin = async (req, res) => {
  try {
    const pinId = req.params.id;
    const userId = req.user._id;

    const pin = await Pin.findById(pinId);
    if (!pin) {
      return errorResponse(res, 'Pin not found', 404);
    }

    const alreadyLiked = pin.likers.some(id => id.toString() === userId.toString());
    if (alreadyLiked) {
      return errorResponse(res, 'Pin already liked', 400);
    }

    pin.likers.push(userId);
    await pin.save();

    // Update user's liked pins
    await User.findByIdAndUpdate(userId, { $addToSet: { likedPins: pinId } });

    // Send notification to pin owner
    await notifyPinLike(pin.owner, userId, pinId);

    return successResponse(res, null, 'Pin liked successfully');
  } catch (error) {
    console.error('Like Pin Error:', error);
    return errorResponse(res, 'Failed to like pin', 500);
  }
};

export const unlikePin = async (req, res) => {
  try {
    const pinId = req.params.id;
    const userId = req.user._id;

    const pin = await Pin.findById(pinId);
    if (!pin) {
      return errorResponse(res, 'Pin not found', 404);
    }

    const likeIndex = pin.likers.findIndex(id => id.toString() === userId.toString());
    if (likeIndex === -1) {
      return errorResponse(res, 'Pin not liked yet', 400);
    }

    pin.likers.splice(likeIndex, 1);
    await pin.save();

    // Remove from user's liked pins
    await User.findByIdAndUpdate(userId, { $pull: { likedPins: pinId } });

    return successResponse(res, null, 'Pin unliked successfully');
  } catch (error) {
    console.error('Unlike Pin Error:', error);
    return errorResponse(res, 'Failed to unlike pin', 500);
  }
};

export const getLikes = async (req, res) => {
  try {
    const pinId = req.params.id;

    const pin = await Pin.findById(pinId).populate('likers', 'username profilePicture name');
    if (!pin) {
      return errorResponse(res, 'Pin not found', 404);
    }

    return successResponse(res, {
      count: pin.likers.length,
      likers: pin.likers
    });
  } catch (error) {
    console.error('Get Likes Error:', error);
    return errorResponse(res, 'Failed to fetch likes', 500);
  }
};
