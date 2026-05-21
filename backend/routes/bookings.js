const express = require('express');
const Booking = require('../models/booking');
const router = express.Router();

// CREATE new booking
router.post('/', async (req, res) => {
    try {
        const { bookingType = 'Turf', turfId, tournamentId, coachId, userId, date, startTime, endTime, totalPrice } = req.body;

        const bookingData = {
            bookingType,
            user: userId,
            date,
            totalPrice,
            status: 'Confirmed' // In a real app, this would be 'Pending' until payment is verified
        };

        if (bookingType === 'Turf') {
            bookingData.turf = turfId;
            bookingData.startTime = startTime;
            bookingData.endTime = endTime;
        } else if (bookingType === 'Tournament') {
            bookingData.tournament = tournamentId;
        } else if (bookingType === 'Coach') {
            bookingData.coach = coachId;
        }

        const booking = new Booking(bookingData);
        await booking.save();

        res.status(201).json({
            message: 'Booking successful',
            booking
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET user bookings
router.get('/user/:userId', async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.params.userId })
            .populate('turf')
            .populate('tournament')
            .populate('coach');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
