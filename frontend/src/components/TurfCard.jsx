import React from 'react';
import { Link } from 'react-router-dom';

const TurfCard = ({ turf }) => {
    const sportIcons = {
        Football: '⚽',
        Cricket: '🏏',
        Badminton: '🏸',
        Tennis: '🎾',
        Basketball: '🏀',
        Volleyball: '🏐',
    };

    return (
        <Link
            to={`/turf/${turf._id}`}
            className="card group cursor-pointer block h-full"
        >
            {/* Image Container */}
            <div className="relative h-48 overflow-hidden bg-gray-900">
                <img
                    src={turf.images && turf.images[0] ? turf.images[0] : 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=500'}
                    alt={turf.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=500';
                    }}
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                    {turf.featured && (
                        <span className="bg-yellow-500 text-deepBlack text-xs font-bold px-3 py-1 rounded-md">
                            Featured
                        </span>
                    )}
                </div>
                <span className="absolute top-3 right-3 bg-primary text-deepBlack text-xs font-bold px-3 py-1 rounded-md">
                    Bookable
                </span>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Name & Rating */}
                <div className="flex justify-between items-start gap-3 mb-2">
                    <h3 className="text-lg font-bold text-accentWhite group-hover:text-primary transition-colors truncate flex-1 min-w-0">
                        {turf.name}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm text-gray-300 whitespace-nowrap">{turf.rating} ({turf.reviewCount || 0})</span>
                    </div>
                </div>

                {/* Location */}
                <p className="text-gray-400 text-sm mb-3 flex items-center gap-1.5 truncate">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="truncate">{turf.location?.area || 'Chennai'}</span>
                </p>

                {/* Sport Icons */}
                <div className="flex items-center gap-2">
                    {turf.sports && turf.sports.slice(0, 2).map((sport, index) => (
                        <span key={index} className="text-xl" title={sport}>
                            {sportIcons[sport] || '🏟️'}
                        </span>
                    ))}
                    {turf.sports && turf.sports.length > 2 && (
                        <span className="text-xs text-gray-400">+ {turf.sports.length - 2} more</span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default TurfCard;
