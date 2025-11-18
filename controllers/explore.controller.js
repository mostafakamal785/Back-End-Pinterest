import { successResponse, errorResponse } from '../utils/response.util.js';
import Board from '../models/board.model.js';
import Pin from '../models/pin.model.js';


// 📌 GET EXPLORE CONTENT (Main Explore Page)
export const getExploreContent = async (req, res) => {
  try {
    const { category, page = 1, limit = 15 } = req.query;
    const userId = req.user?._id;

    let pinQuery = { $and: [] };
    let boardQuery = { privacy: 'public' };

    // Filter by category if provided
    if (category) {
      pinQuery.$and.push({
        $or: [
          { keywords: { $in: [new RegExp(category, 'i')] } },
          { title: { $regex: category, $options: 'i' } },
          { description: { $regex: category, $options: 'i' } },
        ],
      });

      boardQuery.$or = [
        { keywords: { $in: [new RegExp(category, 'i')] } },
        { name: { $regex: category, $options: 'i' } },
        { description: { $regex: category, $options: 'i' } },
      ];
    }

    // If no category, remove the $and operator
    if (pinQuery.$and.length === 0) {
      delete pinQuery.$and;
    }

    // Get random pins
    const randomPins = await Pin.aggregate([
      { $match: pinQuery },
      { $sample: { size: 20 } },
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner',
        },
      },
      { $unwind: '$owner' },
      {
        $project: {
          'owner.password': 0,
          'owner.email': 0,
        },
      },
    ]);

    // Get popular boards (boards with most pins)
    const popularBoards = await Board.find(boardQuery)
      .populate('owner', 'username profilePicture')
      .sort({ pins: -1 })
      .limit(10);

    // Get trending pins (you can implement more complex logic later)
    const trendingPins = await Pin.find(pinQuery)
      .populate('owner', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(15);

    return successResponse(res, {
      randomPins,
      popularBoards,
      trendingPins,
      categories: await getAvailableCategories(),
    });
  } catch (error) {
    console.error('Get Explore Content Error:', error);
    return errorResponse(res, 'Failed to fetch explore content', 500);
  }
};

// 📌 SEARCH CONTENT
export const searchContent = async (req, res) => {
  try {
    const { q, type = 'all', page = 1, limit = 20 } = req.query;

    let results = {};
    const searchRegex = new RegExp(q, 'i');

    if (type === 'all' || type === 'pins') {
      const pins = await Pin.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { keywords: { $in: [searchRegex] } },
        ],
      })
        .populate('owner', 'username profilePicture')
        .populate('board')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const totalPins = await Pin.countDocuments({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { keywords: { $in: [searchRegex] } },
        ],
      });

      results.pins = {
        items: pins,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(totalPins / limit),
          total: totalPins,
        },
      };
    }

    if (type === 'all' || type === 'boards') {
      const boards = await Board.find({
        privacy: 'public',
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { keywords: { $in: [searchRegex] } },
        ],
      })
        .populate('owner', 'username profilePicture')
        .sort({ pins: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const totalBoards = await Board.countDocuments({
        privacy: 'public',
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { keywords: { $in: [searchRegex] } },
        ],
      });

      results.boards = {
        items: boards,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(totalBoards / limit),
          total: totalBoards,
        },
      };
    }

    return successResponse(res, {
      query: q,
      type,
      ...results,
    });
  } catch (error) {
    console.error('Search Content Error:', error);
    return errorResponse(res, 'Failed to search content', 500);
  }
};

// 📌 GET RANDOM PINS
export const getRandomPins = async (req, res) => {
  try {
    const { category, page = 1, limit = 15 } = req.query;

    let matchQuery = {};

    if (category) {
      matchQuery = {
        $or: [
          { keywords: { $in: [new RegExp(category, 'i')] } },
          { title: { $regex: category, $options: 'i' } },
          { description: { $regex: category, $options: 'i' } },
        ],
      };
    }

    const pins = await Pin.aggregate([
      { $match: matchQuery },
      { $sample: { size: parseInt(limit) } },
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner',
        },
      },
      { $unwind: '$owner' },
      {
        $project: {
          'owner.password': 0,
          'owner.email': 0,
        },
      },
    ]);

    return successResponse(res, { pins });
  } catch (error) {
    console.error('Get Random Pins Error:', error);
    return errorResponse(res, 'Failed to fetch random pins', 500);
  }
};

