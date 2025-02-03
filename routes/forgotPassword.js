// // // forgotPassword.js
// // const express = require('express');
// // const router = express.Router();
// // const bcrypt = require('bcrypt');
// // const User = require('../models/user.js');
// // const nodemailer = require('nodemailer');
// // const otpStore = require('./otpStore.js'); 

// // router.post('/forgot-password', async (req, res) => {
// //     const { email } = req.body;
// //      try {
// //       const user = await User.findOne({ email });
// //       if (!user) {
// //         return res.status(400).json({ success: false, message: 'Email not found' });
// //       }
  
// //       const otp = Math.floor(1000 + Math.random() * 9000);  
// //       const expirationTime = Date.now() + 5 * 60 * 1000; 
      
      
// //       otpStore[email] = { otp, expires: expirationTime };  
  
// //       const transporter = nodemailer.createTransport({
// //         service: 'gmail',
// //         auth: {
// //           user: process.env.EMAIL,  
// //           pass: process.env.PASSWORD, 
// //         },
// //       });
  
// //       const mailOptions = {
// //         from: process.env.EMAIL,
// //         to: email,
// //         subject: 'Your OTP for Password Reset',
// //         text: `Your OTP is ${otp}`,
// //       };
  
// //       transporter.sendMail(mailOptions, (error, info) => {
// //         if (error) {
          
// //           return res.status(500).json({ success: false, message: 'Failed to send OTP' });
// //         }
// //         res.status(200).json({success: true, message: 'OTP sent successfully' });
// //       });
// //     } catch (error) {
      
// //       res.status(500).json({ success: false, message: 'Server error',error: error.message });
// //     }
// // });

// // module.exports = router;
// // forgotPassword.js
// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcrypt');
// const User = require('../models/user.js');
// const nodemailer = require('nodemailer');
// const otpStore = require('./otpStore.js'); 

// router.post('/forgot-password', async (req, res) => {
//   const { email } = req.body;
//   try {
//       const user = await User.findOne({ email });
//       if (!user) {
//           return res.status(400).json({ success: false, message: 'Email not found' });
//       }

//       const otp = Math.floor(1000 + Math.random() * 9000);
//       const expirationTime = Date.now() + 5 * 60 * 1000;
      
//       otpStore[email] = { otp, expires: expirationTime };

//       const transporter = nodemailer.createTransport({
//           service: 'gmail',
//           auth: {
//               user: process.env.EMAIL,
//               pass: process.env.PASSWORD,
//           },
//       });

//       // Add verification of transporter
//       await transporter.verify();

//       const mailOptions = {
//           from: process.env.EMAIL,
//           to: email,
//           subject: 'Your OTP for Password Reset',
//           text: `Your OTP is ${otp}`,
//       };

//       // Use Promise-based approach
//       await transporter.sendMail(mailOptions);
//       res.status(200).json({ success: true, message: 'OTP sent successfully' });
      
//   } catch (error) {
//       console.error('Password reset error:', error);
//       res.status(500).json({ 
//           success: false, 
//           message: 'Failed to send OTP',
//           error: error.message 
//       });
//   }
// //   console.log('Attempting to send email to:', email);
// // await transporter.sendMail(mailOptions);
// // console.log('Email sent successfully');
// });


// module.exports = router;



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
//       const expirationTime = Date.now() + 5 * 60 * 1000; 
      
      
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
// forgotPassword.js
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
      const expirationTime = Date.now() + 5 * 60 * 1000;
      
      otpStore[email] = { otp, expires: expirationTime };

      const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: process.env.EMAIL,
              pass: process.env.PASSWORD,
          },
      });

      // Add verification of transporter
      await transporter.verify();

      const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: 'Your OTP for Password Reset',
          text: `Your OTP is ${otp}`,
      };

      // Use Promise-based approach
      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true, message: 'OTP sent successfully' });
      
  } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ 
          success: false, 
          message: 'Failed to send OTP',
          error: error.message 
      });
  }
//   console.log('Attempting to send email to:', email);
// await transporter.sendMail(mailOptions);
// console.log('Email sent successfully');
});


module.exports = router;
