const mongoose = require('mongoose');
const termsSchema = new mongoose.Schema({
    dateandtime:{type:String,required:false},
    termsandconditions:{type:String},
});

mongoose.model('Terms',termsSchema);