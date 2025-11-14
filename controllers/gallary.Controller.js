import Image from '../models/gallary.Model.js';

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      next({ message: 'there is no files upload', satuts: 400 });
    }
    if (!req.user || !req.user._id) {
      next({ message: 'unauthenticated user', status: 401 });
    }
    const newImage = new Image({
      path: req.file.path,
      createdAt: Date.now(),
      filename: req.file.filename,
      owner: req.user._id,
    });
    await newImage.save();
    res.status(201).json({ message: 'Image uploaded successfully', Image: newImage });
  } catch (error) {
    next(error);
  }
};

export const uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || !req.files.length === 0) {
      next({ message: 'there is no files upload', satuts: 400 });
    }
    if (!req.user || !req.user._id) {
      next({ message: 'unauthenticated user', status: 401 });
    }
    const savedImages = await Promise.all(
      req.files.map((file) =>
        new Image({
          path: file.path,
          createdAt: Date.now(),
          filename: file.filename,
          owner: req.user._id,
        }).save()
      )
    );

    res.status(201).json({ message: 'Images uploaded successfully', Images: savedImages });
  } catch (error) {
    next(error);
  }
};

export const getImages = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      next({ message: 'unauthenticated user', status: 401 });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const images = await Image.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-owner');

    const totalImages = await Image.countDocuments({ owner: req.user._id });
    const totalPages = Math.ceil(totalImages / limit);
    res.status(200).json({
      success: true,
      images: images.map((img) => ({
        ...img.toObject(),
        url: `/uploads/${img.filename}`,
      })),
      pagination: {
        current: page,
        pages: totalPages,
        total: totalImages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getImageById = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      next({ message: 'unauthenticated user', status: 401 });
    }
    const ImageId = req.params.id;
    const image = await Image.findOne({ _id: ImageId, owner: req.user._id }).select('-owner');
    if (!foundImage) {
      return next({ message: 'Image not found', status: 404 });
    }
    res
      .status(200)
      .json({ success: true, image: { ...image.toObject(), url: `/uploads/${image.filename}` } });
  } catch (error) {
    next(error);
  }
};

export const deletImgById = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      next({ message: 'unauthenticated user', status: 401 });
    }
    const ImageId = req.params.id;
    const img = Image.findOne({ _id: ImageId, owner: req.user._id });
    if (!img) {
      return next({ message: 'Image not found', status: 404 });
    }
    try {
      await fs.unlink(img.path);
    } catch (fsError) {
      console.error('Error deleting physical file:', fsError);
      // Continue with database deletion even if file deletion fails
    }
    await Image.deleteOne({ _id: ImageId, owner: req.user._id });
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteImageById = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      next({ message: 'unauthenticated user', status: 401 });
    }
    const ImageId = req.params.id;
    const img = Image.findOne({ _id: ImageId });
    if (!img) {
      return next({ message: 'Image not found', status: 404 });
    }
    try {
      await fs.unlink(img.path);
    } catch (fsError) {
      console.error('Error deleting physical file:', fsError);
      // Continue with database deletion even if file deletion fails
    }
    await Image.deleteOne({ _id: ImageId, owner: req.user._id });
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    next(error);
  }
};
