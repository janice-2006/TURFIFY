import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const CoachDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [coach, setCoach] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`\${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/coaches/${id}`)
            .then(res => res.json())
            .then(data => {
                setCoach(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading coach details:", err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="min-h-screen bg-deepBlack text-primary flex items-center justify-center">Loading Coach Details...</div>;
    if (!coach) return <div className="min-h-screen bg-deepBlack text-red-500 flex items-center justify-center">Coach not found!</div>;

    const fallbackImage = "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&q=80&w=1200";

    const handleEnroll = () => {
        navigate('/payment', { 
            state: { 
                coachId: coach._id,
                coachName: coach.name,
                totalAmount: coach.fees,
                bookingType: 'Coach'
            } 
        });
    };

    return (
        <div className="min-h-screen bg-deepBlack text-accentWhite pb-20">
            <Navbar showFilters={false} />

            {/* Image Gallery Header */}
            <div className="relative h-[50vh] w-full overflow-hidden">
                <img 
                    src={coach.images && coach.images[0] ? coach.images[0] : fallbackImage} 
                    className="w-full h-full object-cover" 
                    alt={coach.name}
                    onError={(e) => { e.target.src = fallbackImage; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deepBlack via-deepBlack/20 to-transparent"></div>
                
                <div className="absolute bottom-10 left-0 w-full">
                    <div className="max-w-7xl mx-auto px-6">
                        <button
                            onClick={() => navigate('/coaching')}
                            className="flex items-center gap-2 mb-4 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-primary hover:text-deepBlack transition-all"
                        >
                            ← Back to Coaching
                        </button>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
                            {coach.name}
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
                                <span className="flex items-center gap-1.5 text-yellow-500 font-bold bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20">
                                    ★ {coach.rating || '4.5'} <span className="text-gray-400 font-normal">({coach.reviewCount || 0} reviews)</span>
                                </span>
                                <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20 uppercase tracking-wider">
                                    {coach.experience || 'Professional'} Experience
                                </span>
                                <span className="flex items-center gap-2 text-gray-400">
                                    🏆 {coach.sport}
                                </span>
                            </div>

                            <h3 className="text-2xl font-bold mb-4 text-white">About the Academy / Trainer</h3>
                            <p className="text-gray-400 text-lg leading-relaxed mb-8">{coach.description}</p>
                            
                            <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-gray-800">
                                <div>
                                    <h4 className="text-lg font-bold mb-4 text-primary uppercase tracking-widest text-sm">Timings & Schedule</h4>
                                    <div className="flex items-center gap-3 text-gray-300 bg-deepBlack/50 p-4 rounded-xl border border-gray-800">
                                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(204,255,0,0.6)]"></div>
                                        <div>
                                            <p className="font-bold text-white">Batch Timings</p>
                                            <p className="text-sm text-gray-400">{coach.timings}</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold mb-4 text-primary uppercase tracking-widest text-sm">Training Venue</h4>
                                    <div className="bg-deepBlack/50 p-6 rounded-2xl border border-gray-800">
                                        <p className="text-white font-medium mb-1">{coach.location?.address}</p>
                                        <p className="text-primary">{coach.location?.area}, Chennai</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Enrollment Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-cardBlack rounded-3xl p-8 shadow-2xl border border-primary/20 sticky top-28">
                            <div className="mb-8 text-center">
                                <p className="text-gray-400 text-sm uppercase tracking-[0.2em] mb-2 font-bold">Monthly Fees</p>
                                <h2 className="text-5xl font-black text-primary">₹{coach.fees}</h2>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm text-gray-400 bg-deepBlack/50 p-4 rounded-xl">
                                    <span className="text-lg">📞</span>
                                    <span>Contact: +91 {coach.contact}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-400 bg-deepBlack/50 p-4 rounded-xl">
                                    <span className="text-lg">🏃</span>
                                    <span>All Skill Levels Welcome</span>
                                </div>
                            </div>

                            <button
                                onClick={handleEnroll}
                                className="btn-primary w-full mt-8 py-4 text-lg font-black shadow-xl shadow-primary/30 transform active:scale-95 transition-all"
                            >
                                ENROLL NOW
                            </button>
                            
                            <p className="text-center text-xs text-gray-500 mt-6">
                                Cancel/refund available within 3 days of joining
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoachDetails;
