const dns = require('dns');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Fix MongoDB SRV DNS resolution on some Windows/Node setups
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

// Fail fast when MongoDB is not connected (avoid 10s buffer timeouts)
mongoose.set('bufferCommands', true);

const authRoutes = require('./routes/auth');
const turfRoutes = require('./routes/turfs');
const bookingRoutes = require('./routes/bookings');
const coachRoutes = require('./routes/coaches');
const tournamentRoutes = require('./routes/tournaments');
const paymentRoutes = require('./routes/payment');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const mongoOptions = {
    dbName: process.env.MONGO_DB_NAME || 'turfify',
    serverSelectionTimeoutMS: 15000,
};

const toDirectMongoUri = (srvUri) => {
    const match = srvUri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@/);
    if (!match) return null;
    const [, user, pass] = match;
    const hosts =
        'ac-8mgbksh-shard-00-00.phztlb0.mongodb.net:27017,' +
        'ac-8mgbksh-shard-00-01.phztlb0.mongodb.net:27017,' +
        'ac-8mgbksh-shard-00-02.phztlb0.mongodb.net:27017';
    return `mongodb://${user}:${pass}@${hosts}/turfify?ssl=true&authSource=admin&replicaSet=atlas-8mgbksh-shard-0&retryWrites=true&w=majority`;
};

const connectMongo = async () => {
    const primaryUri = process.env.MONGO_URI_DIRECT || process.env.MONGO_URI;
    try {
        await mongoose.connect(primaryUri, mongoOptions);
        console.log('✅ Connected to MongoDB');
        return;
    } catch (err) {
        const isSrvDnsFailure =
            err?.code === 'ECONNREFUSED' &&
            String(err?.syscall || '').includes('querySrv') &&
            process.env.MONGO_URI?.startsWith('mongodb+srv');

        if (!isSrvDnsFailure || process.env.MONGO_URI_DIRECT) {
            console.error('❌ MongoDB Error:', err.message);
            console.log('📂 Using local seed data for turfs (45 Chennai venues)');
            return;
        }

        const directUri = toDirectMongoUri(process.env.MONGO_URI);
        if (!directUri) {
            console.error('❌ MongoDB Error:', err.message);
            return;
        }

        try {
            console.log('⚠️ SRV DNS failed; retrying with direct MongoDB hosts...');
            await mongoose.connect(directUri, mongoOptions);
            console.log('✅ Connected to MongoDB (direct URI)');
        } catch (directErr) {
            console.error('❌ MongoDB Error:', directErr.message);
            console.log('📂 Using local seed data for turfs (45 Chennai venues)');
        }
    }
};

connectMongo().then(() => {
    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/turfs', turfRoutes);
    app.use('/api/bookings', bookingRoutes);
    app.use('/api/coaches', coachRoutes);
    app.use('/api/tournaments', tournamentRoutes);
    app.use('/api/payment', paymentRoutes);

    // Test Route
    app.get('/', (req, res) => {
        res.json({ message: 'Turfify API is running!' });
    });

    // Error Handling
    app.use(notFound);
    app.use(errorHandler);

    // Start Server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});
