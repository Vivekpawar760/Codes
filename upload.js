const util = require("util");
const path = require("path");
const multer = require("multer");
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const awsKey = require('../config/responseMsg');


// const sharp = require('sharp');


// var storage = multer.diskStorage({
//   destination: (req, file, callback) => {
//      console.log(file)
//     callback(null, path.join(`${__dirname}/../upload`));
//   },
//   filename: (req, file, callback) => {
//     const match = ["image/png", "image/jpeg"];
//     console.log('filename')
//     // console.log(file)
//     if (match.indexOf(file.mimetype) === -1) {
//       var message = `<strong>${file.originalname}</strong> is invalid. Only accept png/jpeg.`;
//       return callback(message, null);
//     }
//     console.log('asasa')
//     var filename = `${Date.now()}-bezkoder-${file.originalname}`;
//     callback(null, filename);
//   }
// });

var storage = multer.memoryStorage({
    destination: function(req, file, callback) {
        callback(null, '');
    }
});

var multifiles_upload = multer({ storage: storage }).array("multifiles", 10);
exports.multifiles = util.promisify(multifiles_upload);

var profilephoto_upload = multer({ storage: storage }).array("profilephoto", 10);
exports.profilephoto = util.promisify(profilephoto_upload);

var documentphoto_upload = multer({ storage: storage }).array("documentphoto", 10);
exports.documentphoto = util.promisify(documentphoto_upload);

var document_upload = multer({ storage: storage }).array("document", 10);
exports.document = util.promisify(document_upload);

var photourl_upload = multer({ storage: storage }).array("photourl", 10);
exports.photourl = util.promisify(photourl_upload);

var imageurl_upload = multer({ storage: storage }).array("imageurl", 10);
exports.imageurl = util.promisify(imageurl_upload);

var insurancedocumentphoto_upload = multer({ storage: storage }).array("insurancedocumentphoto", 10);
exports.insurancedocumentphoto = util.promisify(insurancedocumentphoto_upload);


const s3bucket = new AWS.S3({
    accessKeyId: awsKey.AWSs3Key.AccessKeyID,
    secretAccessKey: awsKey.AWSs3Key.SecretAccessKey
});

exports.uploadFiles = async(file, type, IsSameName = '0') => {

    // Setting up S3 upload parameters
    let folderName = type;
    let NewFileName = '';
    if (type == 'profile')
        folderName = awsKey.AWSs3Key.ProfilePhoto;
    else if(type == 'Student')
        folderName = awsKey.AWSs3Key.StudentDocument;
    else if(type == 'NearUtilityImage')
        folderName = awsKey.AWSs3Key.NearUtilityImage;
    else if(type == 'Accommodation')
        folderName = awsKey.AWSs3Key.Accommodation;
    else if(type == 'AccommodationRoom')
        folderName = awsKey.AWSs3Key.AccommodationRoom;
    else if(type == 'CPCImage')
        folderName = awsKey.AWSs3Key.CPCImage;
    else if(type == 'CPPImage')
        folderName = awsKey.AWSs3Key.CPPImage;
    else if(type == 'PoCountrys')
        folderName = awsKey.AWSs3Key.PoCountrys;
    else if(type == 'PoCitys')
        folderName = awsKey.AWSs3Key.PoCitys;
    else if(type == 'Mst_Services')
        folderName = awsKey.AWSs3Key.Mst_Services;
    else if(type == 'News')
        folderName = awsKey.AWSs3Key.News;
    else if(type == 'Blogs')
        folderName = awsKey.AWSs3Key.Blogs;
    else if(type == 'LandLord')
        folderName = awsKey.AWSs3Key.LandLord;
    else if(type == 'Testimonial')
        folderName = awsKey.AWSs3Key.Testimonial;
    else if(type == '')
        folderName = awsKey.AWSs3Key.UploadDocument;

    //Return the extension:
    var ResponseData = [];
    let resFilPath = new Promise(resolve => {
        file.map((item) => {
            var ext = path.extname(item.originalname);
            NewFileName = uuidv4() + ext;
            if(IsSameName=='1'){
                // NewFileName = item.originalname + ext;
                NewFileName = item.originalname.trim().replace(/[^a-z0-9.\s]/gi, '').replace(/[_\s]/g, '-');
                NewFileName = NewFileName.split('.')[0]+'.'+NewFileName.split('.').pop();
            }
            if(IsSameName=='2'){
                // NewFileName = item.originalname + ext;
                NewFileName = item.originalname.trim().replace(/[^a-z0-9.\s]/gi, '').replace(/[_\s]/g, '-');
                NewFileName = NewFileName.split('.')[0] +'--'+ uuidv4() + ext;
            }
            const params = {
                Bucket: "ocxeeadmin",
                Key: folderName + '/' + NewFileName, // File name you want to save as in S3
                Body: item.buffer,
                ContentType: item.mimetype,
                ACL: 'public-read'
            };
    
            s3bucket.upload(params, function(err, data) {
                if (err) {
                    console.log("File Upload Message = " + err);    
                    return resolve(ResponseData);
                } else {
                    ResponseData.push(data.Location);
                    if (ResponseData.length == file.length) {
                        // console.log("File Upload Message = File Uploaded SuceesFully");
                        return resolve(ResponseData);
                        // res.json({ "error": false, "Message": "File Uploaded    SuceesFully", Data: ResponseData });
                    }
                }
            });
        });
    });

    return await resFilPath;
};

