// const express = require('express');
// const router = express.Router();
// const User = require('../models/user'); // adjust this to your actual file path

// // GET all users with selected fields
// router.get('/users', async (req, res) => {
//     try {
//         const users = await User.find({}, {
//             name: 1,
//             email: 1,
//             gender: 1,
//             image: 1,
//             birthDate: 1,
//           });
          
//           const formattedUsers = users.map(user => {
//             let imageBase64 = null;
          
//             if (user.image?.data && user.image?.contentType) {
//               const base64 = user.image.data.toString('base64');
//               imageBase64 = `data:${user.image.contentType};base64,${base64}`;
//             }
          
//             return {
//               _id: user._id,
//               name: user.name,
//               email: user.email,
//               gender: user.gender,
//               birthDate: user.birthDate ? user.birthDate.toISOString().split('T')[0] : null,
//               image: imageBase64,
//             };
//           });

//           return res.status(200).json(formattedUsers);
          
//     } catch (error) {
//         console.error("Error fetching users:", error);
//         res.status(500).json({ message: "Failed to get users" });
//     }
// });

// module.exports = router;



const express = require('express');
const router = express.Router();
const User = require('../models/user');

// GET all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, {
            name: 1,
            email: 1,
            gender: 1,
            image: 1,
            birthDate: 1,
        });

        const formattedUsers = users.map(user => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            gender: user.gender,
            birthDate: user.birthDate ? user.birthDate.toISOString().split('T')[0] : null,
            image: user.image || null,  // Just pass as it is
        }));

        return res.status(200).json(formattedUsers);

    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to get users" });
    }
});

module.exports = router;
