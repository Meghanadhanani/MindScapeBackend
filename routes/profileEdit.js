const express = require('express');
const User = require('../models/user.js');
const router = express.Router();
const bcrypt = require('bcrypt');
const multer=require('multer')
const jwt = require('jsonwebtoken');
const path=require('path')
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
router.put('/profile/:userId', upload.single("image"), async (req, res) => {
    const { name, birthDate, gender } = req.body;
    const token = req.headers["authorization"] && req.headers["authorization"].split(' ')[1];
    
    if (!token) {
        return res.status(400).send({ success: false, message: 'Authorization token is missing' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        
        const profileToUpdate = await User.findById(userId);
        
        if (!profileToUpdate) {
            return res.status(404).send({ success: false, message: 'Profile not found or unauthorized' });
        }
        
        // Update basic fields
        profileToUpdate.name = name || profileToUpdate.name;
        profileToUpdate.gender = gender || profileToUpdate.gender;
        
        // Handle birthDate with more robust parsing
        if (birthDate) {
            let dateOfBirth;
            
            // Check for DD-MM-YYYY format
            if (/^\d{2}-\d{2}-\d{4}$/.test(birthDate)) {
                const [day, month, year] = birthDate.split('-').map(Number);
                dateOfBirth = new Date(year, month - 1, day);
            } 
            // Check for YYYY-MM-DD format
            else if (/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
                const [year, month, day] = birthDate.split('-').map(Number);
                dateOfBirth = new Date(year, month - 1, day);
            }
            // Try general date parsing as fallback
            else {
                dateOfBirth = new Date(birthDate);
            }
            
            // Only update if we got a valid date
            if (!isNaN(dateOfBirth.getTime())) {
                profileToUpdate.birthDate = dateOfBirth;
            }
        }
        
        if (req.file) {
            profileToUpdate.image = req.file.filename;
        }
        
        await profileToUpdate.save();
        
        const formattedBirthDate = profileToUpdate.birthDate ? 
                                   profileToUpdate.birthDate.toLocaleDateString('en-GB') :
                                   '';
        
        res.status(200).send({
            success: true,
            message: 'Profile updated successfully',
            profile: {
                id: profileToUpdate._id,
                name: profileToUpdate.name,
                birthDate: formattedBirthDate,
                gender: profileToUpdate.gender,
                email: profileToUpdate.email,
                image: profileToUpdate.image ? 
                       `${process.env.BASE_URL}/uploads/${profileToUpdate.image}` : 
                       null
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'Error updating Profile',
            error: error.message
        });
    }
});

module.exports=router;