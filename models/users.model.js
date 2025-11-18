import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    name: {
      type: String,
      required: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    profilePic: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: 150,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    followerCount: {
      type: Number,
      default: 0,
    },
    likedPins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pin',
      },
    ],
    resetCode: {
      type: String,
      default: null,
    },
    resetCodeExp: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = bcrypt.hash(this.password, 10);
  next();
});

// Password comparison method
userSchema.methods.comparePassword = async function (pass) {
  return await bcrypt.compare(pass, this.password);
};

// Virtual to get profile picture (prioritizes profilePicture over profilePic)
userSchema.virtual('avatar').get(function () {
  return this.profilePicture || this.profilePic;
});

// Index for text search
userSchema.index({ username: 'text', name: 'text' });

// Middleware to update follower count
userSchema.pre('save', function (next) {
  if (this.isModified('followers')) {
    this.followerCount = this.followers.length;
  }
  next();
});

export default mongoose.model('User', userSchema);
