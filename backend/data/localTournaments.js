const { tournaments } = require('./seedData');

const slugify = (name) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const getTournamentPhase = (tournament) => {
    const now = new Date();
    const eventDate = new Date(tournament.date);
    const daysUntil = (eventDate - now) / (1000 * 60 * 60 * 24);

    if (tournament.registrationStatus === 'Closed') return 'Completed';
    if (daysUntil < 0) return 'Completed';
    if (daysUntil <= 7) return 'Ongoing';
    return 'Upcoming';
};

let cached = null;

const getAllLocalTournaments = () => {
    if (cached) return cached;
    cached = tournaments.map((t) => ({
        ...t,
        _id: `local-tournament-${slugify(t.name)}`,
        phase: getTournamentPhase(t),
    }));
    return cached;
};

const filterTournaments = (list, { sport, search, phase }) =>
    list.filter((t) => {
        if (sport && sport !== 'All' && t.sport !== sport) return false;
        if (search && !new RegExp(search, 'i').test(t.name)) return false;
        if (phase && phase !== 'All') {
            const itemPhase = t.phase || getTournamentPhase(t);
            if (itemPhase !== phase) return false;
        }
        return true;
    });

const queryLocalTournaments = (query = {}) => {
    const withPhase = getAllLocalTournaments().map((t) => ({
        ...t,
        phase: getTournamentPhase(t),
    }));
    const filtered = filterTournaments(withPhase, query);
    return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
};

const getLocalTournamentById = (id) => {
    const t = getAllLocalTournaments().find((item) => item._id === id);
    if (!t) return null;
    return { ...t, phase: getTournamentPhase(t) };
};

module.exports = {
    getAllLocalTournaments,
    queryLocalTournaments,
    getLocalTournamentById,
    getTournamentPhase,
};
