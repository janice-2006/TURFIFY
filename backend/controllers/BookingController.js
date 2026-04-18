const Booking = require('../models/booking');

exports.createBooking = async (req, res) => {
    try {
        const { turfId, date, startTime, endTime } = req.body;

        // 1. Check if the slot is already taken
        const overlappingBooking = await Booking.findOne({
            turf: turfId,
            date: new Date(date),
            $or: [
                { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
                { startTime: { $lt: endTime }, endTime: { $gte: endTime } }
            ]
        });

        if (overlappingBooking) {
            return res.status(400).json({ message: "This time slot is already booked!" });
        }

        // 2. Create the booking
        const newBooking = new Booking({
            turf: turfId,
            user: req.user.id, // From JWT middleware
            date,
            startTime,
            endTime
        });

        await newBooking.save();
        res.status(201).json(newBooking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
