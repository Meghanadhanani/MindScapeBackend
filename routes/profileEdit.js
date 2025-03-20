const express = require('express');
const User = require('../models/user.js');
const router = express.Router();
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

router.put('/profileupdate', upload.single("image"), async (req, res) => {
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

        // Parse the birthdate correctly
        let dateOfBirth;
        if (birthDate.includes('-')) {
            // If format is YYYY-MM-DD (from your app)
            const [year, month, day] = birthDate.split('-').map(Number);
            dateOfBirth = new Date(year, month - 1, day);
        } else {
            // Handle any other format if needed
            dateOfBirth = new Date(birthDate);
        }

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

        // Format the birthdate as DD/MM/YYYY for response
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