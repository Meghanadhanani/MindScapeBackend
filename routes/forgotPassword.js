// // forgotPassword.js
// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcrypt');
// const User = require('../models/user.js');
// const nodemailer = require('nodemailer');
// const otpStore = require('./otpStore.js'); 

// router.post('/forgot-password', async (req, res) => {
//     const { email } = req.body;
//      try {
//       const user = await User.findOne({ email });
//       if (!user) {
//         return res.status(400).json({ success: false, message: 'Email not found' });
//       }
  
//       const otp = Math.floor(1000 + Math.random() * 9000);  
//       const expirationTime = Date.now() + 2 * 60 * 1000; 
      
      
//       otpStore[email] = { otp, expires: expirationTime };  
  
//       const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//           user: process.env.EMAIL,  
//           pass: process.env.PASSWORD, 
//         },
//       });
  
//       const mailOptions = {
//         from: process.env.EMAIL,
//         to: email,
//         subject: 'Your OTP for Password Reset',
//         text: `Your OTP is ${otp}`,
//       };
  
//       transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
          
//           return res.status(500).json({ success: false, message: 'Failed to send OTP' });
//         }
//         res.status(200).json({success: true, message: 'OTP sent successfully' });
//       });
//     } catch (error) {
      
//       res.status(500).json({ success: false, message: 'Server error',error: error.message });
//     }
// });

// module.exports = router;




const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user.js');
const nodemailer = require('nodemailer');
const otpStore = require('./otpStore.js'); 

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
     try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ success: false, message: 'Email not found' });
      }
  
      const otp = Math.floor(1000 + Math.random() * 9000);  
      const expirationTime = Date.now() + 10 * 60 * 1000; 
      
      otpStore[email] = { otp, expires: expirationTime };  
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,  
          pass: process.env.PASSWORD, 
        },
      });
      
      // HTML template for the email
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #dddddd;
              border-radius: 5px;
              background-color: #f9f9f9;
            }
            .header {
              text-align: center;
              padding-bottom: 15px;
              border-bottom: 1px solid #eeeeee;
              margin-bottom: 20px;
            }
            .header h1 {
              color: #3498db;
              margin: 0;
            }
            .content {
              padding: 20px;
              background-color: white;
              border-radius: 5px;
            }
            .otp-container {
              text-align: center;
              margin: 25px 0;
            }
            .otp-code {
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 5px;
              color: #3498db;
              padding: 10px 20px;
              background-color: #f0f7ff;
              border-radius: 5px;
              display: inline-block;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #777777;
            }
            .expiry-note {
              color: #e74c3c;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset</h1>
            </div>
            <div class="content">
              <p>Hello ${user.name || 'there'},</p>
              <p>We received a request to reset your password. Please use the following One-Time Password (OTP) to proceed with your password reset:</p>
              
              <div class="otp-container">
                <div class="otp-code">${otp}</div>
              </div>
              
              <p class="expiry-note">This OTP will expire in 10 minutes.</p>
              
              <p>If you did not request a password reset, please ignore this email or contact our support team if you have any concerns.</p>
              
              <p>Thank you,<br>MindScape</p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;
  
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Your OTP for Password Reset',
        text: `Your OTP is ${otp}`, // Plain text version as fallback
        html: htmlContent // HTML version
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).json({ success: false, message: 'Failed to send OTP' });
        }
        res.status(200).json({success: true, message: 'OTP sent successfully' });
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error',error: error.message });
    }
});

module.exports = router;