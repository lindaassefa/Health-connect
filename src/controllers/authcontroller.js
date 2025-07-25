const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log('Received registration request:', { username, email }); // Log received data
        const user = await User.create({ username, email, password });
        console.log('User created:', user.id); // Log successful creation
        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
        console.error('Registration error:', error); // Log the full error
        res.status(500).json({ error: 'Error registering user', details: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for email:', email);
        
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        console.log('User found:', { id: user.id, username: user.username, email: user.email });
        console.log('Input password:', password);
        console.log('Hashed password in DB:', user.password);
        console.log('Password length:', password.length);
        
        const isMatch = await user.validatePassword(password);
        console.log('Password match result:', isMatch);
        
        if (!isMatch) {
            console.log('Password validation failed');
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        console.log('Password validation successful');
        
        // Create JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        // Send token in response body
        res.json({ message: 'Login successful', userId: user.id, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Create new JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ message: 'Token refreshed successfully', token });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({ error: 'Error refreshing token' });
    }
};