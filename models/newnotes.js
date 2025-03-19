const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
   user:[
               {
                   type:mongoose.Schema.Types.ObjectId,
                   ref:"User",
                   required:true
               }
           ],
    notes: [{
        title: {
            type: String,
            required: true
        },
        mood: {
            type: String, 
            enum: ['Awesome', 'Noicee', 'Meh', 'Angy', 'Sed', 'Awful', 'Lazy Lad', 'Sick'],
            required: true
        },
        note: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

const Note = mongoose.model('newNote', NoteSchema);
module.exports = Note;