import React from 'react';
import { Link } from 'react-router-dom';

const TournamentCard = ({ tournament }) => {
    const sportIcons = {
        Football: '⚽',
        Cricket: '🏏',
        Badminton: '🏸',
        Tennis: '🎾',
        Basketball: '🏀',
        Volleyball: '🏐',
        Pickleball: '🏓',
    };

    const formattedDate = new Date(tournament.date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    return (
        <Link
            to={`/tournament/${tournament._id}`}
            className="card group cursor-pointer block h-full"
        >
            {/* Image Container */}
            <div className="relative h-48 overflow-hidden bg-gray-900">
                <img
                    src={tournament.images && tournament.images[0] ? tournament.images[0] : 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500'}
                    alt={tournament.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500';
                    }}
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-yellow-500 text-deepBlack text-xs font-bold px-3 py-1 rounded-md">
                        {tournament.prizePool ? 'Prize Pool' : 'Event'}
                    </span>
                </div>
                <span className={`absolute top-3 right-3 text-deepBlack text-xs font-bold px-3 py-1 rounded-md ${
                    tournament.phase === 'Ongoing' ? 'bg-green-500' : 'bg-primary'
                }`}>
                    {tournament.phase || tournament.registrationStatus || 'Open'}
                </span>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Name */}
                <h3 className="text-lg font-bold text-accentWhite group-hover:text-primary transition-colors truncate mb-2">
                    {tournament.name}
                </h3>

                {/* Venue Location */}
                <p className="text-gray-400 text-sm mb-2 flex items-center gap-1.5 truncate">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="truncate">{tournament.location?.venueName || 'Chennai'}</span>
                </p>

                {/* Event Date */}
                <p className="text-gray-400 text-xs mb-3 flex items-center gap-1.5">
                    <span className="text-primary">📅</span>
                    <span>{formattedDate}</span>
                </p>

                {/* Sport Icon & Entry Fee */}
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-800">
                    <div className="flex items-center gap-2">
                        <span className="text-xl" title={tournament.sport}>
                            {sportIcons[tournament.sport] || '🏆'}
                        </span>
                        <span className="text-sm text-gray-300 font-medium">{tournament.sport}</span>
                    </div>
                    <span className="text-primary font-bold text-sm">Fee: ₹{tournament.entryFee}</span>
                </div>
                
                {tournament.prizePool && (
                    <div className="mt-2 text-xs text-yellow-500 font-semibold bg-yellow-950/20 border border-yellow-900/30 px-2.5 py-1 rounded-md inline-block">
                        🎁 {tournament.prizePool}
                    </div>
                )}
            </div>
        </Link>
    );
};

export default TournamentCard;
