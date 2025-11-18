import { successResponse, errorResponse } from '../utils/response.util.js';
import Board from '../models/board.model.js';
import Pin from '../models/pin.model.js';

// 📌 CREATE BOARD
export const createBoard = async (req, res) => {
  try {
    const { name, description, privacy, keywords } = req.body;
    const owner = req.user._id;

    const board = await Board.create({
      name,
      description: description || '',
      privacy: privacy || 'public',
      keywords: keywords || [],
      owner,
      pins: [],
    });

    return successResponse(res, { board }, 'Board created successfully', 201);
  } catch (error) {
    console.error('Create Board Error:', error);
    return errorResponse(res, 'Failed to create board', 500);
  }
};

// 📌 GET USER'S BOARDS
export const getUserBoards = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const boards = await Board.find({ owner: userId })
      .populate('owner', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Board.countDocuments({ owner: userId });

    return successResponse(res, {
      boards,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error('Get User Boards Error:', error);
    return errorResponse(res, 'Failed to fetch boards', 500);
  }
};

// 📌 GET SPECIFIC BOARD
export const getBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const board = await Board.findById(id)
      .populate('owner', 'username profilePicture')
      .populate('pins');

    if (!board) {
      return errorResponse(res, 'Board not found', 404);
    }

    // Check if user can access private board
    if (board.privacy === 'private' && board.owner._id.toString() !== userId.toString()) {
      return errorResponse(res, 'Access denied to private board', 403);
    }

    return successResponse(res, { board });
  } catch (error) {
    console.error('Get Board Error:', error);
    return errorResponse(res, 'Failed to fetch board', 500);
  }
};

// 📌 UPDATE BOARD
export const updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updateData = { ...req.body };

    // Find board and check ownership
    const board = await Board.findById(id);
    if (!board) {
      return errorResponse(res, 'Board not found', 404);
    }

    if (board.owner.toString() !== userId.toString()) {
      return errorResponse(res, 'You can only update your own boards', 403);
    }

    const updatedBoard = await Board.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('owner', 'username profilePicture');

    return successResponse(res, { board: updatedBoard }, 'Board updated successfully');
  } catch (error) {
    console.error('Update Board Error:', error);
    return errorResponse(res, 'Failed to update board', 500);
  }
};

// 📌 DELETE BOARD
export const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const board = await Board.findById(id);
    if (!board) {
      return errorResponse(res, 'Board not found', 404);
    }

    if (board.owner.toString() !== userId.toString()) {
      return errorResponse(res, 'You can only delete your own boards', 403);
    }

    // Remove board reference from all pins
    await Pin.updateMany({ board: id }, { $unset: { board: '' } });

    await Board.findByIdAndDelete(id);

    return successResponse(res, null, 'Board deleted successfully');
  } catch (error) {
    console.error('Delete Board Error:', error);
    return errorResponse(res, 'Failed to delete board', 500);
  }
};

// 📌 ADD PIN TO BOARD
export const addPinToBoard = async (req, res) => {
  try {
    const { id, pinId } = req.params;
    const userId = req.user._id;

    // Check if board exists and user owns it
    const board = await Board.findById(id);
    if (!board) {
      return errorResponse(res, 'Board not found', 404);
    }

    if (board.owner.toString() !== userId.toString()) {
      return errorResponse(res, 'You can only add pins to your own boards', 403);
    }

    // Check if pin exists
    const pin = await Pin.findById(pinId);
    if (!pin) {
      return errorResponse(res, 'Pin not found', 404);
    }

    // Check if pin is already in board
    if (board.pins.includes(pinId)) {
      return errorResponse(res, 'Pin already exists in this board', 400);
    }

    // Add pin to board
    board.pins.push(pinId);
    await board.save();

    // Update pin's board reference
    pin.board = id;
    await pin.save();

    const updatedBoard = await Board.findById(id)
      .populate('owner', 'username profilePicture')
      .populate('pins');

    return successResponse(res, { board: updatedBoard }, 'Pin added to board successfully');
  } catch (error) {
    console.error('Add Pin to Board Error:', error);
    return errorResponse(res, 'Failed to add pin to board', 500);
  }
};

// 📌 REMOVE PIN FROM BOARD
export const removePinFromBoard = async (req, res) => {
  try {
    const { id, pinId } = req.params;
    const userId = req.user._id;

    // Check if board exists and user owns it
    const board = await Board.findById(id);
    if (!board) {
      return errorResponse(res, 'Board not found', 404);
    }

    if (board.owner.toString() !== userId.toString()) {
      return errorResponse(res, 'You can only remove pins from your own boards', 403);
    }

    // Remove pin from board
    board.pins = board.pins.filter((pin) => pin.toString() !== pinId);
    await board.save();

    // Remove board reference from pin
    await Pin.findByIdAndUpdate(pinId, { $unset: { board: '' } });

    const updatedBoard = await Board.findById(id)
      .populate('owner', 'username profilePicture')
      .populate('pins');

    return successResponse(res, { board: updatedBoard }, 'Pin removed from board successfully');
  } catch (error) {
    console.error('Remove Pin from Board Error:', error);
    return errorResponse(res, 'Failed to remove pin from board', 500);
  }
};

// 📌 GET BOARD PINS
export const getBoardPins = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const board = await Board.findById(id).populate('owner', 'username profilePicture');
    if (!board) {
      return errorResponse(res, 'Board not found', 404);
    }

    // Get pins with pagination
    const pins = await Pin.find({ _id: { $in: board.pins } })
      .populate('owner', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    return successResponse(res, {
      board: {
        _id: board._id,
        name: board.name,
        description: board.description,
        privacy: board.privacy,
        owner: board.owner,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
      },
      pins,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(board.pins.length / limit),
        total: board.pins.length,
      },
    });
  } catch (error) {
    console.error('Get Board Pins Error:', error);
    return errorResponse(res, 'Failed to fetch board pins', 500);
  }
};

// 📌 SEARCH USER BOARDS
export const searchUserBoards = async (req, res) => {
  try {
    const userId = req.user._id;
    const { q, page = 1, limit = 20 } = req.query;

    let query = { owner: userId };

    if (q && q.trim()) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { keywords: { $in: [new RegExp(q, 'i')] } },
      ];
    }

    const boards = await Board.find(query)
      .populate('owner', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Board.countDocuments(query);

    return successResponse(res, {
      boards,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error('Search User Boards Error:', error);
    return errorResponse(res, 'Failed to search boards', 500);
  }
};

// 📌 FILTER BOARDS BY PRIVACY
export const getBoardsByPrivacy = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type } = req.params;
    const { page = 1, limit = 20 } = req.query;

    let query = { owner: userId };

    if (type !== 'all') {
      query.privacy = type;
    }

    const boards = await Board.find(query)
      .populate('owner', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Board.countDocuments(query);

    return successResponse(res, {
      boards,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error('Filter Boards Error:', error);
    return errorResponse(res, 'Failed to filter boards', 500);
  }
};
