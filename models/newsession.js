const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
   user:[
               {
                   type:mongoose.Schema.Types.ObjectId,
                   ref:"User",
                   required:true
               }
           ],
    sessions: [{
        duration: {
            type: String,
            required: true
        },
        description: {
            type: String, 
            
            required: true
        },
        
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

const Session = mongoose.model('newSession', sessionSchema);
module.exports = Session;