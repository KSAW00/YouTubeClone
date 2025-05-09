/**
 * Authentication Utility Functions
 * 
 * This module provides functions for managing user authentication state
 * and retrieving user information throughout the application.
 */

// auth.js - handles all the login stuff

/**
 * Get the current user's ID from local storage
 * @returns {string|null} User ID or null if not logged in
 */
// Gets user ID from token - returns null if not logged in
export function getUserId() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
    } catch {
        return null;
    }
}

/**
 * Check if a user is currently logged in
 * @returns {boolean} True if user is logged in
 */
// Quick check if user is logged in
export function isLoggedIn() {
    return !!localStorage.getItem('token');
}

/**
 * Extract user ID from JWT token
 * @returns {string|null} User ID from token payload or null if invalid
 */
// Decode user ID from JWT without full validation
export const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
    } catch {
        return null;
    }
};

// Cache mechanism for username to reduce API calls
// Cache username to avoid spamming the API
let cachedUsername = null;

/**
 * Get the current user's username, using cache when available
 * @returns {Promise<string>} Username or null if not found
 */
// Get username from cache or API
export async function getUsername() {
    try {
        if (cachedUsername) return cachedUsername;
        
        const token = localStorage.getItem('token');
        if (!token) return null;

        const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user info');
        }

        const user = await response.json();
        cachedUsername = user.username;
        return user.username;
    } catch (error) {
        console.error('Error getting username:', error);
        return 'User';
    }
}

/**
 * Fetch complete user information from server
 * @returns {Promise<Object>} User object or null if request fails
 */
// Get all user details - used in profile page
export async function getUserInfo() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user info');
        }

        const user = await response.json();
        cachedUsername = user.username; // Update cache
        return user;
    } catch (error) {
        console.error('Error getting user info:', error);
        return null;
    }
}

/**
 * Dispatch event to notify components of auth state changes
 * Used by components like Topbar and Sidebar to update their state
 */
// Tell everyone auth changed (login/logout)
function notifyAuthChange() {
    window.dispatchEvent(new Event('auth-change'));
}

/**
 * Log out the current user
 * - Clears token from localStorage
 * - Notifies components of auth state change
 */
// Logout - clear token and tell everyone
export function logout() {
    localStorage.removeItem('token');
    notifyAuthChange();
}
