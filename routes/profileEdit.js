const express = require('express');
const User = require('../models/user.js');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');

// Multer config for handling base64 or normal fields
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.put('/profile', upload.none(), async (req, res) => {
    const { name, birthDate, gender, hobby, image } = req.body; // Now properly parsed
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authorization token is required'
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

        if (name) user.name = name;
        if (gender) user.gender = gender;
        if (hobby) user.hobby = hobby;

        if (birthDate) {
            const [day, month, year] = birthDate.split('-').map(Number);
            const dateOfBirth = new Date(year, month - 1, day);
            if (isNaN(dateOfBirth.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date format. Please use DD-MM-YYYY format.'
                });
            }
            user.birthDate = dateOfBirth;
        }

        if (image) {
            user.image = image; // Now the base64 image will be properly received
        }

        await user.save();

        const formattedBirthDate = user.birthDate
            ? `${String(user.birthDate.getDate()).padStart(2, '0')}-${String(user.birthDate.getMonth() + 1).padStart(2, '0')}-${user.birthDate.getFullYear()}`
            : null;

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                birthDate: formattedBirthDate,
                gender: user.gender,
                hobby: user.hobby,
                image: user.image
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
