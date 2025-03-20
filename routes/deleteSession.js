// const express = require('express');
// const Session = require('../models/session.js'); // Import the Session model
// const router = express.Router();
// const jwt = require('jsonwebtoken');

// router.delete('/deletesession/:sessionId', async (req, res) => {
//     const { sessionId } = req.params;
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

//         // Find the session by ID
//         const session = await Session.findById(sessionId);

//         if (!session) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Session not found'
//             });
//         }

//         // Check if the authenticated user owns the session
//         if (session.user.toString() !== authenticatedUserId) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'You are not authorized to delete this session'
//             });
//         }

//         // Delete the session
//         await Session.findByIdAndDelete(sessionId);

//         res.status(200).json({
//             success: true,
//             message: 'Session deleted successfully'
//         });

//     } catch (error) {
//         console.error('Session deletion error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error during session deletion',
//             error: error.message
//         });
//     }
// });

// module.exports = router;


const express = require('express');
const Session = require('../models/newsession.js'); // Import the Session model
const router = express.Router();
const jwt = require('jsonwebtoken');

router.delete('/deletesession/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
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

        
        const userSession = await Session.findOne({ user: authenticatedUserId });

        if (!userSession) {
            return res.status(404).json({
                success: false,
                message: 'No session data found for this user'
            });
        }

        
        const sessionIndex = userSession.sessions.findIndex(s => s._id.toString() === sessionId);

        if (sessionIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        
        userSession.sessions.splice(sessionIndex, 1);
        await userSession.save();

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

