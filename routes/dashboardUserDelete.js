const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user.js');
const Note = require('../models/newnotes.js');
const Feedback = require('../models/newfeedback.js');
const Session = require('../models/newsession.js');

const cors=require('cors');





router.delete('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
 
    
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