exports.uploadTimeLineFiles = async(file, type) => {

    // Setting up S3 upload parameters
    let folderName = '';
    let NewFileName = '';
    if (type == 'profile')
        folderName = awsKey.AWSs3Key.ProfilePhoto;
    else
        folderName = awsKey.AWSs3Key.UploadDocument;

    //Return the extension:
    var ResponseData = [];
    let resFilPath = new Promise(resolve => {
        file.map((item) => {
            var ext = path.extname(item.originalname);
            NewFileName = type + '_' + uuidv4() + ext;

            const params = {
                Bucket: "ocxeeadmin",
                Key: folderName + '/' + NewFileName, // File name you want to save as in S3
                Body: item.buffer,
                ACL: 'public-read'
            };

            s3bucket.upload(params, function(err, data) {
                if (err) {
                    console.log("File Upload Message = " + err);
                    return resolve(ResponseData);
                } else {
                    ResponseData.push({ "name": item.originalname, "path": data.Location });
                    if (ResponseData.length == file.length) {
                        console.log("File Upload Message = File Uploaded SuceesFully");
                        return resolve(ResponseData);
                        // res.json({ "error": false, "Message": "File Uploaded    SuceesFully", Data: ResponseData });
                    }
                }
            });
        });
    });

    return await resFilPath;
};

exports.S3FileUpload = async (file_array, folder_location='', IsCompress='0') => {
    if (folder_location.trim()=='') {
        folder_location = awsKey.AWSs3Key.UploadDocument;
    }
    
    var ResponseData = [];
    let FileResponse = await new Promise(resolve => {
        file_array.map(async file_data => {
            // let file_ext = path.extname(file_data.originalname);
            // let file_name = uuidv4() + file_ext;
            if (IsCompress=='1') {
                let file_tmp = await exports.CompressFile(file_data);
                file_data.buffer = (file_tmp.buffer!='' ? file_tmp.buffer : file_data.buffer);
                file_data.mimetype = (file_tmp.mimetype!='' ? file_tmp.mimetype : file_data.mimetype);
              
            }
            // console.log(file_data)
            let file_name = file_data.originalname.trim().replace(/[^a-z0-9.\s]/gi, '').replace(/[_\s]/g, '-');
            // file_name = file_name.split('.')[0]+'.'+file_name.split('.').pop();
            const params = {
                Bucket: "ocxeeadmin",
                Key: folder_location + file_name, // File name you want to save as in S3
                Body: file_data.buffer,
                ContentType: file_data.mimetype,
                ACL: 'public-read'
            };

            s3bucket.upload(params, function(err, data) {
                if (err) {
                    console.log("File Upload Message = " + err);
                    return resolve(ResponseData);
                } else {
                    ResponseData.push(data.Location);
                    if (ResponseData.length == file_array.length) {
                        console.log(ResponseData.length + " file uploaded successfully.");
                        // console.log(data);
                        return resolve(ResponseData);
                    }
                }
            });
        });
    });
    return  FileResponse;
};

exports.S3CheckFile = async (folder_location='') =>{
    let IsExists=false;
    try {
        const params = {
            Bucket: 'ocxeeadmin', // your bucket name,
            Key: folder_location 
        }
        // console.log(params);
        const data = await s3bucket.getObject(params).promise();
        // console.log('exists');
        // let url='https://ocxeeadmin.s3.eu-west-2.amazonaws.com/'+folder_location;
        // console.log(url);
        // console.log(data.Body.toString('utf-8'));
        IsExists=true;
      } catch (e) {
        // console.log(' not exists');

        IsExists=false; 
        //  console.log(`Could not retrieve file from S3: ${e.message}`)
      }

    return IsExists

}

exports.CompressFile = async (file_data) => {
    var Jimp = require('jimp');
    let buffer_data = await new Promise(resolve => {
        Jimp.read(file_data['buffer'], async (error, image) => {
            if (error) {
                console.log("<<----- Jimp.read error ---------->>");
                console.log(error);
                resolve({'mimetype':'', 'buffer':''});
            } else {
                let mime = image.getMIME();
                // var file = 'test/test_images.' + image.getExtension();
                let buffer_string = await image.quality(50).getBufferAsync(mime);
                resolve({'mimetype':mime, 'buffer':buffer_string});
            }
        });
    });
    return buffer_data;
};

