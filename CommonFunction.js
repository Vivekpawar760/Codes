require('dotenv').config();
const sqlred = require("../config/read.db");
const sqlwr = require("../config/write.db");
const Code = require("../config/responseMsg");
const SqlHelper = require("../CommonMethod/sqlhelper");
const { dbcalled } = require("../CommonMethod/sqlhelper");
const upload = require("../middleware/upload");
var FCM = require('fcm-node');
var fcm = new FCM(Code.FCM.ServerKey);
var request = require("request");
var xl = require('excel4node');
const _ = require("lodash");
const moment = require('moment');
var fs = require('fs');
const CommonDefault = require("../config/responseMsg");
const crypto = require('crypto');
const awsKey = require('../config/responseMsg');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');


const s3bucket = new AWS.S3({
    accessKeyId: awsKey.AWSs3Key.AccessKeyID,
    secretAccessKey: awsKey.AWSs3Key.SecretAccessKey
});


// import { CryptoJS } from 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/aes.js';
// var CryptoJS = require("crypto");
var CryptoJS = require("crypto-js");
this.key = '+T*&)*$_-(|\*$)%';
this.iv = '<?"0#%&>^$)280^9';
this.resKey = '|$%@5)+&^**9#_/*';
this.resIv = '*+_6$0@#}%!!8+^@';
this.encrypt_method = "aes-128-cbc";

const Commom = function (commom) {
    this.Device_Name = commom.Device_Name;
};

Commom.decrypt = (encrypted) => {
    var key = this.key;
    var iv = this.iv;
    var decrypted = CryptoJS.AES.decrypt(encrypted.details, key, {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
    // return encrypted;
};

Commom.encrypt = (str) => {
    var key = this.key;
    var iv = this.iv;
    var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(str), key,
        {
            keySize: 128 / 8,
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
    return encrypted.toString();
    // return JSON.parse(str).toString(); 
};

Commom.Encode = async = (str) => {
    // Create buffer object, specifying utf8 as encoding
    let bufferObj = Buffer.from(str, "utf8");
    return bufferObj.toString("base64");
}

Commom.Decode = async = (encode) => {
    // Create buffer object, specifying utf8 as encoding
    return Buffer.from(encode, 'base64');
}

Commom.CheckValidToken = async (request) => {
    let query = "SELECT * FROM HST_Login WHERE HstID=? AND UserID=? AND Source=? LIMIT 1";
    let HST_data = await SqlHelper.select(query, [request.Token, request.UserID, request.Source], (err, res) => {
        if (err) {
            console.log(err);
            return [];
        } else {
            return res;
        }
    });

    var response = {
        'status': '3',
        'message': 'Authentication Fail',
    }

    if (HST_data.length > 0) {
        // let CurrentTime = moment().format('DD-MM-YYYY HH:mm:ss');
        // let ExpectedTime = moment(HST_data[0]['LoginDate']).add(24, 'hours').format('DD-MM-YYYY HH:mm:ss');
        let CurrentTime = moment().format('YYYYMMDDHHmmss');
        let ExpectedTime = moment(HST_data[0]['LoginDate']).add(24, 'hours').format('YYYYMMDDHHmmss');
        if (CurrentTime <= ExpectedTime) {
            response.status = '1',
                response.message = 'Session fetch Successfully.';
        } else {
            response.status = '3',
                response.message = 'Session expired. try to login again.';
        }
    }

    return response;
}

Commom.generateRandomNumber = (n) => {
    var add = 1,
        max = 12 - add; // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.   

    if (n > max) {
        return generate(max) + generate(n - max);
    }

    max = Math.pow(10, n + add);
    var min = max / 10; // Math.pow(10, n) basically
    var number = Math.floor(Math.random() * (max - min + 1)) + min;

    return ("" + number).substring(add);
};

Commom.CheckToken = async (UserID, Token, Source, result) => {
    let qry = "select 1 from HST_Login where UserID='" + UserID + "' and HstID='" + Token + "' and Source='" + Source + "'";

    return new Promise(resolve => {
        sqlred.query(qry, (err, res) => {
            if (err) {
                resolve(result(err, new Array()));
            } else {
                resolve(result(null, res));
            }
        });
    });
}

Commom.CheckVersion = async (UserID, Version, Source, result) => {
    let qry = "select Appname  from MST_Version where CheckVersion=1  and Version='" + Version + "' and Source='" + Source + "' OR '" + Source + "'='WEB'  limit 0,1";

    return new Promise(resolve => {
        sqlred.query(qry, (err, res) => {
            if (err) {
                resolve(result(err, new Array()));
            } else {
                resolve(result(null, res));
            }
        });
    });

}

Commom.CheckVersionToken = async (UserID, Version, Token, Appname, Source) => {
    let res = [];
    let qry = "select 1 from HST_Login where UserID='" + UserID + "' and HstID='" + Token + "' and Source='" + Source + "'";
    //  console.log(qry);
    resToken = await SqlHelper.dbcalled('rd', qry, (err, data) => {
        return data
    });

    if (resToken.length == 0) {
        res = [{ 'Message': 'Invalid Token' }]
        return res
    }
    qry = "select Appname  from MST_Version where (CheckVersion=1  and Version='" + Version + "' and Source='" + Source + "' and Appname='" + Appname + "') OR '" + Source + "'='WEB'  limit 0,1";
    resVersion = await SqlHelper.dbcalled('rd', qry, (err, data) => {
        return data
    });

    if (resVersion.length == 0) {
        res = [{ 'Message': 'This Version is no longer supported, please update' }]
        return res
    }
    return res;
}

Commom.FileUpload = async (req, type, key, result) => {
    try {
        //  console.log(key);
        if (key == 'multifiles') {
            await upload.multifiles(req, result);
        } else if (key == 'profilephoto') {
            await upload.profilephoto(req, result);
        } else if (key == 'documentphoto') {
            await upload.documentphoto(req, result);
        } else if (key == 'document') {
            await upload.document(req, result);
        } else if (key == 'photourl') {
            await upload.photourl(req, result);
        } else if (key == 'imageurl') {
            await upload.imageurl(req, result);
        } else if (key == 'insurancedocumentphoto') {
            await upload.insurancedocumentphoto(req, result);
        }


        // await upload.uploadFilesMiddleware(req, result);
        const file = req.files;

        let resFilePath = []
        // console.log(resFilePath)
        // if (req.files.length > 0) {
        //   resFilePath = await upload.uploadFiles(file, type);
        // }
        //  console.log(resFilePath);
        //  console.log(req.files.length);
        //  console.log(resFilePath[1]);
        //  console.log(req.files.length);
        if (req.files.length <= 0) {
            //result([{ "Message": "You must select at least 1 file." }], null);
            return result(null, []);
        } else {
            resFilePath = await upload.uploadFiles(file, type);
        }
        //  console.log(resFilePath)
        return result(null, resFilePath);
        return
    } catch (error) {
        console.log(error.code);

        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            result([{ "Message": "you can upload maximum 10 files." }], null);
            return
        }
        result([{ "Message": "Error when trying upload many files: " + error }], null);
        return
    }
}

Commom.TimelineFileUpload = async (req, type, key, result) => {
    try {
        //  console.log(key);
        if (key == 'multifiles') {
            await upload.multifiles(req, result);
        } else if (key == 'profilephoto') {
            await upload.profilephoto(req, result);
        } else if (key == 'documentphoto') {
            await upload.documentphoto(req, result);
        } else if (key == 'document') {
            await upload.document(req, result);
        } else if (key == 'photourl') {
            await upload.photourl(req, result);
        } else if (key == 'imageurl') {
            await upload.imageurl(req, result);
        }


        // await upload.uploadFilesMiddleware(req, result);
        const file = req.files;

        let resFilePath = []
        // console.log(resFilePath)
        // if (req.files.length > 0) {
        //   resFilePath = await upload.uploadFiles(file, type);
        // }
        //  console.log(resFilePath);
        //  console.log(req.files.length);
        //  console.log(resFilePath[1]);
        //  console.log(req.files.length);
        if (req.files.length <= 0) {
            // result([{ "Message": "You must select at least 1 file." }], null);
            return result(null, []);
        } else {
            resFilePath = await upload.uploadTimeLineFiles(file, type);
        }
        //  console.log('try')
        //  console.log(resFilePath)
        return result(null, resFilePath);
        return
    } catch (error) {
        console.log(error.code);
        console.log('catch')
        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            result([{ "Message": "you can upload maximum 10 files." }], null);
            return
        }
        result([{ "Message": "Error when trying upload many files: " + error }], null);
        return
    }
}

// async remove Ravi
Commom.PushSendNotification = async (Request) => {
    var PageType = "PARTNERHOME";
    Data = Request.Data;
    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        //to: 'fitjJbv-hC4:APA91bH3RkLl-I8I-7lnzZhKoaUmARchZJBM1U5CkfYxH3sJ6s8tiu_mhAumEdICG6X6BsZmophDV7vFLr0SQkJArUCLBz8rdZFgmC0OANX-zYNlHRRqVE4vLMDyTVrRe53RdHbwOujL',
        //collapse_key: 'your_collapse_key',
        to: Request.FCM_Token,

        notification: {
            title: Request.Title,
            body: Request.Body
        },

        data: { //you can send only notification or only data(or include both)
            Data,
            title: Request.Title,
            body: Request.Body,
            "pageType": PageType, // "PARTNERHOME", //PageType,
            "click_action": "FLUTTER_NOTIFICATION_CLICK",
            "id": 10,
            "sound": "default",
            "priority": "high"
        }
    };
    console.log(Code.FCM.ServerKey)
    var response = {}
    fcm.send(message, function (err, response) {
        if (err) {
            console.log(err)
            console.log("Something has gone wrong!");
            // // response.status = '0';
            // response.messages = "err";
            // result({ "message": err }, null);
        } else {
            console.log("Successfully sent with response: ", response);
            response.status = '1';
            response.message = response;
            // result({ "message": "Successfully sent." }, null);
        }
        return response;
    });
}

