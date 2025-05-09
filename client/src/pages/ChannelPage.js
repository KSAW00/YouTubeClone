// ChannelPage - shows channel info and their videos
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, Link } from 'react-router-dom'
import VideoCard from '../components/VideoCard'
import { getUserIdFromToken, isLoggedIn } from '../utils/auth'
import '../styles/ChannelPage.css'

export default function ChannelPage() {
  const { channelId } = useParams()
  const [videos, setVideos] = useState([])
  const [channel, setChannel] = useState(null)
  const [loading, setLoading] = useState(true)
  const userId = getUserIdFromToken()

  // Get channel data and their videos
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get both in parallel
        const [channelRes, videosRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/channels/${channelId}`),
          axios.get(`http://localhost:5000/api/videos/channel/${channelId}`)
        ])
        setChannel(channelRes.data)
        setVideos(videosRes.data)
      } catch (err) {
        console.error('Error loading channel data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [channelId])

  // Delete video if it's your channel
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return
    
    const token = localStorage.getItem('token')
    try {
      await axios.delete(`http://localhost:5000/api/videos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // Remove from list without refetch
      setVideos(videos.filter(v => v._id !== id))
    } catch (err) {
      alert('Failed to delete video')
    }
  }

  if (loading) {
    return <div className="channel-container">Loading...</div>
  }

  if (!channel) {
    return <div className="channel-container">Channel not found</div>
  }

  const isOwner = channel.owner === userId

  return (
    <div className="channel-container">
      <div className="channel-header">
        <h1 className="channel-name">{channel.channelName}</h1>
        <p className="channel-description">{channel.description}</p>
      </div>

      {videos.length > 0 ? (
        <div className="videos-grid">
          {videos.map((video) => (
            <div key={video._id}>
              <VideoCard video={video} />
              {isOwner && isLoggedIn() && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <Link 
                    to={`/edit/${video._id}`}
                    className="auth-button"
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(video._id)}
                    className="auth-button"
                    style={{ color: 'var(--danger)' }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-videos">
          <h3>{channel.channelName} hasn't uploaded any videos yet</h3>
          {isOwner && (
            <Link to="/upload" className="upload-link">
              Upload your first video
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

