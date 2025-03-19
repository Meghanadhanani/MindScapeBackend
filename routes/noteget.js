const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Note = require('../models/newnotes.js');

// router.get('/note/:userId', async (req, res) => {
//     const { userId } = req.params;
//     const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

//     if (!token) {
//         return res.status(400).send({ success: false, message: 'Authorization token is missing' });
//     }

//     try {
        
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);  
//         const loggedInUserId = decoded.userId;  

        
//         if (loggedInUserId !== userId) {
//             return res.status(403).send({ success: false, message: 'Unauthorized: User IDs do not match' });
//         }

        
//         const notes = await Note.find({ user: userId });

//         if (notes.length === 0) {
//             return res.status(404).send({ success: false, message: 'No notes found for this user' });
//         }

//         res.status(200).send({
//             success: true,
//             message: 'Notes retrieved successfully',
//             notes
//         });

//     } catch (error) {
//         console.error(error);
        
//         res.status(500).send({
//             success: false,
//             message: 'Error retrieving notes',
//             error: error.message
//         });
//     }
// });


router.get('/note/:userId', async (req, res) => {
try {
    // Get user ID from authentication middleware
    const { userId } = req.params;
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    // Find the user's notes document
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  
        const loggedInUserId = decoded.userId;  
    const userNotes = await Note.findOne({ user: userId });

    if (!userNotes) {
        return res.status(404).json({ message: "No notes found for this user" });
    }

    res.status(200).json(userNotes.notes);
} catch (error) {
    res.status(500).json({ message: error.message });
}
})

module.exports = router;
