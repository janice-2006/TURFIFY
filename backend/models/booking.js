const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingType: { type: String, enum: ['Turf', 'Tournament', 'Coach'], default: 'Turf' },
    turf: { type: mongoose.Schema.Types.ObjectId, ref: 'Turf', required: false },
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: false },
    coach: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach', required: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: false }, // Format "HH:mm" - Optional for tournaments/coaches
    endTime: { type: String, required: false },
    totalPrice: Number,
    status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
