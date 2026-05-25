import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { turfId, turfName, slot, duration, totalAmount, bookingType = 'Turf', coachId, coachName, tournamentId, tournamentName } = location.state || {};
    
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [processing, setProcessing] = useState(false);

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

    const handlePayment = async () => {
        setProcessing(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('token');
            
            if (!token || !user) {
                alert("Please login to complete booking!");
                navigate('/login');
                return;
            }

            // 1. Create Order on Backend
            const orderRes = await fetch('http://localhost:5000/api/payment/create-order', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount: totalAmount }),
            });
            const orderData = await orderRes.json();

            if (!orderData.success) {
                alert("Failed to initiate payment");
                setProcessing(false);
                return;
            }

            // 2. Options for Razorpay Checkout
            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_StVMQ23vPfFBsB', 
                amount: orderData.order.amount,
                currency: "INR",
                name: "Turfify",
                description: `${bookingType} Booking`,
                order_id: orderData.order.id,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment
                        const verifyRes = await fetch('http://localhost:5000/api/payment/verify', {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        const verifyData = await verifyRes.json();
                        
                        if (verifyData.success) {
                            // 4. Create actual booking in database
                            handleFinalBooking(response.razorpay_payment_id);
                        } else {
                            alert("Payment verification failed!");
                            setProcessing(false);
                        }
                    } catch (err) {
                        console.error("Verification error", err);
                        alert("Payment verification error");
                        setProcessing(false);
                    }
                },
                prefill: {
                    name: user.name || "Customer",
                    email: user.email || "customer@example.com",
                    contact: user.phone || "9999999999"
                },
                theme: {
                    color: "#D0FF00" // Turfify Primary Color
                }
            };
            
            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response){
                alert("Payment Failed: " + response.error.description);
                setProcessing(false);
            });
            rzp1.open();

        } catch (err) {
            console.error("Payment error:", err);
            setProcessing(false);
            alert('Could not start payment. Please try again.');
        }
    };

    const handleFinalBooking = async (paymentRef) => {
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

    const displayName = bookingType === 'Turf' ? turfName : (bookingType === 'Coach' ? coachName : tournamentName);

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
                    <h3 className="text-xl font-bold mb-6">Complete Payment</h3>
                    
                    <div className="bg-cardBlack border border-gray-800 p-8 rounded-3xl text-center shadow-xl">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-primary text-2xl font-black">₹</span>
                        </div>
                        <h4 className="text-2xl font-bold mb-2">Pay securely with Razorpay</h4>
                        <p className="text-gray-400 text-sm mb-8">
                            Includes support for UPI, Credit/Debit Cards, NetBanking, and Wallets.
                            (Test Mode Active - No real money will be deducted)
                        </p>

                        <button 
                            onClick={handlePayment}
                            disabled={processing}
                            className="btn-primary w-full py-4 text-lg font-bold rounded-2xl shadow-[0_0_20px_rgba(208,255,0,0.3)] hover:shadow-[0_0_30px_rgba(208,255,0,0.5)] transition-all"
                        >
                            {processing ? 'Connecting to Payment...' : `Pay ₹${totalAmount.toLocaleString()} Now`}
                        </button>

                        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
                            <span className="text-xs font-bold text-gray-500 border border-gray-700 rounded px-2 py-1">UPI</span>
                            <span className="text-xs font-bold text-gray-500 border border-gray-700 rounded px-2 py-1">VISA</span>
                            <span className="text-xs font-bold text-gray-500 border border-gray-700 rounded px-2 py-1">Mastercard</span>
                            <span className="text-xs font-bold text-gray-500 border border-gray-700 rounded px-2 py-1">RuPay</span>
                        </div>

                        <p className="text-center text-gray-600 text-xs mt-6 flex items-center justify-center gap-2">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            Secure Test Environment
                        </p>
                    </div>
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
