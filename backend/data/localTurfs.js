const seedTurfs = require('./seedTurfs');
const { turfs: dataTurfs } = require('./seedData');

const slugify = (name) =>
    name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

let cachedTurfs = null;

const getAllLocalTurfs = () => {
    if (cachedTurfs) return cachedTurfs;

    const seen = new Set();
    cachedTurfs = [];

    for (const turf of [...seedTurfs, ...dataTurfs]) {
        if (seen.has(turf.name)) continue;
        seen.add(turf.name);
        cachedTurfs.push({
            ...turf,
            _id: `local-${slugify(turf.name)}`,
            bookable: turf.bookable !== false,
        });
    }

    return cachedTurfs;
};

const sortTurfs = (turfs, sortBy) => {
    const sorted = [...turfs];
    if (sortBy === 'price_low') {
        sorted.sort((a, b) => a.pricePerHour - b.pricePerHour);
    } else if (sortBy === 'price_high') {
        sorted.sort((a, b) => b.pricePerHour - a.pricePerHour);
    } else if (sortBy === 'reviews') {
        sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else {
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return sorted;
};

const filterTurfs = (turfs, filters) => {
    const { location, sport, search, minPrice, maxPrice } = filters;

    return turfs.filter((turf) => {
        if (location && location !== 'All') {
            const area = turf.location?.area || '';
            if (!new RegExp(location, 'i').test(area)) return false;
        }
        if (sport && sport !== 'All') {
            if (!turf.sports?.includes(sport)) return false;
        }
        if (search) {
            if (!new RegExp(search, 'i').test(turf.name)) return false;
        }
        if (minPrice && turf.pricePerHour < Number(minPrice)) return false;
        if (maxPrice && turf.pricePerHour > Number(maxPrice)) return false;
        return true;
    });
};

const queryLocalTurfs = (query = {}) => {
    const {
        location,
        sport,
        search,
        sortBy,
        minPrice,
        maxPrice,
        page = 1,
        limit = 100,
    } = query;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 100;
    const skip = (pageNumber - 1) * limitNumber;

    const filtered = filterTurfs(getAllLocalTurfs(), {
        location,
        sport,
        search,
        minPrice,
        maxPrice,
    });
    const sorted = sortTurfs(filtered, sortBy);
    const turfs = sorted.slice(skip, skip + limitNumber);
    const locations = [...new Set(getAllLocalTurfs().map((t) => t.location?.area).filter(Boolean))].sort();

    return {
        turfs,
        locations,
        totalCount: filtered.length,
        currentPage: pageNumber,
        totalPages: Math.ceil(filtered.length / limitNumber) || 1,
        hasMore: skip + turfs.length < filtered.length,
        source: 'local',
    };
};

const getLocalTurfById = (id) => getAllLocalTurfs().find((t) => t._id === id) || null;

module.exports = {
    getAllLocalTurfs,
    queryLocalTurfs,
    getLocalTurfById,
};
