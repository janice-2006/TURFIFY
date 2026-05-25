import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessage('A password reset link has been sent to your email.');
            } else {
                setError(data.message || 'Something went wrong');
            }
        } catch (err) {
            setError('Server error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-deepBlack flex flex-col font-sans">
            <Navbar showFilters={false} />
            <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[100px]"></div>
                </div>

                <div className="w-full max-w-md relative z-10">
                    <div className="bg-cardBlack border border-gray-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
                            <p className="text-gray-400 text-sm">Enter the email associated with your account and we'll send you a link to reset your password.</p>
                        </div>

                        {error && (
                            <div className="bg-red-900/40 border border-red-500/50 text-red-300 px-4 py-2.5 rounded-xl mb-4 text-sm flex items-center gap-2">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="bg-green-900/40 border border-green-500/50 text-green-300 px-4 py-2.5 rounded-xl mb-4 text-sm flex items-center gap-2">
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-deepBlack border border-gray-700 text-white rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                                placeholder="Email Address"
                                required
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-deepBlack font-bold py-3 rounded-xl hover:bg-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ boxShadow: '0 0 20px rgba(204, 255, 0, 0.4)' }}
                            >
                                {loading ? 'Processing...' : 'Send Reset Link'}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-gray-400">Remember your password? </span>
                            <Link to="/login" className="text-primary hover:text-green-400 font-bold ml-1 transition-colors">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;