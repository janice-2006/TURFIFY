import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MyBookingsPage = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));
            
            if (!token || !user) {
                navigate('/login');
                return;
            }

            try {
                // Adjust route based on user ID logic in the backend
                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/bookings/user/${user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setBookings(data);
                }
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-deepBlack text-white pb-20">
            <Navbar showFilters={false} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">MY BOOKINGS</h1>
                    <p className="text-gray-400 mt-2 font-medium">View all your past and upcoming reservations</p>
                </div>

                {loading ? (
                    <div className="flex justify-center mt-20">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="bg-cardBlack rounded-3xl p-10 text-center border border-gray-800 shadow-xl max-w-2xl mx-auto mt-12">
                        <div className="text-6xl mb-4">⚽</div>
                        <h3 className="text-2xl font-bold text-white mb-2">No bookings yet</h3>
                        <p className="text-gray-400 mb-6">Looks like you haven't booked any turfs, coaches, or tournaments.</p>
                        <button 
                            onClick={() => navigate('/')}
                            className="bg-primary text-deepBlack font-bold py-3 px-8 rounded-xl hover:bg-green-400 transition-colors shadow-lg shadow-primary/30 inline-block"
                        >
                            Explore Venues
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bookings.map((booking) => (
                            <div key={booking._id} className="bg-cardBlack rounded-3xl overflow-hidden border border-gray-800 shadow-xl group hover:border-primary/50 transition-all">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg ${
                                            booking.status === 'Confirmed' ? 'bg-primary/20 text-primary' : 
                                            booking.status === 'Cancelled' ? 'bg-red-500/20 text-red-500' : 
                                            'bg-yellow-500/20 text-yellow-500'
                                        }`}>
                                            {booking.status}
                                        </span>
                                        <div className="bg-gray-800 rounded-lg px-2 py-1 flex items-center">
                                            <span className="text-[10px] font-medium text-gray-400 uppercase">{booking.bookingType}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-1 truncate">
                                        {booking.bookingType === 'Turf' && booking.turf ? booking.turf.name : 
                                         booking.bookingType === 'Tournament' && booking.tournament ? booking.tournament.name :
                                         booking.bookingType === 'Coach' && booking.coach ? booking.coach.name : 'Booking details unavailable'}
                                    </h3>

                                    <div className="space-y-2 mt-4 text-sm">
                                        <div className="flex items-center text-gray-400">
                                            <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                            <span className="font-medium text-white">{new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                        
                                        {booking.bookingType === 'Turf' && booking.startTime && (
                                            <div className="flex items-center text-gray-400">
                                                <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                <span className="font-medium text-white">{booking.startTime} - {booking.endTime}</span>
                                            </div>
                                        )}
                                        
                                        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-800">
                                            <span className="text-gray-400 text-xs">Total Amount</span>
                                            <span className="text-xl font-black text-primary">₹{(booking.totalPrice || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookingsPage;