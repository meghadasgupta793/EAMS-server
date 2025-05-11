const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../secret');

const authenticateToken = (req, res, next) => {
    // Retrieve the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

    console.log("Authorization Header:", authHeader); // Log the Authorization header for debugging

    if (!token) {
        return res.status(401).json({ message: 'Access token is missing or invalid' });
    }

    jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
        if (err && err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        console.log('Decoded Token:', decodedToken); // Debug the decoded token
        req.user = decodedToken;
        next();
    });
};

module.exports = authenticateToken;