const ErrorCode = {
    Error: '0',
    Success: '1',
    Logout: '2',
    Invaiddata: '3',
    Fieldmiss: '4',
    AlreadyExist: '5',  // For Mobile Already exist OTP
    VersionUpdate: '6'
}
const AlertTypeCode = {
    Noalert: '0',
    Toaster: '1',
    Popup: '2'
}
const ResponseMsg = {
    Text: "ZMessage",
    Data: "Data",
}
const AWSs3Key = {
    AccessKeyID: "AKIAQVH2VVIVZSPDAVNO",
    SecretAccessKey: "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",

    // folder name of s3 bucket 
    ProfilePhoto: "ProfilePhoto",
    UploadDocument: "UploadDocument",
    StudentDocument: "StudentDocument",
    NearUtilityImage: "NearUtilityImage",
    Accommodation: "Accommodation",
    AccommodationRoom: "AccommodationRoom",
    CPCImage: "CPCImage",
    CPPImage: "CPPImage",
    PoCountrys: "PoCountrys",
    PoCitys: "PoCitys",
    Mst_Services :'Mst_Services',
    
    News :'News',
    Blogs :'Blogs',
    LandLord: 'LandLord',
    Testimonial: 'Testimonial',
}
const FCM = {
    ServerKey: 'AAAAHm9bNiw:APA91bGJv8_zXlJUzcky4QqwedL6qKBzEeY6x3n7ZZhd-vdBpwyogJAzAb-BAUk8M_mLwrx0C4NP9wJQqK3zQaEsJMx_ZbY6Cko9CggIMV_BubWdTbJCcwCDexR3EljKmjZQhKl6If8q'
}
const EmailConfig = {
    CcAddresses: "hasmukh@dnktechnologies.com"
}

module.exports.ResponseText = function(errorcode, alertcode, message ,Status = '0') {
    return JSON.parse('{ "ErrorCode": "' + errorcode + '", "ErrorMessage": "' + message + '", "AlertTypeCode": "' + alertcode + '" ,"status": "' + Status + '" }');
}

const S3Location = 'https://ocxeeadmin.s3.eu-west-2.amazonaws.com/';
const DefaultImage = {
    NotImageFound: S3Location+'DefaultImage/no_img_found.png',
    NotVideoFound: S3Location+'DefaultImage/no_video_found.png',
    NotDataFound: S3Location+'DefaultImage/no_data_found.png',
}

const STUDENT_PANEL_LINK = 'https://www.ocxee.com/';

// module.exports.ResponseText = function(errorcode, alertcode, message) {
//     return JSON.parse('{ "ErrorCode": "' + errorcode + '", "ErrorMessage": "' + message + '", "AlertTypeCode": "' + alertcode + '" }');
// }
module.exports.ErrorCode = ErrorCode;
module.exports.AlertTypeCode = AlertTypeCode;
module.exports.ResponseMsg = ResponseMsg;
module.exports.AWSs3Key = AWSs3Key;
module.exports.FCM = FCM;
module.exports.EmailConfig = EmailConfig;
module.exports.S3Location = S3Location;
module.exports.DefaultImage = DefaultImage;
module.exports.STUDENT_PANEL_LINK = STUDENT_PANEL_LINK;