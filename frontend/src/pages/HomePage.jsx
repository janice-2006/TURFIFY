import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TurfCard from '../components/TurfCard';

const HomePage = () => {
    const [activeTab, setActiveTab] = useState('Venues');
    const [selectedSport, setSelectedSport] = useState('All');
    const [selectedLocation, setSelectedLocation] = useState('All');
    const [sortBy, setSortBy] = useState('rating');
    const [searchQuery, setSearchQuery] = useState('');
    const [turfs, setTurfs] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [coachCount, setCoachCount] = useState(0);
    const [tournamentCount, setTournamentCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:5000/api/coaches')
            .then((res) => res.json())
            .then((data) => setCoachCount(Array.isArray(data) ? data.length : 0))
            .catch(() => {});
        fetch('http://localhost:5000/api/tournaments')
            .then((res) => res.json())
            .then((data) => setTournamentCount(Array.isArray(data) ? data.length : 0))
            .catch(() => {});
    }, []);

    // Fetch turfs from API whenever filters change (reset to page 1)
    useEffect(() => {
        setPage(1);
        fetchTurfs(1);
    }, [selectedSport, selectedLocation, sortBy, searchQuery]);

    const fetchTurfs = async (pageNum, isLoadMore = false) => {
        try {
            if (isLoadMore) setLoadingMore(true);
            else setLoading(true);
            
            setError(null);

            // Build query params
            const params = new URLSearchParams();
            if (selectedSport !== 'All') params.append('sport', selectedSport);
            if (selectedLocation !== 'All') params.append('location', selectedLocation);
            if (searchQuery) params.append('search', searchQuery);
            if (sortBy) params.append('sortBy', sortBy);
            params.append('page', pageNum);
            params.append('limit', 100);

            const response = await fetch(`http://localhost:5000/api/turfs?${params}`);
            const data = await response.json();

            if (response.ok) {
                if (isLoadMore) {
                    setTurfs(prev => [...prev, ...data.turfs]);
                } else {
                    setTurfs(data.turfs);
                }
                setLocations(data.locations);
                setHasMore(data.hasMore);
                setTotalCount(data.totalCount);
            } else {
                setError(
                    data.message === 'Server error'
                        ? 'Database error. Ensure MongoDB is connected, then run: cd backend && node Scripts/seedDatabase.js'
                        : (data.message || 'Failed to fetch turfs')
                );
            }
        } catch (err) {
            setError(
                err?.message?.includes('Failed to fetch')
                    ? 'Cannot reach the API. Start the backend with: cd backend && npm start (port 5000).'
                    : `Server error: ${err.message}`
            );
            console.error(err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchTurfs(nextPage, true);
    };

    const tabs = [
        { name: 'Venues', count: totalCount || turfs.length, path: '/' },
        { name: 'Coaching', count: coachCount, path: '/coaching' },
        { name: 'Tournament', count: tournamentCount, path: '/tournaments' },
    ];

    const handleTabClick = (tab) => {
        if (tab.path && tab.path !== '/') {
            navigate(tab.path);
            return;
        }
        setActiveTab(tab.name);
    };

    const sports = ['All', 'Football', 'Cricket', 'Badminton', 'Tennis', 'Basketball', 'Volleyball'];

    return (
        <div className="min-h-screen bg-deepBlack">
            <Navbar
                onSearch={setSearchQuery}
                onLocationChange={setSelectedLocation}
                locations={locations}
            />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-accentWhite mb-4">
                        Football Grounds in Chennai: Book nearby Football Grounds
                    </h1>

                    {/* Tabs */}
                    <div className="flex gap-6 border-b border-gray-800 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.name}
                                onClick={() => handleTabClick(tab)}
                                className={`pb-3 text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.name
                                        ? 'text-primary border-b-2 border-primary'
                                        : 'text-gray-400 hover:text-accentWhite'
                                    }`}
                            >
                                {tab.name} <span className="text-gray-500">({tab.count})</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-20">
                        <svg className="animate-spin h-12 w-12 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <p className="text-gray-400">Loading turfs from database...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-900/30 border border-red-500 text-red-300 px-6 py-4 rounded-xl mb-6">
                        <p className="font-bold mb-2">⚠️ Error Loading Turfs</p>
                        <p>{error}</p>
                        <button onClick={fetchTurfs} className="btn-primary mt-4 text-sm">
                            Try Again
                        </button>
                    </div>
                )}

                {/* Featured Section */}
                {!loading && !error && turfs.filter(t => t.featured).length > 0 && searchQuery === '' && selectedSport === 'All' && selectedLocation === 'All' && (
                    <div className="mb-12">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="text-yellow-500">✨</span> Featured Venues
                            </h2>
                            <span className="text-primary text-sm font-medium cursor-pointer hover:underline">View all</span>
                        </div>
                        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                            {turfs.filter(t => t.featured).map(turf => (
                                <div key={turf._id} className="min-w-[300px] md:min-w-[350px]">
                                    <TurfCard turf={turf} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filters & Sorting */}
                {!loading && !error && (
                    <>
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            {/* Sport Filter */}
                            <div className="flex gap-2 flex-wrap">
                                {sports.map((sport) => (
                                    <button
                                        key={sport}
                                        onClick={() => setSelectedSport(sport)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedSport === sport
                                                ? 'bg-primary text-deepBlack'
                                                : 'bg-cardBlack text-gray-400 hover:text-accentWhite border border-gray-700'
                                            }`}
                                    >
                                        {sport}
                                    </button>
                                ))}
                            </div>

                            {/* Sort Dropdown */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="input-field py-2 px-4 text-sm"
                            >
                                <option value="rating">Highest Rated</option>
                                <option value="price_low">Price: Low to High</option>
                                <option value="price_high">Price: High to Low</option>
                                <option value="reviews">Most Reviewed</option>
                            </select>
                        </div>

                        {/* Results Count */}
                        <div className="mb-4">
                            <p className="text-gray-400 text-sm">
                                Showing <span className="text-primary font-bold">{turfs.length}</span> turfs
                                {selectedLocation !== 'All' && <span> in <span className="text-primary">{selectedLocation}</span></span>}
                                {selectedSport !== 'All' && <span> for <span className="text-primary">{selectedSport}</span></span>}
                            </p>
                        </div>

                        {/* Turf Grid - Grouped by Location */}
                        {turfs.length > 0 ? (
                            <div className="space-y-12">
                                {Object.entries(
                                    turfs.reduce((groups, turf) => {
                                        const area = turf.location?.area || 'Other';
                                        if (!groups[area]) groups[area] = [];
                                        groups[area].push(turf);
                                        return groups;
                                    }, {})
                                ).map(([area, areaT]) => (
                                    <div key={area}>
                                        <div className="flex items-center gap-3 mb-5">
                                            <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            <h2 className="text-xl font-bold text-white">{area}</h2>
                                            <span className="text-xs text-gray-500 bg-cardBlack border border-gray-700 rounded-full px-3 py-1">{areaT.length} venue{areaT.length > 1 ? 's' : ''}</span>
                                            <div className="flex-1 border-t border-gray-800 ml-2"></div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {areaT.map((turf) => (
                                                <TurfCard key={turf._id} turf={turf} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h3a1 1 0 100-2H7zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
                                </svg>
                                <h3 className="text-xl font-bold text-gray-400 mb-2">No turfs found</h3>
                                <p className="text-gray-500 mb-4">Try adjusting your filters or search criteria</p>
                                <button onClick={() => {
                                    setSelectedSport('All');
                                    setSelectedLocation('All');
                                    setSearchQuery('');
                                }} className="btn-primary text-sm">
                                    Clear All Filters
                                </button>
                            </div>
                        )}

                        {/* Load More Button */}
                        {hasMore && (
                            <div className="text-center mt-12 pb-10">
                                <button 
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="btn-primary min-w-[200px] flex items-center justify-center gap-2 mx-auto"
                                >
                                    {loadingMore ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-deepBlack" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Loading More...
                                        </>
                                    ) : (
                                        'Load More Venues'
                                    )}
                                </button>
                                <p className="text-gray-500 text-xs mt-4">
                                    Showing {turfs.length} of {totalCount} venues
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-cardBlack border-t border-gray-800 mt-16 py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-500 text-sm">
                        © 2025 Turfify. All rights reserved.
                    </p>
                    <div className="flex justify-center gap-6 mt-4">
                        <Link to="/terms" className="text-gray-400 hover:text-primary text-sm">Terms</Link>
                        <Link to="/privacy" className="text-gray-400 hover:text-primary text-sm">Privacy</Link>
                        <Link to="/contact" className="text-gray-400 hover:text-primary text-sm">Contact</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
