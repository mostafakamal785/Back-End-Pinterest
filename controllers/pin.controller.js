import Pin from '../models/pin.model.js';
import User from '../models/users.model.js';

export const like = async (req, res, next) => {
  try {
    const pinId = req.params.id;
    const userId = req.user && (req.user.id || req.user._id || req.user);
    if (!userId) return next({ message: 'Unauthorized', status: 401 });

    const [pin, user] = await Promise.all([Pin.findById(pinId), User.findById(userId)]);
    if (!pin) return next({ message: 'Pin not found', status: 404 });
    if (!user) return next({ message: 'User not found', status: 404 });

    const alreadyLiked = pin.likers.some((id) => id.toString() === user._id.toString());
    if (alreadyLiked) return res.status(200).json({ message: 'Already liked' });

    pin.likers.push(user._id);
    user.likedPins = user.likedPins || [];
    if (!user.likedPins.some((id) => id.toString() === pin._id.toString())) {
      user.likedPins.push(pin._id);
    }

    await Promise.all([pin.save(), user.save()]);

    return res.status(200).json({ message: 'Liked successfully' });
  } catch (err) {
    next(err);
  }
};

export const unlike = async (req, res, next) => {
  try {
    const pinId = req.params.id;
    const userId = req.user && (req.user.id || req.user._id || req.user);
    if (!userId) return next({ message: 'Unauthorized', status: 401 });

    const [pin, user] = await Promise.all([Pin.findById(pinId), User.findById(userId)]);
    if (!pin) return next({ message: 'Pin not found', status: 404 });
    if (!user) return next({ message: 'User not found', status: 404 });

    pin.likers = pin.likers.filter((id) => id.toString() !== user._id.toString());
    user.likedPins = (user.likedPins || []).filter((id) => id.toString() !== pin._id.toString());

    await Promise.all([pin.save(), user.save()]);

    return res.status(200).json({ message: 'Unliked successfully' });
  } catch (err) {
    next(err);
  }
};

export const getLikes = async (req, res, next) => {
  try {
    const pinId = req.params.id;
    const pin = await Pin.findById(pinId).populate('likers', 'username firstName lastName avatar');
    if (!pin) return next({ message: 'Pin not found', status: 404 });
    return res.status(200).json({ count: pin.likers.length, likers: pin.likers });
  } catch (err) {
    next(err);
  }
};

export default { like, unlike, getLikes };
