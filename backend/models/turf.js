const mongoose = require('mongoose');

const turfSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: {
        area: { type: String, required: true }, // e.g., "Ponmar", "Navalur"
        city: { type: String, default: 'Chennai' },
        address: { type: String, required: true },
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    pricePerHour: { type: Number, required: true },
    sports: [{ type: String }], // ['Football', 'Cricket', 'Badminton']
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    images: [{ type: String }],
    ownerDetails: {
        name: String,
        phone: String,
        email: String
    },
    amenities: [{ type: String }], // ['Parking', 'Shower', 'Cafeteria', 'Lights']
    openingHours: {
        start: { type: String, default: '06:00' },
        end: { type: String, default: '22:00' }
    },
    featured: { type: Boolean, default: false },
    bookable: { type: Boolean, default: true },
    capacity: { type: Number }, // Number of players
    turfType: { type: String, enum: ['Indoor', 'Outdoor', 'Covered'], default: 'Outdoor' },
}, { timestamps: true });

module.exports = mongoose.model('Turf', turfSchema);