// 📌 GET PINS BY CATEGORY
export const getPinsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 15 } = req.query;

    const pins = await Pin.find({
      $or: [
        { keywords: { $in: [new RegExp(category, 'i')] } },
        { title: { $regex: category, $options: 'i' } },
        { description: { $regex: category, $options: 'i' } },
      ],
    })
      .populate('owner', 'username profilePicture')
      .populate('board')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Pin.countDocuments({
      $or: [
        { keywords: { $in: [new RegExp(category, 'i')] } },
        { title: { $regex: category, $options: 'i' } },
        { description: { $regex: category, $options: 'i' } },
      ],
    });

    return successResponse(res, {
      category,
      pins,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error('Get Pins by Category Error:', error);
    return errorResponse(res, 'Failed to fetch pins by category', 500);
  }
};

// 📌 GET TRENDING PINS
export const getTrendingPins = async (req, res) => {
  try {
    const { timeframe = 'week', limit = 20 } = req.query;

    // Simple trending logic - you can enhance this later with likes/saves count
    let dateFilter = {};
    const now = new Date();

    switch (timeframe) {
      case 'today':
        dateFilter = { createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) } };
        break;
      case 'week':
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
        break;
      case 'month':
        dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } };
        break;
      // 'all' - no date filter
    }

    const pins = await Pin.find(dateFilter)
      .populate('owner', 'username profilePicture')
      .populate('board')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    return successResponse(res, {
      timeframe,
      pins,
    });
  } catch (error) {
    console.error('Get Trending Pins Error:', error);
    return errorResponse(res, 'Failed to fetch trending pins', 500);
  }
};

// 📌 GET POPULAR BOARDS
export const getPopularBoards = async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;

    const boards = await Board.find({ privacy: 'public' })
      .populate('owner', 'username profilePicture')
      .sort({ pins: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Board.countDocuments({ privacy: 'public' });

    return successResponse(res, {
      boards,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error('Get Popular Boards Error:', error);
    return errorResponse(res, 'Failed to fetch popular boards', 500);
  }
};

// 📌 GET BOARDS BY CATEGORY
export const getBoardsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 15 } = req.query;

    const boards = await Board.find({
      privacy: 'public',
      $or: [
        { keywords: { $in: [new RegExp(category, 'i')] } },
        { name: { $regex: category, $options: 'i' } },
        { description: { $regex: category, $options: 'i' } },
      ],
    })
      .populate('owner', 'username profilePicture')
      .sort({ pins: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Board.countDocuments({
      privacy: 'public',
      $or: [
        { keywords: { $in: [new RegExp(category, 'i')] } },
        { name: { $regex: category, $options: 'i' } },
        { description: { $regex: category, $options: 'i' } },
      ],
    });

    return successResponse(res, {
      category,
      boards,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error('Get Boards by Category Error:', error);
    return errorResponse(res, 'Failed to fetch boards by category', 500);
  }
};

// 📌 GET RECENT BOARDS
export const getRecentBoards = async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;

    const boards = await Board.find({ privacy: 'public' })
      .populate('owner', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Board.countDocuments({ privacy: 'public' });

    return successResponse(res, {
      boards,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error('Get Recent Boards Error:', error);
    return errorResponse(res, 'Failed to fetch recent boards', 500);
  }
};

// 📌 GET CATEGORIES
export const getCategories = async (req, res) => {
  try {
    const categories = await getAvailableCategories();
    return successResponse(res, { categories });
  } catch (error) {
    console.error('Get Categories Error:', error);
    return errorResponse(res, 'Failed to fetch categories', 500);
  }
};

// 📌 GET CATEGORIES STATS
export const getCategoriesStats = async (req, res) => {
  try {
    const categories = await getAvailableCategories();

    const stats = await Promise.all(
      categories.map(async (category) => {
        const pinsCount = await Pin.countDocuments({
          keywords: { $in: [new RegExp(category, 'i')] },
        });

        const boardsCount = await Board.countDocuments({
          privacy: 'public',
          keywords: { $in: [new RegExp(category, 'i')] },
        });

        return {
          name: category,
          pinsCount,
          boardsCount,
        };
      })
    );

    return successResponse(res, { stats });
  } catch (error) {
    console.error('Get Categories Stats Error:', error);
    return errorResponse(res, 'Failed to fetch categories stats', 500);
  }
};

// 🔧 HELPER FUNCTIONS
const getAvailableCategories = async () => {
  // You can expand this list based on your app's needs
  return [
    'art',
    'photography',
    'food',
    'travel',
    'fitness',
    'education',
    'beauty',
    'gaming',
    'home decor',
    'fashion',
    'technology',
    'sports',
    'music',
    'movies',
    'books',
    'DIY',
    'wedding',
    'parenting',
    'business',
  ];
};
