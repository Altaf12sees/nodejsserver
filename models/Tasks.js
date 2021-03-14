const mongoose = require('mongoose');
const tasksSchema = new mongoose.Schema({
    userId:{type:String, required:false},
    userTasks:{type:String,required:false},
    dateandtime:{type:String,required:false}
})
mongoose.model('Tasks',tasksSchema);