import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const TournamentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://localhost:5000/api/tournaments/${id}`)
            .then(res => res.json())
            .then(data => {
                setTournament(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading tournament details:", err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="min-h-screen bg-deepBlack text-primary flex items-center justify-center">Loading Tournament Details...</div>;
    if (!tournament) return <div className="min-h-screen bg-deepBlack text-red-500 flex items-center justify-center">Tournament not found!</div>;

    const fallbackImage = "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200";

    const formattedDate = new Date(tournament.date).toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const handleRegister = () => {
        navigate('/payment', { 
            state: { 
                tournamentId: tournament._id,
                tournamentName: tournament.name,
                totalAmount: tournament.entryFee,
                bookingType: 'Tournament'
            } 
        });
    };

    return (
        <div className="min-h-screen bg-deepBlack text-accentWhite pb-20">
            <Navbar showFilters={false} />

            {/* Image Gallery Header */}
            <div className="relative h-[50vh] w-full overflow-hidden">
                <img 
                    src={tournament.images && tournament.images[0] ? tournament.images[0] : fallbackImage} 
                    className="w-full h-full object-cover" 
                    alt={tournament.name}
                    onError={(e) => { e.target.src = fallbackImage; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deepBlack via-deepBlack/20 to-transparent"></div>
                
                <div className="absolute bottom-10 left-0 w-full">
                    <div className="max-w-7xl mx-auto px-6">
                        <button
                            onClick={() => navigate('/tournaments')}
                            className="flex items-center gap-2 mb-4 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-primary hover:text-deepBlack transition-all"
                        >
                            ← Back to Tournaments
                        </button>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
                            {tournament.name}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-10">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-cardBlack rounded-3xl p-8 shadow-2xl border border-gray-800">
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <span className="px-4 py-1.5 bg-yellow-500/10 text-yellow-500 rounded-full text-sm font-bold border border-yellow-500/20 uppercase tracking-wider">
                                    🏆 {tournament.sport}
                                </span>
                                <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20 uppercase tracking-wider">
                                    {tournament.phase || 'Upcoming'} · {tournament.registrationStatus || 'Open'}
                                </span>
                            </div>

                            <h3 className="text-2xl font-bold mb-4 text-white">Event details</h3>
                            <p className="text-gray-400 text-lg leading-relaxed mb-8">{tournament.description}</p>
                            
                            <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-gray-800">
                                <div>
                                    <h4 className="text-lg font-bold mb-4 text-primary uppercase tracking-widest text-sm">Organiser details</h4>
                                    <div className="flex flex-col gap-3 text-gray-300 bg-deepBlack/50 p-4 rounded-xl border border-gray-800">
                                        <p className="font-bold text-white">{tournament.organiser?.name || 'Local Sports Club'}</p>
                                        <p className="text-sm text-gray-400">Phone: +91 {tournament.organiser?.phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold mb-4 text-primary uppercase tracking-widest text-sm">Venue location</h4>
                                    <div className="bg-deepBlack/50 p-6 rounded-2xl border border-gray-800">
                                        <p className="text-white font-medium mb-1">{tournament.location?.venueName}</p>
                                        <p className="text-gray-400 text-sm mb-3">{tournament.location?.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Registration Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-cardBlack rounded-3xl p-8 shadow-2xl border border-primary/20 sticky top-28">
                            <div className="mb-8 text-center">
                                <p className="text-gray-400 text-sm uppercase tracking-[0.2em] mb-2 font-bold">Entry Fee</p>
                                <h2 className="text-5xl font-black text-primary">₹{tournament.entryFee}</h2>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm text-gray-400 bg-deepBlack/50 p-4 rounded-xl">
                                    <span className="text-lg">📅</span>
                                    <div>
                                        <p className="font-semibold text-white">Event Date</p>
                                        <p className="text-xs text-gray-400">{formattedDate}</p>
                                    </div>
                                </div>
                                {tournament.prizePool && (
                                    <div className="flex items-center gap-3 text-sm text-yellow-500 bg-yellow-950/20 border border-yellow-900/30 p-4 rounded-xl">
                                        <span className="text-lg">🎁</span>
                                        <div>
                                            <p className="font-semibold">Prize Pool</p>
                                            <p className="text-xs">{tournament.prizePool}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleRegister}
                                disabled={tournament.registrationStatus === 'Closed'}
                                className="btn-primary w-full mt-8 py-4 text-lg font-black shadow-xl shadow-primary/30 transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {tournament.registrationStatus === 'Closed' ? 'REGISTRATION CLOSED' : 'REGISTER NOW'}
                            </button>
                            
                            <p className="text-center text-xs text-gray-500 mt-6">
                                Entry tickets are non-refundable once registered
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TournamentDetails;
