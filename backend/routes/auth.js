const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        await user.save();

        // Create token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, firstName: user.firstName, lastName: user.lastName, email: user.email },
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: { id: user._id, name: user.name, firstName: user.firstName, lastName: user.lastName, email: user.email, image: user.image },
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET PROFILE
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// UPDATE PROFILE
router.put('/profile', auth, async (req, res) => {
    try {
        const { firstName, middleName, lastName, image, place, country, phone } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (firstName) user.firstName = firstName;
        if (middleName !== undefined) user.middleName = middleName;
        if (lastName) user.lastName = lastName;
        if (image) user.image = image;
        if (place) user.place = place;
        if (country) user.country = country;
        if (phone) user.phone = phone;

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: { id: user._id, name: user.name, firstName: user.firstName, middleName: user.middleName, lastName: user.lastName, email: user.email, image: user.image, place: user.place, country: user.country, phone: user.phone }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// GOOGLE LOGIN
router.post('/google', async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { name, email, picture, given_name, family_name } = ticket.getPayload();

        // Find or create user
        let user = await User.findOne({ email });
        if (!user) {
            // If user doesn't exist, create a new one
            user = new User({
                firstName: given_name || name.split(' ')[0],
                lastName: family_name || name.split(' ').slice(1).join(' ') || 'User',
                email,
                password: await bcrypt.hash(Math.random().toString(36).slice(-10), 10),
                image: picture
            });
            await user.save();
        }

        // Create JWT
        const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token: jwtToken,
            user: { id: user._id, name: user.name, firstName: user.firstName, lastName: user.lastName, email: user.email, image: user.image },
        });
    } catch (err) {
        res.status(500).json({ message: 'Google authentication failed', error: err.message });
    }
});

module.exports = router;
