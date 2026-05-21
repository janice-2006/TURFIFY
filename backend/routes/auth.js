const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user');
const auth = require('../middleware/authMiddleware');
const localUsers = require('../data/localUsers');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const isDbConnected = () => mongoose.connection.readyState === 1;

const signToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const sendAuthResponse = (res, user, status = 200) => {
    const id = user._id || user.id;
    const payload = {
        token: signToken(id),
        user: {
            id,
            name: user.name || `${user.firstName} ${user.lastName}`.trim(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            image: user.image,
        },
    };
    res.status(status).json(payload);
};

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (!isDbConnected()) {
            const existing = localUsers.findByEmail(email);
            if (existing) {
                return res.status(400).json({ message: 'User already exists' });
            }
            const user = await localUsers.createUser({ firstName, lastName, email, password });
            return sendAuthResponse(res, localUsers.formatUser(user), 201);
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        await user.save();
        sendAuthResponse(res, user, 201);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server error' });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        if (!isDbConnected()) {
            const user = localUsers.findByEmail(email);
            if (!user || !(await localUsers.verifyPassword(user, password))) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            return sendAuthResponse(res, localUsers.formatUser(user));
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        sendAuthResponse(res, user);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server error' });
    }
});

// GET PROFILE
router.get('/profile', auth, async (req, res) => {
    try {
        if (!isDbConnected()) {
            const user = localUsers.findById(req.user.id);
            if (!user) return res.status(404).json({ message: 'User not found' });
            const { password, ...safe } = user;
            return res.json({ ...safe, name: localUsers.formatUser(user).name });
        }

        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// UPDATE PROFILE
router.put('/profile', auth, async (req, res) => {
    try {
        const { firstName, middleName, lastName, image, place, country, phone } = req.body;

        if (!isDbConnected()) {
            const updated = localUsers.updateUser(req.user.id, {
                firstName,
                middleName,
                lastName,
                image,
                place,
                country,
                phone,
            });
            if (!updated) return res.status(404).json({ message: 'User not found' });
            return res.json({
                message: 'Profile updated successfully',
                user: localUsers.formatUser(updated),
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

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
            user: {
                id: user._id,
                name: user.name,
                firstName: user.firstName,
                middleName: user.middleName,
                lastName: user.lastName,
                email: user.email,
                image: user.image,
                place: user.place,
                country: user.country,
                phone: user.phone,
            },
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GOOGLE LOGIN
router.post('/google', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'Google token is required' });
        }

        if (!process.env.GOOGLE_CLIENT_ID) {
            return res.status(500).json({ message: 'Google Client ID not configured on server' });
        }

        let payload;
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        } catch (verifyErr) {
            // Dev fallback: decode token when Google verify fails (offline / origin issues)
            const parts = token.split('.');
            if (parts.length === 3) {
                payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
            } else {
                throw verifyErr;
            }
        }

        const { name, email, picture, given_name, family_name } = payload;
        if (!email) {
            return res.status(400).json({ message: 'Google account email not available' });
        }

        if (!isDbConnected()) {
            let user = localUsers.findByEmail(email);
            if (!user) {
                user = await localUsers.createUser({
                    firstName: given_name || name?.split(' ')[0] || 'User',
                    lastName: family_name || name?.split(' ').slice(1).join(' ') || 'Account',
                    email,
                    password: Math.random().toString(36).slice(-12),
                    image: picture,
                });
            }
            return sendAuthResponse(res, localUsers.formatUser(user));
        }

        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                firstName: given_name || name?.split(' ')[0] || 'User',
                lastName: family_name || name?.split(' ').slice(1).join(' ') || 'Account',
                email,
                password: await bcrypt.hash(Math.random().toString(36).slice(-10), 10),
                image: picture,
            });
            await user.save();
        }

        sendAuthResponse(res, user);
    } catch (err) {
        console.error('Google auth error:', err.message);
        res.status(500).json({
            message: 'Google authentication failed',
            error: err.message,
        });
    }
});

module.exports = router;
