import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const AdminDashboardPage = () => {
    const navigate = useNavigate();
    const [turfs, setTurfs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAccess = () => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                navigate('/login');
                return;
            }
            if (user.role !== 'admin') {
                alert("Unauthorized: Only Turf Owners can access this dashboard.");
                navigate('/');
                return;
            }
            fetchTurfs();
        };

        const fetchTurfs = async () => {
            try {
                // In a real database scenario with properly linked models, you'd fetch only the admin's turfs.
                // Here we fetch all turfs since the initial seed might not map directly to this exact admin ID.
                const response = await fetch('http://localhost:5000/api/turfs');
                const data = await response.json();
                setTurfs(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching turfs:", err);
                setLoading(false);
            }
        };

        checkAccess();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-deepBlack text-white pb-20">
            <Navbar showFilters={false} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                <div className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-primary uppercase tracking-tight" style={{ textShadow: '0 0 20px rgba(204, 255, 0, 0.4)' }}>OWNER DASHBOARD</h1>
                        <p className="text-gray-400 mt-2 font-medium">Manage your venue details, view bookings and edit pricing</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center mt-20">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {turfs.slice(0, 4).map((turf) => ( // Slicing to simulate just the venues owned by this specific owner
                            <div key={turf._id} className="bg-cardBlack rounded-3xl overflow-hidden border border-gray-800 p-6 flex flex-col items-start gap-4 hover:border-primary/50 transition-all">
                                <h3 className="text-2xl font-bold">{turf.name}</h3>
                                <p className="text-sm text-gray-400">{turf.location?.address || 'Address not listed'}</p>
                                
                                <div className="w-full bg-deepBlack rounded-2xl p-4 mt-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-400 text-sm">Price per hour</span>
                                        <span className="text-lg font-bold text-primary">₹{turf.pricePerHour || 1500}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Amenities</span>
                                        <span className="text-sm">{turf.amenities?.length || 0} features</span>
                                    </div>
                                </div>
                                
                                <div className="flex gap-4 w-full mt-2">
                                    <button onClick={() => alert('Editing functionality would open here')} className="flex-1 bg-primary text-deepBlack font-bold py-2 rounded-xl text-sm transition-all hover:bg-green-400">
                                        Edit Details
                                    </button>
                                    <button onClick={() => alert('View bookings for this venue')} className="flex-1 bg-gray-800 text-white font-bold py-2 rounded-xl text-sm transition-all hover:bg-gray-700">
                                        Manage Bookings
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        <div className="bg-cardBlack rounded-3xl border border-gray-800 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 transition-all hover:bg-deepBlack/50 group">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                                <span className="text-3xl text-primary">+</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Add New Venue</h3>
                            <p className="text-sm text-gray-500 max-w-[200px]">Register another sports ground under your management.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboardPage;