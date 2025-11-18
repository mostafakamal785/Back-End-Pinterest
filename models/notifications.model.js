import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'like_pin',
        'unlike_pin',
        'comment_pin',
        'reply_comment',
        'follow_user',
        'unfollow_user',
        'save_pin',
        'unsave_pin'
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedPin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pin',
    },
    relatedBoard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
    },
    relatedComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    data: {
      type: mongoose.Schema.Types.Mixed, // Additional data for the notification
    },
  },
  { timestamps: true }
);

// Indexes for performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ sender: 1, type: 1 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  await notification.save();

  // Populate sender info for real-time emission
  await notification.populate('sender', 'username profilePicture name');
  return notification;
};

export default mongoose.model('Notification', notificationSchema);
