import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isLoggedIn, logout } from '../utils/auth';
import axios from 'axios';
import '../styles/Topbar.css';

export default function Topbar({ toggleSidebar }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [username, setUsername] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [hasChannel, setHasChannel] = useState(false);
    const [channelId, setChannelId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const getUsername = async () => {
            if (!isLoggedIn()) return;
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsername(res.data.username);
            } catch (err) {
                console.error('Failed to get username:', err);
            }
        };

        const checkChannel = async () => {
            if (!isLoggedIn()) return;
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/channels/my', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHasChannel(true);
                setChannelId(res.data.channelId);
            } catch (err) {
                setHasChannel(false);
                setChannelId(null);
            }
        };

        getUsername();
        checkChannel();
        window.addEventListener('auth-change', () => {
            getUsername();
            checkChannel();
        });

        return () => {
            window.removeEventListener('auth-change', () => {
                getUsername();
                checkChannel();
            });
        };
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownOpen && !event.target.closest('.user-menu')) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownOpen]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        navigate('/');
    };

    return (
        <div className="topbar">
            <button className="hamburger" onClick={toggleSidebar} aria-label="Toggle menu">
                <span></span>
                <span></span>
                <span></span>
            </button>

            <Link to="/" className="brand">
                YouTube Clone
            </Link>

            <form className="search-container" onSubmit={handleSearch}>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </form>

            <div className="auth-buttons">
                {!isLoggedIn() ? (
                    <Link to="/login" className="auth-button">Login</Link>
                ) : (
                    <div className="user-menu">
                        <button
                            className="user-menu-button"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            {username || 'User'}
                        </button>
                        {dropdownOpen && (
                            <div className="dropdown-menu">
                                {hasChannel ? (
                                    <Link 
                                        to={`/channel/${channelId}`} 
                                        className="dropdown-item"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        Your Channel
                                    </Link>
                                ) : (
                                    <Link 
                                        to="/create-channel" 
                                        className="dropdown-item"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        Create Channel
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="dropdown-item"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
