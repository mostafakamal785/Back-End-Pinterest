import { successResponse, errorResponse } from '../utils/response.util.js';
import User from '../models/users.model.js';
import Pin from '../models/pin.model.js';
import Board from '../models/board.model.js';
import Comment from '../models/comments.model.js';
import Notification from '../models/notifications.model.js';

// 📊 ADMIN DASHBOARD STATS
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalPins,
      totalBoards,
      totalComments,
      recentUsers,
      recentPins,
      recentBoards
    ] = await Promise.all([
      User.countDocuments(),
      Pin.countDocuments(),
      Board.countDocuments(),
      Comment.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('username name createdAt'),
      Pin.find().sort({ createdAt: -1 }).limit(5).populate('owner', 'username').select('title createdAt'),
      Board.find().sort({ createdAt: -1 }).limit(5).populate('owner', 'username').select('name createdAt')
    ]);

    return successResponse(res, {
      stats: {
        totalUsers,
        totalPins,
        totalBoards,
        totalComments
      },
      recent: {
        users: recentUsers,
        pins: recentPins,
        boards: recentBoards
      }
    });
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    return errorResponse(res, 'Failed to fetch dashboard stats', 500);
  }
};

// 👥 USER MANAGEMENT
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, isVerified } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) query.role = role;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    const users = await User.find(query)
      .select('-password -resetCode -resetCodeExp')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    return successResponse(res, {
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error('Get All Users Error:', error);
    return errorResponse(res, 'Failed to fetch users', 500);
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return errorResponse(res, 'Invalid role', 400);
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password -resetCode -resetCodeExp');

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, { user }, 'User role updated successfully');
  } catch (error) {
    console.error('Update User Role Error:', error);
    return errorResponse(res, 'Failed to update user role', 500);
  }
};

export const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Add suspension logic (you might want to add a suspended field to User model)
    user.isSuspended = true;
    user.suspensionReason = reason;
    user.suspendedAt = new Date();
    await user.save();

    return successResponse(res, { user }, 'User suspended successfully');
  } catch (error) {
    console.error('Suspend User Error:', error);
    return errorResponse(res, 'Failed to suspend user', 500);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Delete user's pins, boards, comments, etc.
    await Promise.all([
      Pin.deleteMany({ owner: id }),
      Board.deleteMany({ owner: id }),
      Comment.deleteMany({ author: id }),
      Notification.deleteMany({ $or: [{ recipient: id }, { sender: id }] })
    ]);

    await User.findByIdAndDelete(id);

    return successResponse(res, null, 'User deleted successfully');
  } catch (error) {
    console.error('Delete User Error:', error);
    return errorResponse(res, 'Failed to delete user', 500);
  }
};

// 📌 CONTENT MODERATION
export const getReportedContent = async (req, res) => {
  try {
    // This would require a reporting system
    // For now, return recent content that might need moderation
    const recentPins = await Pin.find()
      .populate('owner', 'username')
      .sort({ createdAt: -1 })
      .limit(50)
      .select('title description media createdAt');

    return successResponse(res, { reportedContent: recentPins });
  } catch (error) {
    console.error('Get Reported Content Error:', error);
    return errorResponse(res, 'Failed to fetch reported content', 500);
  }
};

export const deletePin = async (req, res) => {
  try {
    const { id } = req.params;

    const pin = await Pin.findById(id);
    if (!pin) {
      return errorResponse(res, 'Pin not found', 404);
    }

    // Remove from board
    if (pin.board) {
      await Board.findByIdAndUpdate(pin.board, {
        $pull: { pins: pin._id }
      });
    }

    // Remove from user likes
    await User.updateMany(
      { likedPins: pin._id },
      { $pull: { likedPins: pin._id } }
    );

    // Delete comments on this pin
    await Comment.deleteMany({ pin: pin._id });

    // Delete the pin
    await Pin.findByIdAndDelete(id);

    return successResponse(res, null, 'Pin deleted successfully');
  } catch (error) {
    console.error('Delete Pin Error:', error);
    return errorResponse(res, 'Failed to delete pin', 500);
  }
};

export const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;

    const board = await Board.findById(id);
    if (!board) {
      return errorResponse(res, 'Board not found', 404);
    }

    // Remove board reference from all pins
    await Pin.updateMany({ board: id }, { $unset: { board: '' } });

    // Delete the board
    await Board.findByIdAndDelete(id);

    return successResponse(res, null, 'Board deleted successfully');
  } catch (error) {
    console.error('Delete Board Error:', error);
    return errorResponse(res, 'Failed to delete board', 500);
  }
};

// 📈 ANALYTICS
export const getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    const [
      newUsers,
      newPins,
      newBoards,
      totalLikes,
      totalComments,
      popularPins,
      popularBoards
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: startDate } }),
      Pin.countDocuments({ createdAt: { $gte: startDate } }),
      Board.countDocuments({ createdAt: { $gte: startDate } }),
      Pin.aggregate([{ $group: { _id: null, total: { $sum: { $size: '$likers' } } } }]),
      Comment.countDocuments({ createdAt: { $gte: startDate } }),
      Pin.find().sort({ likers: -1 }).limit(10).populate('owner', 'username').select('title likers'),
      Board.find().sort({ pins: -1 }).limit(10).populate('owner', 'username').select('name pins')
    ]);

    return successResponse(res, {
      period: `${period} days`,
      growth: {
        newUsers,
        newPins,
        newBoards,
        newComments: totalComments
      },
      engagement: {
        totalLikes: totalLikes[0]?.total || 0,
        popularPins,
        popularBoards
      }
    });
  } catch (error) {
    console.error('Get Analytics Error:', error);
    return errorResponse(res, 'Failed to fetch analytics', 500);
  }
};
