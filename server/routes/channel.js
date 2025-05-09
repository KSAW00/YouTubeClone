const express = require('express');
const router = express.Router();
const Channel = require('../models/Channel');
const User = require('../models/User');
const verifyToken = require('../middleware/auth');
const mongoose = require('mongoose');

// Create a new channel
router.post('/', verifyToken, async (req, res) => {
  try {
    const { channelName, description, channelBanner } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!channelName || !channelName.trim()) {
      return res.status(400).json({ message: 'Channel name is required' });
    }

    // Check for existing channel
    const existing = await Channel.findOne({ owner: userId });
    if (existing) {
      return res.status(400).json({ message: 'User already has a channel' });
    }

    const newChannel = new Channel({
      channelId: `channel_${Date.now()}`,
      channelName: channelName.trim(),
      description: description ? description.trim() : '',
      channelBanner,
      owner: userId
    });

    await newChannel.save();

    // Get owner details for response
    const owner = await User.findById(userId).select('username');
    const channelResponse = newChannel.toObject();
    channelResponse.ownerUsername = owner ? owner.username : 'Unknown User';

    res.status(201).json(channelResponse);
  } catch (err) {
    console.error('Error creating channel:', err);
    res.status(500).json({ message: 'Failed to create channel' });
  }
});

// Get current user's channel
router.get('/my', verifyToken, async (req, res) => {
  try {
    const channel = await Channel.findOne({ owner: req.user.id });
    if (!channel) {
      return res.status(404).json({ message: 'No channel found for this user' });
    }

    // Get owner details
    const owner = await User.findById(channel.owner).select('username');
    const channelResponse = channel.toObject();
    channelResponse.ownerUsername = owner ? owner.username : 'Unknown User';

    res.json(channelResponse);
  } catch (err) {
    console.error('Error fetching user channel:', err);
    res.status(500).json({ message: 'Failed to fetch channel' });
  }
});

// Get channel by ID
router.get('/:id', async (req, res) => {
  try {
    const channel = await Channel.findOne({ channelId: req.params.id });
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Get owner details
    const owner = await User.findById(channel.owner).select('username');
    const channelResponse = channel.toObject();
    channelResponse.ownerUsername = owner ? owner.username : 'Unknown User';

    res.json(channelResponse);
  } catch (err) {
    console.error('Error fetching channel:', err);
    res.status(500).json({ message: 'Failed to fetch channel' });
  }
});

// Update channel
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const channel = await Channel.findOne({ channelId: req.params.id });
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Verify ownership
    if (channel.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this channel' });
    }

    const { channelName, description, channelBanner } = req.body;

    // Validate required fields
    if (channelName && !channelName.trim()) {
      return res.status(400).json({ message: 'Channel name cannot be empty' });
    }

    // Update fields if provided
    if (channelName) channel.channelName = channelName.trim();
    if (description !== undefined) channel.description = description.trim();
    if (channelBanner) channel.channelBanner = channelBanner;

    await channel.save();

    // Get owner details for response
    const owner = await User.findById(channel.owner).select('username');
    const channelResponse = channel.toObject();
    channelResponse.ownerUsername = owner ? owner.username : 'Unknown User';

    res.json(channelResponse);
  } catch (err) {
    console.error('Error updating channel:', err);
    res.status(500).json({ message: 'Failed to update channel' });
  }
});

module.exports = router;
