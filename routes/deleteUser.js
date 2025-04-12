const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user.js');
const Note = require('../models/newnotes.js');
const Feedback = require('../models/newfeedback.js');
const Session = require('../models/newfeedback.js');
const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No authentication token, access denied' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ success: false, message: 'Token is invalid' });
  }
};


router.delete('/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    
   if (!req.user || !req.user.id || req.user.id.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this user' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }
      await Feedback.deleteMany({ 'user': userId }).session(session);
      await Note.deleteMany({ 'user': userId }).session(session);
      await Session.deleteMany({ 'user': userId }).session(session);
      
      
      await User.findByIdAndDelete(userId).session(session);
      await session.commitTransaction();
      session.endSession();
      
      res.status(200).json({ success: true, message: 'User and all associated data deleted successfully' });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error('Error in delete user route:', error);
    
    if (error.message === 'User not found') {
      return res.status(400).json({ success: false, message: error.message });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting user', 
      error: error.message 
    });
  }
});

module.exports = router;

