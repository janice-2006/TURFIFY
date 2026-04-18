const mongoose = require('mongoose');
require('dotenv').config();
const Turf = require('../models/turf');
const turfs = require('../data/seedTurfs');

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing turfs
        await Turf.deleteMany({});
        console.log('🗑️  Cleared existing turfs');

        // Insert new turfs
        await Turf.insertMany(turfs);
        console.log(`✅ Seeded ${turfs.length} turfs successfully!`);

        // Close connection
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');

    } catch (err) {
        console.error('❌ Error seeding database:', err);
        process.exit(1);
    }
};

seedDatabase();
