const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Note = require('../models/newnotes.js'); 
const User=require('../models/user.js')
router.post('/noteadd', async (req, res) => {
    try {
        
        const { title,  note,mood } = req.body;
        
        
        const token = req.headers['authorization'].split(' ')[1];
        
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        
        
        let userNote = await Note.findOne({ user: userId });
        
        if (!userNote) {
            
            userNote = new Note({
                user: [userId], 
                notes: [] 
            });
        }
        
        
        const newNote = {
            title,
            mood,
            note,
            createdAt: new Date()
        };
        
        
        userNote.notes.push(newNote);
        
        
        await userNote.save();
        const newNoteId = userNote.notes[userNote.notes.length - 1]._id;
        
        
        await User.findByIdAndUpdate(userId, { $push: { notes: newNoteId } });
        
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



