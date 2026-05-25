import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        adminSecret: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (isSignUp && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match!');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
            const payload = isSignUp
                ? { firstName: formData.firstName, lastName: formData.lastName, email: formData.email, password: formData.password, role: formData.role, adminSecret: formData.adminSecret }
                : { email: formData.email, password: formData.password };

            const response = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.dispatchEvent(new Event('userUpdate'));
                navigate('/');
            } else {
                setError(data.message || data.error || 'Authentication failed');
            }
        } catch (err) {
            setError('Server error. Please check if backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:5000/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credentialResponse.credential }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.dispatchEvent(new Event('userUpdate'));
                navigate('/');
            } else {
                setError(data.message || data.error || 'Google authentication failed');
            }
        } catch (err) {
            setError('Server error during Google login');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google Sign-In was unsuccessful. Try again later.');
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-deepBlack">

            {/* ========== ANIMATED BACKGROUND ========== */}
            <div className="absolute inset-0 z-0">
                {/* Dark Gradient Base */}
                <div className="absolute inset-0 bg-gradient-to-br from-deepBlack via-gray-900 to-deepBlack"></div>

                {/* Animated Neon Orbs */}
                <div className="absolute top-10 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

                {/* Moving Grid Lines */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(204, 255, 0, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(204, 255, 0, 0.15) 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                            animation: 'moveGrid 20s linear infinite'
                        }}>
                    </div>
                </div>

                {/* Floating Particles */}
                <div className="absolute top-20 left-1/4 w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                <div className="absolute bottom-32 right-1/4 w-3 h-3 bg-primary rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
                <div className="absolute top-1/3 right-20 w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>

                {/* Neon Border Lines */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                <div className="absolute left-0 top-0 w-0.5 h-full bg-gradient-to-b from-transparent via-primary to-transparent"></div>
                <div className="absolute right-0 top-0 w-0.5 h-full bg-gradient-to-b from-transparent via-primary to-transparent"></div>
            </div>

            {/* ========== LOGIN CARD ========== */}
            <div className="relative z-10 w-full max-w-lg mx-4">
                <div className="bg-cardBlack/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-primary/30 overflow-hidden">

                    {/* Neon Glow Effect on Card */}
                    <div className="absolute inset-0 bg-primary/5 blur-xl"></div>

                    <div className="relative p-8">
                        {/* Header with Logo */}
                        <div className="text-center mb-6">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                {/* Football Icon */}
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-green-400 flex items-center justify-center shadow-lg shadow-primary/50">
                                    <svg className="w-full h-full text-deepBlack" viewBox="0 0 100 100" fill="currentColor">
                                        {/* Soccer Ball (Left) */}
                                        <circle cx="35" cy="55" r="20" stroke="currentColor" strokeWidth="2" fill="none" />
                                        <path d="M35 35 L40 45 L50 45 L42 52 L45 62 L35 55 L25 62 L28 52 L20 45 L30 45 Z" fill="currentColor" />

                                        {/* Football (Top Right) */}
                                        <ellipse cx="65" cy="35" rx="18" ry="12" transform="rotate(-45 65 35)" stroke="currentColor" strokeWidth="2" fill="none" />
                                        <line x1="58" y1="30" x2="72" y2="40" stroke="currentColor" strokeWidth="1.5" />
                                        <line x1="60" y1="33" x2="70" y2="38" stroke="currentColor" strokeWidth="1.5" />
                                        <line x1="62" y1="36" x2="68" y2="36" stroke="currentColor" strokeWidth="1.5" />

                                        {/* Tennis Ball (Bottom Right) */}
                                        <circle cx="70" cy="70" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
                                        <path d="M60 70 Q70 60 80 70" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                        <path d="M60 70 Q70 80 80 70" stroke="currentColor" strokeWidth="1.5" fill="none" />

                                        {/* Baseball (Bottom Left) */}
                                        <circle cx="25" cy="75" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                                        <path d="M20 75 Q25 70 30 75" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                        <path d="M20 75 Q25 80 30 75" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                    </svg>

                                </div>
                                <h1 className="text-3xl font-bold text-primary tracking-wide" style={{ textShadow: '0 0 20px rgba(204, 255, 0, 0.5)' }}>
                                    TURFIFY
                                </h1>
                            </div>

                            <p className="text-white">Book your favorite sports turf instantly</p>
                        </div>

                        {/* Toggle Buttons */}
                        <div className="flex bg-deepBlack/80 rounded-full p-1 mb-5 border border-gray-700">
                            <button
                                onClick={() => setIsSignUp(false)}
                                className={`flex-1 py-2 rounded-full text-sm font-bold transition-all duration-300 ${!isSignUp
                                    ? 'bg-primary text-deepBlack shadow-lg shadow-primary/50'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setIsSignUp(true)}
                                className={`flex-1 py-2 rounded-full text-sm font-bold transition-all duration-300 ${isSignUp
                                    ? 'bg-primary text-deepBlack shadow-lg shadow-primary/50'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Sign Up
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-900/40 border border-red-500/50 text-red-300 px-4 py-2.5 rounded-xl mb-4 text-sm flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            {isSignUp && (
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="input-field w-full"
                                        placeholder="First Name"
                                        required={isSignUp}
                                    />
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="input-field w-full"
                                        placeholder="Last Name"
                                        required={isSignUp}
                                    />
                                </div>
                            )}

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input-field w-full"
                                placeholder="Email Address"
                                required
                            />

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input-field w-full"
                                placeholder="Password"
                                required
                            />

                            {isSignUp && (
                                <>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="input-field w-full"
                                        placeholder="Confirm Password"
                                        required={isSignUp}
                                    />
                                    
                                    {/* Role Selection */}
                                    <div className="mb-4 mt-2">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">I am signing up as a:</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white text-sm">
                                                <input 
                                                    type="radio" 
                                                    name="role" 
                                                    value="user" 
                                                    checked={formData.role === 'user'} 
                                                    onChange={handleChange} 
                                                    className="accent-primary w-4 h-4"
                                                />
                                                Customer (Book Turfs)
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white text-sm">
                                                <input 
                                                    type="radio" 
                                                    name="role" 
                                                    value="admin" 
                                                    checked={formData.role === 'admin'} 
                                                    onChange={handleChange} 
                                                    className="accent-primary w-4 h-4"
                                                />
                                                Turf Owner
                                            </label>
                                        </div>
                                    </div>

                                    {/* Admin Secret Key */}
                                    {formData.role === 'admin' && (
                                        <div className="mb-2 transition-all">
                                            <input
                                                type="password"
                                                name="adminSecret"
                                                value={formData.adminSecret}
                                                onChange={handleChange}
                                                className="input-field w-full"
                                                placeholder="Owner Secret Key (e.g. TURFIFYADMIN2026)"
                                                required={formData.role === 'admin'}
                                            />
                                        </div>
                                    )}
                                </>
                            )}

                            {!isSignUp && (
                                <div className="flex justify-end">
                                    <Link to="/forgot-password" className="text-primary text-xs hover:underline hover:text-green-300 transition-colors">
                                        Forgot Password?
                                    </Link>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                                style={{ boxShadow: '0 0 20px rgba(204, 255, 0, 0.4)' }}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Processing...
                                    </span>
                                ) : isSignUp ? 'Create Account' : 'Sign In'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-4 border-gray-700 text-white">Or continue with</span>
                            </div>
                        </div>

                        {/* Google Sign-In */}
                        <div className="w-full flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                theme="filled_black"
                                shape="pill"
                                width="100%"
                            />
                        </div>

                        {/* Footer */}
                        <div className="mt-4 text-center">
                            <p className="text-white">
                                By continuing, you agree to our{' '}
                                <Link to="/terms" className="text-primary hover:underline hover:text-green-300">Terms</Link>
                                {' '}&{' '}
                                <Link to="/privacy" className="text-primary hover:underline hover:text-green-300">Privacy</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========== CUSTOM ANIMATIONS ========== */}
            <style>{`
        @keyframes moveGrid {
          0% { transform: translate(0, 0); }
          100% { transform: translate(40px, 40px); }
        }
      `}</style>
        </div>
    );
};

export default LoginPage;