Commom.PushSendNotificationDynamic = async (FCM_Token, Title, Body, Data, PageType, result) => {
    //  var PageType = "PARTNERHOME";
    // console.log(FCM_Token);
    // console.log(Title);
    // console.log(Body);
    // console.log(Data);
    // console.log(PageType);
    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        //to: 'fitjJbv-hC4:APA91bH3RkLl-I8I-7lnzZhKoaUmARchZJBM1U5CkfYxH3sJ6s8tiu_mhAumEdICG6X6BsZmophDV7vFLr0SQkJArUCLBz8rdZFgmC0OANX-zYNlHRRqVE4vLMDyTVrRe53RdHbwOujL',
        //collapse_key: 'your_collapse_key',
        to: FCM_Token,

        notification: {
            title: Title,
            body: Body
        },

        data: { //you can send only notification or only data(or include both)
            Data,
            title: Title,
            body: Body,
            "pageType": PageType, // "PARTNERHOME", //PageType,
            "click_action": "FLUTTER_NOTIFICATION_CLICK",
            "id": 10,
            "sound": "default",
            "priority": "high"
        }
    };
    //  console.log(message);
    // message = '{' +
    //     '"to":"fORhYZQJRimJ6DvNzHRUHT:APA91bFPfc6SSNLoq-yNL-OIWGDRXkoMG-qPT-1HYQgBOlxtL4azbkJ6JfMZ7LOznaC5ZAk1d0pCGeiXRH9yw-kCpP6gYXIeBUd5UETQ52T65bX0MFebJH70PkIlg4kSYRsf7tuaH0Og",' +
    //     '"notification":{' +
    //     '"title":"Refer Patient",' +
    //     '"body":"Dhaval varsani Refer patient Hardik patel (8690824424)  to you"' +
    //     '},' +
    //     '"data":{' +
    //     '"Data":"",' +
    //     '"title":"Refer Patient",' +
    //     '"body":"Dhaval varsani Refer patient Hardik patel (8690824424)  to you",' +
    //     '"pageType":"REFERDOCTOR",' +
    //     '"click_action":"FLUTTER_NOTIFICATION_CLICK",' +
    //     '"id":10,' +
    //     '"sound":"default",' +
    //     '"priority":"high"' +
    //     '}' +    
    // '}';
    //  console.log('message=');
    //  console.log(message);
    fcm.send(message, function (err, response) {
        if (err) {
            console.log("Something has gone wrong!");
            result({ "message": err }, null);
        } else {
            console.log("Successfully sent with response: ", response);
            result({ "message": "Successfully sent." }, null);
        }
    });

}

Commom.SendOTPSMS = async (MobileNo, OTP, result) => {
    // console.log(sqlred.dbConfig.host);
    console.log(OTP);
    // MobileNo = "9712008007";
    //console.log('Welcome to Meditag,Your Verification code is ' + OTP + '.Treat this as confidential. Meditag never calls to verify your OTP.');

    //if (1 == 1) {

    if (sqlred.dbConfig.host == "meditagweb-cluster.cluster-ro-cqx5jr5mzdtp.ap-south-1.rds.amazonaws.com") {

        var options = {
            method: 'POST',
            url: 'http://enterprise.smsgupshup.com/GatewayAPI/rest',
            qs: {
                method: 'SendMessage',
                send_to: MobileNo,
                msg: 'Welcome to Meditag,Your Verification code is ' + OTP + '.Treat this as confidential. Meditag never calls to verify your OTP.',
                msg_type: 'TEXT',
                userid: '2000193378',
                auth_scheme: 'plain',
                password: 'xNWsfwa5K',
                v: '1.1',
                format: 'text'
            },
            headers: {
                'postman-token': 'e6d3ea6f-119b-2485-a515-26199946b449',
                'cache-control': 'no-cache'
            }
        };

        return new Promise(resolve => {
            request(options, function (error, response, body) {
                if (error) {
                    console.log(error);
                    resolve(result({ "message": "0" }, null));
                } else {
                    //  console.log(body);
                    resolve(result({ "message": "1" }, null));
                }
            });
        });
    } else {
        result({ "message": "1" }, null)
    }
}

