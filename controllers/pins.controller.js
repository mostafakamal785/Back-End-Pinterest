import { successResponse, errorResponse } from '../utils/response.util.js';
import Pin from '../models/pin.model.js';
import Board from '../models/board.model.js';
import User from '../models/users.model.js';

// 📌 CREATE PIN
export const createPin = async (req, res) => {
  try {
    const { title, description, board: boardId, keywords, link } = req.body;
    const ownerId = req.user._id;

    // Verify board exists and user owns it
    if (boardId) {
      const board = await Board.findById(boardId);
      if (!board) {
        return errorResponse(res, 'Board not found', 404);
      }
      if (board.owner.toString() !== ownerId.toString()) {
        return errorResponse(res, 'You can only add pins to your own boards', 403);
      }
    }

    // Handle file upload (if implemented)
    let mediaData = {};
    if (req.file) {
      // This would be handled by upload middleware
      mediaData = {
        uri: req.file.path || req.file.filename,
        filename: req.file.filename,
        type: req.file.mimetype?.startsWith('video/') ? 'video' : 'image',
      };
    }

    const pin = await Pin.create({
      title,
      description: description || '',
      media: mediaData,
      owner: ownerId,
      board: boardId || null,
      keywords: keywords || [],
      link: link || '',
    });

    // Add pin to board if specified
    if (boardId) {
      await Board.findByIdAndUpdate(boardId, {
        $push: { pins: pin._id }
      });
    }

    const populatedPin = await Pin.findById(pin._id)
      .populate('owner', 'username profilePicture name')
      .populate('board', 'name');

    return successResponse(res, { pin: populatedPin }, 'Pin created successfully', 201);
  } catch (error) {
    console.error('Create Pin Error:', error);
    return errorResponse(res, 'Failed to create pin', 500);
  }
};

// 📌 GET PIN BY ID
export const getPin = async (req, res) => {
  try {
    const { id } = req.params;

    const pin = await Pin.findById(id)
      .populate('owner', 'username profilePicture name bio')
      .populate('board', 'name description')
      .populate('likers', 'username profilePicture name');

    if (!pin) {
      return errorResponse(res, 'Pin not found', 404);
    }

    // Check if user can view private board pins
    if (pin.board && pin.board.privacy === 'private') {
      const userId = req.user?._id;
      const board = await Board.findById(pin.board._id);
      if (!userId || board.owner.toString() !== userId.toString()) {
        return errorResponse(res, 'Access denied to private board pin', 403);
      }
    }

    return successResponse(res, { pin });
  } catch (error) {
    console.error('Get Pin Error:', error);
    return errorResponse(res, 'Failed to fetch pin', 500);
  }
};

// 📌 GET ALL PINS (with filters)
export const getPins = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      user: userId,
      board: boardId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = {};

    // Filter by category/keywords
    if (category) {
      query.$or = [
        { keywords: { $in: [new RegExp(category, 'i')] } },
        { title: { $regex: category, $options: 'i' } },
        { description: { $regex: category, $options: 'i' } },
      ];
    }

    // Filter by user
    if (userId) {
      query.owner = userId;
    }

    // Filter by board
    if (boardId) {
      query.board = boardId;
    }

    // Only show pins from public boards (unless user owns them)
    if (!req.user || !boardId) {
      const publicBoards = await Board.find({ privacy: 'public' }).select('_id');
      const publicBoardIds = publicBoards.map(b => b._id);
      query.$or = query.$or || [];
      query.$or.push({ board: { $in: publicBoardIds } }, { board: null });
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pins = await Pin.find(query)
      .populate('owner', 'username profilePicture name')
      .populate('board', 'name privacy')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Pin.countDocuments(query);

    return successResponse(res, {
      pins,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error('Get Pins Error:', error);
    return errorResponse(res, 'Failed to fetch pins', 500);
  }
};

// 📌 UPDATE PIN
export const updatePin = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updateData = { ...req.body };

    const pin = await Pin.findById(id);
    if (!pin) {
      return errorResponse(res, 'Pin not found', 404);
    }

    if (pin.owner.toString() !== userId.toString()) {
      return errorResponse(res, 'You can only update your own pins', 403);
    }

    // Handle board change
    if (updateData.board && updateData.board !== pin.board?.toString()) {
      const newBoard = await Board.findById(updateData.board);
      if (!newBoard) {
        return errorResponse(res, 'Board not found', 404);
      }
      if (newBoard.owner.toString() !== userId.toString()) {
        return errorResponse(res, 'You can only move pins to your own boards', 403);
      }

      // Remove from old board
      if (pin.board) {
        await Board.findByIdAndUpdate(pin.board, {
          $pull: { pins: pin._id }
        });
      }

      // Add to new board
      await Board.findByIdAndUpdate(updateData.board, {
        $push: { pins: pin._id }
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.owner;
    delete updateData.likers;

    const updatedPin = await Pin.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    })
      .populate('owner', 'username profilePicture name')
      .populate('board', 'name');

    return successResponse(res, { pin: updatedPin }, 'Pin updated successfully');
  } catch (error) {
    console.error('Update Pin Error:', error);
    return errorResponse(res, 'Failed to update pin', 500);
  }
};

// 📌 DELETE PIN
export const deletePin = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const pin = await Pin.findById(id);
    if (!pin) {
      return errorResponse(res, 'Pin not found', 404);
    }

    if (pin.owner.toString() !== userId.toString()) {
      return errorResponse(res, 'You can only delete your own pins', 403);
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

    // Delete the pin
    await Pin.findByIdAndDelete(id);

    return successResponse(res, null, 'Pin deleted successfully');
  } catch (error) {
    console.error('Delete Pin Error:', error);
    return errorResponse(res, 'Failed to delete pin', 500);
  }
};

// 📌 GET USER'S PINS
export const getUserPins = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const currentUserId = req.user?._id;

    // Check if viewing own pins or if target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return errorResponse(res, 'User not found', 404);
    }

    const pins = await Pin.find({ owner: userId })
      .populate('owner', 'username profilePicture name')
      .populate('board', 'name privacy')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Pin.countDocuments({ owner: userId });

    return successResponse(res, {
      pins,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error('Get User Pins Error:', error);
    return errorResponse(res, 'Failed to fetch user pins', 500);
  }
};
