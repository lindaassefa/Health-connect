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
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        console.log('Input password:', password); // Log the plain text password entered by the user
        console.log('Hashed password in DB:', user.password);
        const isMatch = await user.validatePassword(password);
        console.log('Password match result:', isMatch);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        // Create JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        // Send token in response body
        res.json({ message: 'Login successful', userId: user.id, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
};