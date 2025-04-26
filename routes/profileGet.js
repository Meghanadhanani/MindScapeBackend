const express = require('express');
const User = require('../models/user.js');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get('/profile/:userId', async (req, res) => {
    const { userId } = req.params;
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

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const formattedBirthDate = user.birthDate
            ? new Date(user.birthDate).toLocaleDateString('en-GB')
            : null;

        res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                birthDate: formattedBirthDate,
                gender: user.gender,
                hobby: user.hobby,
                image: user.image || null // 🔥 just directly send image base64
            }
        });

    } catch (error) {
        console.error('Profile retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during profile retrieval',
            error: error.message
        });
    }
});


module.exports=router