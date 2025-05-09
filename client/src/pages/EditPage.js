import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../utils/auth';


export default function EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    thumbnailUrl: '',
    videoUrl: '',
    category: ''
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/videos/${id}`);
        setForm(res.data);
      } catch (err) {
        alert('Failed to load video');
      }
      if (!isLoggedIn()) {
        navigate('/login');
        return null;
      }

    };
    fetchVideo();
  }, [id]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/videos/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Video updated!');
      navigate(`/channel/${form.channelId}`);
    } catch (err) {
      alert('Failed to update video');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Video</h2>
      <input name="title" placeholder="Title" value={form.title} onChange={handleChange} />
      <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
      <input name="thumbnailUrl" placeholder="Thumbnail URL" value={form.thumbnailUrl} onChange={handleChange} />
      <input name="videoUrl" placeholder="Video URL" value={form.videoUrl} onChange={handleChange} />
      <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
      <button type="submit">Save</button>
    </form>
  );
}
