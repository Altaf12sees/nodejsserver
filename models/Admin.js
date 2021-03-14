const mongoose = require('mongoose');
const adminSchema = new mongoose.Schema({
    joiningdate:{
        type:String,
        required:true
    },
    resignationDate:{
        type:String,
        required:true
    },
    accountStatus:{
        type:String
    },
    profession:{
        type:String
    },
})

adminSchema.pre('save',function(next){
    const admin = this;
    if(!user.isModified('password')){
        return next()
    }
})

mongoose.model('admin',adminSchema);