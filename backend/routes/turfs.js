const express = require('express');
const Turf = require('../models/turf');
const router = express.Router();

// GET all turfs with filters
router.get('/', async (req, res) => {
    try {
        const { location, sport, search, sortBy, minPrice, maxPrice } = req.query;

        let query = {};

        // Filter by location/area
        if (location) {
            query['location.area'] = new RegExp(location, 'i');
        }

        // Filter by sport
        if (sport && sport !== 'All') {
            query.sports = sport;
        }

        // Search by name
        if (search) {
            query.name = new RegExp(search, 'i');
        }

        // Price range
        if (minPrice || maxPrice) {
            query.pricePerHour = {};
            if (minPrice) query.pricePerHour.$gte = Number(minPrice);
            if (maxPrice) query.pricePerHour.$lte = Number(maxPrice);
        }

        // Sorting
        let sort = {};
        if (sortBy === 'rating') {
            sort = { rating: -1 };
        } else if (sortBy === 'price_low') {
            sort = { pricePerHour: 1 };
        } else if (sortBy === 'price_high') {
            sort = { pricePerHour: -1 };
        } else if (sortBy === 'reviews') {
            sort = { reviewCount: -1 };
        } else {
            sort = { rating: -1 }; // Default
        }

        const turfs = await Turf.find(query).sort(sort);

        // Get unique locations for dropdown
        const locations = await Turf.distinct('location.area');

        res.json({
            turfs,
            locations,
            count: turfs.length
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET single turf by ID
router.get('/:id', async (req, res) => {
    try {
        const turf = await Turf.findById(req.params.id);

        if (!turf) {
            return res.status(404).json({ message: 'Turf not found' });
        }

        res.json(turf);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET all unique locations (for dropdown)
router.get('/locations/all', async (req, res) => {
    try {
        const locations = await Turf.distinct('location.area');
        res.json(locations);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST create new turf (for admin)
router.post('/', async (req, res) => {
    try {
        const turf = new Turf(req.body);
        await turf.save();
        res.status(201).json(turf);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
