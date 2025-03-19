// const express = require('express');
// const jwt = require('jsonwebtoken');
// const router = express.Router();
// const Note = require('../models/notes.js');


// router.put('/note/:noteId', async (req, res) => {
//     const { noteId } = req.params; 
//     const { title, note, mood } = req.body; 
//     const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

//     if (!token) {
//         return res.status(400).send({ success: false, message: 'Authorization token is missing' });
//     }

//     try {
        
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);  
//         const userId = decoded.userId;  

        
//         const noteToUpdate = await Note.findOne({ _id: noteId, user: userId });

//         if (!noteToUpdate) {
//             return res.status(404).send({ success: false, message: 'Note not found or unauthorized' });
//         }

        
//         noteToUpdate.title = title || noteToUpdate.title;
//         noteToUpdate.note = note || noteToUpdate.note;
//         noteToUpdate.mood = mood || noteToUpdate.mood;

        
//         await noteToUpdate.save();

        
//         res.status(200).send({
//             success: true,
//             message: 'Note updated successfully',
//             note: noteToUpdate
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send({
//             success: false,
//             message: 'Error updating note',
//             error: error.message
//         });
//     }
// });

// module.exports = router;


const express = require('express');
const jwt = require('jsonwebtoken');
const Note = require('../models/newnotes.js'); // Adjust the path as necessary
const User = require('../models/user.js'); // Adjust the path as necessary

const router = express.Router();

router.put('/note/:noteId', async (req, res) => {
    const { noteId } = req.params; 
    const { title, note, mood } = req.body; 
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    if (!token) {
        return res.status(400).send({ success: false, message: 'Authorization token is missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  
        const userId = decoded.userId;  

        // Find the note by its ID and ensure it belongs to the user
        const noteToUpdate = await Note.findOne({ 'notes._id': noteId, user: userId });

        if (!noteToUpdate) {
            return res.status(404).send({ success: false, message: 'Note not found or unauthorized' });
        }

        // Update the specific note within the notes array
        const updatedNote = await Note.updateOne(
            { _id: noteToUpdate._id, 'notes._id': noteId },
            { $set: { 
                'notes.$.title': title || noteToUpdate.notes.id(noteId).title,
                'notes.$.note': note || noteToUpdate.notes.id(noteId).note,
                'notes.$.mood': mood || noteToUpdate.notes.id(noteId).mood
            }}
        );

        if (updatedNote.nModified === 0) {
            return res.status(400).send({ success: false, message: 'No changes made to the note' });
        }

        res.status(200).send({
            success: true,
            message: 'Note updated successfully',
            note: {
                title: title || noteToUpdate.notes.id(noteId).title,
                note: note || noteToUpdate.notes.id(noteId).note,
                mood: mood || noteToUpdate.notes.id(noteId).mood
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'Error updating note',
            error: error.message
        });
    }
});

module.exports = router;


