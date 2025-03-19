// const express = require('express');
// const jwt = require('jsonwebtoken');
// const Note = require('../models/notes.js');
// const router = express.Router();

// // Middleware to authenticate JWT token
// const authenticateJWT = (req, res, next) => {
//     const token = req.headers['authorization']?.split(' ')[1];
//     if (!token) {
//         return res.sendStatus(403);
//     }
//     jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//         if (err) {
//             return res.sendStatus(403);
//         }
//         req.user = user;
//         next();
//     });
// };

// router.get('/mood-data/:id', authenticateJWT, async (req, res) => {
//     const { startDate, endDate } = req.query;
//     const userId = req.params.id;

//     try {
//         if (!startDate || !endDate) {
//             return res.status(400).json({ error: 'startDate and endDate are required' });
//         }

//         // Update the year to 2025 in the date strings
//         const start = new Date(startDate.replace('2024', '2025'));
//         start.setUTCHours(0, 0, 0, 0);
        
//         const end = new Date(endDate.replace('2024', '2025'));
//         end.setUTCHours(23, 59, 59, 999);

//         console.log('Processed Start Date:', start.toISOString());
//         console.log('Processed End Date:', end.toISOString());

//         // Update the query to handle the user array
//         const notes = await Note.find({
//             user: userId, // MongoDB will match this against the array
//             createdAt: { 
//                 $gte: start, 
//                 $lte: end 
//             }
//         }).select('mood createdAt');

        

//         // Initialize array for the week
//         const weekData = [];
        
//         // Process each day in the date range
//         const currentDate = new Date(start);
//         while (currentDate <= end) {
//             const currentDateStr = currentDate.toISOString().split('T')[0];
            
//             // Find notes for this day
//             const dayNotes = notes.filter(note => {
//                 const noteDate = new Date(note.createdAt);
//                 const noteDateStr = noteDate.toISOString().split('T')[0];
//                 return noteDateStr === currentDateStr;
//             });

//             // Take the most recent mood entry for the day if multiple exists
//             const dayMood = dayNotes.length > 0 
//                 ? dayNotes.sort((a, b) => b.createdAt - a.createdAt)[0].mood 
//                 : null;

//             weekData.push({
//                 day: currentDateStr,
//                 mood: dayMood,
//                 totalEntriesForDay: dayNotes.length
//             });

//             currentDate.setDate(currentDate.getDate() + 1);
//         }

//         res.json({
//             weekData,
//             debug: {
//                 requestedDateRange: {
//                     start: start.toISOString(),
//                     end: end.toISOString()
//                 },
//                 totalNotesFound: notes.length,
//                 dateRangeInDays: Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1
//             }
//         });

//     } catch (error) {
//         console.error('Error fetching mood data:', error);
//         res.status(500).json({ error: 'Internal server error', details: error.message });
//     }
// });

// // Add a new endpoint specifically for calculating streaks
// router.get('/streak/:id', authenticateJWT, async (req, res) => {
//     const userId = req.params.id;

//     try {
//         // Get the current date in user's local time
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
        
//         // Get a date 60 days ago to have enough data for streak calculation
//         const sixtyDaysAgo = new Date(today);
//         sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        
//         // Find all notes for this user in the last 60 days
//         const notes = await Note.find({
//             user: userId,
//             createdAt: { 
//                 $gte: sixtyDaysAgo, 
//                 $lte: new Date() // Use now instead of midnight to include today's entries
//             }
//         }).select('mood createdAt');
        
//         console.log(`Found ${notes.length} notes for user ${userId}`);
        
//         // Group notes by day (in user's local timezone)
//         const dayMap = new Map();
//         notes.forEach(note => {
//             const noteDate = new Date(note.createdAt);
//             // Convert to local date string without time component
//             const dateStr = noteDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
            
//             if (!dayMap.has(dateStr)) {
//                 dayMap.set(dateStr, []);
//             }
//             dayMap.get(dateStr).push(note);
//         });
        
//         console.log(`Notes grouped into ${dayMap.size} unique days`);
        
//         // Convert to array of days with moods
//         const days = Array.from(dayMap.entries()).map(([dateStr, dayNotes]) => {
//             // Take the most recent mood entry for the day
//             const latestNote = dayNotes.sort((a, b) => b.createdAt - a.createdAt)[0];
//             return {
//                 date: dateStr,
//                 mood: latestNote.mood
//             };
//         });
        
//         // Sort days by date (latest first)
//         days.sort((a, b) => new Date(b.date) - new Date(a.date));
        
//         console.log('Sorted days:', days.map(d => d.date));
        
//         // Calculate streak
//         let streak = 0;
//         let currentDate = new Date(today);
        
//         // Check if there's an entry for today
//         const todayStr = currentDate.toLocaleDateString('en-CA');
//         const hasTodayEntry = days.some(day => day.date === todayStr);
        
//         console.log(`Today is ${todayStr}, has entry: ${hasTodayEntry}`);
        
//         // If no entry for today, check if there's one for yesterday to continue the streak
//         if (!hasTodayEntry) {
//             const yesterday = new Date(today);
//             yesterday.setDate(yesterday.getDate() - 1);
//             const yesterdayStr = yesterday.toLocaleDateString('en-CA');
//             const hasYesterdayEntry = days.some(day => day.date === yesterdayStr);
            
//             console.log(`Yesterday is ${yesterdayStr}, has entry: ${hasYesterdayEntry}`);
            
//             // If no entry for yesterday either, the streak is broken
//             if (!hasYesterdayEntry) {
//                 console.log('No entries for today or yesterday - streak is 0');
//                 return res.json({ streak: 0 });
//             }
            
