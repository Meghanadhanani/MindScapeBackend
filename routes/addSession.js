// const express = require('express');
// const Session = require('../models/session.js');
// const router = express.Router();
// const jwt = require('jsonwebtoken');

// router.post('/addsession', async (req, res) => {
//     const { description, duration } = req.body;
//     const token = req.headers['authorization']?.split(' ')[1];

//     if (!token) {
//         return res.status(401).json({
//             success: false,
//             message: 'Authorization token is required'
//         });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const userId = decoded.userId;

//         // Create a new session
//         const newSession = new Session({
//             user: userId,
//             description,
//             duration
//         });

//         await newSession.save();

//         res.status(201).json({
//             success: true,
//             message: 'Session created successfully',
//             session: {
//                 id: newSession._id,
//                 description: newSession.description,
//                 duration: newSession.duration,
//                 createdAt: newSession.createdAt
//             }
//         });

//     } catch (error) {
//         console.error('Session creation error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error during session creation',
//             error: error.message
//         });
//     }
// });

// module.exports = router;



const express = require('express');
const Session = require('../models/newsession.js');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/addsession', async (req, res) => {
    const { description, duration } = req.body;
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authorization token is required'
        });
    }

    if (!description || !duration) {
        return res.status(400).json({
            success: false,
            message: 'Both description and duration are required'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Find if the user already has a session document
        let userSession = await Session.findOne({ user: userId });

        if (!userSession) {
            // If not found, create a new session document
            userSession = new Session({
                user: [userId],
                sessions: [{ description, duration }]
            });
        } else {
            // If found, push new session data into the `sessions` array
            userSession.sessions.push({ description, duration });
        }

        await userSession.save();

        res.status(201).json({
            success: true,
            message: 'Session added successfully',
            session: userSession
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

module.exports = router;
