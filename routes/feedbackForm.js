// const express = require('express');
// const Feedback = require('../models/feedback.js');
// const router = express.Router();
// const jwt=require("jsonwebtoken")


// router.post('/feedback/:userId',async (req,res) => {
//     const {name,feedBack,mood}=req.body;
//     const {userId}=req.params;
//     const token=req.headers["authorization"] && req.headers["authorization"].split(' ')[1];
    
//     if (!token) {
//         return res.status(400).send({ success: false, message: 'Authorization token is missing' });
//     }
//      if ( !name || !feedBack ||!mood) {
//         return res.status(400).json({
//             success: false,
//             message: 'All fields are required'
//         });
//     }
    
//     try{
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);  
//     const userId = decoded.userId;  
//         const newFeedback=new Feedback({
//             name,
//             feedBack,
//             mood,
//             user:userId
//         })

//         await newFeedback.save();
        
//         return res.status(201).json({
//             success: true,
//             message: 'Feedback submitted successfully',
//             data: newFeedback
//         });

//     }catch(error){
//         console.error(error);
//         return res.status(500).json({
//             success: false,
//             message: 'Internal Server Error'
//         });
//     }
// })

// module.exports = router;


const express = require('express');
const Feedback = require('../models/newfeedback.js');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/feedback/:userId', async (req, res) => {
    const { name, feedBack, mood } = req.body;
    const { userId } = req.params;
    const token = req.headers["authorization"]?.split(' ')[1];

    if (!token) {
        return res.status(400).json({ 
            success: false, 
            message: 'Authorization token is missing' 
        });
    }

    if (!name || !feedBack || !mood) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const authenticatedUserId = decoded.userId;

        // Ensure user can only add feedback for themselves
        if (authenticatedUserId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to submit feedback for this user'
            });
        }

        // Find the user's feedback document
        let userFeedback = await Feedback.findOne({ user: userId });

        if (!userFeedback) {
            // If no document exists for the user, create one
            userFeedback = new Feedback({
                user: userId,
                feedbacks: [{ name, feedBack, mood }]
            });
        } else {
            // Push new feedback into the existing document
            userFeedback.feedbacks.push({ name, feedBack, mood });
        }

        await userFeedback.save();

        return res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: userFeedback
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
});

module.exports = router;
