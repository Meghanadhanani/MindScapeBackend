const express = require('express');
const Session = require('../models/session.js');
const router = express.Router();
const User =require('../models/user.js')
const jwt = require('jsonwebtoken');

const cors=require('cors')

const app=express()
const path = require('path');

app.use(cors());
app.use(express.json());

router.post('/addsession', async (req, res) => {
    const { currentNote } = req.body; 
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authorization token is required'
        });
    }

    if (!currentNote) { 
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Create a new session
        const newSession = new Session({
            user: userId,
            currentNote
        });

        await newSession.save();

        res.status(200).json({
            success: true,
            message: 'Session added successfully',
            Session: {
                id: newSession._id,
                currentNote: newSession.currentNote
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during add',
            error: error.message
        });
    }
});


module.exports=router

