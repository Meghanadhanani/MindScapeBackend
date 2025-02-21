const express = require('express');
const jwt = require('jsonwebtoken');
const Note = require('../models/notes.js');
const router = express.Router();

// Middleware to authenticate JWT token
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.sendStatus(403);
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

router.get('/mood-data/:id', authenticateJWT, async (req, res) => {
    const { startDate, endDate } = req.query;
    const userId = req.params.id;

    try {
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'startDate and endDate are required' });
        }

        // Update the year to 2025 in the date strings
        const start = new Date(startDate.replace('2024', '2025'));
        start.setUTCHours(0, 0, 0, 0);
        
        const end = new Date(endDate.replace('2024', '2025'));
        end.setUTCHours(23, 59, 59, 999);

        console.log('Processed Start Date:', start.toISOString());
        console.log('Processed End Date:', end.toISOString());

        // Update the query to handle the user array
        const notes = await Note.find({
            user: userId, // MongoDB will match this against the array
            createdAt: { 
                $gte: start, 
                $lte: end 
            }
        }).select('mood createdAt');

        console.log('Found notes:', notes);

        // Initialize array for the week
        const weekData = [];
        
        // Process each day in the date range
        const currentDate = new Date(start);
        while (currentDate <= end) {
            const currentDateStr = currentDate.toISOString().split('T')[0];
            
            // Find notes for this day
            const dayNotes = notes.filter(note => {
                const noteDate = new Date(note.createdAt);
                const noteDateStr = noteDate.toISOString().split('T')[0];
                return noteDateStr === currentDateStr;
            });

            // Take the most recent mood entry for the day if multiple exists
            const dayMood = dayNotes.length > 0 
                ? dayNotes.sort((a, b) => b.createdAt - a.createdAt)[0].mood 
                : null;

            weekData.push({
                day: currentDateStr,
                mood: dayMood,
                totalEntriesForDay: dayNotes.length
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        res.json({
            weekData,
            debug: {
                requestedDateRange: {
                    start: start.toISOString(),
                    end: end.toISOString()
                },
                totalNotesFound: notes.length,
                dateRangeInDays: Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1
            }
        });

    } catch (error) {
        console.error('Error fetching mood data:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;