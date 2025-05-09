// video.js - handles all video-related API endpoints
const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const User = require('../models/User');
const verifyToken = require('../middleware/auth');
const mongoose = require('mongoose');

// Upload new video
router.post('/upload', async (req, res) => {
  try {
    // Set default values for new video
    const newVideo = new Video({
      ...req.body,
      uploadDate: new Date(),
      views: 0,
      likes: 0,
      dislikes: 0
    });
    await newVideo.save();
    res.status(201).json({ message: 'Video uploaded successfully' });
  } catch (err) {
    console.error('Error uploading video:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Get videos with search and category filters
router.get('/', async (req, res) => {
  try {    
    const { title, category } = req.query;
    const filter = {};

    // Build filter based on query params
    if (title) {
      filter.title = { $regex: title, $options: 'i' }; 
    }
    if (category) {
      filter.category = category;
    }

    // Get videos and sort by newest
    const videos = await Video.find(filter).sort({ uploadDate: -1 });
    
    // Get usernames in one query
    const uploaderIds = videos.map(video => video.uploader).filter(id => id);
    const users = uploaderIds.length > 0 ? 
      await User.find({ _id: { $in: uploaderIds } }) : [];
    
    // Map usernames to videos
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user.username;
    });

    const videosWithUsernames = videos.map(video => {
      const videoObj = video.toObject();
      videoObj.uploaderUsername = userMap[video.uploader] || 'Unknown User';
      return videoObj;
    });
    
    return res.json(videosWithUsernames);
  } catch (err) {
    console.error('Error fetching videos:', err);
    return res.status(500).json({ 
      message: 'Failed to fetch videos',
      error: err.message 
    });
  }
});

// Get videos by channel ID
router.get('/channel/:channelId', async (req, res) => {
  try {
    const videos = await Video.find({ channelId: req.params.channelId });
    
    // Get usernames for all uploaders in one query
    const uploaderIds = videos.map(video => video.uploader).filter(id => id);
    const users = uploaderIds.length > 0 ? await User.find({ _id: { $in: uploaderIds } }) : [];
    
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user.username;
    });

    // Add uploader usernames to videos
    const videosWithUsernames = videos.map(video => {
      const videoObj = video.toObject();
      videoObj.uploaderUsername = userMap[video.uploader] || 'Unknown User';
      return videoObj;
    });
    
    res.json(videosWithUsernames);
  } catch (err) {
    console.error('Error fetching channel videos:', err);
    res.status(500).json({ message: 'Failed to fetch channel videos' });
  }
});

// Get a specific video by ID
router.get('/:id', async (req, res) => {
  try {
    // Validate ID format first
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid video ID format' });
    }    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    // Get uploader username
    const uploader = await User.findById(video.uploader);

    // Convert video to plain object to modify it
    const videoObj = video.toObject();
    videoObj.uploaderUsername = uploader ? uploader.username : 'Unknown User';

    // Get usernames for comments efficiently using one query
    const commentUserIds = video.comments.map(c => c.userId).filter(id => id);
    const users = commentUserIds.length > 0 ? 
      await User.find({ _id: { $in: commentUserIds } }) : [];
    
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user.username;
    });

    // Add usernames to comments
    videoObj.comments = video.comments.map(comment => ({
      ...comment.toObject(),
      username: userMap[comment.userId] || 'Unknown User'
    }));
    
    res.json(videoObj);
  } catch (err) {
    console.error('Error getting video:', err);
    res.status(500).json({ message: 'Failed to get video' });
  }
});

// Add comment to video
router.post('/:id/comment', verifyToken, async (req, res) => {
  try {
    // Validate ID format first
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid video ID format' });
    }

    const { text } = req.body;
    const userId = req.user.id; // Get userId from verified token

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    // Get the user's username for the response
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const comment = {
      userId,
      text: text.trim(),
      timestamp: new Date()
    };

    video.comments.push(comment);
    await video.save();

    // Return the comment with username for immediate display
    const commentResponse = {
      ...comment,
      username: user.username
    };

    res.json({ message: 'Comment added', comment: commentResponse });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

// Delete comment - now requires authentication and ownership verification
router.delete('/:id/comment/:index', verifyToken, async (req, res) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid video ID format' });
    }

    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    const commentIndex = parseInt(req.params.index);
    if (isNaN(commentIndex) || commentIndex < 0 || commentIndex >= video.comments.length) {
      return res.status(400).json({ message: 'Invalid comment index' });
    }

    // Verify comment ownership
    const comment = video.comments[commentIndex];
    if (comment.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    video.comments.splice(commentIndex, 1);
    await video.save();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});

router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid video ID format' });
    }

    const userId = req.user.id;
    const video = await Video.findById(req.params.id);

    if (!video) return res.status(404).json({ message: "Video not found" });

    const alreadyLiked = video.likedBy?.includes(userId);
    const alreadyDisliked = video.dislikedBy?.includes(userId);

    if (alreadyLiked) {
      video.likes = (video.likes || 1) - 1;
      video.likedBy = video.likedBy.filter(id => id !== userId);
    } else {
      video.likes = (video.likes || 0) + 1;
      if (!video.likedBy) video.likedBy = [];
      video.likedBy.push(userId);

      if (alreadyDisliked) {
        video.dislikes = (video.dislikes || 1) - 1;
        video.dislikedBy = video.dislikedBy.filter(id => id !== userId);
      }
    }

    await video.save();
    res.json({ likes: video.likes, dislikes: video.dislikes });
  } catch (err) {
    console.error('Error liking video:', err);
    res.status(500).json({ message: 'Failed to like video' });
  }
});

router.post('/:id/dislike', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid video ID format' });
    }

    const userId = req.user.id;
    const video = await Video.findById(req.params.id);

    if (!video) return res.status(404).json({ message: "Video not found" });

    const alreadyDisliked = video.dislikedBy?.includes(userId);
    const alreadyLiked = video.likedBy?.includes(userId);

    if (alreadyDisliked) {
      video.dislikes = (video.dislikes || 1) - 1;
      video.dislikedBy = video.dislikedBy.filter(id => id !== userId);
    } else {
      video.dislikes = (video.dislikes || 0) + 1;
      if (!video.dislikedBy) video.dislikedBy = [];
      video.dislikedBy.push(userId);

      if (alreadyLiked) {
        video.likes = (video.likes || 1) - 1;
        video.likedBy = video.likedBy.filter(id => id !== userId);
      }
    }

    await video.save();
    res.json({ likes: video.likes, dislikes: video.dislikes });
  } catch (err) {
    console.error('Error disliking video:', err);
    res.status(500).json({ message: 'Failed to dislike video' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid video ID format' });
    }

    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    if (video.uploader !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(video, req.body);
    await video.save();
    res.json({ message: "Video updated", video });
  } catch (err) {
    console.error('Error updating video:', err);
    res.status(500).json({ message: 'Failed to update video' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid video ID format' });
    }

    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    if (video.uploader !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await video.deleteOne();
    res.json({ message: "Video deleted" });
  } catch (err) {
    console.error('Error deleting video:', err);
    res.status(500).json({ message: 'Failed to delete video' });
  }
});

// Increment views - separate endpoint
router.post('/:id/view', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid video ID format' });
    }

    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    video.views = (video.views || 0) + 1;
    await video.save();
    res.json({ views: video.views });
  } catch (err) {
    console.error('Error incrementing views:', err);
    res.status(500).json({ message: 'Failed to increment views' });
  }
});

module.exports = router;
