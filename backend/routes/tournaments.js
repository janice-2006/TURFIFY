const express = require('express');
const Tournament = require('../models/tournament');
const router = express.Router();

// GET all tournaments with optional sport filter and search query
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

        const tournaments = await Tournament.find(query).sort({ date: 1 });
        res.json(tournaments);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET single tournament by ID
router.get('/:id', async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }
        res.json(tournament);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