//             // Start counting from yesterday
//             currentDate = yesterday;
//         }
        
//         // Count consecutive days with entries
//         let checkDate = new Date(currentDate);
//         let consecutiveDates = [];
        
//         while (true) {
//             const dateStr = checkDate.toLocaleDateString('en-CA');
//             const hasEntry = days.some(day => day.date === dateStr);
            
//             if (hasEntry) {
//                 streak++;
//                 consecutiveDates.push(dateStr);
//                 checkDate.setDate(checkDate.getDate() - 1);
//             } else {
//                 break;
//             }
//         }
        
//         console.log(`Final streak: ${streak}, dates: ${consecutiveDates.join(', ')}`);
        
//         res.json({ 
//             streak,
//             streakDates: consecutiveDates, // Include dates for debugging
//             dayCount: days.length        // Include total day count for verification
//         });

//     } catch (error) {
//         console.error('Error calculating streak:', error);
//         res.status(500).json({ error: 'Internal server error', details: error.message });
//     }
// });

// module.exports = router;




const express = require('express');
const jwt = require('jsonwebtoken');
const Note = require('../models/newnotes.js');
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

       

        // Find note documents that contain the userId in their user array
        const noteDocs = await Note.find({
            user: { $elemMatch: { $eq: userId } }
        });

        // Extract all notes from the documents and filter by date
        const allNotes = [];
        noteDocs.forEach(doc => {
            doc.notes.forEach(note => {
                if (note.createdAt >= start && note.createdAt <= end) {
                    allNotes.push({
                        mood: note.mood,
                        createdAt: note.createdAt
                    });
                }
            });
        });

        // Initialize array for the week
        const weekData = [];
        
        // Process each day in the date range
        const currentDate = new Date(start);
        while (currentDate <= end) {
            const currentDateStr = currentDate.toISOString().split('T')[0];
            
            // Find notes for this day
            const dayNotes = allNotes.filter(note => {
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
                totalNotesFound: allNotes.length,
                dateRangeInDays: Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1
            }
        });

    } catch (error) {
        console.error('Error fetching mood data:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Add a new endpoint specifically for calculating streaks
router.get('/streak/:id', authenticateJWT, async (req, res) => {
    const userId = req.params.id;

    try {
        // Get the current date in user's local time
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get a date 60 days ago to have enough data for streak calculation
        const sixtyDaysAgo = new Date(today);
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        
        // Find all note documents for this user
        const noteDocs = await Note.find({
            user: { $elemMatch: { $eq: userId } }
        });
        
        // Extract all notes from the documents and filter by date
        const allNotes = [];
        noteDocs.forEach(doc => {
            doc.notes.forEach(note => {
                if (note.createdAt >= sixtyDaysAgo && note.createdAt <= new Date()) {
                    allNotes.push({
                        mood: note.mood,
                        createdAt: note.createdAt
                    });
                }
            });
        });
        
        console.log(`Found ${allNotes.length} notes for user ${userId}`);
        
        // Group notes by day (in user's local timezone)
        const dayMap = new Map();
        allNotes.forEach(note => {
            const noteDate = new Date(note.createdAt);
            // Convert to local date string without time component
            const dateStr = noteDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
            
            if (!dayMap.has(dateStr)) {
                dayMap.set(dateStr, []);
            }
            dayMap.get(dateStr).push(note);
        });
        
        console.log(`Notes grouped into ${dayMap.size} unique days`);
        
        // Convert to array of days with moods
        const days = Array.from(dayMap.entries()).map(([dateStr, dayNotes]) => {
            // Take the most recent mood entry for the day
            const latestNote = dayNotes.sort((a, b) => b.createdAt - a.createdAt)[0];
            return {
                date: dateStr,
                mood: latestNote.mood
            };
        });
        
        // Sort days by date (latest first)
        days.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        console.log('Sorted days:', days.map(d => d.date));
        
        // Calculate streak
        let streak = 0;
        let currentDate = new Date(today);
        
        // Check if there's an entry for today
        const todayStr = currentDate.toLocaleDateString('en-CA');
        const hasTodayEntry = days.some(day => day.date === todayStr);
        
        console.log(`Today is ${todayStr}, has entry: ${hasTodayEntry}`);
        
        // If no entry for today, check if there's one for yesterday to continue the streak
        if (!hasTodayEntry) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toLocaleDateString('en-CA');
            const hasYesterdayEntry = days.some(day => day.date === yesterdayStr);
            
            console.log(`Yesterday is ${yesterdayStr}, has entry: ${hasYesterdayEntry}`);
            
            // If no entry for yesterday either, the streak is broken
            if (!hasYesterdayEntry) {
                console.log('No entries for today or yesterday - streak is 0');
                return res.json({ streak: 0 });
            }
            
            // Start counting from yesterday
            currentDate = yesterday;
        }
        
        // Count consecutive days with entries
        let checkDate = new Date(currentDate);
        let consecutiveDates = [];
        
        while (true) {
            const dateStr = checkDate.toLocaleDateString('en-CA');
            const hasEntry = days.some(day => day.date === dateStr);
            
            if (hasEntry) {
                streak++;
                consecutiveDates.push(dateStr);
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        console.log(`Final streak: ${streak}, dates: ${consecutiveDates.join(', ')}`);
        
        res.json({ 
            streak,
            streakDates: consecutiveDates, // Include dates for debugging
            dayCount: days.length        // Include total day count for verification
        });

    } catch (error) {
        console.error('Error calculating streak:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;