exports.S3FileDelete = async (file_location = '') => {
    const params = {
        Bucket: "ocxeeadmin",
        Key: file_location // full location of uploaded file
    };
    console.log(file_location);
    var response = {};
    try {
        response = await new Promise(resolve => {
            s3bucket.deleteObject(params, (error, data) => {
                if (error) {
                    console.log(error);
                    resolve({});
                } else {
                    // console.log(data);
                    resolve(data);
                }
            });
        });
        console.log('File Delete Message = File Delete SuceesFully');
    } catch (e) {
        console.log(e);
    }
    return response;
}

exports.uploadToS3 = async (file_array) => {
    var ResponseData = [];
    let resFilPath = new Promise(resolve => {
        // var ext = path.extname(file_array.file_name);
        // NewFileName = uuidv4() + ext;
        var params = {
            Bucket: "ocxeeadmin",
            Key: file_array.file_name, // full location of uploaded file
            Body: file_array.base64, // base64 of file data
            ContentEncoding: 'base64',
            ACL: 'public-read',
            ContentType: file_array.type,
        }
        s3bucket.upload(params, function(err, data) {
            if (err) {
                // console.log("File Upload Message = " + err);
                return resolve(data);
            } else {
                ResponseData.push(data.Location);
                // console.log("File Upload Message = File Uploaded SuceesFully");
                //console.log(data);
                return resolve(ResponseData);
                // res.json({ "error": false, "Message": "File Uploaded    SuceesFully", Data: ResponseData });
            
            }
        });
    });

    return await resFilPath;
}

exports.GetFileUrlToBufferData = async (image_url = '', file_name = '') => {
    var Jimp = require('jimp');
    var response = {
        'status': '0',
        'message': 'File not found.',
        'data': '',
    }
    if (image_url.trim()!='' && file_name.trim()!='') {
        let file_data = await new Promise(resolve => {
            try {
                Jimp.read(image_url, (error, image) => {
                    if (error) {
                        // console.log("----- Jimp.read error ------------------->>");
                        // console.log(error);
                        resolve({ 'status':'0', 'message':'File url read error.', 'data':error });
                    } else {
                        // var file = 'test/test_images.' + image.getExtension();
                        var fileextension=image.getExtension();
                        var fileMime=image.getMIME();
                        var file = 'test/' + file_name;
                        image.quality(100).write(file);
                        resolve({ 'status':'1', 'data':file,'fileext':fileextension,'fileMime':fileMime});
                    }
                });                
            } catch (error) {
                resolve({ 'status':'0', 'message':'File url read error.', 'data':error });
            }
        });

        response = file_data;
        if (file_data.status=='1') {
            var fs = require('fs');
            response = await new Promise(resolve => {
                fs.readFile(file_data.data, (err, data) => {
                    if (err) {
                        resolve({
                            'status': '0',
                            'message': 'File read generate issue.',
                            'data': err,
                        });
                    } else {
                        // console.log(data);
                        try {
                            fs.unlinkSync(file_data.data);
                        } catch (error) {
                        }
                        let str = data.toString('base64')
                        data = Buffer.from(str, 'base64');
                        resolve({
                            'status': '1',
                            'message': 'File convert into Buffer string.',
                            'data': data,
                            'fileext':file_data.fileext,
                            'fileMime':file_data.fileMime,
                        });
                        
                    }
                });
            });
        }
    }

    return response;
}

exports.CreateThumnail = async (FileArray,height=250,width=250,FileName='') => {
    let bufferData = FileArray[0]['buffer'];
    let Status = '0';
    var Jimp = require('jimp');
    response = await new Promise(resolve => {
        // sharp(bufferData).resize(height,width).toBuffer().then(data => {
        //     Status = '1';
        //     resolve(data);
        // })
        // .catch( err => { 
        //     Status = '0';
        //     resolve(err);
        // });
        Jimp.read(bufferData, async (error, image) => {
            if (error) {
                console.log("<<----- Jimp.read error ---------->>");
                console.log(error);
                Status = '0';
                resolve(error);
            } else {
                let mime = image.getMIME();
                let buffer_string = await image.resize(height, width).getBufferAsync(mime);
                Status = '1';
                resolve({'mimetype':mime, 'buffer':buffer_string});
            }
        });
    });
    FileArray.map(obj =>{
        obj.originalname = FileName!='' ? FileName : 'Thumb_'+obj.originalname,
        obj.buffer = response.buffer,
        obj.mimetype = response.mimetype
    });
    return {FileArray : FileArray , Status : Status};
}