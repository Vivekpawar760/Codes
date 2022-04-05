var express = require('express');
var router = express.Router();
var multer  = require('multer');
var AWS = require('aws-sdk');
const awsKey = require('../config/responseMsg');

const s3 = new AWS.S3({
  accessKeyId: awsKey.AWSs3Key.AccessKeyID,
  secretAccessKey: awsKey.AWSs3Key.SecretAccessKey
});

exports.uploadFiles = async (file, type) => {
  // Setting up S3 upload parameters
  let folderName = '';
  let NewFileName = '';
  if (type == 'profile')
      folderName = awsKey.AWSs3Key.ProfilePhoto;
  else
      folderName = awsKey.AWSs3Key.UploadDocument;

  var path = require('path');
  //Return the extension:
  var ext = path.extname(file.name);

  NewFileName = type + '_' + uuidv4() + ext;

  //filename=filename+file   
  const params = {
      Bucket: "meditag",
      Key: folderName + '/' + NewFileName, // File name you want to save as in S3
      Body: file.data,
      ACL: 'public-read'
  };


  let buketfilepath = new Promise(resolve => {
      s3.upload(params,async function (err, data) {
          // console.log('in');
          if (err) {
              // console.log(err);
              return resolve(err);
          }
          // console.log('success');
          // console.log(data.Location);
          return resolve(data.Location);
      })
  });
  // return await {"filepath":buketfilepath};
  return await buketfilepath;
};