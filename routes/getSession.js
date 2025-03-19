// const express = require('express');
// const Session = require('../models/session.js'); // Import the Session model
// const router = express.Router();
// const jwt = require('jsonwebtoken');

// router.get('/getsession/:userId', async (req, res) => {
//     const { userId } = req.params; 
//     const token = req.headers['authorization']?.split(' ')[1];

//     if (!token) {
//         return res.status(401).json({
//             success: false,
//             message: 'Authorization token is required'
//         });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const authenticatedUserId = decoded.userId; 

//         // Check if the authenticated user ID matches the requested user ID
//         if (authenticatedUserId !== userId) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'You are not authorized to access this user\'s sessions'
//             });
//         }

//         // Fetch all sessions for the given user ID
//         const sessions = await Session.find({ user: userId });

//         if (!sessions || sessions.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'No sessions found for this user'
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: 'Session data retrieved successfully',
//             sessions: sessions.map(session => ({
//                 id: session._id,
//                 description: session.description
//             }))
//         });

//     } catch (error) {
//         console.error('Session retrieval error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error during session data retrieval',
//             error: error.message
//         });
//     }
// });

// module.exports = router;




const express = require('express');
const Session = require('../models/session.js');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.get('/getsession/:userId', async (req, res) => {
    const { userId } = req.params; 
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authorization token is required'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const authenticatedUserId = decoded.userId; 

        // Check if the authenticated user ID matches the requested user ID
        if (authenticatedUserId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to access this user\'s sessions'
            });
        }

        // Fetch all sessions for the given user ID
        const sessions = await Session.find({ user: userId }).sort({ createdAt: -1 });

        if (!sessions || sessions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No sessions found for this user'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Session data retrieved successfully',
            sessions: sessions.map(session => ({
                id: session._id,
                description: session.description,
                duration: session.duration,
                createdAt: session.createdAt
            }))
        });

    } catch (error) {
        console.error('Session retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during session data retrieval',
            error: error.message
        });
    }
});

module.exports = router;
