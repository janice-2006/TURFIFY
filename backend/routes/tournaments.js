const express = require('express');
const mongoose = require('mongoose');
const Tournament = require('../models/tournament');
const { queryLocalTournaments, getLocalTournamentById } = require('../data/localTournaments');

const router = express.Router();
const isDbConnected = () => mongoose.connection.readyState === 1;

router.get('/', async (req, res) => {
    try {
        if (!isDbConnected()) {
            return res.json(queryLocalTournaments(req.query));
        }

        const { sport, search } = req.query;
        let query = {};
        if (sport && sport !== 'All') query.sport = new RegExp(sport, 'i');
        if (search) query.name = new RegExp(search, 'i');

        const tournaments = await Tournament.find(query).sort({ date: 1 });
        res.json(tournaments);
    } catch (err) {
        res.json(queryLocalTournaments(req.query));
    }
});

router.get('/:id', async (req, res) => {
    try {
        if (!isDbConnected()) {
            const tournament = getLocalTournamentById(req.params.id);
            if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
            return res.json(tournament);
        }

        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) {
            const local = getLocalTournamentById(req.params.id);
            if (local) return res.json(local);
            return res.status(404).json({ message: 'Tournament not found' });
        }
        res.json(tournament);
    } catch (err) {
        const local = getLocalTournamentById(req.params.id);
        if (local) return res.json(local);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