Commom.SaveActivityLog = async (Data, request) => {
    Data['EntryBy'] = request.UserID;
    Data['EntryDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
    Data['EntryIP'] = request.IpAddress;
    //console.log(Data)
    return await SqlHelper.insert('Trn_Admin_log', Data, (err, res) => {
        if (err) {
            return 0;
        } else {
            return res.insertId;
        }
    });
}

Commom.CleanArray = async (Array) => {
    for (let [Index, Obj] of Array.entries()) {
        Array[Index] = JSON.parse(JSON.stringify(Obj, function (key, value) {
            return (value == '-') ? "" : (value == 'null') ? "" : (value == 'undefined') ? "" : (value == undefined) ? "" : (value == null) ? "" : value
        }));
    }
    return Array;
}

Commom.GetSubscribeEmails = async () => {
    var query = "select EmailAddress from Email_Subscriptions where SubStatus = 1";
    return new Promise(resolve => {
        SqlHelper.select(query, (err, res) => {
            if (err) {
                return resolve(err);
            } else {
                return resolve(res);
            }
        });
    });
}

Commom.GetEmailTemplate = async (TampletName) => {
    var query = "select TemplateSubject,TemplateBody from Mst_MessageTemplate where Active = 1 AND TemplateName = '" + TampletName + "'";
    return new Promise(resolve => {
        SqlHelper.select(query, (err, res) => {
            if (err) {
                return resolve(err);
            } else {
                return resolve(res[0]);
            }
        });
    });
}

//Parth added 
Commom.GenerateAccSlug = async (AccName = '', CountryName = '', StateName = '', CityName = '', UniqueID = '') => {
    let AccSlug = '';
    if (AccName.trim() != '') {
        var acc_slug = [];
        if (CountryName != '' && CountryName != null) {
            acc_slug.push(CountryName.trim().toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-'));
        } else {
            acc_slug.push('country');
        }

        if (CityName != '' && CityName != null) {
            acc_slug.push(CityName.trim().toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-'));
        } else if (StateName != '' && StateName != null) {
            acc_slug.push(StateName.trim().toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-'));
        } else {
            acc_slug.push('city');
        }
        acc_slug.push(AccName.trim().toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-'));
        AccSlug = process.env.STUDENT_PANEL_LINK + 'student-accommodation/' + acc_slug.join('/') + '/' + UniqueID;
    }
    return AccSlug;
}

Commom.GenerateAccSlugNew = async (AccName = '', CountryName = '', StateName = '', CityName = '', UniqueID = '') => {
    var acc_slug = [];
    if (CountryName != '') {
        acc_slug.push(CountryName.trim().toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-'));
    } else {
        acc_slug.push('country');
    }

    if (CityName != '') {
        acc_slug.push(CityName.trim().toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-'));
    } else if (StateName != '') {
        acc_slug.push(StateName.trim().toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-'));
    } else {
        acc_slug.push('city');
    }

    if (AccName.trim() != '') {
        acc_slug.push(AccName.trim().toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-'));
    }

    if (UniqueID.trim() != '') {
        acc_slug.push(UniqueID.trim());
    }

    let AccSlug = process.env.STUDENT_PANEL_LINK + 'student-accommodation/' + acc_slug.join('/');
    return AccSlug;
}

Commom.BtrixCRMRequest_bck = async (ReqData = {}, ServiceID = '0') => {
    let requestUrl = 'https://www.rizecrm.com/anciserv_api.php';

    let ExchangeServiceId = {
        '1': '2-466',       // Insurance
        '2': '3-478',       // Pickup and Drop
        '3': '4-474',       // Forex
        '4': '5-472',       // Travel Assistance
        '5': '6-476',       // SIM Card
        '6': '7-480',       // Money Transfer
        '8': '',            // Accommodation
        '9': '10-468',      // Visa Assistance
        '10': '12-470',     // Education Loan
        '11': '14-2054',    // Storage Service & Essentials
        '12': '15-2056',    // Short Term Courses & Internship
        '13': '17-486',     // Furniture Rentals
        '14': '22-5392',     // Job Assistant
        '15': '23-5394',     // Gurantor Services
        '16': '24-5398',     // Financial Service
    };

    // Start Exchange value of InsuranceType (Insurance service)
    let NewInsuranceTypeId = 0;
    if (ReqData['ServiceTypeID'] == '1') {
        NewInsuranceTypeId = 496;
    } else if (ReqData['ServiceTypeID'] == '2') {
        NewInsuranceTypeId = 498;
    }
    // End Exchange value of InsuranceType (Insurance service)

    let ExchangeNoOfPerson = {
        // Exchange NoOfPerson (Accommodation service)
        '1-8': 56,
        '2-8': 58,
        '3-8': 60,
        '4-8': 62,
        '5-8': 64,
        '6-8': 66,
        '7-8': 68,
        '8-8': 70,
        '9-8': 72,
        '10-8': 74,
        '11-8': 2120,
        '12-8': 2122,
        '13-8': 2124,
        '14-8': 2126,
        // Exchange NoOfPerson (Travel assistance service)
        '1-4': 2156,
        '2-4': 2158,
        '3-4': 2160,
        '4-4': 2162,
        '5-4': 2164,
        '6-4': 2166,
        '7-4': 2166,
        '8-4': 2168,
        '9-4': 2168,
        '10-4': 2170,
    };

    let ExchangeMinNoOfRooms = {
        '0': 108,
        '1': 110,
        '2': 112,
        '3': 114,
        '4': 116,
        '5': 118,
        '6': 120,
        '7': 122,
        '8': 124,
        '9': 126,
    };

    let ExchangeMaxNoOfRooms = {
        '1': 368,
        '2': 370,
        '3': 372,
        '4': 374,
        '5': 376,
        '6': 378,
        '7': 380,
        '8': 382,
        '9': 384,
        '10': 386,
        '11': 386,
        '12': 1982,
        '13': 1982,
        '14': 1984,
        '15': 1986,
    };

    let ExchangeDuration = {
        '1': 84,
        '2': 86,
        '3': 88,
        '4': 90,
        '5': 90,
        '6': 92,
        '7': 92,
        '8': 98,
        '9': 100,
        '10': 102,
        '11': 104,
        '12': 106,
        '13': 2068,
        '14': 2068,
        '15': 2068,
        '16': 2070,
        '17': 2072,
        '18': 2074,
        '19': 2074,
        '20': 2074,
        '21': 2074,
        '22': 2074,
        '23': 2074,
        '24': 2076,
        '25': 2076,
        '26': 2078,
        '27': 2078,
        '28': 2078,
        '29': 2078,
        '30': 2078,
        '31': 2078,
        '32': 2078,
        '33': 2078,
        '34': 2078,
        '35': 2078,
        '36': 2080,
        '37': 2080,
        '38': 2080,
        '39': 2080,
        '40': 2080,
        '41': 2080,
        '42': 2080,
        '43': 2080,
        '44': 2080,
        '45': 2080,
        '46': 2080,
        '47': 2080,
        '48': 2082,
        '49': 2082,
        '50': 2082,
        '51': 2082,
        '52': 2082,
        '53': 2082,
        '54': 2082,
        '55': 2082,
        '56': 2082,
        '57': 2082,
        '58': 2082,
        '59': 2082,
        '60': 2084,
    };

    let ExchangeDistance = {
        '0.5 Mile': 356,
        '1 Mile': 358,
        '5 Mile': 360,
        '10 Mile': 362,
        '15 Mile': 364,
        '20 Mile': 366,
    };

    let BtrixReqData = [];
    if (['1', '2', '3', '4', '5', '6', '9', '10', '11', '12', '13'].includes(ServiceID)) {
        let tmp_data = {
            "FirstName": ReqData['FirstName'],
            "LastName": ReqData['LastName'],
            "PhoneNo": ReqData['PhoneNo'],
            "PhoneCode": ReqData['PhoneNo_CountryCode'],
            "Email": ReqData['Email'],
            "ServiceId": ExchangeServiceId[ReqData['ServiceID']].split('-')[0],
            "ServiceName": ExchangeServiceId[ReqData['ServiceID']].split('-')[1],
            "STDCity": ReqData['CurrentCity'],
            "STDState": ReqData['CurrentState'],
            "STDCountry": ReqData['CurrentCountry'],
            "DSTCity": ReqData['DestinationCity'],
            "DSTState": ReqData['DestinationState'],
            "DSTCountry": ReqData['DestinationCountry'],
            "Remark": ReqData['Remark'],
        };

        if (ServiceID == '1') {
            tmp_data['InsuranceTypeName'] = NewInsuranceTypeId;
        } else if (ServiceID == '2') {
            tmp_data['JourneyDate'] = moment(ReqData['JourneyDate'], "YYYY-MM-DD").format('DD/MM/YYYY');
        } else if (ServiceID == '4') {
            tmp_data['TravelDate'] = moment(ReqData['TravelDate'], "YYYY-MM-DD").format('DD/MM/YYYY');
            tmp_data['NumberOfPerson'] = (ExchangeNoOfPerson[ReqData['NoOfPerson'] + '-4'] != undefined ? ExchangeNoOfPerson[ReqData['NoOfPerson'] + '-4'] : 0);
        } else if (ServiceID == '5') {
            tmp_data['DepartureDate'] = moment(ReqData['DepatureDate'], "YYYY-MM-DD").format('DD/MM/YYYY');
        } else if (ServiceID == '10') {
            tmp_data['LoanAmount'] = ReqData['LoanAmount'];
        }

        BtrixReqData.push(tmp_data);
    } else if (ServiceID == '8') {
        requestUrl = 'https://www.rizecrm.com/accenq_api.php';
        let AccLocation = [];
        try {
            AccLocation = JSON.parse(ReqData['AccLocation']);
        } catch (e) {
            AccLocation = [];
            console.log(e);
        }

        if (AccLocation.length > 0) {
            let cm_query = 'SELECT CountryID, CountryName, CurrencyCode FROM Mst_Country';
            let cm_data = await SqlHelper.select(cm_query, [], (err, res) => {
                if (err) {
                    console.log(err);
                    return [];
                } else {
                    return res;
                }
            });

            for (let i = 0; i < AccLocation.length; i++) {
                let CurrencyCode = '';
                let cfi = _.findIndex(cm_data, { 'CountryName': AccLocation[i]['Country'] });
                if (AccLocation[i]['Country'] != '' && cfi >= 0) {
                    CurrencyCode = '|' + cm_data[cfi]['CurrencyCode'];
                }

                BtrixReqData.push({
                    "Email": ReqData['Email'],
                    "Phone": ReqData['PhoneNo'],
                    "STDCountry": ReqData['CurrentCountry'],
                    "STDCity": (ReqData['CurrentCity'] != '' ? ReqData['CurrentCity'] : ReqData['CurrentState']),
                    "FirstName": ReqData['FirstName'] + ' ' + ReqData['LastName'],
                    "PropertyType": ReqData['PropertyType'],
                    "University": ReqData['UniversityName'],
                    "MinPriceRange": ReqData['MinPrice'] + CurrencyCode,
                    "MaxPriceRange": ReqData['MaxPrice'] + CurrencyCode,
                    "MinNoofRooms": (ExchangeMinNoOfRooms[ReqData['MinNoOfRooms']] != undefined ? ExchangeMinNoOfRooms[ReqData['MinNoOfRooms']] : 0),
                    "MaxNoofRooms": (ExchangeMaxNoOfRooms[ReqData['MaxNoOfRooms']] != undefined ? ExchangeMaxNoOfRooms[ReqData['MaxNoOfRooms']] : 0),
                    "Duration": (ExchangeDuration[ReqData['DurationInMonth']] != undefined ? ExchangeDuration[ReqData['DurationInMonth']] : 0),
                    "MoveInDate": moment(ReqData['MoveInDate'], "YYYY-MM-DD").format('DD/MM/YYYY'),
                    "Location": (AccLocation[i]['Location'] != undefined ? AccLocation[i]['Location'] : ''),
                    "Country": (AccLocation[i]['Country'] != undefined ? AccLocation[i]['Country'] : ''),
                    "City": (AccLocation[i]['City'] != undefined ? AccLocation[i]['City'] : ''),
                    "Remark": ReqData['Remark'],
                    "Distance": (AccLocation[i]['Distance'] != '' ? (ExchangeDistance[AccLocation[i]['Distance']] != undefined ? ExchangeDistance[AccLocation[i]['Distance']] : 0) : 0),
                    "CreatedDate": moment().format('DD/MM/YYYY'),
                    "NoOfPerson": (ExchangeNoOfPerson[ReqData['NoOfPerson'] + '-8'] != undefined ? ExchangeNoOfPerson[ReqData['NoOfPerson'] + '-8'] : 0),
                });
            }
        }
    }

    let response;
    if (BtrixReqData.length > 0) {
        // var request = require('request');
        // require('request').defaults({ rejectUnauthorized: false })
        var options = {
            strictSSL: false,
            // secureProtocol: 'TLSv1_method',
            method: 'POST',
            url: requestUrl,
            body: JSON.stringify(BtrixReqData),
            rejectUnauthorized: false
        };

        // console.log("btrix data");
        // console.log(BtrixReqData);
        if (process.env.IsBtrixCRMRequest == '1') {
            response = await new Promise(resolve => {
                request(options, function (error, body, resp) {
                    if (error) {
                        console.log("Btrix Api is not working :( ");
                        console.log(error);
                        resolve(-1);//throw new Error(error);
                    } else {
                        console.log("Success Btrix response ================> ");
                        console.log(body.body);
                        // console.log("resp ================> ");
                        // console.log(resp);
                        resolve(resp);
                    }
                });
            });
        }
    }
    return response;
}

Commom.BtrixCRMRequest = async (ReqData = {}, ServiceID = '0') => {
    let requestUrl = 'https://www.rizecrm.com/anciserv_api.php';

    let ExchangeServiceId = {
        '1': '2-466',       // Insurance
        '2': '3-478',       // Pickup and Drop
        '3': '4-474',       // Forex
        '4': '5-472',       // Travel Assistance
        '5': '6-476',       // SIM Card
        '6': '7-480',       // Money Transfer
        '8': '',            // Accommodation
        '9': '10-468',      // Visa Assistance
        '10': '12-470',     // Education Loan
        '11': '14-2054',    // Storage Service & Essentials
        '12': '15-2056',    // Short Term Courses & Internship
        '13': '17-486',     // Furniture Rentals
        '14': '22-5392',     // Job Assistant
        '15': '23-5394',     // Gurantor Services
        '16': '24-5398',     // Financial Service
    };

    // Start Exchange value of InsuranceType (Insurance service)
    let NewInsuranceTypeId = 0;
    if (ReqData['ServiceTypeID'] == '1') {
        NewInsuranceTypeId = 496;
    } else if (ReqData['ServiceTypeID'] == '2') {
        NewInsuranceTypeId = 498;
    }
    // End Exchange value of InsuranceType (Insurance service)

    let ExchangeNoOfPerson = {
        // Exchange NoOfPerson (Accommodation service)
        '1-8': 56,
        '2-8': 58,
        '3-8': 60,
        '4-8': 62,
        '5-8': 64,
        '6-8': 66,
        '7-8': 68,
        '8-8': 70,
        '9-8': 72,
        '10-8': 74,
        '11-8': 2120,
        '12-8': 2122,
        '13-8': 2124,
        '14-8': 2126,
        // Exchange NoOfPerson (Travel assistance service)
        '1-4': 2156,
        '2-4': 2158,
        '3-4': 2160,
        '4-4': 2162,
        '5-4': 2164,
        '6-4': 2166,
        '7-4': 2166,
        '8-4': 2168,
        '9-4': 2168,
        '10-4': 2170,
    };

    let ExchangeMinNoOfRooms = {
        '0': 108,
        '1': 110,
        '2': 112,
        '3': 114,
        '4': 116,
        '5': 118,
        '6': 120,
        '7': 122,
        '8': 124,
        '9': 126,
    };

    let ExchangeMaxNoOfRooms = {
        '1': 368,
        '2': 370,
        '3': 372,
        '4': 374,
        '5': 376,
        '6': 378,
        '7': 380,
        '8': 382,
        '9': 384,
        '10': 386,
        '11': 386,
        '12': 1982,
        '13': 1982,
        '14': 1984,
        '15': 1986,
    };

    let ExchangeDuration = {
        '1': 84,
        '2': 86,
        '3': 88,
        '4': 90,
        // '5': 90,
        // '6': 92,
        // '7': 92,
        // Add on 16-04-21
        '5': 92,
        '6': 94,
        '7': 96,

        '8': 98,
        '9': 100,
        '10': 102,
        '11': 104,
        '12': 106,
        '13': 2068,
        '14': 2068,
        '15': 2068,
        '16': 2070,
        '17': 2072,
        '18': 2074,
        '19': 2074,
        '20': 2074,
        '21': 2074,
        '22': 2074,
        '23': 2074,
        '24': 2076,
        '25': 2076,
        '26': 2078,
        '27': 2078,
        '28': 2078,
        '29': 2078,
        '30': 2078,
        '31': 2078,
        '32': 2078,
        '33': 2078,
        '34': 2078,
        '35': 2078,
        '36': 2080,
        '37': 2080,
        '38': 2080,
        '39': 2080,
        '40': 2080,
        '41': 2080,
        '42': 2080,
        '43': 2080,
        '44': 2080,
        '45': 2080,
        '46': 2080,
        '47': 2080,
        '48': 2082,
        '49': 2082,
        '50': 2082,
        '51': 2082,
        '52': 2082,
        '53': 2082,
        '54': 2082,
        '55': 2082,
        '56': 2082,
        '57': 2082,
        '58': 2082,
        '59': 2082,
        '60': 2084,
    };

    let ExchangeDistance = {
        '0.5 Mile': 356,
        '1 Mile': 358,
        '5 Mile': 360,
        '10 Mile': 362,
        '15 Mile': 364,
        '20 Mile': 366,
    };

    console.log(ReqData);

    let BtrixReqData = [];
    if (['1', '2', '3', '4', '5', '6', '9', '10', '11', '12', '13'].includes(ServiceID)) {
        let tmp_data = {
            "EnqRefNo": ReqData['InquiryNo'],
            "FirstName": ReqData['FirstName'],
            "LastName": ReqData['LastName'],
            "PhoneNo": ReqData['PhoneNo'],
            "PhoneCode": ReqData['PhoneNo_CountryCode'],
            "Email": ReqData['Email'],
            "ServiceId": ExchangeServiceId[ReqData['ServiceID']].split('-')[0],
            "ServiceName": ExchangeServiceId[ReqData['ServiceID']].split('-')[1],
            "STDCity": ReqData['CurrentCity'],
            "STDState": ReqData['CurrentState'],
            "STDCountry": ReqData['CurrentCountry'],
            "DSTCity": ReqData['DestinationCity'],
            "DSTState": ReqData['DestinationState'],
            "DSTCountry": ReqData['DestinationCountry'],
            "Remark": ReqData['Remark'],
            "Channel Partner": ReqData['PartnerName'],
        };

        if (ServiceID == '1') {
            tmp_data['InsuranceTypeName'] = NewInsuranceTypeId;
        } else if (ServiceID == '2') {
            tmp_data['JourneyDate'] = moment(ReqData['JourneyDate'], "YYYY-MM-DD").format('MM/DD/YYYY');
        } else if (ServiceID == '4') {
            tmp_data['TravelDate'] = moment(ReqData['TravelDate'], "YYYY-MM-DD").format('MM/DD/YYYY');
            tmp_data['NumberOfPerson'] = (ExchangeNoOfPerson[ReqData['NoOfPerson'] + '-4'] != undefined ? ExchangeNoOfPerson[ReqData['NoOfPerson'] + '-4'] : 0);
        } else if (ServiceID == '5') {
            tmp_data['DepartureDate'] = moment(ReqData['DepatureDate'], "YYYY-MM-DD").format('MM/DD/YYYY');
        } else if (ServiceID == '10') {
            tmp_data['LoanAmount'] = ReqData['LoanAmount'] + '|' + ReqData['CurrencyCode'];
        }

        BtrixReqData.push(tmp_data);
    } else if (ServiceID == '8') {
        requestUrl = 'https://www.rizecrm.com/accenq_api.php';
        let AccLocation = [{
            'Location' : '',
            'Country' : ''
        }];
        try {
            AccLocation = JSON.parse(ReqData['AccLocation']);
        } catch (e) {
            AccLocation = [{
                'Location' : '',
                'Country' : ''
            }];
            console.log(e);
        }

        if (AccLocation.length > 0) {
            // let cm_query = 'SELECT CountryID, CountryName, CurrencyCode FROM Mst_Country';
            // let cm_data = await SqlHelper.select(cm_query, [], (err, res) => {
            //     if (err) {
            //         console.log(err);
            //         return [];
            //     } else {
            //         return res;
            //     }
            // });

            for (let i = 0; i < AccLocation.length; i++) {
                let CurrencyCode = '|' + ReqData['CurrencyCode'];
                // let CurrencyCode = '';
                // let cfi = _.findIndex(cm_data, { 'CountryName': AccLocation[i]['Country'] });
                // if (AccLocation[i]['Country']!='' && cfi>=0) {
                //     CurrencyCode = '|'+cm_data[cfi]['CurrencyCode'];
                // }

                BtrixReqData.push({
                    "Email": ReqData['Email'],
                    "EnqRefNo": ReqData['InquiryNo'],
                    "Phone": ReqData['PhoneNo_CountryCode'] + ReqData['PhoneNo'],
                    "STDCountry": ReqData['CurrentCountry'],
                    "STDCity": (ReqData['CurrentCity'] != '' ? ReqData['CurrentCity'] : ReqData['CurrentState']),
                    "FirstName": ReqData['FirstName'] + ' ' + ReqData['LastName'],
                    "PropertyType": ReqData['PropertyType'],
                    "University": ReqData['UniversityName'],
                    "MinPriceRange": ReqData['MinPrice'] + CurrencyCode,
                    "MaxPriceRange": ReqData['MaxPrice'] + CurrencyCode,
                    "MinNoofRooms": (ExchangeMinNoOfRooms[ReqData['MinNoOfRooms']] != undefined ? ExchangeMinNoOfRooms[ReqData['MinNoOfRooms']] : 0),
                    "MaxNoofRooms": (ExchangeMaxNoOfRooms[ReqData['MaxNoOfRooms']] != undefined ? ExchangeMaxNoOfRooms[ReqData['MaxNoOfRooms']] : 0),
                    "Duration": (ExchangeDuration[ReqData['DurationInMonth']] != undefined ? ExchangeDuration[ReqData['DurationInMonth']] : 0),
                    "MoveInDate": moment(ReqData['MoveInDate'], "YYYY-MM-DD").format('MM/DD/YYYY'),
                    "Location": (AccLocation[i]['Location'] != undefined ? AccLocation[i]['Location'] : ''),
                    "Country": (AccLocation[i]['Country'] != undefined ? AccLocation[i]['Country'] : ''),
                    "City": (AccLocation[i]['City'] != undefined ? AccLocation[i]['City'] : ''),
                    "Remark": ReqData['Remark'],
                    "Distance": (AccLocation[i]['Distance'] != '' ? (ExchangeDistance[AccLocation[i]['Distance']] != undefined ? ExchangeDistance[AccLocation[i]['Distance']] : 0) : 0),
                    "CreatedDate": moment().format('MM/DD/YYYY'),
                    "Channel Partner": ReqData['PartnerName'],
                    "NoOfPerson": (ExchangeNoOfPerson[ReqData['NoOfPerson'] + '-8'] != undefined ? ExchangeNoOfPerson[ReqData['NoOfPerson'] + '-8'] : 0),
                });
            }
        }
    }

    let response;
    console.log("======================> BtrixReqData <=============================");
    console.log(BtrixReqData);
    if (BtrixReqData.length > 0) {
        // var request = require('request');
        // require('request').defaults({ rejectUnauthorized: false })
        var options = {
            strictSSL: false,
            // secureProtocol: 'TLSv1_method',
            method: 'POST',
            url: requestUrl,
            body: JSON.stringify(BtrixReqData),
            rejectUnauthorized: false
        };

        // console.log(BtrixReqData);
        if (process.env.IsBtrixCRMRequest == '1') {
            response = await new Promise(resolve => {
                request(options, function (error, body, resp) {
                    if (error) {
                        console.log("Btrix Api is not working :( ");
                        console.log(error);
                        resolve(-1);//throw new Error(error);
                    } else {
                        console.log("Success Btrix response ================> ");
                        console.log(body.body);
                        // console.log("resp ================> ");
                        // console.log(resp);
                        resolve(resp);
                    }
                });
            });
        }
    }
    return response;
}



Commom.SaveFileGivenLocation = async (file_location, file_data) => {
    let folder_name = file_location.substring(0, file_location.lastIndexOf('/'));
    if (folder_name.trim() != '') {
        await new Promise(cb => {
            fs.mkdir(folder_name, { recursive: true }, function (err) {
                if (err) {
                    if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
                    else cb(err); // something else went wrong
                } else cb(null); // successfully created folder
            });
        });
    }

    let response = await new Promise(resolve => {
        fs.writeFile(file_location, file_data, function (err, data) {
            if (err) {
                console.log(err);
                resolve(err);
            } else {
                console.log(file_location + ' save successfully...');
                resolve(data);
            }
        });
    });
    return response;
}

Commom.BtrixCRMRequest1 = async (BtrixReqData = {}) => {

    let requestUrl = 'https://www.rizecrm.com/ocxee/update_email.php';

    // var request = require('request');
    // require('request').defaults({ rejectUnauthorized: false })
    var options = {
        strictSSL: false,
        // secureProtocol: 'TLSv1_method',
        method: 'POST',
        url: requestUrl,
        body: JSON.stringify(BtrixReqData),
        rejectUnauthorized: false
    };

    // console.log(BtrixReqData);
    let response;
    if (process.env.IsBtrixCRMRequest == '1') {
        response = await new Promise(resolve => {
            request(options, function (error, body, resp) {
                if (error) {
                    console.log("Btrix Api is not working :( ");
                    console.log(error);
                    resolve(-1);//throw new Error(error);
                } else {
                    console.log("Success Btrix response ================> ");
                    console.log(body.body);
                    // console.log("resp ================> ");
                    // console.log(resp);
                    resolve(resp);
                }
            });
        });
    }
    return response;
}

Commom.S3FileDelete = async (res) => {
    var query = `select ` + res.FieldName + ` as File from ` + res.TableName + ` where ` + res.IDName + ` = '` + res.ID + `'`;
    // console.log(query);
    let file_location = await new Promise(resolve => {
        SqlHelper.select(query, (err, res) => {
            if (err) {
                console.log(err);
                return resolve(false);
            } else {
                return resolve(res[0].File);
            }
        });
    });
    if (file_location) {
        file_location = file_location.replace(CommonDefault.S3Location, '');
        await upload.S3FileDelete(file_location);
        return file_location;
    }
    return file_location;
}

Commom.CheckFileExit = async (res) => {
    if (res.ID == 'null' || res.ID == null || res.ID == undefined || res.ID == 'undefined' || !res.ID) {
        res.ID = 0;
    }
    let FileUrl = CommonDefault.S3Location + res.FolderName + res.Files.trim().replace(/[^a-z0-9.\s]/gi, '').replace(/[_\s]/g, '-');
    var query = `select ` + res.FieldName + ` as File from ` + res.TableName + ` where ` + res.FieldName + ` = '` + FileUrl + `' AND ` + res.IDName + ` != '` + res.ID + `'`;
    // console.log(query);
    let IsExitStat = await new Promise(resolve => {
        SqlHelper.select(query, (err, res) => {
            if (err) {
                console.log(err);
                return resolve(false);
            } else if (_.isEmpty(res)) {
                return resolve(true);
            } else {
                return resolve(false);
            }
        });
    });
    if (IsExitStat == true && res.ID > 0) {
        var delete_query = `select ` + res.FieldName + ` as File from ` + res.TableName + ` where ` + res.IDName + ` = '` + res.ID + `'`;
        // console.log(delete_query);
        let file_location = await new Promise(resolve => {
            SqlHelper.select(delete_query, (err, res) => {
                if (err) {
                    console.log(err);
                    return resolve(false);
                } else {
                    return resolve(res[0].File);
                }
            });
        });
        if (file_location) {
            file_location = file_location.replace(CommonDefault.S3Location, '');
            if (file_location != "") await upload.S3FileDelete(file_location);
        }
    }
    return IsExitStat;
}

Commom.TokenEncrypt = (value) => {
    var IV_KEY = process.env.SECRET_KEY.substr(0, 16);
    var encryptor = crypto.createCipheriv(process.env.ENCRYPT_TYPE, process.env.SECRET_KEY, IV_KEY);
    return encryptor.update(value, 'utf8', 'base64') + encryptor.final('base64');
};

Commom.TokenDecrypt = (value) => {
    try {
        var value = value.toString();

        var IV_KEY = process.env.SECRET_KEY.substr(0, 16);
        var decryptor = crypto.createDecipheriv(process.env.ENCRYPT_TYPE, process.env.SECRET_KEY, IV_KEY);
        var decrypt_string = decryptor.update(value, 'base64', 'utf8') + decryptor.final('utf8');
        return decrypt_string;
    } catch (error) {
        return 0;
    }
};
Commom.GetFormattedAddress = async (AddressLine1 = '', AddressLine2 = '', CityName = '', StateName = '', CountryName = '') => {
    let Address = AddressLine1;
    Address += (AddressLine2 != '' && !Address.includes(AddressLine2) ? ", " + AddressLine2 : "");
    Address += (CityName != '' && !Address.includes(CityName) ? ", " + CityName : "");
    Address += (StateName != '' && !Address.includes(StateName) ? ", " + StateName : "");
    Address += (CountryName != '' && !Address.includes(CountryName) ? ", " + CountryName : "");

    return Address
}

Commom.ReadFileData = async (FileLocation) => {
    if (FileLocation) {
        return new Promise(resolve => {
            fs.readFile(FileLocation, "utf8", (err, jsonString) => {
                if (err) {
                    console.log("File read failed:", err);
                    return resolve(0);
                }
                return resolve(jsonString);
            })
        });
    }
    return 0;
}

Commom.GenerateExcel = async (Data, FileName = "Excel") => {
    // console.log(Data)
    // Create a new instance of a Workbook class
    var wb = new xl.Workbook();
    // Add Worksheets to the workbook
    var ws = wb.addWorksheet(FileName);
    // Create a reusable style
    var style2 = wb.createStyle({
        font: {
            color: 'black',
            size: 12,
            bold: true,
            bgcolor: "yellow"
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -',
    });

    var style = wb.createStyle({
        font: {
            color: 'black',
            size: 12,
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -',
    });

    var i = 2;
    for (const [tableKay, item2] of Object.entries(Data)) {
        console.log(tableKay + '------------');
        let item = JSON.parse(JSON.stringify(item2, function (key, value) {
            return (typeof value === 'number') ? value.toString() : (value == '') ? "-" : (value == 'null') ? "-" : (value == 'undefined') ? "-" : (value == undefined) ? "-" : (value == null) ? "-" : value;
        }));
        let k2 = 1;
        for (const [key, value] of Object.entries(Object.keys(item))) {
            if (tableKay == 0) ws.cell(1, k2).string(_.startCase(value)).style(style2); // Heading
            ws.cell(i, k2).string(item[value]).style(style); // Content
            k2++;
        } i++;
    };
    let FileResponse = await new Promise(resolve => {
        wb.writeToBuffer().then(function (buffer) {
            try {
                const params = {
                    Bucket: "ocxeeadmin",
                    Key: '/report/' + FileName + '-' + moment().format('DDMMYYYYHHmmssms') + '-' + uuidv4() + '.xlsx', // File name you want to save as in S3
                    Body: buffer,
                    ContentType: '.xlsx',
                    ACL: 'public-read'
                };

                s3bucket.upload(params, function (err, data) {
                    if (err) {
                        return resolve(err);
                    } else {
                        return resolve(data.Location);
                    }
                });
            } catch (error) {
                console.log(error);
                return resolve(error);
            }
        });
        // wb.write('./report/'+FileName+'.xlsx', function(err, res) {
        //     if (err) {
        //           console.error('err');  
        //           console.error(err);
        //         } else {
        //                 console.error('success');  
        //                 // console.log(res); // Prints out an instance of a node.js fs.Stats object
        //             return resolve(res);
        //     }
        // });
    });
    return FileResponse;
}

Commom.Ac_Wallet_Transaction_Entry = async (user_data) => {
    try {
        if (parseInt(user_data.LedgerID) > 0 && user_data.OrderID > 0) {
            let LedgerEntry = {
                'OrderID': user_data.OrderID,
                'OrderTypeID': user_data.OrderTypeID,
                'EntryDate': moment().format('YYYY-MM-DD'),
                'EntryDateTime': moment().format('YYYY-MM-DD HH:mm:ss'),
                'narretion': user_data.narretion
            }
            LedgerEntry['LedgerID'] = user_data.LedgerID;
            LedgerEntry['RefLedgerID'] = '1';
            LedgerEntry['Debitamount'] = '0';
            LedgerEntry['CreditAmount'] = user_data.Amount;
            LedgerEntry['Balance'] = 0;
            await SqlHelper.insert('Ac_Wallet_Transaction', LedgerEntry, async (err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Wallet First Trasection success " + res.insertId);
                    try {
                        var ActivityArray = {
                            StudentID: '0',
                            ChannelPartnerID: user_data.LedgerID,
                            Message: "Commssion Credit for " + user_data.narretion,
                            Process: 'CommissionGet',
                            ProcessType: '4',
                            ProcessID: user_data.OrderID,
                            ProcessSlug: 'orderlist',
                        }
                        // console.log(ActivityArray);
                        await Commom.SaveNotificationLog(ActivityArray, request);
                    } catch (error) {
                        console.log("Notification not inert -----");
                    }
                    return res.insertId;
                }
            });
            // Reverse Entry
            LedgerEntry['LedgerID'] = '1';
            LedgerEntry['RefLedgerID'] = user_data.LedgerID;
            LedgerEntry['Debitamount'] = user_data.Amount;
            LedgerEntry['CreditAmount'] = '0';
            LedgerEntry['Balance'] = 0;
            await SqlHelper.insert('Ac_Wallet_Transaction', LedgerEntry, (err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Wallet Ocxee Trasection success " + res.insertId);
                    return res.insertId;
                }
            });
            // let OcxeeFinalBalance = await Commom.BalanceCalculation('1');
            // console.log("Ocxee Final Balance "+ OcxeeFinalBalance);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(error);
        return 0;
    }
};

Commom.Ac_Wallet_Reverse_Transaction_Entry = async (user_data) => {
    try {
        if (parseInt(user_data.LedgerID) > 0 && user_data.OrderID > 0) {
            let LedgerEntry = {
                'OrderID': user_data.OrderID,
                'OrderTypeID': user_data.OrderTypeID,
                'EntryDate': moment().format('YYYY-MM-DD'),
                'EntryDateTime': moment().format('YYYY-MM-DD HH:mm:ss'),
                'narretion': user_data.narretion
            }
            LedgerEntry['LedgerID'] = '1';
            LedgerEntry['RefLedgerID'] = user_data.LedgerID;
            LedgerEntry['Debitamount'] = '0';
            LedgerEntry['CreditAmount'] = user_data.Amount;
            LedgerEntry['Balance'] = 0;
            await SqlHelper.insert('Ac_Wallet_Transaction', LedgerEntry, async (err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Wallet First Trasection success " + res.insertId);
                    try {
                        var ActivityArray = {
                            StudentID: '0',
                            ChannelPartnerID: user_data.LedgerID,
                            Message: "Commssion Credit for " + user_data.narretion,
                            Process: 'CommissionGet',
                            ProcessType: '4',
                            ProcessID: user_data.OrderID,
                            ProcessSlug: 'orderlist',
                        }
                        console.log(ActivityArray);
                        await Commom.SaveNotificationLog(ActivityArray, request);
                    } catch (error) {
                        console.log("Notification not inert -----");
                    }
                    return res.insertId;
                }
            });
            // Reverse Entry
            LedgerEntry['LedgerID'] = user_data.LedgerID;
            LedgerEntry['RefLedgerID'] = '1';
            LedgerEntry['Debitamount'] = user_data.Amount;
            LedgerEntry['CreditAmount'] = '0';
            LedgerEntry['Balance'] = 0;
            await SqlHelper.insert('Ac_Wallet_Transaction', LedgerEntry, (err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Wallet Ocxee Trasection success " + res.insertId);
                    return res.insertId;
                }
            });
            // let OcxeeFinalBalance = await Commom.BalanceCalculation('1');
            // console.log("Ocxee Final Balance "+ OcxeeFinalBalance);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(error);
        return 0;
    }
};

Commom.GetLedgerID = async (ID, type = '1') => {
    let TableName = 'ChannelPartner';
    let where = 'AND ChannelPartnerID=?';
    let query = `SELECT LedgerID FROM ` + TableName + ` WHERE Active="1" ` + where + ` LIMIT 1`;
    let data = await SqlHelper.select(query, [ID], (err, res) => {
        if (err || _.isEmpty(res)) {
            return {};
        } else {
            return json_response(res[0].LedgerID);
        }
    });
    return data;
};

Commom.BalanceCalculation = async (ledgerID) => {
    var v_counter = 0;
    var lastBalance = 0;
    var CountLeftEntries = 0;
    if (ledgerID) {
        let lastBalance_query = 'SELECT Balance FROM Ac_Wallet_Transaction WHERE LedgerID=? order by FasID desc LIMIT 1';
        lastEntryBalance = await SqlHelper.select(lastBalance_query, [ledgerID], (err, res) => {
            if (err) {
                return 0;
            } else if (_.isEmpty(res)) {
                return 0;
            } else {
                return res[0]['Balance'];
            }
        });

        if (lastEntryBalance > 0) {
            return lastEntryBalance;
        }

        fs_query = 'SELECT round((IfNUll(CreditAmount,0)-IFnull(Debitamount,0)),2) as amount,FasId FROM Ac_Wallet_Transaction WHERE LedgerID=? AND Balance="" ';
        CountLeftEntries = await SqlHelper.select(fs_query, [ledgerID], (err, res) => {
            if (err) {
                console.log(err);
                return 0;
            } else if (_.isEmpty(res)) {
                return 0;
            } else {
                return res;
            }
        });

        lastBalance_query = 'SELECT Balance FROM Ac_Wallet_Transaction WHERE LedgerID=? AND Balance!="" order by FasId desc limit 1';
        lastBalance = await SqlHelper.select(lastBalance_query, [ledgerID], (err, res) => {
            if (err) {
                console.log(err);
                return 0;
            } else if (_.isEmpty(res)) {
                return 0;
            } else {
                return res[0]['Balance'];
            }
        });

        let counter = _.size(CountLeftEntries);
        let i = 0;
        if (counter > 0) {
            // CountLeftEntries.forEach(async function (data) {
            //     lastBalance = parseFloat(lastBalance) + parseFloat(data.amount);
            //     await SqlHelper.update('Ac_Wallet_Transaction', {'Balance':Math.round(lastBalance, 2).toFixed(2)},
            //             {'FasId' : data.FasId}, (err, res) => {
            //         });
            //     i++;
            //     console.log(lastBalance);
            // });
            for (let index = 0; index < CountLeftEntries.length; index++) {
                const data = CountLeftEntries[index];
                lastBalance = parseFloat(lastBalance) + parseFloat(data.amount);
                await SqlHelper.update('Ac_Wallet_Transaction', { 'Balance': Math.round(lastBalance, 2).toFixed(2) },
                    { 'FasId': data.FasId }, (err, res) => {
                    });
                i++;
                console.log(lastBalance);
            }
        }
        // while (v_counter < CountLeftEntries) {
        //     query = 'SELECT round((CreditAmount-Debitamount),2) AS amount, FasId FROM Ac_Wallet_Transaction WHERE LedgerID=? and Balance="" order by FasId asc LIMIT 1';
        //     amountsData  = await SqlHelper.select(query,[ledgerID], (err, res) => {
        //         if(err) console.log(err);
        //         return json_response(res)[0];
        //     });
        //     lastBalance = Math.round(lastBalance, 2) + Math.round(amountsData['amount'], 2);
        //     console.log("be lastBalance ---> "+ lastBalance);
        //     await SqlHelper.update('Ac_Wallet_Transaction', {'Balance':Math.round(lastBalance, 2).toFixed(2)},
        //         {'FasId' : amountsData['FasId']}, (err, res) => {
        //     });
        //     v_counter++;
        // }
        console.log('Final lastbalance');
        console.log(lastBalance);
        return lastBalance;
    }
    return '0';
}

Commom.GetSettingValue = async (settingKey = '') => {
    setting_query = 'SELECT settingTitle, settingKey, settingValue FROM Mst_Setting WHERE settingKey="' + settingKey + '" AND Active="1" LIMIT 1';
    setting_data = await SqlHelper.select(setting_query, [], (err, res) => {
        if (err) {
            console.log(err);
            return 0;
        } else if (_.isEmpty(res)) {
            // console.log(res);
            return 0;
        } else {
            // console.log(res);
            return json_response(res[0]['settingValue']);
        }
    });

    return setting_data;
};

Commom.generateInquiryNo = async (IsType = '0', ServiceID = '0') => {
    let PrefixKey = '';
    let last_InquiryNo = '';
    if (IsType == '0') {
        switch (ServiceID) {
            case '1': PrefixKey = 'INS';
                break;
            case '2': PrefixKey = 'APT';
                break;
            case '3': PrefixKey = 'FRX';
                break;
            case '4': PrefixKey = 'TAS';
                break;
            case '5': PrefixKey = 'SIM';
                break;
            case '6': PrefixKey = 'MNY';
                break;
            case '8': PrefixKey = 'ACM';
                break;
            case '9': PrefixKey = 'VIS';
                break;
            case '10': PrefixKey = 'EDU';
                break;
            case '11': PrefixKey = 'ESS';
                break;
            case '12': PrefixKey = 'JOB';
                break;
            case '13': PrefixKey = 'FRN';
                break;
            default: PrefixKey = 'NOT';
                break;
        }

        last_InquiryNo = await SqlHelper.select('SELECT InquiryNo FROM Student_Inquiry WHERE ServiceID=? AND InquiryNo!="" ORDER BY InquiryID DESC', [ServiceID], (err, res) => {
            if (res.length > 0 && res[0]['InquiryNo'] != '') {
                return res[0]['InquiryNo'].trim();
            }
            return "";
        });
    } else if (IsType == '1') {
        PrefixKey = 'ACC';

        last_InquiryNo = await SqlHelper.select('SELECT BookingNo FROM Accommodation_BookingRequest WHERE BookingNo!="" ORDER BY BookingID DESC', [], (err, res) => {
            if (res.length > 0 && res[0]['BookingNo'] != '') {
                return res[0]['BookingNo'].trim();
            }
            return "";
        });
    }

    let new_InquiryNo = PrefixKey + moment().format('YYYYMMDD') + '00001';
    if (last_InquiryNo != '') {
        let new_date = PrefixKey + moment().format('YYYYMMDD');
        let old_date = last_InquiryNo.substr(0, 11);
        let old_sr_no = last_InquiryNo.substr(11);
        if (new_date == old_date) {
            let new_sr_no = (parseInt(old_sr_no) + 1).toString();
            if (new_sr_no.length == 1)
                new_sr_no = '0000' + new_sr_no;
            else if (new_sr_no.length == 2)
                new_sr_no = '000' + new_sr_no;
            else if (new_sr_no.length == 3)
                new_sr_no = '00' + new_sr_no;
            else if (new_sr_no.length == 4)
                new_sr_no = '0' + new_sr_no;

            new_InquiryNo = old_date + new_sr_no;
        }
    }
    return new_InquiryNo;
}

Commom.SaveNotificationLog = async (Data, request) => {
    Data['EntryBy'] = request.UserID || 0;
    Data['EntryDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
    Data['EntryIP'] = request.IpAddress || "";
    //console.log(Data)
    return await SqlHelper.insert('Mst_Notification', Data, (err, res) => {
        if (err) {
            console.log(err);
            return 0;
        } else {
            console.log("Sucess fully entry notification " + res.insertId);
            return res.insertId;
        }
    });
}

Commom.GetNotificationMessage = (Key) => {

    let Message = {
        'BookingStatusUpdate': 'Dear user, your student {{ServiceName}} booking status has been changed. Please check the details.',
        'InquiryStatusUpdate': "Dear user, your student {{ServiceName}} inquiry status has been changed. Please check the details.",
        'WithdrawalStatus': 'Dear user, your request for withdrawing amount has been {{Status}}.'
    }
    return Message[Key];
}

Commom.GetAccCommissionAmount = async (Data = { 'Country': '', 'City': '' }) => {
    let AmpuntData = { 'Min': 0, 'Max': 0 };
    // setting_query = 'SELECT * FROM Accommodation_commission WHERE "' + week + '" BETWEEN FromWeek AND ToWeek AND Active="1" LIMIT 1';
    setting_query = `SELECT * FROM Accommodation_City_Commission as act 
    left join Mst_Country as mc on act.CountryID = mc.CountryID
    left join Mst_City as mcity on act.CityID = mcity.CityID 
    WHERE mc.CountryName = ? AND mcity.CityName = ? AND act.Active = "1" LIMIT 1`;
    // console.log(setting_query);
    // console.log(Data.Country.trim());
    // console.log(Data.City.trim());
    setting_data = await SqlHelper.select(setting_query, [Data.Country.trim(), Data.City.trim()], (err, res) => {
        if (err) {
            console.log(err);
            return AmpuntData;
        } else if (_.isEmpty(res)) {
            console.log(res);
            return AmpuntData;
        } else {
            console.log(`${res[0]['CpMin']} - ${res[0]['CpMax']}`);
            AmpuntData['Min'] = res[0]['CpMin'];
            AmpuntData['Max'] = res[0]['CpMax'];
            return json_response(AmpuntData);
        }
    });
    return setting_data;
};

Commom.CreateSubDomain = async (subDomainName, Action = "CREATE") => {
    var AWS = require('aws-sdk')
    var route53 = new AWS.Route53({
        accessKeyId: process.env.ROUTE53_ACCESS_KEY,
        secretAccessKey: process.env.ROUTE53_SECRET_KEY, region: "eu-west-2"
    });
    var params = {
        ChangeBatch: {
            Changes: [{
                Action: Action,
                ResourceRecordSet: {
                    AliasTarget: {
                        DNSName: "ocxeednk-1909592145.eu-west-2.elb.amazonaws.com",
                        EvaluateTargetHealth: false,
                        HostedZoneId: "ZHURV8PSTC4K8"
                    },
                    Name: subDomainName + '.ocxee.com',
                    Type: "A"
                }
            }],
            Comment: "Testing subdomain creation"
        },
        HostedZoneId: "Z00589833EMG1D1WTZDH5"// Depends on the type of resource that you want to route traffic to
    };
    let Data = { 'Apistatus': '0' };
    try {
        Data = await route53.changeResourceRecordSets(params).promise();
        Data['ChangeInfo']['Apistatus'] = '1';
    } catch (error) {
        Data = error;
        Data['Apistatus'] = '0';
    }
    return Data;
}

Commom.ReferralStudentCalculation = async (ID) => {
    let TableName = 'Student';
    let where = 'AND ChannelPartnerID=?';
    let query = `SELECT Count(StudentID) as total_student FROM ` + TableName + ` WHERE Active="1" ` + where + ` LIMIT 1`;
    let data = await SqlHelper.select(query, [ID], (err, res) => {
        if (err || _.isEmpty(res)) {
            return {};
        } else {
            return json_response(res[0].total_student);
        }
    });
    return data;
};

Commom.GetCommissionCategory = async (student) => {
    let query = 'SELECT CP_Category_Id,Commission_Per_Student,Cash_Incentive,Min_Student,Commission_Per_services FROM CP_Category WHERE Is_Active="1" AND Min_Student<=' + student + ' AND (CASE WHEN Max_Student>0 THEN Max_Student>=' + student + '  ELSE 1=1 END )   LIMIT 1';
    let data = await SqlHelper.select(query, [], (err, res) => {
        if (err || _.isEmpty(res)) {
            let tmpres = {
                'CP_Category_Id': 0,
                'Commission_Per_Student': 0,
                'Cash_Incentive': 0,
                'Min_Student': 0,
                'Commission_Per_services': 0
            };
            return tmpres;
        } else {
            return json_response(res[0]);
        }
    });
    return data;
};

Commom.getTotalInquiryOrder = async (studentID) => {
    let query = 'SELECT Count(OrderID) as totalInquiryOrder FROM User_Order WHERE ReferID=' + studentID + ' AND OrderTypeID=3 AND Status in (1,2)  LIMIT 1';
    let data = await SqlHelper.select(query, [], (err, res) => {
        if (err || _.isEmpty(res)) {
            return 0;
        } else {
            return json_response(res[0].totalInquiryOrder);
        }
    });
    return data;
};
Commom.SendGridMail = (MailData) => {
    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    console.log(MailData)
    MailData.StudentList.forEach(emailid => {
        const msg = {
            to: emailid, // Change to your recipient
            from: 'info@Ocxee.com', // Change to your verified sender
            subject: MailData.Subject,
            text: 'and easy to do anywhere, even with Node.js',
            html: MailData.Body,
            attachments: MailData.attachments != undefined ? [MailData.attachments] : []
        }
        sgMail
            .send(msg)
            .then(() => {
                // console.log('Email sent')
                return 1
            })
            .catch((error) => {
                console.error(error)
            })
    });


};


Commom.GetAllCampaigns = (MailData) => {
    const client = require('@sendgrid/client');
    client.setApiKey(process.env.SENDGRID_API_KEY);

    const headers = {
        "on-behalf-of": "The subuser's username. This header generates the API call as if the subuser account was making the call."
    };
    const queryParams = {
        "limit": 10
    };
    const request = {
        url: `/v3/campaigns`,
        method: 'GET',
        headers: headers,
        qs: queryParams
    }

    client.request(request)
        .then(([response, body]) => {
            console.log(response.statusCode);
            console.log(JSON.stringify(response.body));
        })
        .catch(error => {
            console.error(error);
        });
}
module.exports = Commom;