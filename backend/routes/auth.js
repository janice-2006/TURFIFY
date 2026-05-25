const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
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
            role: user.role || 'user'
        },
    };
    res.status(status).json(payload);
};

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, role, adminSecret } = req.body;

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate Admin Secret if role is admin
        if (role === 'admin') {
            if (adminSecret !== 'TURFIFYADMIN2026') {
                return res.status(401).json({ message: 'Invalid Admin Secret key' });
            }
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
            role: role === 'admin' ? 'admin' : 'user'
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

        if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
            return res.status(400).json({ message: 'Invalid user ID format. Please log in again.' });
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

        if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
            return res.status(400).json({ message: 'Invalid user ID format. Please log in again.' });
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

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!isDbConnected()) {
            return res.status(500).json({ message: 'Database not connected, cannot reset password.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found with this email' });
        }

        // Generate token
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        // Hash token and set to resetPasswordToken field
        const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpire = resetPasswordExpire;
        await user.save();

        // Create reset url
        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

        // Setup Nodemailer
        // Need ethereal email or generic SMTP if actual email is not provided.
        // For development, you can use Gmail or simply log it.
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const message = `
            <h1>You have requested a password reset</h1>
            <p>Please go to this link to reset your password:</p>
            <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
        `;

        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER || 'noreply@turfify.com',
                to: user.email,
                subject: 'Turfify Password Reset',
                html: message
            });

            res.status(200).json({ success: true, message: 'Email sent' });
        } catch (error) {
            console.log("-----------------------------------------");
            console.log("Email could not be sent (Likely due to missing EMAIL_USER/EMAIL_PASS in .env)");
            console.log("DEV BYPASS: Here is your password reset link to test locally:");
            console.log(resetUrl);
            console.log("-----------------------------------------");
            
            // In a real app we might reset the tokens if email fails, but keeping it 
            // open here so you can copy-paste from terminal during development
            return res.status(200).json({ success: true, message: 'Email bypassed for Dev Mode. Check terminal for link!' });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// RESET PASSWORD
router.post('/reset-password/:token', async (req, res) => {
    try {
        if (!isDbConnected()) {
            return res.status(500).json({ message: 'Database not connected' });
        }

        // Get hashed token
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Set new password
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ message: 'Please provide a new password' });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successful' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
