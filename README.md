# Dark Themed YouTube Clone

A full-stack video sharing platform with a modern dark theme interface, built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- Video uploading and viewing
- Dark theme UI
- User authentication (register/login)
- Channel creation and management
- Like/dislike functionality
- Comment system


## Getting Started

1. Clone the repository

2. Set up environment variables:
Create a `.env` file in the server directory with:
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

3. Install all dependencies:
```bash
npm run install-all
```

4. Start both frontend and backend servers:
```bash
npm start
```

This will start both the backend server (on port 5000) and the frontend development server (on port 3000) concurrently.

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user

### Videos
- GET `/api/videos` - Get all videos
- GET `/api/videos/:id` - Get single video
- POST `/api/videos/upload` - Upload new video
- POST `/api/videos/:id/view` - Increment view count
- POST `/api/videos/:id/like` - Like video
- POST `/api/videos/:id/dislike` - Dislike video
- POST `/api/videos/:id/comment` - Add comment

### Channels
- GET `/api/channels/my` - Get user's channel
- POST `/api/channels` - Create new channel
- GET `/api/channels/:id` - Get channel details

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Axios for API requests
- CSS Modules for styling

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication

## Key Features Implementation

### View Count System
- Views are incremented only once per video load
- Implemented using React's useEffect for tracking initial loads

### Authentication
- JWT-based authentication
- Secure password hashing
- Protected routes on both frontend and backend

### Dark Theme
- Consistent dark theme using CSS variables
- Modern UI with smooth transitions