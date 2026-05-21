const { coaches } = require('./seedData');

const slugify = (name) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

let cached = null;

const getAllLocalCoaches = () => {
    if (cached) return cached;
    cached = coaches.map((c) => ({
        ...c,
        _id: `local-coach-${slugify(c.name)}`,
    }));
    return cached;
};

const filterCoaches = (list, { sport, search }) =>
    list.filter((c) => {
        if (sport && sport !== 'All' && c.sport !== sport) return false;
        if (search && !new RegExp(search, 'i').test(c.name)) return false;
        return true;
    });

const queryLocalCoaches = (query = {}) => {
    const filtered = filterCoaches(getAllLocalCoaches(), query);
    return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
};

const getLocalCoachById = (id) => getAllLocalCoaches().find((c) => c._id === id) || null;

module.exports = { getAllLocalCoaches, queryLocalCoaches, getLocalCoachById };
