// const express = require('express');
// const User = require('../models/user.js');
// const router = express.Router();
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const bodyParser=require('body-parser')
// const cors=require('cors')
// const multer=require('multer')
// const app=express()
// const path = require('path');
// app.use(bodyParser.urlencoded({extended:true,limit:"10mb"}))
// app.use(bodyParser.json({limit:'10mb'}))
// app.use(cors());
// app.use(express.json());
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

// router.post('/profileadd', upload.single("image"), async (req, res) => {
//     const { name, birthDate, gender,hobby } = req.body; 
//     const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    
//     if (!token) {
//         return res.status(401).json({
//             success: false,
//             message: 'Authorization token is required'
//         });
//     }

//     if (!name || !birthDate || !gender || !req.file || !hobby) { 
//         return res.status(400).json({
//             success: false,
//             message: 'All fields are required'
//         });
//     }

//     try {
        
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const userId = decoded.userId;

        
//         const [day, month, year] = birthDate.split('-').map(Number);
//         const dateOfBirth = new Date(year, month - 1, day); 

//         const user = await User.findById(userId);
        
//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'User not found'
//             });
//         }
//         // const imageUrl = `/uploads/${req.file.filename}`;
//         const imageUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`; 

//         user.name = name;
//         user.birthDate = dateOfBirth;
//         user.gender = gender;
//         user.image = req.file.filename; 
//         user.hobby=hobby;
        
//         await user.save();
//         const formattedBirthDate = user.birthDate.toLocaleDateString('en-GB'); 
//         res.status(200).json({
//             success: true,
//             message: 'Profile Added successfully',
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 birthDate: formattedBirthDate,
//                 gender: user.gender,
//                 email: user.email,
//                 hobby:user.hobby,
//                 image: imageUrl
//             }
//         });

//     } catch (error) {
       
//         res.status(500).json({
//             success: false,
//             message: 'Server error during profile add',
//             error: error.message
//         });
//     }
// });

// module.exports=router





const express = require('express');
const User = require('../models/user.js');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/profileadd', async (req, res) => {
    const { name, birthDate, gender, hobby, image } = req.body; 
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authorization token is required'
        });
    }

    if (!name || !birthDate || !gender || !hobby || !image) { 
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    try {
        // Verify token and get userId
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Parse birthdate
        let dateOfBirth;
        try {
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
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format',
                error: error.message
            });
        }

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Process base64 image data
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

        // Update other user fields
        user.name = name;
        user.birthDate = dateOfBirth;
        user.gender = gender;
        user.hobby = hobby;
        user.profileCreated = true;
        
        await user.save();
        
        const formattedBirthDate = user.birthDate.toLocaleDateString('en-GB');
        
        // Convert image back to base64 for response
        let imageBase64 = null;
        if (user.image && user.image.data) {
            imageBase64 = `data:${user.image.contentType};base64,${user.image.data.toString('base64')}`;
        }
        
        res.status(200).json({
            success: true,
            message: 'Profile Added successfully',
            user: {
                id: user._id,
                name: user.name,
                birthDate: formattedBirthDate,
                gender: user.gender,
                email: user.email,
                hobby: user.hobby,
                image: imageBase64,
                profileCreated: user.profileCreated
                
            }
        });

    } catch (error) {
        console.error('Profile add error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during profile add',
            error: error.message
        });
    }
});

module.exports = router;