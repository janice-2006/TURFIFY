import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const TurfDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [turf, setTurf] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`\${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/turfs/${id}`)
            .then(res => res.json())
            .then(data => {
                setTurf(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error:", err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="min-h-screen bg-deepBlack text-primary flex items-center justify-center">Loading Turf Details...</div>;
    if (!turf) return <div className="min-h-screen bg-deepBlack text-red-500 flex items-center justify-center">Turf not found!</div>;

    const fallbackImage = "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200";

    return (
        <div className="min-h-screen bg-deepBlack text-accentWhite pb-20">
            <Navbar showFilters={false} />

            {/* Image Gallery Header */}
            <div className="relative h-[50vh] w-full overflow-hidden">
                <img 
                    src={turf.images[0] || fallbackImage} 
                    className="w-full h-full object-cover" 
                    alt={turf.name}
                    onError={(e) => { e.target.src = fallbackImage; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deepBlack via-deepBlack/20 to-transparent"></div>
                
                <div className="absolute bottom-10 left-0 w-full">
                    <div className="max-w-7xl mx-auto px-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 mb-4 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-primary hover:text-deepBlack transition-all"
                        >
                            ← Back to Search
                        </button>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
                            {turf.name}
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
                                    ★ {turf.rating} <span className="text-gray-400 font-normal">({turf.reviewCount} reviews)</span>
                                </span>
                                <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20 uppercase tracking-wider">
                                    {turf.turfType}
                                </span>
                                <span className="flex items-center gap-2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {turf.location.area}
                                </span>
                            </div>

                            <h3 className="text-2xl font-bold mb-4 text-white">About this venue</h3>
                            <p className="text-gray-400 text-lg leading-relaxed mb-8">{turf.description}</p>
                            
                            <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-gray-800">
                                <div>
                                    <h4 className="text-lg font-bold mb-4 text-primary uppercase tracking-widest text-sm">Amenities</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        {turf.amenities.map((amenity, i) => (
                                            <div key={i} className="flex items-center gap-3 text-gray-300 bg-deepBlack/50 p-3 rounded-xl border border-gray-800">
                                                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(204,255,0,0.6)]"></div>
                                                {amenity}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold mb-4 text-primary uppercase tracking-widest text-sm">Location Details</h4>
                                    <div className="bg-deepBlack/50 p-6 rounded-2xl border border-gray-800">
                                        <p className="text-white font-medium mb-1">{turf.location.address}</p>
                                        <p className="text-primary">{turf.location.area}, Chennai</p>
                                        <button className="mt-6 w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all text-sm font-bold flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            View on Google Maps
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-cardBlack rounded-3xl p-8 shadow-2xl border border-primary/20 sticky top-28">
                            <div className="mb-8 text-center">
                                <p className="text-gray-400 text-sm uppercase tracking-[0.2em] mb-2 font-bold">Price per Hour</p>
                                <h2 className="text-5xl font-black text-primary">₹{turf.pricePerHour}</h2>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm text-gray-400 bg-deepBlack/50 p-4 rounded-xl">
                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Available 6:00 AM - 11:00 PM</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-400 bg-deepBlack/50 p-4 rounded-xl">
                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Instant Confirmation</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/book/${turf._id}`)}
                                className="btn-primary w-full mt-8 py-4 text-lg font-black shadow-xl shadow-primary/30 transform active:scale-95 transition-all"
                            >
                                BOOK NOW
                            </button>
                            
                            <p className="text-center text-xs text-gray-500 mt-6">
                                Free cancellation up to 4 hours before slot
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TurfDetails;
