const express = require('express');
const Session = require('../models/session.js');
const router = express.Router();
const User =require('../models/user.js')
const jwt = require('jsonwebtoken');

router.post('/logout',(req,res)=>{
    res.status(200).json({message:"Logout successfully..."})
})

module.exports=router 