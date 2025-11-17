import mongoose from 'mongoose';

const pinSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
    },

    media: {
      uri: { type: String, required: true }, // Cloud/Local path
      filename: { type: String, required: true },
      type: { type: String, enum: ['image', 'video'], default: 'image' },
      thumbnail: { type: String, default: null }, // Optional (videos)
    },

    publisher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },

    keywords: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Text index for Search
pinSchema.index({
  title: 'text',
  description: 'text',
  keywords: 'text',
});

export default mongoose.model('Pin', pinSchema);
