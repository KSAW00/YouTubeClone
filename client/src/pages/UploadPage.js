// UploadPage - where users post new videos
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getUserIdFromToken } from '../utils/auth'
import '../styles/UploadPage.css'

export default function UploadPage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    thumbnailUrl: '',
    videoUrl: '',
    channelId: '',
    category: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [hasChannel, setHasChannel] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const userId = getUserIdFromToken()

  // Make sure user has a channel before allowing upload
  useEffect(() => {
    const fetchChannel = async () => {
      if (!userId) {
        navigate('/login')
        return
      }

      try {
        const res = await axios.get('http://localhost:5000/api/channels/my', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.channelId) {
          setHasChannel(true)
          setForm(prev => ({ ...prev, channelId: res.data.channelId }))
        }
      } catch (err) {
        console.error('Error fetching channel:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchChannel()
  }, [userId, token, navigate])

  const validateForm = () => {
    const newErrors = {}
    if (!form.title.trim()) newErrors.title = 'Title is required'
    if (!form.description.trim()) newErrors.description = 'Description is required'
    if (!form.thumbnailUrl.trim()) newErrors.thumbnailUrl = 'Thumbnail URL is required'
    if (!form.videoUrl.trim()) newErrors.videoUrl = 'Video URL is required'

    if (form.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    }
    if (form.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }
    
    const urlPattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/\S*)?$/i
    if (!urlPattern.test(form.thumbnailUrl)) {
      newErrors.thumbnailUrl = 'Please enter a valid URL'
    }
    if (!urlPattern.test(form.videoUrl)) {
      newErrors.videoUrl = 'Please enter a valid URL'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    
    if (!hasChannel) {
      navigate('/create-channel')
      return
    }
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    try {
      await axios.post('http://localhost:5000/api/videos/upload', 
        {...form, uploader: userId}, 
        {headers: {Authorization: `Bearer ${token}`}}
      )
      alert('Video uploaded successfully!')
      navigate('/')
    } catch (err) {
      setErrors({ 
        submit: err.response?.data?.message || 'Upload failed. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        Loading your channel...
      </div>
    )
  }

  if (!hasChannel) {
    return (
      <div className="upload-container">
        <div className="no-channel-message">
          <h2>Create a Channel First</h2>
          <p>You need to create a channel before you can upload videos</p>
          <button 
            onClick={() => navigate('/create-channel')}
            className="create-channel-button"
          >
            Create Channel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="upload-container">
      <h2 className="upload-title">Upload New Video</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label>Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter video title"
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter video description"
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label>Thumbnail URL</label>
          <input
            name="thumbnailUrl"
            value={form.thumbnailUrl}
            onChange={handleChange}
            placeholder="Enter thumbnail URL"
          />
          {errors.thumbnailUrl && <span className="error-message">{errors.thumbnailUrl}</span>}
        </div>

        <div className="form-group">
          <label>Video URL</label>
          <input
            name="videoUrl"
            value={form.videoUrl}
            onChange={handleChange}
            placeholder="Enter video embed URL"
          />
          {errors.videoUrl && <span className="error-message">{errors.videoUrl}</span>}
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="">Select a category</option>
            <option value="React">React</option>
            <option value="JavaScript">JavaScript</option>
            <option value="MongoDB">MongoDB</option>
            <option value="Node">Node</option>
          </select>
          {errors.category && <span className="error-message">{errors.category}</span>}
        </div>

        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  )
}
