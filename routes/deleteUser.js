const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user.js');
const Note = require('../models/newnotes.js');
const Feedback = require('../models/newfeedback.js');
const Session = require('../models/newsession.js');
const cors = require('cors');

// Delete user account with additional debugging
router.delete('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { password } = req.body; // Get password from request body
    
    console.log(`Attempting to delete user with ID: ${userId}`);
    console.log(`Password provided: ${password ? 'Yes' : 'No'}`);
    
    // Validate password is provided
    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password is required to delete account' 
      });
    }

    // Find user first to verify they exist
    console.log(`Looking up user with ID: ${userId}`);
    const user = await User.findById(userId);
    
    if (!user) {
      console.log(`User with ID ${userId} not found in database`);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found. Please check the user ID.' 
      });
    }
    
    console.log(`User found: ${user._id}`);
    console.log(`User has password hash: ${user.password ? 'Yes' : 'No'}`);
    
    // Verify that bcrypt comparison can be done
    if (!user.password) {
      console.log('User record does not contain a password hash');
      return res.status(400).json({
        success: false,
        message: 'Account cannot be deleted (no password hash found)'
      });
    }

    try {
      // Verify password
      console.log('Comparing password with stored hash...');
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log(`Password validation result: ${isPasswordValid ? 'Valid' : 'Invalid'}`);
      
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Incorrect password. Account deletion failed.' 
        });
      }
    } catch (bcryptError) {
      console.error('Error during password verification:', bcryptError);
      return res.status(500).json({
        success: false,
        message: 'Error verifying password',
        error: bcryptError.message
      });
    }

    // Start transaction for deletion process
    console.log('Starting deletion transaction...');
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Delete all user-related data
      console.log('Deleting associated data...');
      const feedbackResult = await Feedback.deleteMany({ 'user': userId }).session(session);
      console.log(`Deleted ${feedbackResult.deletedCount} feedback items`);
      
      const noteResult = await Note.deleteMany({ 'user': userId }).session(session);
      console.log(`Deleted ${noteResult.deletedCount} notes`);
      
      const sessionResult = await Session.deleteMany({ 'user': userId }).session(session);
      console.log(`Deleted ${sessionResult.deletedCount} sessions`);
      
      // Delete user account
      console.log('Deleting user account...');
      const deletedUser = await User.findByIdAndDelete(userId).session(session);
      
      if (!deletedUser) {
        console.log('Failed to delete user account');
        throw new Error('Failed to delete user');
      }
      
      console.log('User successfully deleted');
      
      // Commit transaction
      await session.commitTransaction();
      session.endSession();
      console.log('Transaction committed successfully');
      
      res.status(200).json({ 
        success: true, 
        message: 'User and all associated data deleted successfully' 
      });
    } catch (error) {
      // If any error occurs, abort transaction
      console.error('Error during deletion transaction:', error);
      await session.abortTransaction();
      session.endSession();
      console.log('Transaction aborted');
      throw error;
    }
  } catch (error) {
    console.error('Error in delete user route:', error);
    
    // Handle specific errors
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
        error: error.message
      });
    }
    
    if (error.message === 'User not found') {
      return res.status(404).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    if (error.message === 'Failed to delete user') {
      return res.status(404).json({ 
        success: false, 
        message: 'User could not be deleted' 
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user',
      error: error.message
    });
  }
});

module.exports = router;