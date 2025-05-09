// VideoPage - shows video player, comments, likes etc
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { isLoggedIn, getUserId } from '../utils/auth';
import '../styles/VideoPage.css';

export default function VideoPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    // Track all the things we need
    const [video, setVideo] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [viewRegistered, setViewRegistered] = useState(false);

    // Gets fresh video data without bumping view count
    const fetchVideo = () => {
        axios.get(`http://localhost:5000/api/videos/${id}`)
            .then(res => {
                const newVideoData = res.data;
                // Preserve the current view count to prevent UI flicker
                if (video && video.views) {
                    newVideoData.views = video.views;
                }
                setVideo(newVideoData);
            })
            .catch(err => {
                console.error('Error fetching video:', err);
            });
    };

    // First load: fetch video and count the view
    useEffect(() => {
        let isCurrentRequest = true; // prevents race conditions

        // First load the video data
        axios.get(`http://localhost:5000/api/videos/${id}`)
            .then(res => {
                if (!isCurrentRequest) return;
                setVideo(res.data);
                
                // Count view only on initial load
                axios.post(`http://localhost:5000/api/videos/${id}/view`)
                    .then(() => {
                        if (isCurrentRequest) {
                            setViewRegistered(true);
                        }
                    })
                    .catch(err => console.error('Error incrementing views:', err));
            })
            .catch(err => {
                if (isCurrentRequest) {
                    console.error('Error:', err);
                }
            });

        // Cleanup: cancel any pending state updates
        return () => {
            isCurrentRequest = false;
            setViewRegistered(false);
        };
    }, [id]);

    const handlePostComment = (e) => {
        e.preventDefault();
        if (!isLoggedIn()) {
            navigate('/login');
            return;
        }

        if (!commentText.trim()) {
            alert('Comment cannot be empty');
            return;
        }

        setIsSubmitting(true);

        axios.post(`http://localhost:5000/api/videos/${id}/comment`, {
            userId: getUserId(),
            text: commentText
        }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(() => {
            setCommentText('');
            fetchVideo();
        })
        .catch(err => {
            console.error('Failed to post comment:', err);
            alert('Failed to post comment. Please try again.');
        })
        .finally(() => {
            setIsSubmitting(false);
        });
    };

    const handleDeleteComment = (index) => {
        if (!isLoggedIn()) {
            navigate('/login');
            return;
        }

        axios.delete(`http://localhost:5000/api/videos/${id}/comment/${index}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(() => {
            fetchVideo();
        })
        .catch(() => {
            alert('Failed to delete comment');
        });
    };

    const handleLike = () => {
        if (!isLoggedIn()) {
            navigate('/login');
            return;
        }
        
        axios.post(`http://localhost:5000/api/videos/${id}/like`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(() => {
            fetchVideo();
        })
        .catch(err => {
            console.error('Failed to like video:', err);
        });
    };

    const handleDislike = () => {
        if (!isLoggedIn()) {
            navigate('/login');
            return;
        }

        axios.post(`http://localhost:5000/api/videos/${id}/dislike`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(() => {
            fetchVideo();
        })
        .catch(err => {
            console.error('Failed to dislike video:', err);
        });
    };

    if (!video) return (
        <div className="video-container loading">
            <div className="loading-spinner">Loading...</div>
        </div>
    );

    const isLiked = video.likedBy?.includes(getUserId());
    const isDisliked = video.dislikedBy?.includes(getUserId());

    return (
        <div className="video-container">
            <iframe 
                width="100%" 
                height="500" 
                src={video.videoUrl} 
                title={video.title} 
                allowFullScreen
                className="video-frame"
            ></iframe>
            
            <div className="video-info">
                <h2 className="video-title">{video.title}</h2>
                <p className="video-description">{video.description}</p>
                <div className="video-stats">
                    <p className="views-count">{video.views || 0} views</p>
                    <div className="action-buttons">
                        <button 
                            onClick={handleLike} 
                            className={`action-button ${isLiked ? 'active' : ''}`}
                        >
                            <span className="action-icon">👍</span>
                            <span className="action-count">{video.likes || 0}</span>
                        </button>
                        <button 
                            onClick={handleDislike} 
                            className={`action-button ${isDisliked ? 'active' : ''}`}
                        >
                            <span className="action-icon">👎</span>
                            <span className="action-count">{video.dislikes || 0}</span>
                        </button>
                    </div>
                </div>
                <p className="uploader-info">
                    <strong>Uploader:</strong> {video.uploaderUsername}
                </p>
            </div>

            <div className="comments-section">
                <h3 className="comments-title">Comments</h3>
                {isLoggedIn() ? (
                    <form onSubmit={handlePostComment} className="comment-form">
                        <input
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write a comment"
                            className="comment-input"
                            disabled={isSubmitting}
                        />
                        <button 
                            type="submit" 
                            className="submit-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Posting...' : 'Post'}
                        </button>
                    </form>
                ) : (
                    <p className="login-prompt">
                        Please <button onClick={() => navigate('/login')} className="login-button">log in</button> to comment.
                    </p>
                )}
                <ul className="comments-list">
                    {video.comments?.map((c, i) => (
                        <li key={i} className="comment-item">
                            <strong>{c.username}</strong>: {c.text}
                            <span className="comment-time">
                                {c.timestamp ? new Date(c.timestamp).toLocaleString() : ''}
                            </span>
                            {getUserId() === c.userId && (
                                <button 
                                    onClick={() => handleDeleteComment(i)}
                                    className="delete-button"
                                >
                                    Delete
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
