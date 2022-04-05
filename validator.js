const { check, validationResult } = require('express-validator');
const Code = require("../config/responseMsg")
const Commom = require("../CommonMethod/CommonFunction");

const InvalidParameter = function (errors) {
    var returnStr = "";
    errors.forEach(element => {
        returnStr = returnStr == "" ? element.param + ": " + element.msg : returnStr + ", " + element.param + ": " + element.msg;
    });
    return returnStr;
}

exports.ApiAuthentication = [
    check('Token', 'Token is required').trim().notEmpty(),
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('Source', 'Source is required').trim().notEmpty(),
    async (req, res, next) => {
        // req.body = JSON.parse(Commom.decrypt(req.body));
        req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        let TokenData = await Commom.CheckValidToken(req.body);
        if (TokenData.status == '1') {
            return next();
        }
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Logout, Code.AlertTypeCode.Popup, TokenData.message, TokenData.status), "Data": [] });
    },
]

exports.StudentList = [
    check('page', 'Pagenumber is required').notEmpty(),
    check('limit', 'Limit is required').notEmpty(),
    check('UserId', 'UserId is required').notEmpty(),
    // check('PageNo', 'PageNo is required').trim().notEmpty(),
    // check('Limit', 'Limit is required').trim().notEmpty(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.StudentList2 = [
    // check('page', 'Pagenumber is required').notEmpty(), 
    //                    check('limit', 'Limit is required').notEmpty(),
    //                    check('UserId', 'UserId is required').notEmpty(),
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),


    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.SelectMenu = [check('ParameterTypeID', 'ParameterTypeID is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]


exports.StudentDetail = [check('StudentID', 'StudentID is required').notEmpty(),
check('UserId', 'UserId is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.UpdatePersonalDetail = [check('FirstName', 'FirstName is required').notEmpty(),
// check('MiddleName', 'MiddleName is required').notEmpty(),
check('LastName', 'LastName is required').notEmpty(),
check('email', 'email is required').notEmpty(),
check('PhoneNo_CountryCode', 'PhoneNo_CountryCode is required').notEmpty(),
check('PhoneNo', 'PhoneNo_CountryCode is required').notEmpty(),
check('UserId', 'UserId is required').notEmpty(),

(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.DeletePersonalDetail = [check('StudentID', 'StudentID is required').notEmpty(),
check('UserId', 'UserId is required').notEmpty(),

(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.UpdateFamilyDetail = [check('StudentID', 'StudentID is required').notEmpty(),
check('UserId', 'UserId is required').notEmpty(),
check('RelationShip', 'RelationShip is required').notEmpty(),
check('Name', 'Name is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.DeleteFamilyDetail = [check('FamilyID', 'FamilyID is required').notEmpty(),
check('UserId', 'UserId is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.UpdateEducationDetail = [check('StudentID', 'StudentID is required').notEmpty(),
check('LevelOfEdcuation', 'LevelOfEdcuation is required').notEmpty(),
check('InstituteName', 'InstituteName is required').notEmpty(),
check('EducationFrom', 'EducationFrom is required').notEmpty(),
check('EdcuationTo', 'EdcuationTo is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.DeleteEducationDetail = [check('UserId', 'UserId is required').notEmpty(),
check('EducationID', 'EducationID is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.UpdateWorkDetail = [check('CompanyName', 'CompanyName is required').notEmpty(),
check('JobTitle', 'JobTitle is required').notEmpty(),
check('WorkFrom', 'WorkFrom is required').notEmpty(),
check('WorkTo', 'WorkTo is required').notEmpty(),
check('UserId', 'UserId is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.DeleteWorkDetail = [check('UserId', 'UserId is required').notEmpty(),
check('WorkID', 'WorkID is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.UpdateTestDetail = [check('Type', 'Type is required').notEmpty(),
check('ExamDate', 'ExamDate is required').notEmpty(),
check('Listening', 'Listening is required').notEmpty(),
check('Reading', 'Reading is required').notEmpty(),
check('Writing', 'Writing is required').notEmpty(),
check('Speaking', 'Speaking is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.DeleteTestDetail = [check('UserId', 'UserId is required').notEmpty(),
check('TestID', 'TestID is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.UpdateQualificationDetail = [check('ExamType', 'ExamType is required').notEmpty(),
check('ExamDate', 'ExamDate is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.DeleteQualificationDetail = [check('UserId', 'UserId is required').notEmpty(),
check('QualificationID', 'QualificationID is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.UpdatePhysicalDisabilitiesDetail = [check('Type', 'Type is required').notEmpty(),
check('Percentage', 'Percentage is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.DeletePhysicalDisabilitiesDetail = [check('UserId', 'UserId is required').notEmpty(),
check('ID', 'ID is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.UpdatePassportDetail = [check('StudentID', 'StudentID is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.UpdateBackgroundinfoDetail = [check('StudentID', 'StudentID is required').notEmpty(),
check('InfoId', 'InfoId is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]


exports.UpdateDocumentDetail = [check('Type', 'Type is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.StudentBookingRquest1 = [check('RefID', 'RefID is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.DeleteDocumentDetail = [check('UserId', 'UserId is required').notEmpty(),
check('DocumentID', 'DocumentID is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.customer = [check('email', 'username is required').notEmpty(), check('password', 'username is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.UpdateMappingPartner = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),
    check('StudentID', 'StudentID is required').notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(422).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]


exports.Validate_MobileNumberVerification = [check('mobileno', 'Mobile Number is required').notEmpty(), check('source', 'Source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_SignUp = [check('firstname', 'firstname is required').notEmpty(), check('gender', 'gender is required').notEmpty(), check('mobileno', 'mobileno is required').notEmpty(), check('password', 'password is required').notEmpty(), check('email', 'email is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_UserLogin = [check('username', 'username is required').notEmpty(), check('password', 'password is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_GetMedicalCondition_Activity = [check('source', 'source is required').notEmpty(), check('userid', 'userid is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_AddMedicalInsurance = [check('userid', 'userid is required').notEmpty(), check('policyname', 'policyname is required').notEmpty(), check('companyname', 'companyname is required').notEmpty(), check('policyno', 'policyno is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_AddEmergenyContact = [check('firstname', 'firstname is required').notEmpty(), check('contactno', 'contactno is required').notEmpty(), check('relationship', 'relationship is required').notEmpty(), check('source', 'source is required').notEmpty(), check('userid', 'userid is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_AddUserFamily = [check('name', 'name is required').notEmpty(), check('contactno', 'contactno is required').notEmpty(), check('relationship', 'relationship is required').notEmpty(), check('source', 'source is required').notEmpty(), check('userid', 'userid is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_GetMedicalInsurance = [check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_GetEmergenyContact = [check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_GetUserFamily = [check('source', 'source is required').notEmpty(), check('userid', 'userid is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_DoctorMobileSmartSearch = [check('mobileno', 'mobileno is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_AddFamilyDoctor = [check('doctorname', 'doctorname is required').notEmpty(), check('contactno', 'contactno is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_UserUploadDocument = [check('documentname', 'documentname is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_AddUserMedicalHistory = [check('diseasetypeid', 'diseasetype is required').notEmpty(), check('disease', 'disease is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_GetUserMedicalHistory = [check('source', 'source is required').notEmpty(), check('userid', 'userid is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]


exports.Validate_UserProfileUpdate = [check('firstname', 'firstname is required').notEmpty(), check('gender', 'gender is required').notEmpty(), check('mobileno', 'mobileno is required').notEmpty(), check('email', 'email is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_GetFamilyDoctorList = [check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(), check('version', 'version is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_PartnerSignUp = [check('firstname', 'firstname is required').notEmpty(), check('gender', 'gender is required').notEmpty(), check('mobileno', 'mobileno is required').notEmpty(), check('password', 'password is required').notEmpty(), check('email', 'email is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_DoctorProfileUpdate = [check('firstname', 'firstname is required').notEmpty(), check('gender', 'gender is required').notEmpty(), check('mobileno', 'mobileno is required').notEmpty(), check('email', 'email is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_AddGalleryPhotos = [check('userid', 'userid is required').notEmpty(), check('title', 'title is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_GetGalleryPhotosList = [check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_AddPartnerAchivement = [check('userid', 'userid is required').notEmpty(), check('title', 'title is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_GetPartnerAchivementList = [check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_DeleteUserFamily = [check('familyid', 'familyid is required').notEmpty(), check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_DeleteFamilyDoctor = [check('doctorid', 'doctorid is required').notEmpty(), check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_DeleteEmergenyContact = [check('emergencyid', 'emergencyid is required').notEmpty(), check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_DeleteMedicalInsurance = [check('insuranceid', 'insuranceid is required').notEmpty(), check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_UserDocumentList = [check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_DeleteUserDocument = [check('documentid', 'documentid is required').notEmpty(), check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_ChangePassword = [check('newpassword', 'newpassword is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_AddPartnerService = [check('userid', 'userid is required').notEmpty(), check('title', 'title is required').notEmpty(), check('discount', 'discount is required').notEmpty(), check('status', 'status is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_GetPartnerServiceList = [check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_DeleteGalleryPhotos = [check('gallerydetailid', 'gallerydetailid is required').notEmpty(), check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_DeletePartnerAchivement = [check('achivementid', 'achivementid is required').notEmpty(), check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_DeletePartnerService = [check('serviceid', 'serviceid is required').notEmpty(), check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_AddClinicTiming = [check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_GetClinicTimingList = [check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_AddTestPrice = [check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(), check('reportid', 'reportid is required').notEmpty(), check('price', 'price is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_GetTestPriceList = [check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_DeleteTestPrice = [check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(), check('priceid', 'priceid is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_DeleteUserMedicalHistory = [check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(), check('medicalhisid', 'medicalhisid is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_AddPartnerSubuser = [check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(), check('area', 'area is required').notEmpty(), check('email', 'email is required').notEmpty(), check('password', 'password is required').notEmpty(), check('firstname', 'firstname is required').notEmpty(), check('lastname', 'lastname is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_GetPartnerSubuserList = [check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_DeletePartnerSubuser = [check('subuserid', 'subuserid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_GetUserByMeditagID = [check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(), check('mobileno', 'mobileno is required').notEmpty(), check('parentid', 'parentid is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_AddAppointmentByDoctor = [check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(), check('doctorid', 'doctorid is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_AddAppointmentBySubUser = [check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(), check('parentid', 'parentid is required').notEmpty(), check('loginuserid', 'loginuserid is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_AddPrescription = [check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(), check('appointmentid', 'appointmentid is required').notEmpty(), check('doctorid', 'doctorid is required').notEmpty(),
check('description', 'description is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]
exports.Validate_AttendAppointment = [check('source', 'source is required').notEmpty(), check('doctorid', 'doctorid is required').notEmpty(), check('appointmentid', 'appointmentid is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]
exports.Validate_ReferByLabDoctor = [check('referfromid', 'referfromid is required').notEmpty(), check('refertoid', 'refertoid is required').notEmpty(), check('userid', 'userid is required').notEmpty(), check('refertype', 'refertype is required').notEmpty(), check('source', 'source is required').notEmpty(), check('appointmentid', 'appointmentid is required').notEmpty(),
check('description', 'description is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]
exports.Validate_ReferByLabDoctorReplayList = [check('refertoid', 'refertoid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]
exports.Validate_ReferByLabDoctorList = [check('referfromid', 'referfromid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]
exports.Validate_ReferReplaySave = [check('appointmentid', 'appointmentid is required').notEmpty(),
check('appreferid', 'appreferid is required').notEmpty(),
check('refermsg', 'refermsg is required').notEmpty(),
check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]
exports.Validate_GetDoctorDashboard = [check('doctorid', 'doctorid is required').notEmpty(),
check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]
exports.Validate_GetReferLabList = [check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]
exports.Validate_GetReferDoctorList = [check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_GetConnectionList = [check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_GetFollowerList = [check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_GetUserDetails = [check('userid', 'userid is required').notEmpty(), check('doctorid', 'doctorid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]
exports.Validate_Notification = [check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_ContactSync = [check('userid', 'userid is required').notEmpty(), check('source', 'source is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_AddInquiry = [check('name', 'name is required').notEmpty(), check('email', 'email is required').notEmpty(), check('subject', 'subject is required').notEmpty(), check('message', 'message is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]


exports.Validate_AddUserTimeLinePermission = [check('userid', 'userid is required').notEmpty(), check('doctorid', 'doctorid is required').notEmpty(), check('permissiontimeid', 'permissiontimeid is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_GetUserTimeLinePermissionList = [check('userid', 'userid is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_DeleteUserTimeLinePermission = [check('permissionid', 'permissionid is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_AddUserActivity = [check('userid', 'userid is required').notEmpty(), check('activitydate', 'activitydate is required').notEmpty(), check('activitytime', 'activitytime is required').notEmpty(), check('activitytype', 'activitytype is required').notEmpty(), check('value', 'value is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_DeleteUserActivity = [check('activityid', 'activityid is required').notEmpty(), check('userid', 'userid is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

exports.Validate_GetUserActivityList = [check('userid', 'userid is required').notEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorStr = InvalidParameter(errors.array());
        return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
    }
    next();
},
]

// start accommodation api
exports.GetAccommodationList = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.Send_AccEmail = [
    check('AccommodationID', 'AccommodationID is required').trim().notEmpty(),
    check('TemplateName', 'TemplateName is required').trim().notEmpty(),
    check('ToEmail', 'ToEmail is required').trim().notEmpty(),
    check('TemplateBody', 'TemplateBody is required').trim().notEmpty(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.Get_Accommodation = [
    check('AccommodationID', 'AccommodationID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.AddAccommodation = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    //check('AccommodationID', 'AccommodationID is required').trim().notEmpty(),
    // check('AccommodationName', 'AccommodationName is required').trim().notEmpty(),
    check('AddressLine1', 'AddressLine1 is required').trim().notEmpty(),
    check('Latitude', 'Latitude is required').trim().notEmpty(),
    check('Longitude', 'Longitude is required').trim().notEmpty(),
    check('CountryId', 'CountryId is required').trim().notEmpty(),
    check('StateId', 'StateId is required').trim().notEmpty(),
    check('CityId', 'CityId is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.GetAccommodationDetails = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('AccommodationID', 'AccommodationID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddFeature = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('AccommodationID', 'AccommodationID is required').trim().notEmpty(),
    check('feature_data', 'feature_data is required').notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddContact = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('AccommodationID', 'AccommodationID is required').trim().notEmpty(),
    //check('AccContactID', 'AccContactID is required').trim().notEmpty(),
    check('Name', 'Name is required').trim().notEmpty(),
    check('PhoneNo', 'PhoneNo is required').trim().notEmpty(),
    check('Email', 'Email is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteContact = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('AccContactID', 'AccContactID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddOffer = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('AccommodationID', 'AccommodationID is required').trim().notEmpty(),
    //check('AccOfferID', 'AccOfferID is required').trim().notEmpty(),
    check('OfferTitle', 'OfferTitle is required').trim().notEmpty(),
    check('Description', 'Description is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteOffer = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('AccOfferID', 'AccOfferID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddFAQ = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('AccommodationID', 'AccommodationID is required').trim().notEmpty(),
    //check('AccFAQID', 'AccFAQID is required').trim().notEmpty(),
    check('Question', 'Question is required').trim().notEmpty(),
    check('Answer', 'Answer is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteFAQ = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('AccFAQID', 'AccFAQID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddRule = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('AccommodationID', 'AccommodationID is required').trim().notEmpty(),
    //check('AccRulesID', 'AccRulesID is required').trim().notEmpty(),
    check('Rules', 'Rules is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteRule = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('AccRulesID', 'AccRulesID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddCategoryRoom = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('AccRoomCategoryID', 'AccRoomCategoryID is required').trim().notEmpty(),
    check('AccommodationID', 'AccommodationID is required').trim().notEmpty(),
    check('RoomCategory', 'RoomCategory is required').trim().notEmpty(),
    check('RentTypeID', 'RentTypeID is required').trim().notEmpty(),
    // check('ShortDescription', 'ShortDescription is required').trim().notEmpty(),
    check('CurrencyID', 'CurrencyID is required').trim().notEmpty(),
    check('TotalRooms', 'TotalRooms is required').trim().notEmpty(),
    check('TotalBeds', 'TotalBeds is required').trim().notEmpty(),
    check('DeposoitAmount', 'DeposoitAmount is required').trim().notEmpty(),
    check('rent_data', 'rent_data is required').notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteCategoryRoom = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('AccRoomCategoryID', 'AccRoomCategoryID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddCategoryRoomFeature = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('AccRoomCategoryID', 'AccRoomCategoryID is required').trim().notEmpty(),
    check('AccommodationID', 'AccommodationID is required').trim().notEmpty(),
    check('feature_data', 'feature_data is required').notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UploadCategoryRoomGallery = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('AccommodationID', 'AccommodationID is required').trim().notEmpty(),
    check('AccRoomCategoryID', 'AccRoomCategoryID is required').trim().notEmpty(),
    check('MediaType', 'MediaType is required').trim().notEmpty(),
    // check('recfile', 'recfile is required').notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteCategoryRoomGallery = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('AccRoomCategoryGalleryID', 'AccRoomCategoryGalleryID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddNearUtility = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('AccommodationID', 'AccommodationID is required').trim().notEmpty(),
    check('UtilityID', 'UtilityID is required').trim().notEmpty(),
    check('UtilityName', 'UtilityName is required').trim().notEmpty(),
    check('Description', 'Description is required').trim().notEmpty(),
    check('Distance', 'Distance is required').trim().notEmpty(),
    // check('Image', 'Image is required').notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteNearUtility = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('UtilityID', 'UtilityID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UploadGallery = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('AccommodationID', 'AccommodationID is required').trim().notEmpty(),
    check('MediaType', 'MediaType is required').trim().notEmpty(),
    // check('recfile', 'recfile is required').notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteGallery = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('AccGalleryID', 'AccGalleryID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteAccommodation = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('AccommodationID', 'AccommodationID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdateAccExtra = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('AccommodationID', 'AccommodationID is required').trim().notEmpty(),
    check('AccExtraID', 'AccExtraID is required').trim().notEmpty(),
    check('Title', 'Title is required').trim().notEmpty(),
    check('Description', 'Description is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteAccExtra = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('AccommodationID', 'AccommodationID is required').trim().notEmpty(),
    check('AccExtraID', 'AccExtraID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdateAccSEO = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('AccommodationID', 'AccommodationID is required').trim().notEmpty(),
    check('MetaTitle', 'MetaTitle is required').trim().notEmpty(),
    check('MetaKeyword', 'MetaKeyword is required').trim().notEmpty(),
    check('MetaDescription', 'MetaDescription is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.GetProviderWiseCommonData = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ProviderID', 'ProviderID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdateRulesCommon = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ProviderID', 'ProviderID is required').trim().notEmpty(),
    check('AccRulesID', 'AccRulesID is required').trim().notEmpty(),
    check('Rules', 'Rules is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteRulesCommon = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ProviderID', 'ProviderID is required').trim().notEmpty(),
    check('AccRulesID', 'AccRulesID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdateOfferCommon = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ProviderID', 'ProviderID is required').trim().notEmpty(),
    check('AccOfferID', 'AccOfferID is required').trim().notEmpty(),
    check('OfferTitle', 'OfferTitle is required').trim().notEmpty(),
    check('Description', 'Description is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteOfferCommon = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ProviderID', 'ProviderID is required').trim().notEmpty(),
    check('AccOfferID', 'AccOfferID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdateFaqCommon = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ProviderID', 'ProviderID is required').trim().notEmpty(),
    check('AccFAQID', 'AccFAQID is required').trim().notEmpty(),
    check('Question', 'Question is required').trim().notEmpty(),
    check('Answer', 'Answer is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteFaqCommon = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ProviderID', 'ProviderID is required').trim().notEmpty(),
    check('AccFAQID', 'AccFAQID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdateExtraCommon = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ProviderID', 'ProviderID is required').trim().notEmpty(),
    check('AccExtraID', 'AccExtraID is required').trim().notEmpty(),
    check('Title', 'Title is required').trim().notEmpty(),
    check('Description', 'Description is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteExtraCommon = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ProviderID', 'ProviderID is required').trim().notEmpty(),
    check('AccExtraID', 'AccExtraID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdateContactCommon = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ProviderID', 'ProviderID is required').trim().notEmpty(),
    check('AccContactID', 'AccContactID is required').trim().notEmpty(),
    check('Name', 'Name is required').trim().notEmpty(),
    check('PhoneNo', 'PhoneNo is required').trim().notEmpty(),
    check('Email', 'Email is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdateCommonData = [
    check('ProviderID', 'ProviderID is required').trim().notEmpty(),
    check('CommonData', 'CommonData is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteContactCommon = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ProviderID', 'ProviderID is required').trim().notEmpty(),
    check('AccContactID', 'AccContactID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.GetAccomSearchList = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('Search', 'Search is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.GetMasterData = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.GetStateList = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('CountryID', 'CountryID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.GetCityList = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('CountryID', 'CountryID is required').trim().notEmpty(),
    check('StateID', 'StateID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.GetCityName = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('CityID', 'CityID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdateMappingLandlord = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('LandlordID', 'LandlordID is required').trim().notEmpty(),
    check('AccommodationID', 'AccommodationID is required').notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
// end accommodation api

// Channel Partner API - 09/12/20
exports.GetChannelPartnerList = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.GetChannelPartnerDetails = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteChannelPartner = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdateCompanyInfo = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),
    check('CompanyName', 'CompanyName is required').trim().notEmpty(),
    check('YearOfFoundation', 'YearOfFoundation is required').trim().notEmpty(),
    // check('CompanyLogo', 'CompanyLogo is required').trim().notEmpty(),
    check('RegisterOfficeAddress', 'RegisterOfficeAddress is required').trim().notEmpty(),
    check('CountryID', 'CountryID is required').trim().notEmpty(),
    check('StateID', 'StateID is required').trim().notEmpty(),
    check('CityID', 'CityID is required').trim().notEmpty(),
    check('PostCode', 'PostCode is required').trim().notEmpty(),
    check('CompanyDescription', 'CompanyDescription is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdatePersonalInfo = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),
    check('FirstName', 'FirstName is required').trim().notEmpty(),
    // check('LastName', 'LastName is required').trim().notEmpty(),
    // check('PersonalPhoto', 'PersonalPhoto is required').trim().notEmpty(),
    check('PersonalEmail', 'Email is required').trim().notEmpty(),
    check('PersonalPassword', 'Password is required').trim().notEmpty(),
    // check('ReferenceNo', 'ReferenceNo is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdateCRMInfo = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),
    check('CRMUrl', 'CRMUrl is required').trim().notEmpty(),
    check('CRMLogin', 'CRMLogin is required').trim().notEmpty(),
    check('CRMDatabase', 'CRMDatabase is required').trim().notEmpty(),
    check('CRMPassword', 'CRMPassword is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdateContactInfo = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),
    check('ContactPhoneNo', 'ContactPhoneNo is required').trim().notEmpty(),
    // check('OfficePhoneNo', 'OfficePhoneNo is required').trim().notEmpty(),
    check('GeneralEmail', 'GeneralEmail is required').trim().notEmpty(),
    // check('CPCRMEmail', 'CPCRMEmail is required').trim().notEmpty(),
    // check('LoginID', 'LoginID is required').trim().notEmpty(),
    // check('Password', 'Password is required').trim().notEmpty(),
    check('WebsiteURL', 'WebsiteURL is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdateLegalInfo = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),
    check('IncorpartionDate', 'IncorpartionDate is required').trim().notEmpty(),
    check('GSTIN', 'GSTIN is required').trim().notEmpty(),
    check('PanNo', 'PanNo is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdateAccountInfo = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),
    check('AccountName', 'AccountName is required').trim().notEmpty(),
    check('AccountEmail', 'AccountEmail is required').trim().notEmpty(),
    check('AccountPhoneNo', 'AccountPhoneNo is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdateAuthorizedInfo = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),
    check('AuthorizedName', 'AuthorizedName is required').trim().notEmpty(),
    check('AuthorizedDesignation', 'AuthorizedDesignation is required').trim().notEmpty(),
    check('AuthorizedEmail', 'AuthorizedEmail is required').trim().notEmpty(),
    check('AuthorizedPhoneNo', 'AuthorizedPhoneNo is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdateCPOtherInfo = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),
    check('HeadOffice', 'HeadOffice is required').trim().notEmpty(),
    check('BranchOffice', 'BranchOffice is required').trim().notEmpty(),
    check('NumberOfStudents', 'NumberOfStudents is required').trim().notEmpty(),
    check('NatureOfBusiness', 'NatureOfBusiness is required').notEmpty(),
    check('CountriesServing', 'CountriesServing is required').notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddCPBank = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),
    check('BankID', 'BankID is required').trim().notEmpty(),
    check('BankName', 'BankName is required').trim().notEmpty(),
    check('AccountNo', 'AccountNo is required').trim().notEmpty(),
    check('IFSCCode', 'IFSCCode is required').trim().notEmpty(),
    check('SWIFTCode', 'SWIFTCode is required').trim().notEmpty(),
    // check('IsDefault', 'IsDefault is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteCPBank = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),
    check('BankID', 'BankID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdateMappingUniversity = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('UniversityID', 'UniversityID is required').trim().notEmpty(),
    check('ChannelPartnerID', 'ChannelPartnerID is required').notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.GetUniversityList = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.GetUniversityDetails = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('UniversityID', 'UniversityID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteUniversity = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('UniversityID', 'UniversityID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdateUniversityInfo = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('UniversityID', 'UniversityID is required').trim().notEmpty(),
    check('UniversityName', 'UniversityName is required').trim().notEmpty(),
    check('AddressLine1', 'AddressLine1 is required').trim().notEmpty(),
    check('Latitude', 'Latitude is required').trim().notEmpty(),
    check('Longitude', 'Longitude is required').trim().notEmpty(),
    check('CountryID', 'CountryID is required').trim().notEmpty(),
    check('StateID', 'StateID is required').trim().notEmpty(),
    check('CityID', 'CityID is required').trim().notEmpty(),
    check('AssociateType', 'AssociateType is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdateProfessionalInfo = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('UniversityID', 'UniversityID is required').trim().notEmpty(),
    check('Reference', 'Reference is required').trim().notEmpty(),
    check('Commission', 'Commission is required').trim().notEmpty(),
    check('UcasNo', 'UcasNo is required').trim().notEmpty(),
    check('UniversityRank', 'UniversityRank is required').trim().notEmpty(),
    check('CourseLanguages', 'CourseLanguages is required').trim().notEmpty(),
    check('Active', 'Active is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddUniProgram = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('UniversityID', 'UniversityID is required').trim().notEmpty(),
    check('ProgramID', 'ProgramID is required').trim().notEmpty(),
    check('ProgramName', 'ProgramName is required').trim().notEmpty(),
    check('DisciplineID', 'DisciplineID is required').trim().notEmpty(),
    check('IntakeID', 'IntakeID is required').trim().notEmpty(),
    check('DegreeID', 'DegreeID is required').trim().notEmpty(),
    check('Language', 'Language is required').trim().notEmpty(),
    check('Active', 'Active is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UploadUniGallery = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('UniversityID', 'UniversityID is required').trim().notEmpty(),
    check('MediaType', 'MediaType is required').trim().notEmpty(),
    // check('recfile', 'recfile is required').notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteUniGallery = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('UniversityID', 'UniversityID is required').trim().notEmpty(),
    check('GalleryID', 'GalleryID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.GetUniAssociateTypeList = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteUniProgram = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('UniversityID', 'UniversityID is required').trim().notEmpty(),
    check('ProgramID', 'ProgramID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.GetPartnerDashboardData = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(422).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.PartnerEnquirySubmit = [
    check('ServiceID', 'ServiceID is required').trim().notEmpty(),
    check('Source', 'Source is required').trim().notEmpty(),
    check('Type', 'Type is required').trim().notEmpty(),
    check('FirstName', 'FirstName is required').trim().notEmpty(),
    check('LastName', 'LastName is required').trim().notEmpty(),
    check('Email', 'Email is required').trim().notEmpty(),
    check('PhoneNo', 'PhoneNo is required').trim().notEmpty(),
    check('Remark', 'Remark is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(422).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AdminLogin = [
    check('username', 'username is required').trim().notEmpty(),
    check('password', 'password is required').trim().notEmpty(),
    check('source', 'source is required').trim().notEmpty(),
    check('ip', 'ip is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.Mst_ParameterTypeList = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]


exports.AddMst_ParameterType = [
    check('ParameterTypeID', 'ParameterTypeID is required').trim().notEmpty(),
    check('ParameterType', 'ParameterType is required').trim().notEmpty(),
    check('Status', 'Status is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteMst_ParameterType = [
    check('ParameterTypeID', 'ParameterTypeID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]


exports.Mst_ParameterValueList = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteMst_ParameterValue = [
    check('ParameterValueID', 'ParameterValueID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors
                .array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddMst_ParameterValue = [
    // check('ParameterValueID', 'ParameterTypeID is required').trim().notEmpty(),
    check('ParameterTypeID', 'ParameterTypeID is required').trim().notEmpty(),
    check('ParameterValueCode', 'ParameterValueCode is required').trim().notEmpty(),
    check('ParameterValue', 'ParameterValue is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.Mst_UserList = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.Mst_AddUser = [
    check('UserName', 'UserName is required').trim().notEmpty(),
    check('RoleID', 'Role is required').trim().notEmpty(),
    check('Name', 'Name is required').trim().notEmpty(),
    check('MobileNo', 'MobileNo is required').trim().notEmpty(),
    // check('Password', 'Password is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.Mst_DeleteUser = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.Mst_CountryList = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.Mst_StateList = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.Mst_CityList = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddCountry = [
    check('CountryName', 'CountryName is required').trim().notEmpty(),
    check('CountryCode', 'CountryCode is required').trim().notEmpty(),
    check('PhoneCode', 'PhoneCode is required').trim().notEmpty(),
    // check('CurrencySymbol', 'CurrencySymbol is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteCountry = [
    check('CountryID', 'CountryID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddState = [
    check('CountryID', 'CountryID is required').trim().notEmpty(),
    check('StateName', 'StateName is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddCity = [
    check('CountryID', 'CountryID is required').trim().notEmpty(),
    check('StateID', 'StateID is required').trim().notEmpty(),
    check('CityName', 'CityName is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteState = [
    check('StateID', 'StateID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteCity = [
    check('CityID', 'CityID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.FeesList = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.AddFees = [
    check('Title', 'Title is required').trim().notEmpty(),
    check('Fees', 'Fees is required').trim().notEmpty(),
    check('userId', 'userId is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteFees = [
    check('FeesID', 'FeesID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.PoCountrys = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.PoCitys = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddPoCitys = [
    check('CountryID', 'Country is required').trim().notEmpty(),
    check('StateID', 'State is required').trim().notEmpty(),
    check('CityID', 'City is required').trim().notEmpty(),
    check('DisplayOrderno', 'Display Order no is required').trim().notEmpty(),
    check('AccomodationLink', 'Accomodation Link is required').trim().notEmpty(),
    check('userId', 'EntryBy is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeletePoCitys = [
    check('PopulerCityID', 'PopulerCityID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddPoCountrys = [
    check('CountryID', 'Country is required').trim().notEmpty(),
    check('DisplayOrderno', 'Display Order no is required').trim().notEmpty(),
    check('AccomodationLink', 'Accomodation Link is required').trim().notEmpty(),
    check('userId', 'EntryBy is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeletePoCountrys = [
    check('PopulerCountryID', 'PopulerCountryID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.ServicesType = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    // check('userId', 'EntryBy is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddServicesType = [
    check('ServiceID', 'ServiceID Order no is required').trim().notEmpty(),
    check('Type', 'Type is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.DeleteServicesType = [
    check('ServiceTypeID', 'ServiceTypeID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]


exports.MasterServices = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddMasterServices = [
    check('Name', 'Name is required').trim().notEmpty(),
    check('CountryID', 'CountryID is required').trim().notEmpty(),
    check('PageTitle', 'PageTitle is required').trim().notEmpty(),
    check('DisplayOrder', 'DisplayOrder is required').trim().notEmpty(),
    check('userId', 'userId is required').trim().notEmpty(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]


exports.DeleteMasterServices = [
    check('ServiceID', 'ServiceID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]


exports.ServicesProvider = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddServicesProvider = [
    check('Name', 'Name is required').trim().notEmpty(),
    check('userId', 'userId is required').trim().notEmpty(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteServicesProvider = [
    check('ServiceProviderID', 'ServiceProviderID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.SPMaping = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddSPMaping = [
    check('ServiceID', 'ServiceID is required').trim().notEmpty(),
    check('ServiceProviderID', 'ServiceProviderID is required').trim().notEmpty(),
    check('CountryID', 'CountryID is required').trim().notEmpty(),
    check('DisplayOrder', 'DisplayOrder is required').trim().notEmpty(),
    check('userId', 'userId is required').trim().notEmpty(),


    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteSPMaping = [
    check('ServiceProviderMapID', 'ServiceProviderMapID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.MessageTemplate = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddMessageTemplate = [
    check('TemplateName', 'TemplateName is required').trim().notEmpty(),
    check('TemplateSubject', 'TemplateSubject is required').trim().notEmpty(),
    check('TemplateBody', 'TemplateBody is required').trim().notEmpty(),
    check('userId', 'userId is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteMessageTemplate = [
    check('TemplateID', 'TemplateID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.WebTestimonial = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddWebTestimonial = [
    check('Name', 'Name is required').trim().notEmpty(),
    check('Designation', 'Designation is required').trim().notEmpty(),
    check('Description', 'Description is required').trim().notEmpty(),
    check('userId', 'userId is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteWebTestimonial = [
    check('TestimonialID', 'TestimonialID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.Discipline = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddDiscipline = [
    check('DisciplineName', 'DisciplineName is required').trim().notEmpty(),
    check('userId', 'userId is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]


exports.DeleteDiscipline = [
    check('DisciplineID', 'DisciplineID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]


exports.Intake = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddIntake = [
    check('IntakeFrom', 'IntakeFrom is required').trim().notEmpty(),
    check('userId', 'userId is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteIntake = [
    check('IntakeID', 'IntakeID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AssociateType = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddAssociateType = [
    check('ComapnyName', 'ComapnyName is required').trim().notEmpty(),
    check('CompanyEmail', 'CompanyEmail is required').trim().notEmpty(),

    check('userId', 'userId is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.DeleteAssociateType = [
    check('AssociateID', 'AssociateID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.PromoCode = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]


exports.AddPromoCode = [
    check('Title', 'Title is required').trim().notEmpty(),
    check('CoupanCode', 'CoupanCode is required').trim().notEmpty(),
    // check('Startdate', 'Startdate is required').trim().notEmpty(),
    // check('EndTime', 'EndTime is required').trim().notEmpty(),
    check('DiscountType', 'DiscountType is required').trim().notEmpty(),
    check('Discount', 'Discount is required').trim().notEmpty(),
    check('TotalLimit', 'TotalLimit is required').trim().notEmpty(),
    check('PerUserLimit', 'PerUserLimit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeletePromoCode = [
    check('PromoCodeID', 'PromoCodeID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.PropertyType = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]


exports.AddPropertyType = [
    check('PropertyTypeName', 'PropertyTypeName is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeletePropertyType = [
    check('PropertyTypeID', 'PropertyTypeID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.Role = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddRole = [
    check('RoleName', 'RoleName is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteRole = [
    check('RoleID', 'RoleID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.QuickLink = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]


exports.AddQuickLink = [
    check('PageName', 'PageName is required').trim().notEmpty(),
    check('Content', 'Content is required').trim().notEmpty(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteQuickLink = [
    check('QuickLinkID', 'QuickLinkID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.Banner = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddBanner = [
    check('Caption', 'Caption is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteBanner = [
    check('BannerID', 'BannerID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]



exports.Blog = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddBlog = [
    check('BlogTitle', 'BlogTitle is required').trim().notEmpty(),
    check('PageTitle', 'PageTitle is required').trim().notEmpty(),
    check('SeoKeyword', 'SeoKeyword is required').trim().notEmpty(),
    // check('recfile', 'recfile is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteBlog = [
    check('BlogID', 'BlogID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.NewsMedia = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.Mst_FromList = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.AddMst_From = [
    check('FormName', 'FormName is required').trim().notEmpty(),
    check('SytemForm', 'SytemForm is required').trim().notEmpty(),
    check('Catgory', 'Catgory is required').trim().notEmpty(),
    check('Status', 'Status is required').trim().notEmpty(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddNewsMedia = [
    check('MediaType', 'MediaType is required').trim().notEmpty(),
    check('NewsType', 'NewsType is required').trim().notEmpty(),
    check('MediaURL', 'MediaURL is required').trim().notEmpty(),
    check('PageTitle', 'PageTitle is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteMst_From = [
    check('FormID', 'FormID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.DeleteNewsMedia = [
    check('NewsID', 'NewsID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.Mst_PageList = [
    check('RID', 'RID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.AddPermission = [
    check('RID', 'RID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.Landlord = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]


exports.AddLandlord = [
    check('Firstname', 'Firstname is required').trim().notEmpty(),
    // check('Lastname', 'Lastname is required').trim().notEmpty(),
    check('Email', 'Email is required').trim().notEmpty(),
    check('Addressline1', 'Addressline1 is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteLandlord = [
    check('LandlordID', 'LandlordID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.ChangePass = [
    check('Cpass', 'Current Password is required').trim().notEmpty(),
    check('Npass', 'New Password is required').trim().notEmpty(),
    check('Cnfpass', 'Confirm Password is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.CheckPass = [
    check('Cpass', 'Current Password is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.Setting = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddSetting = [
    check('settingTitle', 'settingTitle is required').trim().notEmpty(),
    check('settingKey', 'settingKey is required').trim().notEmpty(),
    // check('settingValue', 'settingValue is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteSetting = [
    check('settingID', 'settingID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.ApiMapping = [
    check('ProviderID', 'ProviderID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]


exports.AddApiMapping = [
    // check('MappingID', 'MappingID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AccBookingRequest = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]


exports.AddRemark = [
    check('BookingID', 'BookingID is required').trim().notEmpty(),
    check('Remark', 'Remark is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.Remark = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    check('BookingID', 'BookingID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteRemark = [
    check('BookingRemarkID', 'BookingRemarkID is required').trim().notEmpty(),
    check('BookingID', 'BookingID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.BookingStatusUpdate = [
    check('BookingID', 'BookingID is required').trim().notEmpty(),
    check('Status', 'Status is required').trim().notEmpty(),
    check('Remark', 'Remark is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.Student_Inquiry = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.InquiryStatusUpdate = [
    check('InquiryID', 'InquiryID is required').trim().notEmpty(),
    check('Status', 'Status is required').trim().notEmpty(),
    check('Remark', 'Remark is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.NotificationList = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]


exports.AddNotification = [
    check('RID', 'RoleID is required').trim().notEmpty(),
    check('Title', 'Title is required').trim().notEmpty(),
    check('Description', 'Description is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteNotification = [
    check('NotificationID', 'NotificationID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.LoginHistory = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.AdminDashboard = [
    check('RoleID', 'RoleID is required').trim().notEmpty(),
    check('Date', 'Date is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.TopInquires = [
    check('RoleID', 'RoleID is required').trim().notEmpty(),
    check('Date', 'Date is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.GenerateStudentExcel = [
    // check('Ids', 'Ids is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.GenerateLandlordExcel = [
    // check('Ids', 'Ids is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.GenerateCPartnerExcel = [
    // check('Ids', 'Ids is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.GenerateUniversityExcel = [
    // check('Ids', 'Ids is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.GetCountryToCity = [
    check('CountryID', 'CountryID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.GetSProvider = [
    check('ServiceID', 'ServiceID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.ActivityLogList = [
    // check('ServiceID', 'ServiceID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.ServicesSection = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    check('ServiceID', 'ServiceID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddServicesSection = [
    check('SectionType', 'SectionType is required').trim().notEmpty(),
    check('SectionTitle', 'SectionTitle is required').trim().notEmpty(),
    check('ServiceID', 'ServiceID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteServicesSection = [
    check('SectionID', 'SectionID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.ServicesSectionItem = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddServicesSectionItem = [
    check('SectionID', 'SectionID is required').trim().notEmpty(),
    check('ItemTitle', 'ItemTitle is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteServicesSectionItem = [
    check('ItemID', 'ItemID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.ReviewList = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.ReviewApproval = [
    check('RatingID', 'RatingID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.ContactUsList = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.SearchingActivityLogList = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UploadServiceImage = [
    // check('recfile', 'Image is required').trim().notEmpty(),
    check('ServiceID', 'ServiceID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.ServiceImageFetch = [
    // check('recfile', 'Image is required').trim().notEmpty(),
    check('ServiceID', 'ServiceID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.ServiceImageDelete = [
    // check('recfile', 'Image is required').trim().notEmpty(),
    check('ServiceImageID', 'ServiceImageID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.ImageDeleteS3 = [
    check('Image', 'Image is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.PopularPropoertiesList = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddPopularPropoerties = [
    check('Title', 'Title is required').trim().notEmpty(),
    // check('Fetures', 'Fetures is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeletePopularPropoerties = [
    check('PopularPropoertieID', 'PopularPropoertieID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.homeMapSliderList = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddhomeMapSlider = [
    check('Title', 'Title is required').trim().notEmpty(),
    // check('IconeMaping', 'IconeMaping is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeletehomeMapSlider = [
    check('MapId', 'MapId is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.StudentWorkExpXlsImport = [
    // check('recfile', 'Excel file is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]


exports.StudentExamXlsImport = [
    // check('recfile', 'Excel file is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.CareerList = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddBestAcc = [
    check('AccommodationID', 'AccommodationID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.BestAccList = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.ArrangeCallList = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.StudentLoginHistory = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.EmailLogList = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.ServiceLogList = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AccListing = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddAccLocation = [
    check('AccommodationID', 'AccommodationID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AccFeatureIssueList = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddAccFeatureIssue = [
    check('FetureID', 'FetureID is required').trim().notEmpty(),
    check('FeaturesName', 'FeaturesName is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.SeoDescriptionList = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddSeoDescription = [
    check('CountryID', 'CountryID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteSeoDescription = [
    check('AccSeoID', 'AccSeoID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteSubSeoDescription = [
    check('AccSeoDetailsID', 'AccSeoDetailsID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdateCommonFeature = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ProviderID', 'ProviderID is required').trim().notEmpty(),
    check('feature_data', 'feature_data is required').notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.CheckUserName = [
    check('UserType', 'UserType is required').trim().notEmpty(),
    check('UserName', 'UserName is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.PasswordChange = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('Email', 'Email is required').trim().notEmpty(),
    check('Password', 'Password is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdateRoomGallery = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('AccRoomCategoryGalleryID', 'AccRoomCategoryGalleryID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdateRoomCommonFeature = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ProviderID', 'ProviderID is required').trim().notEmpty(),
    check('feature_data', 'feature_data is required').notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.SendReverificationStudentlink = [
    check('UserIDS', 'UserIDS is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.Send_InvoiceMail = [
    check('AccommodationID', 'AccommodationID is required').trim().notEmpty(),
    check('TemplateName', 'TemplateName is required').trim().notEmpty(),
    check('ToEmail', 'ToEmail is required').trim().notEmpty(),
    check('TemplateBody', 'TemplateBody is required').trim().notEmpty(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdateAccOrderedList = [
    check('ListingID', 'ListingID is required').trim().notEmpty(),
    check('CountryID', 'CountryID is required').trim().notEmpty(),
    check('CityID', 'CityID is required').trim().notEmpty(),
    check('ProviderSequence', 'ProviderSequence is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteAccOrderList = [
    check('ListingID', 'ListingID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]


exports.GenerlInquiryList = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdatePaymentCommon = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('ProviderID', 'ProviderID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AdsList = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddAds = [
    // check('recfile', 'Photo is required').trim().notEmpty(),
    check('Link', 'Link is required').trim().notEmpty(),
    check('ModuleType', 'ModuleType is required').trim().notEmpty(),
    // check('AdType', 'AdType is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteAds = [
    check('Ad_ID', 'Ad_ID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.Get_Payment_Link = [
    check('Amount', 'Amount is required').trim().notEmpty(),
    check('Currency', 'Currency is required').trim().notEmpty(),
    check('Ref_Id', 'Refference Number  is required').trim().notEmpty(),
    check('Ref_Id_Enc', 'Refference Number is required').trim().notEmpty(),
    check('Service_Name', 'Service is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]


exports.AccAdsList = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddAccAds = [
    // check('recfile', 'Photo is required').trim().notEmpty(),
    check('AdLink', 'Ad Link is required').trim().notEmpty(),
    // check('CountryID', 'CountryID is required').trim().notEmpty(),
    check('AdType', 'AdType is required').trim().notEmpty(),
    check('OrderNo', 'OrderNo is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteAccAds = [
    check('AccAdsID', 'AccAdsID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.ImpressionList = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AccProviderlist = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.AddAccProvider = [
    check('ParentName', 'Parent Name is required').trim().notEmpty(),
    check('Name', 'Name is required').trim().notEmpty(),
    check('ProviderUrl', 'Provider Url is required').trim().notEmpty(),
    //check('recfile', 'Image URL is required').trim().notEmpty(),
    check('CronTime', 'Cron Time is required').trim().notEmpty(),
    check('IsCronType', 'Cron Type is required').trim().notEmpty(),
    check('IsOffline', 'Offline Status is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.DeleteAccProvider = [
    check('ProviderID', 'ProviderID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.GetAccommodationLinkDetails = [
    check('AccommodationID', 'AccommodationID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.CalculateRoomRent = [
    check('AccommodationID', 'AccommodationID is required').trim().notEmpty(),
    check('AccRoomCategoryID', 'AccRoomCategoryID is required').trim().notEmpty(),
    check('AccRoomCategoryRentID', 'AccRoomCategoryRentID is required').trim().notEmpty(),
    check('StartDate', 'StartDate is required').trim().notEmpty(),
    check('EndDate', 'EndDate is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.BookingRequest = [
    check('AccommodationID', 'AccommodationID is required').trim().notEmpty(),
    check('AccRoomCategoryID', 'AccRoomCategoryID is required').trim().notEmpty(),
    check('AccRoomCategoryRentID', 'AccRoomCategoryRentID is required').trim().notEmpty(),
    check('StartDate', 'StartDate is required').trim().notEmpty(),
    check('EndDate', 'EndDate is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.InvoiceNoCreate = [
    check('InquiryID', 'InquiryID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]


exports.InvoiceReport = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.GetServiceList = [
    // check('CountryID', 'CountryID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdateSigleRecord = [

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.UpdateDocStatus = [

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.GetStudentDetail = [
    check('BookingID', 'Booking is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.UpdateChannelPartner = [

    check('InquiryIdList', 'Inquiry List is required').trim().notEmpty(),
    check('ChannelPartnerID', 'ChannelPartner is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.LinkPropertyList = [
    check('InquiryID', 'Inquiry is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.HtmlToPdf = [
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.AddVideo = [
    // check('VideoBase64', 'Video is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

//heli 09-12-2021
exports.GetPartnerWithdrawalData = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('Year', 'Year is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(422).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.AddWithdrawRequest = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('OrderAmount', 'OrderAmount is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(422).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.GetChannelPartnerCommissionList = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(422).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.RecentRegisterStudents = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    // check('PageNo', 'PageNo is required').trim().notEmpty(),
    // check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(422).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.UpdateChannelPartnerData = [
    check('ChannelPartnerID', 'ChannelPartner is required').trim().notEmpty(),
    check('AccountManagerID', 'Account Manager is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.withdrawrequest = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(422).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]


exports.WithdrawStatusUpdate = [
    check('WithdrawID', 'WithdrawID is required').trim().notEmpty(),
    check('Status', 'Status is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(422).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.AddBankDetails = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('BankName', 'BankName is required').trim().notEmpty(),
    check('AccountNo', 'AccountNo is required').trim().notEmpty(),
    check('IFSCCode', 'IFSCCode is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(422).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.CpProfileUpdate = [
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(422).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.GetChannelPatnerDetail = [
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(422).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.CpProfilePic = [
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(422).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.GetInquiryDetails = [
    check('InquiryID', 'InquiryID is required').trim().notEmpty(),
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(422).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]


exports.studentEntry = [
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),
    check('FirstName', 'FirstName is required').trim().notEmpty(),
    check('LastName', 'LastName is required').trim().notEmpty(),
    check('Email', 'Email is required').trim().notEmpty(),
    // check('PhoneNo_CountryCode', 'PhoneNo_CountryCode is required').trim().notEmpty(),
    check('PhoneNo', 'PhoneNo is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(422).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.CpDocUpdate = [
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(422).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.CpInfoUpdate = [
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(422).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.UpdateCPDocStatus = [

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.GetChannelPartnerDueCommissionList = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(422).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.GetChannelPartnerDueInquiryCommissionList = [
    check('UserID', 'UserID is required').trim().notEmpty(),
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(422).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.GetBookingDetails = [
    check('BookingID', 'BookingID is required').trim().notEmpty(),
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(422).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.Send_CP_AccEmail = [
    check('AccommodationID', 'Accommodation is required').trim().notEmpty(),
    check('TemplateName', 'Subject is required').trim().notEmpty(),
    check('ToEmail', 'Email is required').trim().notEmpty(),
    // check('TemplateBody', 'TemplateBody is required').trim().notEmpty(),
    // check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.GetUniversityKeword = [
    // check('keryword', 'keryword is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var error_string = InvalidParameter(errors.array());
            return res.status(200).send(Common.ResFormat('0', process.env.Toaster, error_string, '', {}));
        }
        next();
    },
]
exports.GetPerformanceGraphData = [
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),
    check('DateType', 'DateType is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var error_string = InvalidParameter(errors.array());
            return res.status(200).send(Common.ResFormat('0', process.env.Toaster, error_string, '', {}));
        }
        next();
    },
]
exports.AccCommission = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.GetCommissionGraphData = [
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var error_string = InvalidParameter(errors.array());
            return res.status(200).send(Common.ResFormat('0', process.env.Toaster, error_string, '', {}));
        }
        next();
    },
]
exports.AddAccCommission = [
    check('FromWeek', 'FromWeek is required').trim().notEmpty(),
    check('ToWeek', 'ToWeek is required').trim().notEmpty(),
    check('Charge', 'Charge is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.GetServiceGraphData = [
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),
    check('ServiceDateType', 'ServiceDateType is required').trim().notEmpty(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var error_string = InvalidParameter(errors.array());
            return res.status(200).send(Common.ResFormat('0', process.env.Toaster, error_string, '', {}));
        }
        next();
    },
]
exports.DeleteAccCommission = [
    check('CommissionID', 'CommissionID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.GetVisiorGraphData = [
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),
    check('VisitorDateType', 'VisitorDateType is required').trim().notEmpty(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var error_string = InvalidParameter(errors.array());
            return res.status(200).send(Common.ResFormat('0', process.env.Toaster, error_string, '', {}));
        }
        next();
    },
]
exports.GetChannelPartnerDueBookingCommissionList = [
    check('UserId', 'ChannelPartnerID is required').trim().notEmpty(),


    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var error_string = InvalidParameter(errors.array());
            return res.status(200).send(Common.ResFormat('0', process.env.Toaster, error_string, '', {}));
        }
        next();
    },
]
exports.GetPartnerWalletCommissionChartData = [
    check('UserID', 'ChannelPartnerID is required').trim().notEmpty(),


    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var error_string = InvalidParameter(errors.array());
            return res.status(200).send(Common.ResFormat('0', process.env.Toaster, error_string, '', {}));
        }
        next();
    },
]
exports.BookingCpMaping = [
    check('ChannelPartnerID', 'ChannelPartnerID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.AddNearBySearchData = [
    check('AccSeoID', 'AccSeoID is required').trim().notEmpty(),
    check('CountryID', 'CountryID is required').trim().notEmpty(),
    check('CityID', 'CityID is required').trim().notEmpty(),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.GetNearBySearchData = [
    check('AccSeoID', 'AccSeoID is required').trim().notEmpty(),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.RemoveNearBySearchData = [
    check('NearBySearchID', 'NearBySearchID is required').trim().notEmpty(),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.UpdateNearBySearchData = [
    check('NearBySearchID', 'NearBySearchID is required').trim().notEmpty(),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.GetNewAccomodationCommission = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.AddStudentByCp = [
    check('CpId', 'Channel Partner is required').trim().notEmpty(),
    check('FirstName', 'First Name is required').trim().notEmpty(),
    check('LastName', 'Last Name is required').trim().notEmpty(),
    check('Email', 'Email is required').trim().notEmpty(),
    check('PhoneNo_CountryCode', 'Phone Code is required').trim().notEmpty(),
    check('PhoneNo', 'Phone number is required').trim().notEmpty(),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.AddAccCommissionNew = [
    check('CountryID', 'CountryID is required').trim().notEmpty(),
    check('CityID', 'CityID is required').trim().notEmpty(),
    check('CpMin', 'CpMin is required').trim().notEmpty(),
    check('CpMax', 'CpMax is required').trim().notEmpty(),
    check('Status', 'Status is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.GetMarketPlaceDetailView = [
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.GenerateMarketplaceviewExcel = [
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.CheckSubdomain = [
    check('SubDomainName', 'SubDomainName is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.AddFAQDescription = [
    check('CountryID', 'CountryID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.DeleteAccCommissionNew = [
    check('CommissionID', 'CommissionID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.GetFAQDescription = [
    check('AccSeoID', 'AccSeoID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.RemoveFAQDescription = [
    check('AccSeoID', 'AccSeoID is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.StudentAddXlsImport = [
    // check('recfile', 'Excel file is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.NearByDataAddByXls = [
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.ExportStudent_Inquiry = [
    // check('recfile', 'Excel file is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.PartnerLevels = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddPartnerLevels = [
    check('CP_Category_Title', 'CP_Category_Title is required').trim().notEmpty(),
    check('Min_Student', 'Min_Student is required').trim().notEmpty(),
    check('Max_Student', 'Max_Student is required').trim().notEmpty(),
    check('Commission_Per_Student', 'Commission_Per_Student is required').trim().notEmpty(),
    check('Commission_Per_services', 'Commission_Per_services is required').trim().notEmpty(),
    check('Cash_Incentive', 'Cash_Incentive is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.DeletePartnerLevels = [
    check('CP_Category_Id', 'CP_Category_Id is required').trim().notEmpty(),
   (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.AddMarketingMaill = [
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.StudentCVlist = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.FoodPartner = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddFoodPartner = [
    check('Name', 'Name is required').trim().notEmpty(),
    check('Email', 'Email is required').trim().notEmpty(),
    check('Website', 'Website is required').trim().notEmpty(),
    check('PhoneNo', 'PhoneNo is required').trim().notEmpty(),
    check('CompanyName', 'CompanyName is required').trim().notEmpty(),
    check('DisplayOrder', 'DisplayOrder is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.DeleteFoodPartner = [
    check('Food_Provider_Id', 'Food_Provider_Id is required').trim().notEmpty(),
   (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.FoodPartnerOffer = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]

exports.AddFoodPartnerOffer = [
    check('Food_Provider_Id', 'FoodPartnerID is required').trim().notEmpty(),
    check('OfferTitle', 'OfferTitle is required').trim().notEmpty(),
    check('OfferDescription', 'OfferDescription is required').trim().notEmpty(),
    check('OfferCode', 'OfferCode is required').trim().notEmpty(),
    check('Offer_NoOfTime', 'Offer_NoOfTime is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.DeleteFoodPartnerOffer = [
    check('Offer_Id', 'Offer_Id is required').trim().notEmpty(),
   (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.SrudentOffer = [
    check('PageNo', 'PageNo is required').trim().notEmpty(),
    check('Limit', 'Limit is required').trim().notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]
exports.FoodProviderList = [
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorStr = InvalidParameter(errors.array());
            return res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Fieldmiss, Code.AlertTypeCode.Popup, errorStr), "Data": [] });
        }
        next();
    },
]