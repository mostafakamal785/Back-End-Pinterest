import { successResponse, errorResponse } from '../utils/response.util.js';
import Notification from '../models/notifications.model.js';

// 📌 GET USER NOTIFICATIONS
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    let query = { recipient: userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'username profilePicture name')
      .populate('relatedPin', 'title media')
      .populate('relatedBoard', 'name')
      .populate('relatedComment', 'content')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });

    return successResponse(res, {
      notifications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
      unreadCount,
    });
  } catch (error) {
    console.error('Get User Notifications Error:', error);
    return errorResponse(res, 'Failed to fetch notifications', 500);
  }
};

// 📌 MARK NOTIFICATIONS AS READ
export const markNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationIds } = req.body;

    let query = { recipient: userId };
    if (notificationIds && notificationIds.length > 0) {
      query._id = { $in: notificationIds };
    }

    const result = await Notification.updateMany(query, { isRead: true });

    return successResponse(res, {
      updatedCount: result.modifiedCount,
      message: 'Notifications marked as read'
    });
  } catch (error) {
    console.error('Mark Notifications Read Error:', error);
    return errorResponse(res, 'Failed to mark notifications as read', 500);
  }
};

// 📌 DELETE NOTIFICATION
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: userId
    });

    if (!notification) {
      return errorResponse(res, 'Notification not found', 404);
    }

    return successResponse(res, null, 'Notification deleted successfully');
  } catch (error) {
    console.error('Delete Notification Error:', error);
    return errorResponse(res, 'Failed to delete notification', 500);
  }
};

// 📌 GET NOTIFICATION COUNT
export const getNotificationCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });

    return successResponse(res, { unreadCount });
  } catch (error) {
    console.error('Get Notification Count Error:', error);
    return errorResponse(res, 'Failed to get notification count', 500);
  }
};

// 🔧 HELPER FUNCTIONS FOR CREATING NOTIFICATIONS

export const createNotification = async (data) => {
  try {
    const notification = await Notification.createNotification(data);

    // Emit real-time notification via Socket.IO
    if (global.io && notification) {
      global.io.to(`user_${data.recipient}`).emit('notification', {
        type: 'new_notification',
        data: notification
      });
    }

    return notification;
  } catch (error) {
    console.error('Create Notification Error:', error);
    return null;
  }
};

export const notifyPinLike = async (pinOwnerId, likerId, pinId) => {
  if (pinOwnerId.toString() === likerId.toString()) return; // Don't notify self-likes

  await createNotification({
    recipient: pinOwnerId,
    sender: likerId,
    type: 'like_pin',
    message: 'liked your pin',
    relatedPin: pinId,
  });
};

export const notifyPinUnlike = async (pinOwnerId, unlikerId, pinId) => {
  if (pinOwnerId.toString() === unlikerId.toString()) return;

  await createNotification({
    recipient: pinOwnerId,
    sender: unlikerId,
    type: 'unlike_pin',
    message: 'unliked your pin',
    relatedPin: pinId,
  });
};

export const notifyComment = async (pinOwnerId, commenterId, pinId, commentId) => {
  if (pinOwnerId.toString() === commenterId.toString()) return;

  await createNotification({
    recipient: pinOwnerId,
    sender: commenterId,
    type: 'comment_pin',
    message: 'commented on your pin',
    relatedPin: pinId,
    relatedComment: commentId,
  });
};

export const notifyReply = async (commentAuthorId, replierId, pinId, commentId) => {
  if (commentAuthorId.toString() === replierId.toString()) return;

  await createNotification({
    recipient: commentAuthorId,
    sender: replierId,
    type: 'reply_comment',
    message: 'replied to your comment',
    relatedPin: pinId,
    relatedComment: commentId,
  });
};

export const notifyFollow = async (followedUserId, followerId) => {
  await createNotification({
    recipient: followedUserId,
    sender: followerId,
    type: 'follow_user',
    message: 'started following you',
  });
};

export const notifyUnfollow = async (followedUserId, unfollowerId) => {
  await createNotification({
    recipient: followedUserId,
    sender: unfollowerId,
    type: 'unfollow_user',
    message: 'unfollowed you',
  });
};
