const express  = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const app = express()
const PORT = 3000
const {mogoUrl} = require('./keys')

require('./models/User');
require('./models/Terms');
require('./models/Tasks');
require('./models/admin');

const requireToken = require('./middleware/requireToken')
const authRoutes = require('./routes/authRoutes')
app.use(bodyParser.json())
app.use(authRoutes)
app.use('/imageuploads',express.static('imageuploads'));
//app.use('/models/public/notification', require('./models/public/notification'));
mongoose.connect(mogoUrl,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})

mongoose.connection.on('connected',()=>{
    console.log("connected to mongo")
})

mongoose.connection.on('error',(err)=>{
    console.log("this is error",err)
})

app.get('/',requireToken,(req,res)=>{
    res.send({
        _id:req.user._id, 
        phone:req.user.phone, 
        username:req.user.username, 
        profileimage:req.user.profileimage,
        joiningdate:req.user.joiningdate,
        skills:req.user.skills,
        resignationDate:req.user.resignationDate,
        emaratesIDFront:req.user.emaratesIDFront,
        emaratesIDBack:req.user.emaratesIDBack,
        visaCopy:req.user.visaCopy,
        empCardFront:req.user.empCardFront,
        empCardBack:req.user.empCardBack,
        agentlanguage:req.user.agentlanguage,
        agentDrivingLicenceFront:req.user.agentDrivingLicenceFront,
        agentDrivingLicenceBack:req.user.agentDrivingLicenceBack,
        joiningDate:req.user.joiningDate,
        accountStatus:req.user.accountStatus,
        profession:user.req.profession,
        resignationDate:req.user.resignationDate,
        })
})
app.listen(PORT,()=>{
    console.log("server running "+PORT)
})