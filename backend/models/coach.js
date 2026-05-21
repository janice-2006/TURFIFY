const mongoose = require('mongoose');

const coachSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    sport: { type: String, required: true },
    rating: { type: Number, default: 4.5 },
    reviewCount: { type: Number, default: 0 },
    images: [{ type: String }],
    location: {
        area: { type: String, required: true },
        address: { type: String, required: true }
    },
    fees: { type: Number, required: true }, // Per month or session
    experience: { type: String }, // e.g. "5+ Years"
    contact: { type: String },
    timings: { type: String, default: "07:00 AM - 09:00 AM" }
}, { timestamps: true });

module.exports = mongoose.model('Coach', coachSchema);
