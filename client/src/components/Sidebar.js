import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { isLoggedIn } from '../utils/auth'
import axios from 'axios'
import '../styles/Sidebar.css'

export default function Sidebar({ isOpen }) {
  const location = useLocation()
  const [hasChannel, setHasChannel] = useState(false)
  const [channelId, setChannelId] = useState(null)

  useEffect(() => {
    const checkChannel = async () => {
      if (!isLoggedIn()) return
      
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('http://localhost:5000/api/channels/my', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setHasChannel(true)
        setChannelId(res.data.channelId)
      } catch (err) {
        setHasChannel(false)
        setChannelId(null)
      }
    }

    checkChannel()
    window.addEventListener('auth-change', checkChannel)
    return () => window.removeEventListener('auth-change', checkChannel)
  }, [])

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <nav className="nav-menu">
        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          Home
        </Link>
        
        {isLoggedIn() && (
          <>
            <Link to={hasChannel ? "/upload" : "/create-channel"} className="nav-item">
              Upload video
            </Link>
            {hasChannel && channelId && (
              <Link to={`/channel/${channelId}`} className="nav-item">
                Your Channel
              </Link>
            )}
            {!hasChannel && (
              <Link to="/create-channel" className="nav-item">
                Create Your Channel
              </Link>
            )}
          </>
        )}
      </nav>
    </div>
  )
}

