const Comment = require('../models/Comment');
const Video = require('../models/Video');

// Add comment to video
const addComment = async (req, res) => {
  try {
    const { videoId, content, parentCommentId } = req.body;
    const userId = req.user.id;
    
    if (!content || !videoId) {
      return res.status(400).json({ message: 'Content and videoId are required' });
    }
    
    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // If it's a reply, check if parent comment exists
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }
    
    const comment = new Comment({
      videoId,
      userId,
      content,
      parentCommentId: parentCommentId || null
    });
    
    await comment.save();
    
    // Populate user info
    await comment.populate('userId', 'username profilePicture');
    
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get comments for a video
const getVideoComments = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Get top-level comments (not replies)
    const comments = await Comment.find({ 
      videoId, 
      parentCommentId: null 
    })
    .populate('userId', 'username profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
    
    // Get reply counts for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replyCount = await Comment.countDocuments({ 
          parentCommentId: comment._id 
        });
        
        // Get first few replies
        const replies = await Comment.find({ 
          parentCommentId: comment._id 
        })
        .populate('userId', 'username profilePicture')
        .sort({ createdAt: 1 })
        .limit(3);
        
        return {
          ...comment.toObject(),
          replyCount,
          replies
        };
      })
    );
    
    const totalComments = await Comment.countDocuments({ 
      videoId, 
      parentCommentId: null 
    });
    
    res.json({
      comments: commentsWithReplies,
      totalComments,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalComments / limit),
      hasMore: skip + comments.length < totalComments
    });
  } catch (error) {
    console.error('Error getting video comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get replies for a comment
const getCommentReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const replies = await Comment.find({ parentCommentId: commentId })
      .populate('userId', 'username profilePicture')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalReplies = await Comment.countDocuments({ parentCommentId: commentId });
    
    res.json({
      replies,
      totalReplies,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalReplies / limit),
      hasMore: skip + replies.length < totalReplies
    });
  } catch (error) {
    console.error('Error getting comment replies:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update comment
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user owns the comment
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }
    
    comment.content = content;
    comment.isEdited = true;
    await comment.save();
    
    await comment.populate('userId', 'username profilePicture');
    
    res.json(comment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user owns the comment
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    // Delete all replies to this comment
    await Comment.deleteMany({ parentCommentId: commentId });
    
    // Delete the comment
    await Comment.findByIdAndDelete(commentId);
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Like/Unlike comment
const toggleCommentLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // For now, we'll just increment/decrement the likes count
    // In a more sophisticated system, you might want to track individual likes
    comment.likes += 1;
    await comment.save();
    
    res.json({ 
      message: 'Comment liked successfully',
      likes: comment.likes
    });
  } catch (error) {
    console.error('Error toggling comment like:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addComment,
  getVideoComments,
  getCommentReplies,
  updateComment,
  deleteComment,
  toggleCommentLike
}; 