import { successResponse, errorResponse } from '../utils/response.util.js';
import Comment from '../models/comments.model.js';
import Pin from '../models/pin.model.js';
import { notifyComment, notifyReply } from './notifications.controller.js';

// 📌 CREATE COMMENT
export const createComment = async (req, res) => {
  try {
    const { content, pinId, parentCommentId } = req.body;
    const authorId = req.user._id;

    // Verify pin exists
    const pin = await Pin.findById(pinId);
    if (!pin) {
      return errorResponse(res, 'Pin not found', 404);
    }

    // If replying to a comment, verify parent exists
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return errorResponse(res, 'Parent comment not found', 404);
      }
    }

    const comment = await Comment.create({
      content,
      author: authorId,
      pin: pinId,
      parentComment: parentCommentId || null,
    });

    // Add to parent's replies if it's a reply
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { replies: comment._id }
      });

      // Send reply notification
      const parentComment = await Comment.findById(parentCommentId);
      await notifyReply(parentComment.author, authorId, pinId, comment._id);
    } else {
      // Send comment notification to pin owner
      await notifyComment(pin.owner, authorId, pinId, comment._id);
    }

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username profilePicture name')
      .populate('replies');

    return successResponse(res, { comment: populatedComment }, 'Comment created successfully', 201);
  } catch (error) {
    console.error('Create Comment Error:', error);
    return errorResponse(res, 'Failed to create comment', 500);
  }
};

// 📌 GET PIN COMMENTS
export const getPinComments = async (req, res) => {
  try {
    const { pinId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Verify pin exists
    const pin = await Pin.findById(pinId);
    if (!pin) {
      return errorResponse(res, 'Pin not found', 404);
    }

    // Get top-level comments (no parent)
    const comments = await Comment.find({
      pin: pinId,
      parentComment: null
    })
      .populate('author', 'username profilePicture name')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'username profilePicture name'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Comment.countDocuments({
      pin: pinId,
      parentComment: null
    });

    return successResponse(res, {
      comments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error('Get Pin Comments Error:', error);
    return errorResponse(res, 'Failed to fetch comments', 500);
  }
};

// 📌 UPDATE COMMENT
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return errorResponse(res, 'Comment not found', 404);
    }

    if (comment.author.toString() !== userId.toString()) {
      return errorResponse(res, 'You can only edit your own comments', 403);
    }

    comment.content = content;
    comment.isEdited = true;
    await comment.save();

    const updatedComment = await Comment.findById(id)
      .populate('author', 'username profilePicture name');

    return successResponse(res, { comment: updatedComment }, 'Comment updated successfully');
  } catch (error) {
    console.error('Update Comment Error:', error);
    return errorResponse(res, 'Failed to update comment', 500);
  }
};

// 📌 DELETE COMMENT
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return errorResponse(res, 'Comment not found', 404);
    }

    if (comment.author.toString() !== userId.toString()) {
      return errorResponse(res, 'You can only delete your own comments', 403);
    }

    // Remove from parent's replies if it's a reply
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: comment._id }
      });
    }

    // Delete all replies recursively
    await deleteCommentReplies(comment._id);

    // Delete the comment
    await Comment.findByIdAndDelete(id);

    return successResponse(res, null, 'Comment deleted successfully');
  } catch (error) {
    console.error('Delete Comment Error:', error);
    return errorResponse(res, 'Failed to delete comment', 500);
  }
};

// 📌 LIKE/UNLIKE COMMENT
export const toggleCommentLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return errorResponse(res, 'Comment not found', 404);
    }

    const alreadyLiked = comment.likes.some(like => like.toString() === userId.toString());

    if (alreadyLiked) {
      comment.likes = comment.likes.filter(like => like.toString() !== userId.toString());
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    return successResponse(res, {
      comment: {
        _id: comment._id,
        likesCount: comment.likes.length,
        isLiked: !alreadyLiked
      }
    }, alreadyLiked ? 'Comment unliked' : 'Comment liked');
  } catch (error) {
    console.error('Toggle Comment Like Error:', error);
    return errorResponse(res, 'Failed to toggle like', 500);
  }
};

// 🔧 HELPER FUNCTION: Recursively delete comment replies
const deleteCommentReplies = async (commentId) => {
  const replies = await Comment.find({ parentComment: commentId });

  for (const reply of replies) {
    await deleteCommentReplies(reply._id);
    await Comment.findByIdAndDelete(reply._id);
  }
};
