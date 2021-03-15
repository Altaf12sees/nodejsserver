const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const {jwtkey} = require('../keys')
const router = express.Router();
const User = mongoose.model('User');
const Terms = mongoose.model('Terms');
const Tasks = mongoose.model('Tasks');
const Admin = mongoose.model('admin');
var fs=require('fs');
const multer = require('multer');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');

//AWS S3 bucket path


const s3 = new aws.S3({})

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'img-bkt01',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    }
  })
})
//  const response= s3.listObjects({
//    Bucket:'img-bkt01'
//  });
// console.log(response);
// var urlParams = {Bucket: 'img-bkt01', Key: '1615699720717'};
//       s3.getSignedUrl('getObject', urlParams, function(err, url){
//         //console.log('the url of the image is ' +  url);
//       // clientcallback(null,url);
//       });

// const storage = multer.diskStorage({
//   destination: function(req, file, cb){
//     cb(null, true);
//   },
//   filename: function(req, file, cb){
//     cb(null, new Date().toISOString() + file.originalname);
//   }
// });

//const upload = multer({dest:'imageuploads/'});
//const upload = multer ({storage: storage});

//get user data
router.get('/user/:id', function(req,res){
  var id = req.params.id;
  User.find({_id:id}, function(error,users){
    if(error){
      res.send('some thing wrong');
      next();
    }
    res.json(users);
  });
})

router.get('/', function(req,res){
  User.find({}, function(error,users){
    if(error){
      res.send('some thing wrong');
      next();
    }
    res.json(users);
  });
})

//signup user
router.post('/signup',async (req,res)=>{
    const {phone,password,username, profileimage, resignationDate} = req.body;
    try{
      const user = new User({phone,password, username, profileimage, resignationDate});
      await  user.save();
      const token = jwt.sign({userId:user._id},jwtkey)
      res.send({token})
    }catch(err){
      return res.status(422).send(err.message)
    }
})

//check phone number exist or not
router.post('/verifyphone',async (req,res)=>{
    const {phone} = req.body
    if(!phone){
        return res.status(422).send({error :"Phone number not found."})
    }
    const user = await User.findOne({phone})
    if(!user){
        return res.status(422).send({error :"User not found."})
    }
    try{
      //await user.comparePassword(password);    
      const token = jwt.sign({userId:user._id},jwtkey)
      res.send("Yes! This phone number is "+ req.body.phone+" found!")
    }catch(err){
        return res.status(422).send({error :"must provide phone or password"})
    }
})

//sign in user
router.post('/signin',async (req,res)=>{
    const {phone,password} = req.body
    if(!phone || !password){
        return res.status(422).send({error :"must provide phone or password"})
    }
    const user = await User.findOne({phone})
    if(!user){
        return res.status(422).send({error :"must provide phone or password"})
    }
    try{
      await user.comparePassword(password);    
      const token = jwt.sign({userId:user._id},jwtkey)
      res.send({token})
    }catch(err){
        return res.status(422).send({error :"must provide phone or password"})
    }
})

//user data update and save
router.post('/postUserData/:id', upload.fields(
  [{name:'profileimage'},
  {name:'emaratesIDFront'},
  {name:'emaratesIDBack'},
  {name:'visaCopy'},
  {name:'empCardFront'},
  {name:'empCrd'},
  {name:'empCardBack'},
  {name:'agentDrivingLicenceFront'},
  {name:'agentDrivingLicenceBack'},
  ]), async (req,res)=>{
  var id = req.params.id;
   await  User.findOne({ _id: id}, async (error, foundobject)=>{
      if(error){
        console.log(error);
        res.status(500).send();
      }else {
        if(!foundobject){
          res.status(404).send();
        }else{
          if(req.body.phone){foundobject.phone=req.body.phone;}
          if(req.body.password){foundobject.password=req.body.password;}
          if(req.body.username){foundobject.username= req.body.username;}
          if(req.body.joiningdate){foundobject.joiningdate=req.body.joiningdate;}
          if(req.body.skills){foundobject.skills=req.body.skills;}
          if(req.body.agentlanguage){foundobject.agentlanguage=req.body.agentlanguage}
          //images/files data
          if(req.files.profileimage){foundobject.profileimage= req.files.profileimage[0].location;}
          if(req.files.emaratesIDFront){foundobject.emaratesIDFront=req.files.emaratesIDFront[0].location;}
          if(req.files.emaratesIDBack){foundobject.emaratesIDBack=req.files.emaratesIDBack[0].location;}
          if(req.files.visaCopy){foundobject.visaCopy= req.files.visaCopy[0].location;}
          if(req.files.empCardFront){foundobject.empCardFront=req.files.empCardFront[0].location;}
          if(req.files.empCardBack){foundobject.empCardBack=req.files.empCardBack[0].location;}
          if(req.files.agentDrivingLicenceFront){foundobject.agentDrivingLicenceFront=req.files.agentDrivingLicenceFront[0].location;}
          if(req.files.agentDrivingLicenceBack){foundobject.agentDrivingLicenceBack=req.files.agentDrivingLicenceBack[0].location;}
          if(req.body.joiningDate){foundobject.joiningDate= req.body.joiningDate;}
          if(req.body.accountStatus){foundobject.accountStatus= req.body.accountStatus;}
          if(req.body.profession){foundobject.profession=req.body.profession;}
          if(req.body.resignationDate){foundobject.resignationDate=req.body.resignationDate;}

          foundobject.save(function(error, updateObject){
            if(error){
              console.log(error);
              res.status(500).send();
            } else{
              res.send(updateObject);
            }
          });
        }
      }
   });
})

