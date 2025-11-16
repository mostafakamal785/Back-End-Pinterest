import Pin from '../models/pin.model.js';

export const getTrending = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;

    // Get pins sorted by like count (descending) and creation date
    const pins = await Pin.find({ privacy: 'public' })
      .sort({ likeCount: -1, createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('publisher', 'username firstName lastName avatar');

    const total = await Pin.countDocuments({ privacy: 'public' });

    return res.status(200).json({ count: pins.length, total, pins });
  } catch (err) {
    next(err);
  }
};

export const getRandom = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Get random public pins using aggregation
    const pins = await Pin.aggregate([
      { $match: { privacy: 'public' } },
      { $sample: { size: limit } },
    ]);

    // Populate publisher details
    const populatedPins = await Pin.populate(pins, {
      path: 'publisher',
      select: 'username firstName lastName avatar',
    });

    return res.status(200).json({ count: populatedPins.length, pins: populatedPins });
  } catch (err) {
    next(err);
  }
};

export default { getTrending, getRandom };
