const turfs = [
    {
        name: 'HotFut SPR Sports - Vivira Mall',
        description: 'One of Chennai\'s most premium rooftop turfs. Known for high-quality lighting and a professional atmosphere. Ideal for corporate matches and high-intensity games.',
        location: { area: 'Navalur', city: 'Chennai', address: 'Vivira Mall, OMR, Navalur, Chennai - 600119' },
        pricePerHour: 1800,
        sports: ['Football', 'Cricket'],
        rating: 4.9,
        reviewCount: 124,
        images: ['https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800'],
        amenities: ['Rooftop', 'AC Lounge', 'Parking', 'Shower', 'Cafeteria'],
        featured: true,
        capacity: 14,
        turfType: 'Outdoor'
    },
    {
        name: 'FC Marina - Ponmar',
        description: 'Professional grade turf with FIFA-certified artificial grass. The go-to spot for local football enthusiasts in the Ponmar area.',
        location: { area: 'Ponmar', city: 'Chennai', address: 'GST Road, Ponmar, Chennai - 600048' },
        pricePerHour: 1200,
        sports: ['Football', 'Cricket'],
        rating: 4.7,
        reviewCount: 89,
        images: ['https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800'],
        amenities: ['Parking', 'Shower', 'Professional Lighting'],
        featured: false,
        capacity: 14,
        turfType: 'Outdoor'
    },
    {
        name: 'Smash N Kick',
        description: 'A versatile multi-sport hub. Whether it is a badminton smash or a football kick, this venue provides top-tier facilities for all.',
        location: { area: 'Kelambakkam', city: 'Chennai', address: 'ECR, Kelambakkam, Chennai - 603103' },
        pricePerHour: 1500,
        sports: ['Badminton', 'Football', 'Tennis'],
        rating: 4.6,
        reviewCount: 56,
        images: ['https://images.unsplash.com/photo-1626245347646-4e0f0a8a7b0e?w=800'],
        amenities: ['Covered Court', 'Parking', 'Locker Room'],
        featured: false,
        capacity: 20,
        turfType: 'Covered'
    },
    {
        name: 'The Football Factory',
        description: 'A dedicated football sanctuary in the heart of the city. Known for hosting the most competitive local leagues in Chennai.',
        location: { area: 'Anna Nagar', city: 'Chennai', address: '2nd Avenue, Anna Nagar, Chennai - 600040' },
        pricePerHour: 1700,
        sports: ['Football'],
        rating: 4.8,
        reviewCount: 210,
        images: ['https://images.unsplash.com/photo-1556632279-10c5c06a9f03?w=800'],
        amenities: ['High-end Turf', 'Sound System', 'Parking'],
        featured: true,
        capacity: 14,
        turfType: 'Outdoor'
    },
    {
        name: 'Court Masters',
        description: 'Elite indoor badminton and tennis courts. The flooring is world-class, providing the perfect grip for professional players.',
        location: { area: 'Mylapore', city: 'Chennai', address: 'Luz Church Road, Mylapore, Chennai - 600004' },
        pricePerHour: 1100,
        sports: ['Badminton', 'Tennis'],
        rating: 4.7,
        reviewCount: 78,
        images: ['https://images.unsplash.com/photo-1626245347646-4e0f0a8a7b0e?w=800'],
        amenities: ['AC', 'Indoor', 'Shower', 'Pro Shop'],
        featured: true,
        capacity: 4,
        turfType: 'Indoor'
    }
    // Add more turfs following this pattern...
];

module.exports = turfs;