router.post('/deleteimage/:imgpath', async (req,res)=>{
  var imgpath = req.params.imgpath;
  try{
    //fs.unlinkSync('imageuploads/${req.params.id}');
    fs.unlinkSync('imageuploads/'+imgpath)
    res.status(201).send({message:"Image deleted"});
  }catch(e){
    res.status(400).send({message:"Error...", error:e.toString(), req: req.body});
  }
})


//delete user
router.post('/deleteUser/:id', function(req,res){
  var id = req.params.id;
   User.findByIdAndRemove({_id:id}, async(error, foundobject)=>{
    res.send(updateObject);

  });
})
// update user
router.post('/signup/:id',async (req,res)=>{
  var id = req.params.id;
   await  User.findOne({ _id: id}, async (error, foundobject)=>{
      if(error){
        console.log(error);
        res.status(500).send();
      }else {
        if(!foundobject){
          res.status(404).send();
        }else{
          if(req.body.username){
            foundobject.username= req.body.username;
          }
          if(req.body.profileimage){
            foundobject.profileimage= req.body.profileimage;
          }
          if(req.body.password){
            foundobject.password=req.body.password;
          }
          if(req.body.joiningdate){
            foundobject.joiningdate=req.body.joiningdate;
          }
          if(req.body.skills){
            foundobject.skills=req.body.skills;
          }
          if(req.body.resignationDate){
            foundobject.resignationDate=req.body.resignationDate;
          }
          if(req.body.emaratesIDFront){
            foundobject.emaratesIDFront=req.body.emaratesIDFront;
          }
          if(req.body.emaratesIDBack){
            foundobject.emaratesIDBack=req.body.emaratesIDBack;
          }
          foundobject.save(function(error, updateObject){
            if(error){
              console.log(error);
              res.status(500).send();
            } else{
              res.send(updateObject);
            }
          });
        }
      }
   });
})

//admin activity
router.post('/postDataFromAdmin/:id',async (req,res)=>{
  var id = req.params.id;
   await  User.findOne({ _id: id}, async (error, foundobject)=>{
      if(error){
        console.log(error);
        res.status(500).send();
      }else {
        if(!foundobject){
          res.status(404).send();
        }else{
          if(req.body.joiningDate){
            foundobject.joiningDate= req.body.joiningDate;
          }
          if(req.body.accountStatus){
            foundobject.accountStatus= req.body.accountStatus;
          }
          if(req.body.profession){
            foundobject.profession=req.body.profession;
          }
          if(req.body.resignationDate){
            foundobject.resignationDate=req.body.resignationDate;
          }
          foundobject.save(function(error, updateObject){
            if(error){
              console.log(error);
              res.status(500).send();
            } else{
              res.send(updateObject);
            }
          });
        }
      }
   });
})


//get all users
router.get('/user', function(req,res){
  User.find({}, function(error,users){
    if(error){
      res.send('some thing wrong');
      next();
    }
    res.json(users);
  });
})

//count users
router.get('/count', function(req,res){
  User.countDocuments({}, function(error,users){
    if(error){
      res.send('some thing wrong');
      next();
    }
    res.json(users);
  });
})

router.post('/postTerms',async (req,res)=>{
    const {dateandtime,termsandconditions} = req.body;
    try{
      const terms = new Terms({dateandtime,termsandconditions});
      await  terms.save();
      const token = jwt.sign({userId:terms._id},jwtkey)
      res.send(req.body)
    }catch(err){
      return res.status(422).send(err.message)
    }
})

router.get('/getTerms', function(req,res){
  Terms.find({}, function(error,termsconditions){
    if(error){
      res.send('some thing wrong');
      next();
    }
    res.json(termsconditions);
  });
})

//Assign Tasks to users
router.post('/sendTasks',async (req,res)=>{
  //var id=req.params.id;
    const {userId,task,dateandtime} = req.body;
    try{
      const tasks = new Tasks({userId,task, dateandtime});
      await  tasks.save();
      const token = jwt.sign({userId:task._id},jwtkey)
      res.send({})
    }catch(err){
      return res.status(422).send(err.message)
    }
})


// router.post('/userimage/:id', upload.single('profileimage'), async (req,res)=>{
//   console.log(req.file);
//     var id = req.params.id;
//    await  User.findOne({ _id: id}, async (error, foundobject)=>{
//       if(error){
//         console.log(error);
//         res.status(500).send();
//       }else {
//         if(!foundobject){
//           res.status(404).send();
//         }else{
//           if(req.body.phone){
//             foundobject.phone=req.body.phone;
//           }
//           if(req.body.username){
//             foundobject.username= req.body.username;
//           }
//           if(req.file.path){
//             foundobject.profileimage= req.file.path;
//           }
//           if(req.body.password){
//             foundobject.password=req.body.password;
//           }
//           foundobject.save(function(error, updateObject){
//             if(error){
//               console.log(error);
//               res.status(500).send();
//             } else{
//               res.send(updateObject);
//             }
//           });
//         }
//       }
//    });
// })

// User Tasks
router.get('/tasks/:id', function(req,res){
  var id = req.params.id;
  Tasks.find({userId:id}, function(error,tasks){
    if(error){
      res.send('some thing wrong');
      next();
    }
    res.json(tasks);
  });
})

module.exports = router
