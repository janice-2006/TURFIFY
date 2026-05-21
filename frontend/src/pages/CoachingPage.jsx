import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CoachCard from '../components/CoachCard';

const CoachingPage = () => {
    const [coaches, setCoaches] = useState([]);
    const [selectedSport, setSelectedSport] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const sports = ['All', 'Football', 'Cricket', 'Badminton', 'Pickleball', 'Swimming', 'Tennis', 'Basketball', 'Volleyball', 'Kho Kho', 'Kabaddi'];

    useEffect(() => {
        const fetchCoaches = async () => {
            try {
                setLoading(true);
                setError(null);
                const params = new URLSearchParams();
                if (selectedSport !== 'All') params.append('sport', selectedSport);
                if (searchQuery) params.append('search', searchQuery);

                const response = await fetch(`http://localhost:5000/api/coaches?${params}`);
                const data = await response.json();

                if (response.ok) {
                    setCoaches(Array.isArray(data) ? data : []);
                } else {
                    setError(data.message || 'Failed to load coaching services');
                }
            } catch {
                setError('Cannot reach the API. Start the backend on port 5000.');
            } finally {
                setLoading(false);
            }
        };

        fetchCoaches();
    }, [selectedSport, searchQuery]);

    const grouped = coaches.reduce((groups, coach) => {
        const area = coach.location?.area || 'Chennai';
        if (!groups[area]) groups[area] = [];
        groups[area].push(coach);
        return groups;
    }, {});

    return (
        <div className="min-h-screen bg-deepBlack">
            <Navbar showFilters={false} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-accentWhite mb-2">
                        Coaching in Chennai
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Professional coaching at turfs and academies — football, badminton, pickleball, swimming & more.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search coaches or academies..."
                        className="input-field flex-1"
                    />
                    <div className="flex gap-2 flex-wrap">
                        {sports.map((sport) => (
                            <button
                                key={sport}
                                onClick={() => setSelectedSport(sport)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    selectedSport === sport
                                        ? 'bg-primary text-deepBlack'
                                        : 'bg-cardBlack text-gray-400 hover:text-accentWhite border border-gray-700'
                                }`}
                            >
                                {sport}
                            </button>
                        ))}
                    </div>
                </div>

                {loading && (
                    <div className="text-center py-20 text-gray-400">Loading coaching services...</div>
                )}

                {error && (
                    <div className="bg-red-900/30 border border-red-500 text-red-300 px-6 py-4 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                {!loading && !error && coaches.length === 0 && (
                    <div className="text-center py-20 text-gray-500">No coaching services found. Try another sport filter.</div>
                )}

                {!loading && !error && coaches.length > 0 && (
                    <div className="space-y-12">
                        <p className="text-gray-400 text-sm">
                            Showing <span className="text-primary font-bold">{coaches.length}</span> coaching programs
                        </p>
                        {Object.entries(grouped).map(([area, areaCoaches]) => (
                            <div key={area}>
                                <div className="flex items-center gap-3 mb-5">
                                    <h2 className="text-xl font-bold text-white">{area}</h2>
                                    <span className="text-xs text-gray-500 bg-cardBlack border border-gray-700 rounded-full px-3 py-1">
                                        {areaCoaches.length} program{areaCoaches.length > 1 ? 's' : ''}
                                    </span>
                                    <div className="flex-1 border-t border-gray-800" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {areaCoaches.map((coach) => (
                                        <CoachCard key={coach._id} coach={coach} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <footer className="bg-cardBlack border-t border-gray-800 mt-16 py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-500 text-sm">© 2025 Turfify. All rights reserved.</p>
                    <div className="flex justify-center gap-6 mt-4">
                        <Link to="/" className="text-gray-400 hover:text-primary text-sm">Venues</Link>
                        <Link to="/tournaments" className="text-gray-400 hover:text-primary text-sm">Tournaments</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CoachingPage;
