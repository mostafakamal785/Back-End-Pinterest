import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    privacy: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },

    keywords: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Text index for better Search support
boardSchema.index({ name: 'text', keywords: 'text' });

export default mongoose.model('Board', boardSchema);
