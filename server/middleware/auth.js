/**
 * Authentication Middleware
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

// auth middleware - checks if user is logged in
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Get token from header
        const header = req.headers.authorization;
        if (!header) {
            return res.status(401).json({ message: 'No token found' });
        }

        // Strip off the "Bearer " part
        const token = header.split(' ')[1];
        
        // Check if token is valid
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add user info to request
        req.user = decoded;
        next();
        
    } catch (err) {
        // Token bad - no access
        res.status(401).json({ message: 'Invalid token' });
    }
};
