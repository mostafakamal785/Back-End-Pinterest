import mongoose from 'mongoose';

const pinSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },

    media: {
      uri: { type: String, required: true },
      filename: { type: String, required: true },
      type: { type: String, enum: ['image', 'video'], default: 'image' },
      thumbnail: { type: String, default: null },
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

pinSchema.index({
  title: 'text',
  description: 'text',
  keywords: 'text',
});

export default mongoose.model('Pin', pinSchema);
