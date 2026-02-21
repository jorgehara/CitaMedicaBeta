const mongoose = require('mongoose');

const unavailabilitySchema = new mongoose.Schema({
    date: {
        type: String,  // 'YYYY-MM-DD'
        required: true,
        trim: true
    },
    period: {
        type: String,
        enum: ['morning', 'afternoon', 'full'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Unavailability', unavailabilitySchema);
