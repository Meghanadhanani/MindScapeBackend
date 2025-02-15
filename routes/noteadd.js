const express=require('express');
const User=require('../models/user.js')
const jwt=require('jsonwebtoken')
const router=express.Router()
const Note=require('../models/notes.js')

router.post('/noteadd', async (req, res) => {
    try {
        const { title, note, mood } = req.body;
        
        // Check if Authorization header exists
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authorization header missing' 
            });
        }

        // Extract token with safeguards
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid authorization format. Use: Bearer <token>' 
            });
        }

        const token = parts[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token: userId not found' 
            });
        }

        const userId = decoded.userId;

        // Validate required fields
        if (!title || !note || !mood) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields' 
            });
        }

        // Create and save new note
        const newNote = new Note({
            title,
            note,
            mood,
            user: userId
        });

        await newNote.save();

        // Update user's notes array
        await User.findByIdAndUpdate(userId, { 
            $push: { notes: newNote._id } 
        });

        res.status(201).json({ 
            success: true, 
            message: 'Note added successfully', 
            noteId: newNote._id 
        });

    } catch (error) {
        console.error('Server error:', error);
        
        // Send appropriate error messages based on error type
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expired' 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: 'Error adding note', 
            error: error.message 
        });
    }
});



module.exports=router