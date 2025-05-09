/**
 * Backend Server
 * 
 * Main server configuration and startup script.
 * Implements a RESTful API for the GothTube video sharing platform.
 * 
 * Completed from assignment:
 * - Express.js server with CORS support
 * - MongoDB connection with mongoose
 * - JWT-based authentication
 * - Route handling for videos, channels, and auth
 * 
 * 
 * API Routes:
 * - /api/auth/*  : Authentication routes
 * - /api/videos/*: Video management
 * - /api/channels/*: Channel management
**/

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const app = express()

// Configure CORS with specific options
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
const port = process.env.PORT || 5000
mongoose.connect(process.env.MONGO_URI, {
}).then(() => {
  console.log('Connected to MongoDB successfully');
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
})

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const videoRoutes = require('./routes/video');
app.use('/api/videos', videoRoutes);

const channelRoutes = require('./routes/channel');
app.use('/api/channels', channelRoutes);
