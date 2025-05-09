/**
 * Video Schema
 * 
 * Represents a video in the platform with all its associated metadata and interactions.
 * Includes view tracking, like/dislike system, and comments functionality.
**/

const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({  // Basic info
  videoId: String,      // unique ID
  title: String,        // video title
  description: String,  // longer description
  thumbnailUrl: String, // preview image
  videoUrl: String,     // actual video source
  category: String,    //Category

  // Relations
  channelId: String,    // which channel posted it
  uploader: String,     // who uploaded it

  // Stats
  views: Number,        // view counter
  likes: Number,        // like counter
  dislikes: Number,     // dislike counter
  uploadDate: Date,     // when it was posted

  // Arrays of IDs
  likedBy: [String],    // who liked it
  dislikedBy: [String], // who disliked it

  // Embedded comments
  comments: [
    {
      userId: String,   // who commented
      text: String,     // what they said
      timestamp: Date   // when they said it
    }
  ]
});

module.exports = mongoose.model('Video', VideoSchema);
