import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const BookingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const slots = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];
    const [bookedSlots] = useState(["09:00", "18:00", "19:00"]); // Simulated booked slots
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [duration, setDuration] = useState(1);
    const [turf, setTurf] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://localhost:5000/api/turfs/${id}`)
            .then(res => res.json())
            .then(data => {
                setTurf(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching turf:", err);
                setLoading(false);
            });
    }, [id]);

    const handleConfirm = () => {
        if (!selectedSlot) return alert("Please select a time slot!");
        
        // Pass booking details to payment page
        navigate('/payment', { 
            state: { 
                turfId: id,
                turfName: turf.name,
                slot: selectedSlot,
                duration: duration,
                totalAmount: turf.pricePerHour * duration,
                pricePerHour: turf.pricePerHour
            } 
        });
    };

    if (loading) return <div className="min-h-screen bg-deepBlack text-primary flex items-center justify-center font-bold">Loading...</div>;
    if (!turf) return <div className="min-h-screen bg-deepBlack text-red-500 flex items-center justify-center font-bold">Turf not found!</div>;

    const totalAmount = turf.pricePerHour * duration;

    return (
        <div className="min-h-screen bg-deepBlack text-white">
            <Navbar showFilters={false} />
            <div className="max-w-3xl mx-auto p-6">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-cardBlack hover:bg-primary hover:text-deepBlack transition-all text-gray-400">←</button>
                    <h1 className="text-4xl font-black text-white tracking-tight">Book Your Slot</h1>
                </div>

                <div className="bg-cardBlack p-6 rounded-3xl border border-gray-800 mb-6">
                    <h2 className="text-xl font-bold mb-4">{turf.name}</h2>
                    <div className="flex items-center justify-between text-gray-400">
                        <span>Price per hour</span>
                        <span className="text-white font-bold">₹{turf.pricePerHour}</span>
                    </div>
                </div>

                <h3 className="text-lg font-bold text-gray-300 mb-3">1. Select Start Time</h3>
                <div className="bg-cardBlack p-6 rounded-3xl border border-gray-800 mb-8">
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {slots.map(slot => {
                            const isBooked = bookedSlots.includes(slot);
                            return (
                                <button
                                    key={slot}
                                    disabled={isBooked}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`py-3 rounded-xl font-bold transition-all ${isBooked
                                            ? 'bg-red-900/20 text-red-700 cursor-not-allowed border border-red-900/30'
                                            : selectedSlot === slot
                                                ? 'bg-primary text-deepBlack ring-4 ring-primary/30'
                                                : 'bg-deepBlack text-white hover:border-primary border border-gray-700'
                                        }`}
                                >
                                    {slot}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <h3 className="text-lg font-bold text-gray-300 mb-3">2. How many hours?</h3>
                <div className="bg-cardBlack p-6 rounded-3xl border border-gray-800 mb-10">
                    <div className="flex items-center justify-center gap-8">
                        <button 
                            onClick={() => setDuration(Math.max(1, duration - 1))}
                            className="w-12 h-12 rounded-full border-2 border-primary text-primary text-2xl font-bold flex items-center justify-center hover:bg-primary hover:text-deepBlack transition-all"
                        >
                            -
                        </button>
                        <div className="text-center">
                            <span className="text-4xl font-bold text-white">{duration}</span>
                            <p className="text-gray-400 text-sm">Hours</p>
                        </div>
                        <button 
                            onClick={() => setDuration(Math.min(5, duration + 1))}
                            className="w-12 h-12 rounded-full border-2 border-primary text-primary text-2xl font-bold flex items-center justify-center hover:bg-primary hover:text-deepBlack transition-all"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center p-6 bg-cardBlack rounded-3xl border border-primary/30 shadow-lg shadow-primary/10">
                    <div>
                        <p className="text-gray-400 text-sm">Total Amount</p>
                        <p className="text-3xl font-bold text-primary">₹{totalAmount.toLocaleString()}</p>
                    </div>
                    <button onClick={handleConfirm} className="btn-primary px-10 py-3 shadow-lg shadow-primary/40">
                        Continue to Payment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
