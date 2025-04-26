const mongoose = require('mongoose');

const UserSchema=new mongoose.Schema({
    name:{
        type:String,
        default:null
    },
    birthDate:{
     type:Date,
     default:null
    },
    gender: {
        type: String,
        enum: ['Male', 'Female','Other'],
        default: null 
    },
    image:{
        type:String,
        default:null
    },

    email:{
        type:String,
        required:true
    },
    password:{ 
        type: String,
         required: true,
         
     },
     hobby:{ 
        type: String,
         default:null
         
     }
     ,
     token: { 
        type: String,
        default: null 
    },
    notes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Note",
            required:true
        }
    ]
    
       
    
}, {
    timestamps: true
}
)


const User = mongoose.model('mindscapeuser', UserSchema);
module.exports = User;