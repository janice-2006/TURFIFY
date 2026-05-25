import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phone: '',
        place: '',
        country: '',
        image: ''
    });

    const avatars = [
        'Aneka', 'Ayaan', 'Avery', 'Emery', 'Jocelyn', 'Max', 'Riley', 'Amaya', 'Iris', 'Jade'
    ];

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                
                if (response.ok) {
                    setFormData({
                        firstName: data.firstName || '',
                        middleName: data.middleName || '',
                        lastName: data.lastName || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        place: data.place || '',
                        country: data.country || '',
                        image: data.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=Ayaan`
                    });
                } else {
                    setMessage({ type: 'error', text: data.message });
                }
            } catch (err) {
                setMessage({ type: 'error', text: 'Failed to load profile' });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarSelect = (seed) => {
        const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
        setFormData({ ...formData, image: newAvatar });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/profile`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                localStorage.setItem('user', JSON.stringify(data.user));
                // Notify navbar to update
                window.dispatchEvent(new Event('userUpdate'));
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Server error. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-deepBlack text-primary flex items-center justify-center font-bold">Loading Profile...</div>;

    return (
        <div className="min-h-screen bg-deepBlack text-white">
            <Navbar showFilters={false} />
            
            <div className="max-w-4xl mx-auto p-6 pt-12 pb-24">
                <div className="flex items-center gap-4 mb-10">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-cardBlack hover:bg-primary hover:text-deepBlack transition-all text-gray-400">←</button>
                    <h1 className="text-4xl font-black text-white tracking-tight">Edit Profile</h1>
                </div>

                {message.text && (
                    <div className={`mb-8 p-4 rounded-2xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-red-500/10 border-red-500 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
                    {/* Left: Avatar Selection */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-cardBlack rounded-3xl p-8 border border-gray-800 text-center shadow-xl">
                            <div className="relative inline-block mb-6">
                                <div className="w-32 h-32 rounded-full border-4 border-primary overflow-hidden mx-auto bg-deepBlack shadow-[0_0_20px_rgba(204,255,0,0.3)]">
                                    <img src={formData.image} alt="Profile" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-primary text-deepBlack w-10 h-10 rounded-full flex items-center justify-center border-4 border-cardBlack shadow-lg">
                                    📸
                                </div>
                            </div>
                            <h3 className="text-lg font-bold mb-4">Choose Avatar</h3>
                            <div className="grid grid-cols-5 gap-2">
                                {avatars.map(seed => (
                                    <button 
                                        key={seed}
                                        type="button"
                                        onClick={() => handleAvatarSelect(seed)}
                                        className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${formData.image.includes(seed) ? 'border-primary scale-110 shadow-lg shadow-primary/30' : 'border-transparent hover:border-gray-600'}`}
                                    >
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt={seed} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Personal Info */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-cardBlack rounded-3xl p-8 border border-gray-800 shadow-xl">
                            <h3 className="text-xl font-bold mb-6 text-primary flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">👤</span>
                                Personal Information
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1.5 block ml-1">First Name</label>
                                    <input 
                                        type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                                        className="input-field w-full" placeholder="First Name" required 
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1.5 block ml-1">Middle Name (Optional)</label>
                                    <input 
                                        type="text" name="middleName" value={formData.middleName} onChange={handleChange}
                                        className="input-field w-full" placeholder="Middle Name" 
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="text-xs text-gray-500 mb-1.5 block ml-1">Last Name</label>
                                <input 
                                    type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                                    className="input-field w-full" placeholder="Last Name" required 
                                />
                            </div>

                            <div className="mb-4">
                                <label className="text-xs text-gray-500 mb-1.5 block ml-1">Email Address (ReadOnly)</label>
                                <input 
                                    type="email" name="email" value={formData.email} readOnly
                                    className="input-field w-full opacity-50 cursor-not-allowed bg-deepBlack" 
                                />
                            </div>

                            <div className="mb-4">
                                <label className="text-xs text-gray-500 mb-1.5 block ml-1">Phone Number</label>
                                <input 
                                    type="text" name="phone" value={formData.phone} onChange={handleChange}
                                    className="input-field w-full" placeholder="+91 00000 00000" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1.5 block ml-1">Place / Area</label>
                                    <input 
                                        type="text" name="place" value={formData.place} onChange={handleChange}
                                        className="input-field w-full" placeholder="e.g. Adyar" 
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1.5 block ml-1">Country</label>
                                    <input 
                                        type="text" name="country" value={formData.country} onChange={handleChange}
                                        className="input-field w-full" placeholder="India" 
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={saving}
                                className="w-full btn-primary py-4 mt-10 font-black text-lg shadow-xl shadow-primary/20 transform active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                {saving ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-deepBlack" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Saving Changes...
                                    </>
                                ) : (
                                    <>SAVE PROFILE</>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
