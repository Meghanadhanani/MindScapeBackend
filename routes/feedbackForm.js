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


// const express = require('express');
// const Feedback = require('../models/newfeedback.js');
// const router = express.Router();
// const jwt = require('jsonwebtoken');

// router.post('/feedback/:userId', async (req, res) => {
//     const { name, feedBack, mood } = req.body;
//     const { userId } = req.params;
//     const token = req.headers["authorization"]?.split(' ')[1];

//     if (!token) {
//         return res.status(400).json({ 
//             success: false, 
//             message: 'Authorization token is missing' 
//         });
//     }

//     if (!name || !feedBack || !mood) {
//         return res.status(400).json({
//             success: false,
//             message: 'All fields are required'
//         });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const authenticatedUserId = decoded.userId;

//         // Ensure user can only add feedback for themselves
//         if (authenticatedUserId !== userId) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'You are not authorized to submit feedback for this user'
//             });
//         }

//         // Find the user's feedback document
//         let userFeedback = await Feedback.findOne({ user: userId });

//         if (!userFeedback) {
//             // If no document exists for the user, create one
//             userFeedback = new Feedback({
//                 user: userId,
//                 feedbacks: [{ name, feedBack, mood }]
//             });
//         } else {
//             // Push new feedback into the existing document
//             userFeedback.feedbacks.push({ name, feedBack, mood });
//         }

//         await userFeedback.save();

//         return res.status(201).json({
//             success: true,
//             message: 'Feedback submitted successfully',
//             data: userFeedback
//         });

//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             success: false,
//             message: 'Internal Server Error',
//             error: error.message
//         });
//     }
// });

// module.exports = router;



const express = require('express');
const Feedback = require('../models/newfeedback.js');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/user.js');
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

    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!feedBack) missingFields.push("feedBack");
    if (!mood) missingFields.push("mood");
  
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          missingFields.length === 1
            ? `Missing required field: ${missingFields[0]}.`
            : `Missing required fields: ${missingFields.join(", ")}.`,
        missingFields,
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
        const user=await User.findById(userId);
        const email=user.email;
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
  const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,  
          pass: process.env.PASSWORD, 
        },
      });
      let emailTemplate = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Feedback Received</title>
          <style>
              body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
              }
              .header {
                  background-color: #4A90E2;
                  color: white;
                  padding: 10px;
                  text-align: center;
                  border-radius: 5px 5px 0 0;
              }
              .content {
                  background-color: #f9f9f9;
                  padding: 20px;
                  border-left: 1px solid #ddd;
                  border-right: 1px solid #ddd;
              }
              .footer {
                  background-color: #f2f2f2;
                  padding: 15px;
                  text-align: center;
                  font-size: 14px;
                  color: #777;
                  border-radius: 0 0 5px 5px;
                  border: 1px solid #ddd;
              }
              .mood {
                  display: inline-block;
                  padding: 8px 15px;
                  border-radius: 20px;
                  font-weight: bold;
                  margin: 10px 0;
              }
              .happy {
                  background-color: #4CAF50;
                  color: white;
              }
              .neutral {
                  background-color: #FFC107;
                  color: #333;
              }
              .sad {
                  background-color: #F44336;
                  color: white;
              }
              .feedback-text {
                  background-color: white;
                  padding: 15px;
                  font-size:20px;
                  border-radius: 5px;
                  border-left: 5px solid #4A90E2;
                  margin-top: 15px;
              }
              .user-info {
                  margin-bottom: 15px;
              }
              .user-info span {
                  font-weight: bold;
                  font-size:15px
              }
              .timestamp {
                  font-size: 12px;
                  color: #999;
                  margin-top: 10px;
                  text-align: right;
              }
                  .name{
                  font-size:20px;
                  padding-left:10px
                  }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>New Feedback Received</h1>
          </div>
          <div class="content">
              <div class="user-info">
                  <p><span>From:</span> <span class="name">${name}</span></p>
                  <p><span>Mood:</span> <span class="mood">${mood}</span></p>
              </div>
              
              <div>
                  <h3>Feedback:</h3>
                  <div class="feedback-text">
                      ${feedBack}
                  </div>
              </div>
              
              
          </div>
      </body>
      </html>`;
      const mailOptions = {
        from: email,
        to: process.env.EMAIL,
        subject: `New Feedback Received:from ${name}`,
        // text:`New Feedback Received: ${mood} mood from ${name} and feedback is ${feedBack}`
        html:  emailTemplate
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          
          return res.status(500).json({ success: false, message: 'Failed to send OTP' });
        }
        return res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: userFeedback
        });
    })
       

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


