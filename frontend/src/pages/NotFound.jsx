import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-deepBlack text-white">
            <Navbar showFilters={false} />
            <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
                <div className="w-64 h-64 relative mb-8">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                    <span className="text-[120px] font-black text-primary relative z-10">404</span>
                </div>
                <h1 className="text-4xl font-bold mb-4">Goal Not Found!</h1>
                <p className="text-gray-400 text-lg max-w-md mx-auto mb-10">
                    Looks like you've wandered off the pitch. The page you're looking for doesn't exist or has been moved.
                </p>
                <Link to="/" className="btn-primary px-10 py-4 text-lg font-bold shadow-xl shadow-primary/30 transform hover:scale-105 transition-all">
                    Back to the Game
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
