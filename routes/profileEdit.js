// const express = require('express');
// const User = require('../models/user.js');
// const router = express.Router();
// const bcrypt = require('bcrypt');
// const multer=require('multer')
// const jwt = require('jsonwebtoken');
// const path=require('path')
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, '../uploads'));
//     },
//     filename: (req, file, cb) => {
//        return cb(null, `${Date.now()}-${file.originalname}`); 
//     }
// });
// const upload = multer({ 
//     storage: storage,
   
// });

// router.put('/profile/:userId', upload.single("image"), async (req, res) => {
//     const { name, birthDate, gender } = req.body;
//     const token = req.headers["authorization"] && req.headers["authorization"].split(' ')[1];

//     if (!token) {
//         return res.status(400).send({ success: false, message: 'Authorization token is missing' });
//     }
    
//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const userId = decoded.userId;

//         const profileToUpdate = await User.findById(userId);

//         if (!profileToUpdate) {
//             return res.status(404).send({ success: false, message: 'Profile not found or unauthorized' });
//         }

//         const [day, month, year] = birthDate.split('-').map(Number);
//         const dateOfBirth = new Date(year, month - 1, day);

//         profileToUpdate.name = name || profileToUpdate.name;
//         profileToUpdate.birthDate = dateOfBirth || profileToUpdate.birthDate;
//         profileToUpdate.gender = gender || profileToUpdate.gender;

//         if (req.file) {
//             profileToUpdate.image = req.file.filename; 
//         }

//         await profileToUpdate.save();

//         const formattedBirthDate = profileToUpdate.birthDate.toLocaleDateString('en-GB');
//         res.status(200).send({
//             success: true,
//             message: 'Profile updated successfully',
//             profile: {
//                 id: profileToUpdate._id,
//                 name: profileToUpdate.name,
//                 birthDate: formattedBirthDate,
//                 gender: profileToUpdate.gender,
//                 email: profileToUpdate.email,
//                 // imageUrl: `${req.protocol}://${req.get('host')}/uploads/${profileToUpdate.image}`,
//                 image:`${process.env.BASE_URL}/uploads/${profileToUpdate.image}`
         
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send({
//             success: false,
//             message: 'Error updating Profile',
//             error: error.message
//         });
//     }
// });


// module.exports=router;

const express = require('express');
const User = require('../models/user.js');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage: storage,
});

router.put('/profile', upload.single("image"), async (req, res) => {
    const { name, birthDate, gender, hobby } = req.body;
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authorization token is required'
        });
    }

    if (!name || !birthDate || !gender || !hobby) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Parse the birthdate in DD-MM-YYYY format
        const [day, month, year] = birthDate.split('-').map(Number);
        const dateOfBirth = new Date(year, month - 1, day);

        // Update user information
        user.name = name;
        user.birthDate = dateOfBirth;
        user.gender = gender;
        user.hobby = hobby;
        
        // Only update image if a new one is provided
        if (req.file) {
            user.image = req.file.filename;
        }
        
        await user.save();

        // Format the birthdate as DD-MM-YYYY for response
        const formattedBirthDate = user.birthDate.toLocaleDateString('en-GB');
        
        // Generate image URL
        const imageUrl = `${process.env.BASE_URL}/uploads/${user.image}`;

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                birthDate: formattedBirthDate,
                gender: user.gender,
                email: user.email,
                hobby: user.hobby,
                image: imageUrl
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during profile update',
            error: error.message
        });
    }
});

module.exports = router;