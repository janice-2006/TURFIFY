import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ onSearch, onLocationChange, locations = [], showFilters = true }) => {
    const [location, setLocation] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const routerLocation = useLocation();

    const navLinkClass = (path) => {
        const active =
            path === '/'
                ? routerLocation.pathname === '/'
                : routerLocation.pathname === path || routerLocation.pathname.startsWith(`${path}/`);
        return active
            ? 'text-primary text-sm font-bold uppercase tracking-wider border-b-2 border-primary pb-1'
            : 'text-gray-400 hover:text-primary text-sm font-medium transition-colors uppercase tracking-wider';
    };

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            if (token && userData) {
                setIsLoggedIn(true);
                setUser(JSON.parse(userData));
            } else {
                setIsLoggedIn(false);
                setUser(null);
            }
        };

        checkAuth();

        // Listen for same-window updates
        window.addEventListener('userUpdate', checkAuth);
        // Listen for other-window updates
        window.addEventListener('storage', checkAuth);

        return () => {
            window.removeEventListener('userUpdate', checkAuth);
            window.removeEventListener('storage', checkAuth);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
        navigate('/login');
    };

    const handleLocationChange = (e) => {
        const newLocation = e.target.value;
        setLocation(newLocation);
        if (onLocationChange) {
            onLocationChange(newLocation);
        }
    };

    const handleSearchChange = (e) => {
        const newSearch = e.target.value;
        setSearchQuery(newSearch);
        if (onSearch) {
            onSearch(newSearch);
        }
    };

    return (
        <nav className="bg-cardBlack border-b border-gray-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
            {/* Top Navigation Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Logo - Always Top Left */}
                    <Link to="/" className="flex items-center gap-3 group transition-all duration-300 transform hover:scale-105">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-green-400 to-primary flex items-center justify-center shadow-lg shadow-primary/40 group-hover:rotate-12 transition-transform">
                            <span className="text-deepBlack font-bold text-xl">⚽</span>
                        </div>
                        <span className="text-2xl font-black text-primary tracking-tighter" style={{ textShadow: '0 0 20px rgba(204, 255, 0, 0.4)' }}>
                            TURFIFY
                        </span>
                    </Link>

                    {/* Center - Location, Search, Filter (Only on Search pages) */}
                    {showFilters && (
                        <div className="hidden lg:flex items-center gap-4 flex-1 max-w-2xl mx-12">
                            {/* Location Selector */}
                            <div className="relative">
                                <select
                                    value={location}
                                    onChange={handleLocationChange}
                                    className="bg-deepBlack border border-gray-700 text-gray-300 py-2.5 pr-10 pl-10 rounded-xl text-sm appearance-none cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all w-full min-w-[160px]"
                                >
                                    <option value="All">All Locations</option>
                                    {locations.map((loc) => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                                <svg className="w-4 h-4 text-primary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <svg className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {/* Search Bar */}
                            <div className="relative flex-1 group">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder="Search for grounds or clubs..."
                                    className="bg-deepBlack border border-gray-700 text-gray-100 py-2.5 pr-4 pl-11 rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all w-full group-hover:border-gray-600"
                                />
                                <svg className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    )}

                    {/* Right - Navigation Links */}
                    <div className="flex items-center gap-2 sm:gap-6">
                        <div className="flex items-center gap-3 sm:gap-6 mr-2 sm:mr-4">
                            {isLoggedIn && (
                                <Link to="/my-bookings" className={navLinkClass('/my-bookings')}>My Bookings</Link>
                            )}
                            {isLoggedIn && user?.role === 'admin' && (
                                <Link to="/admin-dashboard" className={navLinkClass('/admin-dashboard')}>Owner Dashboard</Link>
                            )}
                            <Link to="/coaching" className={navLinkClass('/coaching')}>Coaching</Link>
                            <Link to="/tournaments" className={navLinkClass('/tournaments')}>Tournament</Link>
                        </div>

                        {isLoggedIn ? (
                            <div className="flex items-center gap-4">
                                <Link to="/profile" className="flex items-center gap-3 group">
                                    <div className="w-11 h-11 rounded-full border-2 border-gray-700 overflow-hidden group-hover:border-primary transition-all p-0.5 shadow-lg shadow-black/40">
                                        <img 
                                            src={user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName || 'User'}`} 
                                            alt="Profile" 
                                            className="w-full h-full rounded-full bg-deepBlack"
                                        />
                                    </div>
                                    <div className="hidden lg:block text-left">
                                        <p className="text-xs text-gray-500 font-medium">Hello,</p>
                                        <p className="text-sm text-white font-bold group-hover:text-primary transition-colors truncate max-w-[100px]">
                                            {user?.firstName || 'User'}
                                        </p>
                                    </div>
                                </Link>
                                <button onClick={handleLogout} className="hidden sm:block text-gray-500 hover:text-red-500 text-xs font-bold transition-colors ml-2 uppercase tracking-tighter">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="btn-primary py-2.5 px-6 text-sm font-bold shadow-lg shadow-primary/20">
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

