const express = require('express');
const User = require('../models/user.js');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());
app.use(express.json());

router.post('/profileadd', async (req, res) => {
    const { name, birthDate, gender, image, hobby } = req.body;
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Authorization token is required' });
    }

    if (!name || !birthDate || !gender || !image || !hobby) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const [day, month, year] = birthDate.split('-').map(Number);
        const dateOfBirth = new Date(year, month - 1, day);

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Save base64 string directly into database
        user.name = name;
        user.birthDate = dateOfBirth;
        user.gender = gender;
        user.image = image; // 👈 base64 directly stored
        user.hobby = hobby;

        await user.save();

        const formattedBirthDate = user.birthDate.toLocaleDateString('en-GB');

        res.status(200).json({
            success: true,
            message: 'Profile added successfully',
            user: {
                id: user._id,
                name: user.name,
                birthDate: formattedBirthDate,
                gender: user.gender,
                email: user.email,
                hobby: user.hobby,
                image: user.image // sending back base64 string
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error during profile add', error: error.message });
    }
});

module.exports = router;


