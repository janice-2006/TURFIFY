const express = require('express');
const Coach = require('../models/coach');
const router = express.Router();

// GET all coaches with optional sport filter and search query
router.get('/', async (req, res) => {
    try {
        const { sport, search } = req.query;
        let query = {};

        if (sport && sport !== 'All') {
            query.sport = new RegExp(sport, 'i');
        }

        if (search) {
            query.name = new RegExp(search, 'i');
        }

        const coaches = await Coach.find(query).sort({ rating: -1 });
        res.json(coaches);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET single coach by ID
router.get('/:id', async (req, res) => {
    try {
        const coach = await Coach.findById(req.params.id);
        if (!coach) {
            return res.status(404).json({ message: 'Coach not found' });
        }
        res.json(coach);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
