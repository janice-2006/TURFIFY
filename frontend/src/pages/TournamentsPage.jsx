import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TournamentCard from '../components/TournamentCard';

const TournamentsPage = () => {
    const [tournaments, setTournaments] = useState([]);
    const [selectedSport, setSelectedSport] = useState('All');
    const [selectedPhase, setSelectedPhase] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const sports = ['All', 'Football', 'Cricket', 'Badminton', 'Pickleball'];
    const phases = ['All', 'Upcoming', 'Ongoing'];

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                setLoading(true);
                setError(null);
                const params = new URLSearchParams();
                if (selectedSport !== 'All') params.append('sport', selectedSport);
                if (selectedPhase !== 'All') params.append('phase', selectedPhase);
                if (searchQuery) params.append('search', searchQuery);

                const response = await fetch(`http://localhost:5000/api/tournaments?${params}`);
                const data = await response.json();

                if (response.ok) {
                    const list = Array.isArray(data) ? data : [];
                    const enriched = list.map((t) => {
                        const eventDate = new Date(t.date);
                        const daysUntil = (eventDate - new Date()) / (1000 * 60 * 60 * 24);
                        let phase = t.phase;
                        if (!phase) {
                            if (t.registrationStatus === 'Closed' || daysUntil < 0) phase = 'Completed';
                            else if (daysUntil <= 7) phase = 'Ongoing';
                            else phase = 'Upcoming';
                        }
                        return { ...t, phase };
                    });
                    setTournaments(enriched);
                } else {
                    setError(data.message || 'Failed to load tournaments');
                }
            } catch {
                setError('Cannot reach the API. Start the backend on port 5000.');
            } finally {
                setLoading(false);
            }
        };

        fetchTournaments();
    }, [selectedSport, selectedPhase, searchQuery]);

    const upcoming = tournaments.filter((t) => t.phase === 'Upcoming');
    const ongoing = tournaments.filter((t) => t.phase === 'Ongoing');

    const renderSection = (title, items, badgeClass) => {
        if (items.length === 0) return null;
        return (
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${badgeClass}`}>
                        {items.length} event{items.length > 1 ? 's' : ''}
                    </span>
                    <div className="flex-1 border-t border-gray-800" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((t) => (
                        <TournamentCard key={t._id} tournament={t} />
                    ))}
                </div>
            </div>
        );
    };

    const displayList =
        selectedPhase === 'Upcoming'
            ? upcoming
            : selectedPhase === 'Ongoing'
            ? ongoing
            : tournaments;

    return (
        <div className="min-h-screen bg-deepBlack">
            <Navbar showFilters={false} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-accentWhite mb-2">
                        Tournaments in Chennai
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Discover upcoming and ongoing tournaments — register your team and compete for prizes.
                    </p>
                </div>

                <div className="flex gap-2 mb-4 flex-wrap">
                    {phases.map((phase) => (
                        <button
                            key={phase}
                            onClick={() => setSelectedPhase(phase)}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                                selectedPhase === phase
                                    ? 'bg-primary text-deepBlack'
                                    : 'bg-cardBlack text-gray-400 border border-gray-700 hover:text-white'
                            }`}
                        >
                            {phase === 'All' ? 'All Events' : phase}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tournaments..."
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
                    <div className="text-center py-20 text-gray-400">Loading tournaments...</div>
                )}

                {error && (
                    <div className="bg-red-900/30 border border-red-500 text-red-300 px-6 py-4 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                {!loading && !error && displayList.length === 0 && (
                    <div className="text-center py-20 text-gray-500">No tournaments found for this filter.</div>
                )}

                {!loading && !error && displayList.length > 0 && (
                    <>
                        <p className="text-gray-400 text-sm mb-6">
                            Showing <span className="text-primary font-bold">{displayList.length}</span> tournaments
                        </p>
                        {selectedPhase === 'All' ? (
                            <>
                                {renderSection('Ongoing Tournaments', ongoing, 'bg-green-500/20 text-green-400 border border-green-500/30')}
                                {renderSection('Upcoming Tournaments', upcoming, 'bg-primary/20 text-primary border border-primary/30')}
                            </>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayList.map((t) => (
                                    <TournamentCard key={t._id} tournament={t} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <footer className="bg-cardBlack border-t border-gray-800 mt-16 py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-500 text-sm">© 2025 Turfify. All rights reserved.</p>
                    <div className="flex justify-center gap-6 mt-4">
                        <Link to="/" className="text-gray-400 hover:text-primary text-sm">Venues</Link>
                        <Link to="/coaching" className="text-gray-400 hover:text-primary text-sm">Coaching</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default TournamentsPage;
