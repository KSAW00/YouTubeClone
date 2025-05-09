// HomePage - shows video grid and category filters
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import VideoCard from '../components/VideoCard';
import { useLocation, useNavigate } from 'react-router-dom';

// Helper to get URL params easily
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function HomePage() {
  const [videos, setVideos] = useState([]);
  const query = useQuery();
  const navigate = useNavigate();
  
  // Get search terms from URL
  const search = query.get('search');
  const category = query.get('category');

  // Fetch videos when search/category changes
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        // Build query string for filters
        const params = new URLSearchParams();
        if (search) params.append('title', search);
        if (category) params.append('category', category);
        
        const res = await axios.get(`http://localhost:5000/api/videos${params.toString() ? '?' + params.toString() : ''}`);
        if (res.data) {
          setVideos(res.data);
        }
      } catch (err) {
        console.error('Error fetching videos:', err.response || err);
        setVideos([]); // Set empty array on error
      }
    };
    fetchVideos();
  }, [search, category]);

  // Video categories
  const categories = ['React', 'JavaScript', 'MongoDB', 'Node'];
  return (
    <div style={{ padding: '1rem' }}>
      {/* Filter Buttons */}
      <div style={{ padding: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => navigate(`/?category=${cat}`)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: category === cat ? '#2196f3' : '#f0f0f0',
              color: category === cat ? 'white' : 'black',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer'
            }}
          >
            {cat}
          </button>
        ))}
      </div>
      
      {/* Video Grid */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1rem',
        padding: '1rem 0'
      }}>
        {videos.map((video, idx) => (
          <VideoCard key={idx} video={video} />
        ))}
      </div>
    </div>
  );
}