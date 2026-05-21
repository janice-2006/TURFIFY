import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import TurfDetails from './pages/TurfDetails';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import ProfilePage from './pages/ProfilePage';
import CoachingPage from './pages/CoachingPage';
import TournamentsPage from './pages/TournamentsPage';
import CoachDetails from './pages/CoachDetails';
import TournamentDetails from './pages/TournamentDetails';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Dashboard/Home */}
        <Route path="/" element={<HomePage />} />

        {/* Authentication */}
        <Route path="/login" element={<LoginPage />} />

        {/* Coaching & Tournaments */}
        <Route path="/coaching" element={<CoachingPage />} />
        <Route path="/coach/:id" element={<CoachDetails />} />
        <Route path="/tournaments" element={<TournamentsPage />} />
        <Route path="/tournament/:id" element={<TournamentDetails />} />

        {/* Turf Specific Pages */}
        <Route path="/turf/:id" element={<TurfDetails />} />
        <Route path="/book/:id" element={<BookingPage />} />
        <Route path="/payment" element={<PaymentPage />} />

        {/* User Profile */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* Other Pages (Temporary redirects to Home) */}
        <Route path="/training" element={<CoachingPage />} />
        <Route path="/terms" element={<HomePage />} />
        <Route path="/privacy" element={<HomePage />} />
        <Route path="/contact" element={<HomePage />} />

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

// THIS IS THE LINE YOU WERE MISSING!
export default App; 
