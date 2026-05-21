const dns = require('dns');
const mongoose = require('mongoose');
require('dotenv').config();

if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}
mongoose.set('bufferCommands', false);

const Turf = require('../models/turf');
const Coach = require('../models/coach');
const Tournament = require('../models/tournament');

const seedTurfs = require('../data/seedTurfs');
const { turfs: dataTurfs, tournaments, coaches } = require('../data/seedData');

// Merge turfs from both files, avoiding duplicates by name
const seenNames = new Set();
const allTurfs = [];
for (const t of seedTurfs) {
    if (!seenNames.has(t.name)) { seenNames.add(t.name); allTurfs.push(t); }
}
for (const t of dataTurfs) {
    if (!seenNames.has(t.name)) { seenNames.add(t.name); allTurfs.push(t); }
}

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.MONGO_DB_NAME || 'turfify',
            serverSelectionTimeoutMS: 15000,
        });
        console.log('✅ Connected to MongoDB');

        // Clear existing collections
        await Turf.deleteMany({});
        console.log('🗑️  Cleared existing turfs');

        await Coach.deleteMany({});
        console.log('🗑️  Cleared existing coaches');

        await Tournament.deleteMany({});
        console.log('🗑️  Cleared existing tournaments');

        // Insert new data
        await Turf.insertMany(allTurfs);
        console.log(`✅ Seeded ${allTurfs.length} turfs successfully!`);

        await Coach.insertMany(coaches);
        console.log(`✅ Seeded ${coaches.length} coaches successfully!`);

        await Tournament.insertMany(tournaments);
        console.log(`✅ Seeded ${tournaments.length} tournaments successfully!`);

        // Close connection
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');

    } catch (err) {
        console.error('❌ Error seeding database:', err);
        process.exit(1);
    }
};

seedDatabase();
