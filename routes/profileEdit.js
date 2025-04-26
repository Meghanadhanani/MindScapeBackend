const express = require('express');
const User = require('../models/user.js');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.put('/profile', async (req, res) => {
    const { name, birthDate, gender, hobby, image } = req.body;
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

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

        // Update basic user information if provided
        if (name) user.name = name;
        if (gender) user.gender = gender; // Ensure it matches your enum
        if (hobby) user.hobby = hobby;

        // Handle birthDate with proper validation
        if (birthDate) {
            try {
                let dateOfBirth;
                
                if (birthDate.includes('-')) {
                    const parts = birthDate.split('-');
                    // Check if format is DD-MM-YYYY or YYYY-MM-DD
                    if (parts[0].length === 4) {
                        // YYYY-MM-DD format
                        const [year, month, day] = parts.map(Number);
                        dateOfBirth = new Date(year, month - 1, day);
                    } else {
                        // DD-MM-YYYY format
                        const [day, month, year] = parts.map(Number);
                        dateOfBirth = new Date(year, month - 1, day);
                    }
                } else {
                    // Fallback to standard date parsing
                    dateOfBirth = new Date(birthDate);
                }
                
                // Ensure the date is valid
                if (isNaN(dateOfBirth.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid date value'
                    });
                }
                
                user.birthDate = dateOfBirth;
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date format',
                    error: error.message
                });
            }
        }
        
        // Process base64 image data if provided
        if (image) {
            // Extract content type and actual base64 data
            const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            
            if (matches && matches.length === 3) {
                const contentType = matches[1];
                const base64Data = matches[2];
                const buffer = Buffer.from(base64Data, 'base64');
                
                // Create image object based on your schema
                const imageData = {
                    data: buffer,
                    contentType: contentType,
                    filename: `profile-${Date.now()}`
                };
                
                // Update user fields
                user.image = imageData;
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid image format'
                });
            }
        }
        
        await user.save();

        // Format the birthdate for response - use GB format (DD/MM/YYYY)
        const formattedBirthDate = user.birthDate ? 
            user.birthDate.toLocaleDateString('en-GB') : null;

        // Convert image back to base64 for response
        let imageBase64 = null;
        if (user.image && user.image.data) {
            imageBase64 = `data:${user.image.contentType};base64,${user.image.data.toString('base64')}`;
        }

        // Create response object with the updated user information
        const userResponse = {
            id: user._id,
            name: user.name,
            birthDate: formattedBirthDate,
            gender: user.gender,
            email: user.email,
            hobby: user.hobby,
            image: imageBase64
        };
console.log('User response:', userResponse);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: userResponse
        });

    } catch (error) {
        console.error('Profile update error:', error);
        
        // Provide more specific error messages based on the type of error
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
                error: error.message
            });
        }
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                error: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error during profile update',
            error: error.message
        });
    }
});

module.exports = router;