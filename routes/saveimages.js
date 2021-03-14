const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
 
 aws.config.update({
     secretAccessKey:'Rgs7gsTWF9Ofz6pFhL8OpVZz++/r5tgXRwbytDAb',
     accessKeyId:'AKIAX46DF5Z4AO362CO2',
     region:'me-south-1'
 });
 
const s3 = new aws.S3({})
 
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'img-bkt01',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    }
  })
})

module.exports=saveimages;