import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateChannelpage.css';

export default function CreateChannelPage() {  const [form, setForm] = useState({
    channelName: '',
    description: '',
    channelBanner: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const validateForm = () => {
    const newErrors = {};
    if (!form.channelName.trim()) newErrors.channelName = 'Channel name is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.channelBanner.trim()) newErrors.channelBanner = 'Banner URL is required';
    
    if (form.channelName.trim().length < 3) {
      newErrors.channelName = 'Channel name must be at least 3 characters';
    }
    if (form.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/channels', form, {
        headers: { Authorization: `Bearer ${token}` }
      });      // Dispatch auth change event to update sidebar
      window.dispatchEvent(new Event('auth-change'));
      navigate(`/channel/${res.data.channelId}`);
    } catch (err) {
      setErrors({ 
        submit: err.response?.data?.message || 'Failed to create channel' 
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="create-channel-container">
      <form onSubmit={handleSubmit} className="create-channel-form">
        <h2 className="create-channel-title">Create Your Channel</h2>
        
        <div className="input-group">          <input
            name="channelName"
            placeholder="Channel Name"
            onChange={handleChange}
            value={form.channelName}
            className={`create-channel-input ${errors.channelName ? 'error' : ''}`}
            disabled={isLoading}
          />
          {errors.channelName && <span className="error-message">{errors.channelName}</span>}
        </div>

        <div className="input-group">
          <textarea
            name="description"
            placeholder="Channel Description"
            onChange={handleChange}
            value={form.description}
            className={`create-channel-textarea ${errors.description ? 'error' : ''}`}
            disabled={isLoading}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        <div className="input-group">
          <input
            name="channelBanner"
            placeholder="Banner URL"
            onChange={handleChange}
            value={form.channelBanner}
            className={`create-channel-input ${errors.channelBanner ? 'error' : ''}`}
            disabled={isLoading}
          />
          {errors.channelBanner && <span className="error-message">{errors.channelBanner}</span>}
        </div>

        {errors.submit && <div className="submit-error">{errors.submit}</div>}

        <button
          type="submit"
          className="create-channel-button"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Channel...' : 'Create Channel'}
        </button>
      </form>
    </div>
  );
}
