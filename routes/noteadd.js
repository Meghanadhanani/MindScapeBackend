// const express=require('express');
// const User=require('../models/user.js')
// const jwt=require('jsonwebtoken')
// const router=express.Router()
// const Note=require('../models/newnotes.js')
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Note = require('../models/newnotes.js'); // Assuming this is your Note model with the schema you provided
const User=require('../models/user.js')
router.post('/noteadd', async (req, res) => {
    try {
        // Extract data from the request
        const { title, mood, note } = req.body;
        
        // Get token from Authorization header
        const token = req.headers['authorization'].split(' ')[1];
        
        // Verify token and extract userId
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        
        // Find if a note document already exists for this user
        let userNote = await Note.findOne({ user: userId });
        
        if (!userNote) {
            // If no document exists, create a new one
            userNote = new Note({
                user: [userId], // Add userId to the user array
                notes: [] // Initialize with empty notes array
            });
        }
        
        // Create a new note object
        const newNote = {
            title,
            mood,
            note,
            createdAt: new Date()
        };
        
        // Add the new note to the notes array
        userNote.notes.push(newNote);
        
        // Save the document
        await userNote.save();
        const newNoteId = userNote.notes[userNote.notes.length - 1]._id;
        
        // Update the User model to add this note ID to the user's notes array
        await User.findByIdAndUpdate(userId, { $push: { notes: newNoteId } });
        // Return success response with the new note
        res.status(201).json({
            success: true,
            message: 'Note added successfully',
            noteId: userNote._id,
            noteDetails: newNote
        });
        
    } catch (error) {
        console.error(error);
               res.status(500).send({ success: false, message: 'Error adding note', error: error.message });
        
         }
});

module.exports = router;
// router.post('/noteadd', async (req, res) => {
//     const { title, note, mood } = req.body;
//     const token = req.headers['authorization'].split(' ')[1];  // Token from Authorization header

//     try {
        
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);  
//         const userId = decoded.userId; 

        
//         const newNote = new Note({
//             title,
//             note,
//             mood,
//             user: userId  
//         });

//         await newNote.save();  

        
//         await User.findByIdAndUpdate(userId, { $push: { notes: newNote._id } });

//         res.status(201).send({ success: true, message: 'Note added successfully', noteId: newNote._id });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send({ success: false, message: 'Error adding note', error: error.message });
//     }
// });



// module.exports=router


