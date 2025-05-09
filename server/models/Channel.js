// Channel model - stores channel info and links to user
const mongoose = require('mongoose');

const ChannelSchema = new mongoose.Schema({    // Link to user who owns channel
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Unique channel ID for URLs
    channelId: {
        type: String,
        required: true,
        unique: true
    },
    
    // Channel details
    channelName: {
        type: String,
        required: true,
        trim: true
    },    description: {
        type: String,
        default: ''
    },
    channelBanner: {
        type: String,
        required: true
    },
    
    // Stats and meta
    subscriberCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    // Array of subscriber IDs
    subscribers: [{
        type: String
    }]
});

module.exports = mongoose.model('Channel', ChannelSchema);
