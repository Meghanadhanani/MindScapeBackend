const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
   user:[
               {
                   type:mongoose.Schema.Types.ObjectId,
                   ref:"User",
                   required:true
               }
           ],
    feedbacks: [{
        name:{
            type:String,
            require:true
        },
        feedBack:{
            type:String,
            require:true
        },
        mood: {
            type: String, 
            enum: ['Awesome', 'Noiicee', 'Meh', 'Awful', 'Fine'],
            required: true
        },
        
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

const Feedback= mongoose.model('newFeedback', feedbackSchema);
module.exports = Feedback;