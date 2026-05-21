import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { turfId, turfName, slot, duration, totalAmount, bookingType = 'Turf', coachId, coachName, tournamentId, tournamentName } = location.state || {};
    
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [processing, setProcessing] = useState(false);
    const [upiId, setUpiId] = useState('merchant@okaxis'); // Default fallback
    
    // Card states
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    useEffect(() => {
        if (bookingType === 'Turf' && turfId) {
            fetch(`http://localhost:5000/api/turfs/${turfId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.upiId) setUpiId(data.upiId);
                })
                .catch(err => console.error("Error fetching turf upi:", err));
        }
    }, [turfId, bookingType]);

    if (!location.state) {
        return (
            <div className="min-h-screen bg-deepBlack text-white flex flex-col items-center justify-center p-6">
                <Navbar showFilters={false} />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-red-500 mb-4">No booking information found.</p>
                    <button onClick={() => navigate('/')} className="btn-primary">Return Home</button>
                </div>
            </div>
        );
    }

    const handleFinalBooking = async () => {
        setProcessing(true);
        
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('token');
            
            if (!token || !user) {
                alert("Please login to complete booking!");
                navigate('/login');
                return;
            }

            const bookingPayload = {
                bookingType,
                userId: user.id,
                totalPrice: totalAmount,
                date: new Date()
            };

            if (bookingType === 'Turf') {
                bookingPayload.turfId = turfId;
                const [hours, minutes] = slot.split(':').map(Number);
                const endTime = `${String(hours + duration).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                bookingPayload.startTime = slot;
                bookingPayload.endTime = endTime;
            } else if (bookingType === 'Tournament') {
                bookingPayload.tournamentId = tournamentId;
            } else if (bookingType === 'Coach') {
                bookingPayload.coachId = coachId;
            }

            const response = await fetch('http://localhost:5000/api/bookings', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bookingPayload),
            });

            if (response.ok) {
                // Success animation delay
                setTimeout(() => {
                    setProcessing(false);
                    alert('✨ Payment Confirmed! Your turf is booked successfully.');
                    navigate('/');
                }, 2500);
            } else {
                const data = await response.json();
                alert(data.message || 'Booking failed');
                setProcessing(false);
            }
        } catch (err) {
            console.error("Booking error:", err);
            setProcessing(false);
            alert('Payment failed. Please try again.');
        }
    };

    // Generate UPI QR Code URL
    const displayName = bookingType === 'Turf' ? turfName : (bookingType === 'Coach' ? coachName : tournamentName);
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(displayName)}&am=${totalAmount}&cu=INR&tn=TurfifyBooking`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

    return (
        <div className="min-h-screen bg-deepBlack text-white">
            <Navbar showFilters={false} />
            <div className="max-w-4xl mx-auto p-6 grid md:grid-cols-5 gap-8">
                
                {/* Left Side: Summary */}
                <div className="md:col-span-2">
                    <div className="sticky top-28">
                        <div className="flex items-center gap-4 mb-8">
                            <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-cardBlack hover:bg-primary hover:text-deepBlack transition-all text-gray-400">←</button>
                            <h1 className="text-3xl font-black text-white tracking-tight">Checkout</h1>
                        </div>

                        <div className="bg-cardBlack rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
                            <div className="p-6 bg-primary/5 border-b border-gray-800">
                                <h2 className="text-lg font-bold">{displayName}</h2>
                                <p className="text-primary text-sm font-medium">{bookingType} Booking Summary</p>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Date</span>
                                    <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                                </div>
                                {bookingType === 'Turf' && (
                                    <>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Time</span>
                                            <span className="text-primary font-bold">{slot}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Duration</span>
                                            <span>{duration} Hour(s)</span>
                                        </div>
                                    </>
                                )}
                                {bookingType === 'Coach' && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subscription</span>
                                        <span>Monthly Coaching Batch</span>
                                    </div>
                                )}
                                {bookingType === 'Tournament' && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Type</span>
                                        <span>Tournament Entry Ticket</span>
                                    </div>
                                )}
                                <div className="border-t border-gray-800 pt-4 mt-4">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-gray-400">Total Payable</span>
                                        <span className="text-2xl font-bold text-primary">₹{totalAmount.toLocaleString()}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 text-right">Includes all taxes and convenience fees</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Payment Details */}
                <div className="md:col-span-3">
                    <h3 className="text-xl font-bold mb-6">Choose Payment Method</h3>
                    
                    <div className="space-y-4">
                        {/* UPI OPTION */}
                        <div className={`p-5 rounded-3xl border transition-all ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-gray-800 bg-cardBlack'}`}>
                            <label className="flex items-center gap-4 cursor-pointer mb-2">
                                <input 
                                    type="radio" 
                                    name="payMethod" 
                                    checked={paymentMethod === 'upi'} 
                                    onChange={() => setPaymentMethod('upi')}
                                    className="w-5 h-5 accent-primary flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold">UPI Payment</p>
                                    <p className="text-xs text-gray-400">GPay, PhonePe, Paytm, or any UPI app</p>
                                </div>
                                <span className="text-xs font-bold text-gray-400 border border-gray-600 rounded px-2 py-1 flex-shrink-0">UPI</span>
                            </label>

                            {paymentMethod === 'upi' && (
                                <div className="flex flex-col items-center bg-white p-6 rounded-2xl mt-4 animate-fadeIn">
                                    <p className="text-black font-bold text-sm mb-4">Scan QR Code to Pay</p>
                                    <div className="relative group">
                                        <img src={qrCodeUrl} alt="UPI QR Code" className="w-48 h-48" />
                                        <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-all pointer-events-none"></div>
                                    </div>
                                    <div className="mt-4 text-center">
                                        <p className="text-gray-500 text-xs mb-1">Payable to: <span className="font-bold text-black">{displayName}</span></p>
                                        <p className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">{upiId}</p>
                                    </div>
                                    <button 
                                        onClick={handleFinalBooking}
                                        disabled={processing}
                                        className="mt-6 w-full bg-deepBlack text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition-all"
                                    >
                                        {processing ? 'Verifying...' : 'I Have Paid'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* CARD OPTION */}
                        <div className={`p-5 rounded-3xl border transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-gray-800 bg-cardBlack'}`}>
                            <label className="flex items-center gap-4 cursor-pointer mb-2">
                                <input 
                                    type="radio" 
                                    name="payMethod" 
                                    checked={paymentMethod === 'card'} 
                                    onChange={() => setPaymentMethod('card')}
                                    className="w-5 h-5 accent-primary flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold">Credit / Debit Card</p>
                                    <p className="text-xs text-gray-400">Visa, Mastercard, RuPay & more</p>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    <span className="text-[10px] font-bold text-blue-400 border border-blue-800 rounded px-1.5 py-0.5">VISA</span>
                                    <span className="text-[10px] font-bold text-orange-400 border border-orange-800 rounded px-1.5 py-0.5">MC</span>
                                </div>
                            </label>

                            {paymentMethod === 'card' && (
                                <div className="space-y-4 mt-4 animate-fadeIn">
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Card Number</label>
                                        <input 
                                            type="text" 
                                            placeholder="0000 0000 0000 0000" 
                                            className="input-field w-full" 
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Expiry</label>
                                            <input 
                                                type="text" 
                                                placeholder="MM/YY" 
                                                className="input-field w-full"
                                                value={expiry}
                                                onChange={(e) => setExpiry(e.target.value.slice(0, 5))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">CVV</label>
                                            <input 
                                                type="password" 
                                                placeholder="•••" 
                                                className="input-field w-full"
                                                value={cvv}
                                                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleFinalBooking}
                                        disabled={processing || cardNumber.length < 16}
                                        className="w-full btn-primary py-4 rounded-2xl mt-4"
                                    >
                                        {processing ? 'Processing...' : `Pay ₹${totalAmount.toLocaleString()}`}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-4">
                        <span className="text-xs font-bold text-gray-500 border border-gray-700 rounded px-2 py-1">VISA</span>
                        <span className="text-xs font-bold text-gray-500 border border-gray-700 rounded px-2 py-1">Mastercard</span>
                        <span className="text-xs font-bold text-gray-500 border border-gray-700 rounded px-2 py-1">RuPay</span>
                        <span className="text-xs font-bold text-gray-500 border border-gray-700 rounded px-2 py-1">UPI</span>
                    </div>

                    <p className="text-center text-gray-600 text-xs mt-4 flex items-center justify-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Secure SSL Encrypted Payment
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default PaymentPage;
