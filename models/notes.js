const mongoose = require('mongoose');
const User =require('./user')

const MoodSchema = new mongoose.Schema({
    
     user:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"User",
                required:true
            }
        ],
    title: {
        type: String,
        required: true
    },
    note: {
        type: String,
        required: true
    },
    mood: {
        type: String, 
        enum: ['Awesome', 'Noiicee', 'Meh', 'Angy', 'Sed', 'Awful', 'Lazy Lad', 'Sick'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Note = mongoose.model('note', MoodSchema);
module.exports = Note;
