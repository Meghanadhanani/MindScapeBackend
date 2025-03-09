// const mongoose = require('mongoose');
// const User = require('./user');

// const sessionSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true
//     },
//     description: {
//         type: String,
//         required: true
//     },
//     duration: {
//         type: String,
//         required: true
//     },
//     initialTime: {
//         type: Number,
//         required: true
//     },
//     elapsedTime: {
//         type: Number,
//         required: true
//     },
//     date: {
//         type: Date,
//         default: Date.now
//     }
// }, {
//     timestamps: true
// });

// const Session = mongoose.model('Session', sessionSchema);
// module.exports = Session;



const mongoose = require('mongoose');
const User = require('./user');

const sessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    currentNote: {
        type: String,
        required: true
    },

}, {
    timestamps: true
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;