const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// const userSessionSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     sessions: [sessionSchema]
// });
const userSessionSchema = new mongoose.Schema({
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    sessions: [sessionSchema]
});
module.exports = mongoose.model('Session', userSessionSchema);