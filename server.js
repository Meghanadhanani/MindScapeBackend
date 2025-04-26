const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const User = require('./models/user.js');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');  // For OTP generation
const loginRoute=require('./routes/login.js')
const registerRoute=require('./routes/register.js')
const resetPassword=require('./routes/resetPassword.js')
const forgotPassword=require('./routes/forgotPassword.js')
const verifyOtp=require('./routes/verifyOtp.js')
const noteAdd=require('./routes/noteadd.js')
const noteGet=require('./routes/noteget.js')
const noteEdit=require('./routes/noteEdit.js')
const noteDelete=require('./routes/noteDelete.js')
const feedback=require('./routes/feedbackForm.js')
const otpStore=require('./routes/otpStore.js')
const profileAdd=require('./routes/profileAdd.js')
const profileGet=require('./routes/profileGet.js')
const stateGraph=require('./routes/stateGraph.js')
const addSession=require('./routes/addSession.js')
const getSession=require('./routes/getSession.js')
const deleteSession=require('./routes/deleteSession.js')
const profileEdit=require('./routes/profileEdit.js')
const musicCode=require('./routes/musicCode.js')
const userdelete=require('./routes/deleteUser.js')
const getUsers=require('./routes/getAllUsers.js')
const Aicode=require('./routes/tryAiCode.js')

;

const path=require('path')
dotenv.config();

const app = express();
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use(cors({
  origin: "*", 
  methods: ["GET", "POST","DELETE"]
}));

app.use(express.json());
dotenv.config();

const response = mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
if(response){
    console.log('Connected to DB')
}
else{
    console.log('Not Connected')
}



app.use('/',loginRoute)
app.use('/',registerRoute)
app.use('/',forgotPassword)
app.use('/',verifyOtp)
app.use('/',resetPassword)
app.use('/',noteAdd)
app.use('/',noteGet)
app.use('/',feedback)
app.use('/',noteEdit)
app.use('/',noteDelete)
app.use('/',profileAdd)
app.use('/',profileGet)
app.use('/',profileEdit)
app.use('/',stateGraph)
app.use('/',addSession)
app.use('/',getSession)
app.use('/',deleteSession)
app.use('/',musicCode)
app.use('/',userdelete)
app.use('/',getUsers)
app.use('/',Aicode)

app.get('/', (req, res) => {
  res.send("Hello from backend");
});

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});