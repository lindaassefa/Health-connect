const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findByPk(decoded.id);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        req.user = user;
        next();
    } catch (err) {
        console.error('Authentication error:', err);
        res.status(401).json({ error: 'Token is not valid' });
    }
};

module.exports = authMiddleware