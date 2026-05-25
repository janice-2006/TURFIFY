const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

// Initialize Razorpay instance
// In a real app, always use process.env keys
// If keys are missing, fallback to a dummy instance so the app doesn't crash on start
let razorpayInstance = null;

const getRazorpayInstance = () => {
    if (!razorpayInstance) {
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key_id',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_dummy_secret',
        });
    }
    return razorpayInstance;
}


// Create payment order
router.post('/create-order', auth, async (req, res) => {
    try {
        const { amount } = req.body;
        
        if (!amount) {
            return res.status(400).json({ message: 'Amount is required' });
        }

        const options = {
            amount: amount * 100, // Razorpay works in paise (rupees * 100)
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        };

        const order = await getRazorpayInstance().orders.create(options);
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Razorpay Error:", error);
        res.status(500).json({ message: 'Failed to create payment order', error: error.message });
    }
});

// Verify payment signature
router.post('/verify', auth, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Payment details are missing' });
        }

        const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_dummy_secret';

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256', secret).update(body.toString()).digest('hex');
                                  
        if (expectedSignature === razorpay_signature) {
            // Payment verified
            // In complete implementation, you would update the order status in your DB here
            res.status(200).json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (error) {
         console.error("Razorpay Verify Error:", error);
         res.status(500).json({ message: 'Internal server error during verification' });
    }
});

module.exports = router;
