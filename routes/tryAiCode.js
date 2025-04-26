// // Import the required packages
// require('dotenv').config();
// const express = require('express');
// const { Groq } = require('groq-sdk');

// const router = express.Router();

// // Initialize the Groq client
// const groq = new Groq({ apiKey: process.env.API_KEY });

// // Create a route for AI responses
// router.post('/ask', async (req, res) => {
//   const userInput = req.body.question;
  
//   if (!userInput) {
//     return res.status(400).json({ error: 'Please provide a question.' });
//   }

//   try {
//     // Make request to Groq API using Llama model
//     const response = await groq.chat.completions.create({
//       model: "llama3-70b-8192",  // This accesses Meta's Llama 3 model
//       messages: [
//         { role: "user", content: userInput }
//       ],
//       temperature: 0.7,
//       max_tokens: 1024
//     });

//     // Send the response back to the client
//     const aiResponse = response.choices[0].message.content;
//     res.json({ answer: aiResponse });

//   } catch (error) {
//     console.error('Error with AI API:', error);
//     res.status(500).json({ 
//       error: 'Error communicating with AI API',
//       details: error.message
//     });
//   }
// });

// module.exports = router;




require('dotenv').config();
const express = require('express');
const { Groq } = require('groq-sdk');
const jwt = require('jsonwebtoken'); 

const router = express.Router();

// Initialize the Groq client
const groq = new Groq({ apiKey: process.env.API_KEY });


const conversationStore = {};


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token is required' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};


router.post('/ask', authenticateToken, async (req, res) => {
  const userInput = req.body.question;
  const userId = req.user.id; // Get user ID from the decoded token
  
  if (!userInput) {
    return res.status(400).json({ error: 'Please provide a question.' });
  }

  
  if (!conversationStore[userId]) {
    conversationStore[userId] = [];
  }
  
  
  conversationStore[userId].push({ role: "user", content: userInput });

  try {
  
    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: conversationStore[userId],
      temperature: 0.7,
      max_tokens: 1024
    });

  
    const aiResponse = response.choices[0].message.content;
    
  
    conversationStore[userId].push({ role: "assistant", content: aiResponse });
    
  
    res.json({ 
      answer: aiResponse, 
      history: conversationStore[userId]
    });

  } catch (error) {
    console.error('Error with AI API:', error);
    res.status(500).json({ 
      error: 'Error communicating with AI API',
      details: error.message
    });
  }
});


module.exports = router;



