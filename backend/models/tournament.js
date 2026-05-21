const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    sport: { type: String, required: true },
    location: {
        venueName: { type: String, required: true },
        address: { type: String, required: true }
    },
    date: { type: Date, required: true },
    entryFee: { type: Number, required: true },
    prizePool: { type: String },
    images: [{ type: String }],
    registrationStatus: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
    organiser: {
        name: String,
        phone: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Tournament', tournamentSchema);
