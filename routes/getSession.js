const express = require('express');
const Session = require('../models/session.js');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authorization token is required'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

// Get all sessions for a user
router.get('/sessions', verifyToken, async (req, res) => {
    try {
        const sessions = await Session.find({ user: req.user.userId })
            .sort({ createdAt: -1 }); // Sort by newest first

        res.status(200).json({
            success: true,
            message: 'Sessions retrieved successfully',
            sessions
        });
    } catch (error) {
        console.error('Session retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during session retrieval',
            error: error.message
        });
    }
});

// Create a new session
router.post('/sessions', verifyToken, async (req, res) => {
    try {
        const { description, duration, initialTime, elapsedTime } = req.body;
        
        const newSession = new Session({
            user: req.user.userId,
            description,
            duration,
            initialTime,
            elapsedTime,
            date: new Date()
        });

        await newSession.save();

        res.status(201).json({
            success: true,
            message: 'Session created successfully',
            session: newSession
        });
    } catch (error) {
        console.error('Session creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during session creation',
            error: error.message
        });
    }
});

// Delete a session
router.delete('/sessions/:sessionId', verifyToken, async (req, res) => {
    try {
        const session = await Session.findOne({
            _id: req.params.sessionId,
            user: req.user.userId
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found or unauthorized'
            });
        }

        await session.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Session deleted successfully'
        });
    } catch (error) {
        console.error('Session deletion error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during session deletion',
            error: error.message
        });
    }
});

module.exports = router;