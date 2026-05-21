const express = require('express');
const mongoose = require('mongoose');
const Coach = require('../models/coach');
const { queryLocalCoaches, getLocalCoachById } = require('../data/localCoaches');

const router = express.Router();
const isDbConnected = () => mongoose.connection.readyState === 1;

router.get('/', async (req, res) => {
    try {
        if (!isDbConnected()) {
            return res.json(queryLocalCoaches(req.query));
        }

        const { sport, search } = req.query;
        let query = {};
        if (sport && sport !== 'All') query.sport = new RegExp(sport, 'i');
        if (search) query.name = new RegExp(search, 'i');

        const coaches = await Coach.find(query).sort({ rating: -1 });
        res.json(coaches);
    } catch (err) {
        res.json(queryLocalCoaches(req.query));
    }
});

router.get('/:id', async (req, res) => {
    try {
        if (!isDbConnected()) {
            const coach = getLocalCoachById(req.params.id);
            if (!coach) return res.status(404).json({ message: 'Coach not found' });
            return res.json(coach);
        }

        const coach = await Coach.findById(req.params.id);
        if (!coach) {
            const local = getLocalCoachById(req.params.id);
            if (local) return res.json(local);
            return res.status(404).json({ message: 'Coach not found' });
        }
        res.json(coach);
    } catch (err) {
        const local = getLocalCoachById(req.params.id);
        if (local) return res.json(local);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
