/**
 * VideoCard Component
 * 
 * Displays a video preview card with:
 * - Thumbnail image
 * - Title
 * - Channel name (linked)
 * - View count
 * 
 * Features:
 * - Clickable card navigates to video page
 * - Channel name stops event propagation for direct channel navigation
 * - Responsive design with hover effects
 * - Consistent dark theme styling
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.video - Video object containing metadata
 * @param {string} props.video._id - Video ID
 * @param {string} props.video.thumbnailUrl - URL to video thumbnail
 * @param {string} props.video.title - Video title
 * @param {string} props.video.channelId - Channel ID
 * @param {string} props.video.uploaderUsername - Username of uploader
 * @param {number} props.video.views - View count
 */

// VideoCard - the little preview boxes in the grid
import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/VideoCard.css'

export default function VideoCard({ video }) {
  return (
    // Whole card links to video, but channel name has its own link
    <Link to={`/video/${video._id}`} className="video-card">
      <div>
        <img 
          src={video.thumbnailUrl} 
          alt={video.title} 
          className="video-thumbnail" 
        />
        <div className="video-info">
          <h4 className="video-title">{video.title}</h4>
          {/* stopPropagation lets us click channel without going to video */}
          <Link 
            to={`/channel/${video.channelId}`} 
            onClick={(e) => e.stopPropagation()}
            className="video-channel"
          >
            {video.uploaderUsername || 'Unknown User'}
          </Link>
          <p className="video-stats">{video.views || 0} views</p>
        </div>
      </div>
    </Link>
  )
}

