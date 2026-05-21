const express = require('express');
const mongoose = require('mongoose');
const Turf = require('../models/turf');
const { queryLocalTurfs, getLocalTurfById } = require('../data/localTurfs');

const router = express.Router();

const isDbConnected = () => mongoose.connection.readyState === 1;

// GET all unique locations (for dropdown) — must be before /:id
router.get('/locations/all', async (req, res) => {
    try {
        if (!isDbConnected()) {
            const { locations } = queryLocalTurfs({ limit: 1000 });
            return res.json(locations);
        }
        const locations = await Turf.distinct('location.area');
        res.json(locations);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET all turfs with filters and pagination
router.get('/', async (req, res) => {
    try {
        if (!isDbConnected()) {
            return res.json(queryLocalTurfs(req.query));
        }

        const { location, sport, search, sortBy, minPrice, maxPrice, page = 1, limit = 100 } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        let query = {};

        if (location && location !== 'All') {
            query['location.area'] = new RegExp(location, 'i');
        }

        if (sport && sport !== 'All') {
            query.sports = sport;
        }

        if (search) {
            query.name = new RegExp(search, 'i');
        }

        if (minPrice || maxPrice) {
            query.pricePerHour = {};
            if (minPrice) query.pricePerHour.$gte = Number(minPrice);
            if (maxPrice) query.pricePerHour.$lte = Number(maxPrice);
        }

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
            sort = { rating: -1 };
        }

        const totalCount = await Turf.countDocuments(query);
        const turfs = await Turf.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limitNumber);

        const locations = await Turf.distinct('location.area');

        res.json({
            turfs,
            locations,
            totalCount,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalCount / limitNumber),
            hasMore: skip + turfs.length < totalCount,
        });
    } catch (err) {
        res.json(queryLocalTurfs(req.query));
    }
});

// GET single turf by ID
router.get('/:id', async (req, res) => {
    try {
        if (!isDbConnected()) {
            const turf = getLocalTurfById(req.params.id);
            if (!turf) {
                return res.status(404).json({ message: 'Turf not found' });
            }
            return res.json(turf);
        }

        const turf = await Turf.findById(req.params.id);

        if (!turf) {
            const localTurf = getLocalTurfById(req.params.id);
            if (localTurf) return res.json(localTurf);
            return res.status(404).json({ message: 'Turf not found' });
        }

        res.json(turf);
    } catch (err) {
        const localTurf = getLocalTurfById(req.params.id);
        if (localTurf) return res.json(localTurf);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST create new turf (for admin)
router.post('/', async (req, res) => {
    try {
        if (!isDbConnected()) {
            return res.status(503).json({ message: 'Database not connected. Cannot create turf offline.' });
        }
        const turf = new Turf(req.body);
        await turf.save();
        res.status(201).json(turf);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
