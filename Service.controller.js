const Service = require("../models/Service.model");
const Code = require("../config/responseMsg");
const async = require('async');
const upload = require("../middleware/upload");
const md5 = require('md5');
const { request } = require("express");
const _ = require("lodash");
const Commom = require("../CommonMethod/CommonFunction");
const { query } = require("express-validator");
const CommonDefault = require("../config/responseMsg");
var xlsx = require('xlsx');
var path = require('path');
const Send_Mail = require("../CommonMethod/sendEmail");
const moment = require('moment');
const sqlhelper = require("../CommonMethod/sqlhelper");
const { count } = require("console");
const stripe = require('stripe')(process.env.STRIPE_KEY);
var fs = require('fs');
var pdf = require('html-pdf');

exports.ServicesType = async (req, res) => {

    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.ServiceTypeID != undefined && request.ServiceTypeID != '') {
        where += ' AND mst.ServiceTypeID=?';
        where_array.push(request.ServiceTypeID);
    }
    if (request.Service != undefined && request.Service != '') {
        where += ' AND mst.ServiceID like ?';
        where_array.push('%' + request.Service + '%');
    }

    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }
    if (request.Type != undefined && request.Type != '') {
        where += ' AND mst.Type like ?';
        where_array.push('%' + request.Type + '%');
    }
    if (request.Status != undefined && request.Status != "") {
        where += ' AND mst.Active=? ';
        where_array.push(request.Status);
    }
    let query = `SELECT CAST(mst.ServiceTypeID as CHAR) as ServiceTypeID,mss.Name,mst.ServiceID as Sidd,(select GROUP_CONCAT(Name) from \ 
    Mst_Services as mss2 where FIND_IN_SET(ServiceID,Sidd)) AS Names ,mst.Type,mst.Description,mst.Active, \
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = mst.EntryBy) as EntryBy,\
    DATE_FORMAT(mst.EntryDate,'%d %b %Y') as EntryDate,mst.EntryIP,\
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = mst.UpdateBy) as UpdateBy,\
    DATE_FORMAT(mst.UpdateDate,'%d %b %Y') as UpdateDate,\
    mst.UpdateIP from Mst_ServicesType as mst left join Mst_Services as mss on mss.ServiceID = mst.ServiceID \
    WHERE 1 `+ where + ` ` + limit;

    async.waterfall([
        function (done) {
            Service.JoinListCount('Mst_ServicesType as mst left join Mst_Services as mss on mss.ServiceID = mst.ServiceID', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddServicesType = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.ServiceTypeID > 0) {
        where_data = {
            'ServiceTypeID': request.ServiceTypeID,
        };
    }
    update_data['ServiceID'] = request.ServiceID;
    update_data['Type'] = request.Type;
    update_data['Active'] = request.Status;
    if (request.Description != undefined && request.Description != 'null') {
        update_data['Description'] = request.Description;
    }

    if (request.ServiceTypeID == "" || request.ServiceTypeID == undefined) {
        request.ServiceTypeID = 0;
    }
    let fieldshow = 'CAST(ServiceTypeID as CHAR) as ServiceTypeID,Type,Description';
    let RequestData = {
        'tableName': 'Mst_ServicesType',
        'IdName': 'ServiceTypeID',
        'ID': request.ServiceTypeID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeleteServicesType = (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Mst_ServicesType', 'ServiceTypeID', req.body.ServiceTypeID, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": [] });
        }
    });
};

exports.MasterServices = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.SearchAll != undefined && request.SearchAll != "") {
        where += ' AND (ms.Name like "%' + request.SearchAll + '%" OR ms.PageTitle like "%' + request.SearchAll + '%" OR ms.LendingType like "%' + request.SearchAll + '%" OR ms.Type like "%' + request.SearchAll + '%") ';
    }
    if (request.ServiceID != undefined && request.ServiceID != '') {
        where += ' AND ms.ServiceID=?';
        where_array.push(request.ServiceID);
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }
    if (request.Name != undefined && request.Name != '') {
        where += ' AND ms.Name like ?';
        where_array.push('%' + request.Name + '%');
    }
    if (request.PageTitle != undefined && request.PageTitle != '') {
        where += ' AND ms.PageTitle like ?';
        where_array.push('%' + request.PageTitle + '%');
    }
    if (request.CountryID != undefined && request.CountryID != '') {
        where += ' AND ms.CountryID=?';
        where_array.push(request.CountryID);
    }
    if (request.LendingType != undefined && request.LendingType != '') {
        where += ' AND ms.LendingType=?';
        where_array.push(request.LendingType);
    }
    if (request.Status != undefined && request.Status != "") {
        where += ' AND ms.Active=? ';
        where_array.push(request.Status);
    }
    let query = `SELECT CAST(ms.ServiceID as CHAR) as ServiceID,ms.Name,ms.PageSlug,ms.CountryID,ms.CountryID as CID,(select GROUP_CONCAT(CountryName) from 
    Mst_Country as mc where FIND_IN_SET(mc.CountryID,ms.CountryID)) as CountryName ,ms.SeoTitle,ms.SeoDescription,ms.SeoKeyword,ms.PageTitle,ms.MediaImage,ms.LendingType,ms.DisplayOrder,ms.Active, 
    DATE_FORMAT(ms.EntryDate,'%d %b %Y') as EntryDate,ms.EntryIP,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = ms.UpdateBy) as UpdateBy,
    DATE_FORMAT(ms.UpdateDate,'%d %b %Y') as UpdateDate,
    ms.UpdateIP from Mst_Services as ms  WHERE 1 `+ where + `order by ms.ServiceID desc ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Mst_Services as ms', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                // console.log(data2)
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddMasterServices = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.ServiceID > 0) {
        where_data = {
            'ServiceID': request.ServiceID,
        };
    }
    // let check_query = 'SELECT * FROM  Mst_Services WHERE PageSlug = '+request.PageSlug+' and ServiceID !='+request.ServiceID;
    // let check_data = await sqlhelper.select(check_query, [], (err, res) => {
    //     if (err) {
    //         callback(err, new Array());
    //         return 0;
    //     }else if (_.isEmpty(res)) {
    //         return 1;
    //     } else {
    //         callback(null,{'message' : 'Service slug all ready exit','data' : new Array() });
    //         return -1;
    //     }
    // });
    // if (check_data==-1) {
    //     return;
    // }
    if (req.files.recfile) {
        let FileDetail = {
            TableName: 'Mst_Services',
            FieldName: 'MediaImage',
            IDName: 'ServiceID',
            ID: request.ServiceID || 0,
            Files: req.files.recfile[0].originalname,
            FolderName: 'Mst_Services/ServiceLogo/'
        };
        let ISFileExit = await Commom.CheckFileExit(FileDetail);
        if (!ISFileExit) {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "This image name allready exit. please upload another name.", '0'), "Data": [] });
            return;
        }
    }

    update_data['CountryID'] = request.CountryID;
    update_data['PageTitle'] = request.PageTitle;
    update_data['DisplayOrder'] = request.DisplayOrder;
    update_data['Name'] = request.Name;
    update_data['SeoTitle'] = request.SeoTitle;
    update_data['PageSlug'] = request.PageSlug;
    update_data['SeoDescription'] = request.SeoDescription;
    update_data['SeoKeyword'] = request.SeoKeyword;
    update_data['LendingType'] = 'PreLanding';
    if (request.Type != undefined && request.Type != 'null') {
        update_data['Type'] = request.Type;
    }
    if (request.Status != undefined && request.Status != 'null') {
        update_data['Active'] = request.Status;
    }

    if (request.ServiceID == "" || request.ServiceID == undefined) {
        request.ServiceID = 0;
    }
    update_data['MediaImage'] = request.oldfile;


    if (req.files.recfile) {
        if (Object.entries(req.files.recfile).length) {
            resimage = await upload.uploadFiles(req.files.recfile, 'Mst_Services/ServiceLogo', '1');
        }
        if (Object.entries(req.files.recfile).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            update_data['MediaImage'] = resimage[0];
        }
    }

    let fieldshow = 'CAST(ServiceID as CHAR) as ServiceID,Name,PageTitle,MediaImage,LendingType,DisplayOrder';
    let RequestData = {
        'tableName': 'Mst_Services',
        'IdName': 'ServiceID',
        'ID': request.ServiceID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeleteMasterServices = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let FileDetail = { TableName: 'Mst_Services', FieldName: 'MediaImage', IDName: 'ServiceID', ID: req.body.ServiceID || 0 };
    await Commom.S3FileDelete(FileDetail);
    Service.Delete('Mst_Services', 'ServiceID', req.body.ServiceID, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": req.body.ServiceID });
        }
    });
};

exports.ServicesProvider = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);
    if (request.SearchAll != undefined && request.SearchAll != "") {
        where += ' AND (Name like "%' + request.SearchAll + '%" OR Type like "%' + request.SearchAll + '%" OR Offer like "%' + request.SearchAll + '%" OR ProviderURL like "%' + request.SearchAll + '%") ';
    }
    if (request.ServiceProviderID != undefined && request.ServiceProviderID != '') {
        where += ' AND ServiceProviderID=?';
        where_array.push(request.ServiceProviderID);
    }
    if (request.Name != undefined && request.Name != '') {
        where += ' AND Name like ?';
        where_array.push('%' + request.Name + '%');
    }

    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }
    if (request.Type != undefined && request.Type != '') {
        where += ' AND FIND_IN_SET (Type,?)';
        where_array.push(request.Type);
    }
    if (request.Status != undefined && request.Status != "") {
        where += ' AND Active=? ';
        where_array.push(request.Status);
    }
    // if(request.IsApi != undefined && request.IsApi != 'null')
    // {
    //     where += ' AND IsApi=? ';
    //     where_array.push(request.IsApi);
    // }
    let query = `SELECT CAST(ServiceProviderID as CHAR) as ServiceProviderID,Name,Type as TypeId,(select GROUP_CONCAT(Type) from  
    Mst_ServicesType as mss2 where FIND_IN_SET(ServiceTypeID,TypeId)) AS Type,Offer,ProviderURL,MediaImage,ShortDescription,DetailDescription,Active,IsApi,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = msp.EntryBy) as EntryBy,
    DATE_FORMAT(EntryDate,'%d %b %Y') as EntryDate,EntryIP,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = msp.UpdateBy) as UpdateBy,
    DATE_FORMAT(UpdateDate,'%d %b %Y') as UpdateDate,
    UpdateIP from Mst_ServicesProvider as msp WHERE 1 `+ where + ` order by msp.ServiceProviderID desc ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Mst_ServicesProvider as msp', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddServicesProvider = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.ServiceProviderID > 0) {
        where_data = {
            'ServiceProviderID': request.ServiceProviderID,
        };
    }
    update_data['Name'] = request.Name;
    if (request.Offer != undefined && request.Offer != 'null') {
        update_data['Offer'] = request.Offer;
    }
    if (request.Type != undefined && request.Type != 'null') {
        update_data['Type'] = request.Type;
    }
    if (request.ProviderURL != undefined && request.ProviderURL != 'null') {
        update_data['ProviderURL'] = request.ProviderURL;
    }
    if (request.ShortDescription != undefined && request.ShortDescription != 'null') {
        update_data['ShortDescription'] = request.ShortDescription;
    }
    if (request.DetailDescription != undefined && request.DetailDescription != 'null') {
        update_data['DetailDescription'] = request.DetailDescription;
    }
    if (request.Status != undefined && request.Status != 'null') {
        update_data['Active'] = request.Status;
    }
    if (request.LinkName != undefined && request.LinkName != 'null') {
        update_data['LinkName'] = request.LinkName;
    }
    if (request.ServiceProviderID == "" || request.ServiceProviderID == undefined) {
        request.ServiceProviderID = 0;
    }
    if (request.IsApi != undefined && (request.IsApi == '0' || request.IsApi == '1') ) {
         update_data['IsApi'] = request.IsApi;
    }
    update_data['MediaImage'] = request.oldfile;
    if (req.files.recfile) {
        if (Object.entries(req.files.recfile).length) {
            resimage = await upload.uploadFiles(req.files.recfile, 'Mst_Services');
        }
        if (Object.entries(req.files.recfile).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            update_data['MediaImage'] = resimage[0];
        }
    }
    let fieldshow = 'CAST(ServiceProviderID as CHAR) as ServiceProviderID,Name,Type,Offer,ProviderURL,MediaImage,ShortDescription';
    let RequestData = {
        'tableName': 'Mst_ServicesProvider',
        'IdName': 'ServiceProviderID',
        'ID': request.ServiceProviderID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeleteServicesProvider = (req, res) => {
    let deleteId = req.body.ServiceProviderID;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Mst_ServicesProvider', 'ServiceProviderID', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
};

exports.SPMaping = async (req, res) => {

    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.SearchAll != undefined && request.SearchAll != "") {
        where += ' AND (msp.Name like "%' + request.SearchAll + '%" OR CountryName like "%' + request.SearchAll + '%" OR ms.Name like "%' + request.SearchAll + '%" OR mspm.DisplayOrder like "%' + request.SearchAll + '%") ';
    }
    if (request.ServiceProviderMapID != undefined && request.ServiceProviderMapID != '') {
        where += ' AND mspm.ServiceProviderMapID=?';
        where_array.push(request.ServiceProviderMapID);
    }
    if (request.ServiceID != undefined && request.ServiceID != '') {
        where += ' AND mspm.ServiceID=?';
        where_array.push(request.ServiceID);
    }
    if (request.ServiceProviderID != undefined && request.ServiceProviderID != '') {
        where += ' AND mspm.ServiceProviderID=?';
        where_array.push(request.ServiceProviderID);
    }
    if (request.DisplayOrder != undefined && request.DisplayOrder != '') {
        where += ' AND mspm.DisplayOrder like ?';
        where_array.push('%' + request.DisplayOrder + '%');
    }

    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }

    if (request.Status != undefined && request.Status != "") {
        where += ' AND mspm.Active=? ';
        where_array.push(request.Status);
    }
    let query = `SELECT CAST(mspm.ServiceProviderMapID as CHAR) as ServiceProviderMapID,msp.Name as ProviderName,mst.Type as ServiceType,mspm.ServiceID,mspm.ServiceProviderID,mspm.CountryID as cid,ms.Name as ServiceName,(select GROUP_CONCAT(mc2.CountryName) from \ 
    Mst_Country as mc2 where FIND_IN_SET(mc2.CountryID,cid)) AS CountryName,mspm.DisplayOrder,mspm.Active,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = mspm.EntryBy) as EntryBy,
    DATE_FORMAT(mspm.EntryDate,'%d %b %Y') as EntryDate,mspm.EntryIP,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = mspm.UpdateBy) as UpdateBy,
    DATE_FORMAT(mspm.UpdateDate,'%d %b %Y') as UpdateDate,
    mspm.UpdateIP from Mst_ServicesProviderMapping as mspm left join Mst_Services ms on ms.ServiceID = mspm.ServiceID
    left join Mst_ServicesProvider msp on msp.ServiceProviderID = mspm.ServiceProviderID
    left join Mst_ServicesType mst on mst.ServiceTypeID = msp.Type
    left join Mst_Country mc on mc.CountryID = mspm.CountryID
    WHERE 1 `+ where + ` order by mspm.ServiceProviderMapID desc ` + limit;

    async.waterfall([
        function (done) {
            Service.JoinListCount('Mst_ServicesProviderMapping as mspm left join Mst_Services ms on ms.ServiceID = mspm.ServiceID left join Mst_ServicesProvider msp on msp.ServiceProviderID = mspm.ServiceProviderID left join Mst_Country mc on mc.CountryID = mspm.CountryID', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddSPMaping = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.ServiceProviderMapID > 0) {
        where_data = {
            'ServiceProviderMapID': request.ServiceProviderMapID,
        };
    }
    update_data['ServiceID'] = request.ServiceID;
    update_data['ServiceProviderID'] = request.ServiceProviderID;
    update_data['CountryID'] = request.CountryID;
    update_data['DisplayOrder'] = request.DisplayOrder;

    if (request.Status != undefined && request.Status != 'null') {
        update_data['Active'] = request.Status;
    }

    if (request.ServiceProviderMapID == "" || request.ServiceProviderMapID == undefined) {
        request.ServiceProviderMapID = 0;
    }

    let fieldshow = 'CAST(ServiceProviderMapID as CHAR) as ServiceProviderMapID,DisplayOrder';
    let RequestData = {
        'tableName': 'Mst_ServicesProviderMapping',
        'IdName': 'ServiceProviderMapID',
        'ID': request.ServiceProviderMapID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeleteSPMaping = (req, res) => {
    let deleteId = req.body.ServiceProviderMapID;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Mst_ServicesProviderMapping', 'ServiceProviderMapID', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
};

exports.MessageTemplate = async (req, res) => {

    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.TemplateID != undefined && request.TemplateID != '') {
        where += ' AND TemplateID=?';
        where_array.push(request.TemplateID);
    }

    if (request.TemplateName != undefined && request.TemplateName != '') {
        where += ' AND TemplateName like ?';
        where_array.push('%' + request.TemplateName + '%');
    }

    if (request.TemplateSubject != undefined && request.TemplateSubject != '') {
        where += ' AND TemplateSubject like ?';
        where_array.push('%' + request.TemplateSubject + '%');
    }

    if (request.CCEmail != undefined && request.CCEmail != '') {
        where += ' AND CCEmail like ?';
        where_array.push('%' + request.CCEmail + '%');
    }

    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }

    if (request.Status != undefined && request.Status != "") {
        where += ' AND Active=? ';
        where_array.push(request.Status);
    }
    let query = `SELECT CAST(TemplateID as CHAR) as TemplateID,TemplateName,TemplateSubject,TemplateBody,CCEmail,Active,Remark,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = mm.EntryBy) as EntryBy,
    DATE_FORMAT(EntryDate,'%d %b %Y') as EntryDate,EntryIP,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = mm.UpdateBy) as UpdateBy,
    DATE_FORMAT(UpdateDate,'%d %b %Y') as UpdateDate,
    UpdateIP from Mst_MessageTemplate  as mm
    WHERE 1 `+ where + ` order by TemplateID desc ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Mst_MessageTemplate', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddMessageTemplate = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.TemplateID > 0) {
        where_data = {
            'TemplateID': request.TemplateID,
        };
    }
    update_data['TemplateName'] = request.TemplateName;
    update_data['TemplateSubject'] = request.TemplateSubject;
    update_data['TemplateBody'] = request.TemplateBody;
    update_data['CCEmail'] = request.CCEmail;
    update_data['Remark'] = request.Remark;

    if (request.Status != undefined && request.Status != 'null') {
        update_data['Active'] = request.Status;
    }

    if (request.TemplateID == "" || request.TemplateID == undefined) {
        request.TemplateID = 0;
    }

    let fieldshow = 'CAST(TemplateID as CHAR) as TemplateID,TemplateName,TemplateSubject';
    let RequestData = {
        'tableName': 'Mst_MessageTemplate',
        'IdName': 'TemplateID',
        'ID': request.TemplateID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeleteMessageTemplate = (req, res) => {
    let deleteId = req.body.TemplateID;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Mst_MessageTemplate', 'TemplateID', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
};

exports.WebTestimonial = async (req, res) => {

    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.TestimonialID != undefined && request.TestimonialID != '') {
        where += ' AND wt.TestimonialID=?';
        where_array.push(request.TestimonialID);
    }
    if (request.CountryID != undefined && request.CountryID != '') {
        where += ' AND wt.CountryID=?';
        where_array.push(request.CountryID);
    }
    if (request.ServiceID != undefined && request.ServiceID != '') {
        where += ' AND wt.ServiceID=?';
        where_array.push(request.ServiceID);
    }

    if (request.Designation != undefined && request.Designation != '') {
        where += ' AND wt.Designation like ?';
        where_array.push('%' + request.Designation + '%');
    }
    if (request.Name != undefined && request.Name != '') {
        where += ' AND wt.Name like ?';
        where_array.push('%' + request.Name + '%');
    }
    if (request.CompanyName != undefined && request.CompanyName != '') {
        where += ' AND wt.CompanyName like ?';
        where_array.push('%' + request.CompanyName + '%');
    }

    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }

    if (request.Status != undefined && request.Status != "") {
        where += ' AND wt.Active=? ';
        where_array.push(request.Status);
    }
    let query = `SELECT CAST(wt.TestimonialID as CHAR) as TestimonialID,wt.CountryID,wt.ServiceID,ms.Name as ServiceName,wt.Name,wt.Gender,wt.Designation,wt.CompanyName,mc.CountryName,ImageURL,wt.VideoURL,wt.Description,wt.Rating,wt.DisplayOrder,wt.Active,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = wt.EntryBy) as EntryBy,
    DATE_FORMAT(wt.EntryDate,'%d %b %Y') as EntryDate,wt.EntryIP,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = wt.UpdateBy) as UpdateBy,
    DATE_FORMAT(wt.UpdateDate,'%d %b %Y') as UpdateDate,
    wt.UpdateIP from Mst_WebTestimonial  as wt left join Mst_Country as mc on mc.CountryID = wt.CountryID
    left join Mst_Services as ms on ms.ServiceID = wt.ServiceID
    WHERE 1 `+ where + ` ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Mst_WebTestimonial as wt', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddWebTestimonial = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.TestimonialID > 0) {
        where_data = {
            'TestimonialID': request.TestimonialID,
        };
    }
    update_data['Name'] = request.Name;
    update_data['Designation'] = request.Designation;
    update_data['Description'] = request.Description;

    if (request.Gender != undefined && request.Gender != 'null') {
        update_data['Gender'] = request.Gender;
    }
    if (request.CompanyName != undefined && request.CompanyName != 'null') {
        update_data['CompanyName'] = request.CompanyName;
    }
    if (request.Rating != undefined && request.Rating != 'null') {
        update_data['Rating'] = request.Rating;
    }
    if (request.CountryID != undefined && request.CountryID != 'null') {
        update_data['CountryID'] = request.CountryID;
    }
    if (request.ServiceID != undefined && request.ServiceID != 'null') {
        update_data['ServiceID'] = request.ServiceID;
    }
    if (request.ImageURL != undefined && request.ImageURL != 'null') {
        update_data['ImageURL'] = request.ImageURL;
    }
    if (request.VideoURL != undefined && request.VideoURL != 'null') {
        update_data['VideoURL'] = request.VideoURL;
    }
    if (request.DisplayOrder != undefined && request.DisplayOrder != 'null') {
        update_data['DisplayOrder'] = request.DisplayOrder;
    }
    if (request.Status != undefined && request.Status != 'null') {
        update_data['Active'] = request.Status;
    }
    if (request.TestimonialID == "" || request.TestimonialID == undefined) {
        request.TestimonialID = 0;
    }
    update_data['ImageURL'] = request.oldfile;
    if (req.files.recfile != undefined && req.files.recfile != "") {
        if (Object.entries(req.files.recfile).length) {
            resimage = await upload.uploadFiles(req.files.recfile, 'Testimonial');
        }
        if (Object.entries(req.files.recfile).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            update_data['ImageURL'] = resimage[0];
        }
    }
    let fieldshow = 'CAST(TestimonialID as CHAR) as TestimonialID,Name,Gender';
    let RequestData = {
        'tableName': 'Mst_WebTestimonial',
        'IdName': 'TestimonialID',
        'ID': request.TestimonialID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeleteWebTestimonial = (req, res) => {
    let deleteId = req.body.TestimonialID;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Mst_WebTestimonial', 'TestimonialID', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
};

exports.Discipline = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.DisciplineID != undefined && request.DisciplineID != '') {
        where += ' AND md.DisciplineID=?';
        where_array.push(request.DisciplineID);
    }

    if (request.DisciplineName != undefined && request.DisciplineName != '') {
        where += ' AND md.DisciplineName like ?';
        where_array.push('%' + request.DisciplineName + '%');
    }

    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }

    if (request.Status != undefined && request.Status != "") {
        where += ' AND md.Active=? ';
        where_array.push(request.Status);
    }
    let query = `SELECT CAST(md.DisciplineID as CHAR) as DisciplineID,DisciplineName,DisciplineLogo,Active,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = md.EntryBy) as EntryBy,
    DATE_FORMAT(md.EntryDate,'%d %b %Y') as EntryDate,md.EntryIP,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = md.UpdateBy) as UpdateBy,
    DATE_FORMAT(md.UpdateDate,'%d %b %Y') as UpdateDate,
    md.UpdateIP from Mst_Discipline as md  WHERE 1 `+ where + ` ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Mst_Discipline as md', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddDiscipline = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.DisciplineID > 0) {
        where_data = {
            'DisciplineID': request.DisciplineID,
        };
    }
    update_data['DisciplineName'] = request.DisciplineName;
    update_data['DisciplineLogo'] = request.oldfile;
    if (req.files.recfile) {
        if (Object.entries(req.files.recfile).length) {
            resimage = await upload.uploadFiles(req.files.recfile, 'Mst_Services');
        }
        if (Object.entries(req.files.recfile).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            update_data['DisciplineLogo'] = resimage[0];
        }
    }
    if (request.Status != undefined) {
        update_data['Active'] = request.Status;
    }
    let fieldshow = 'CAST(DisciplineID as CHAR) as DisciplineID,DisciplineName,DisciplineLogo';
    let RequestData = {
        'tableName': 'Mst_Discipline',
        'IdName': 'DisciplineID',
        'ID': request.DisciplineID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeleteDiscipline = (req, res) => {
    let deleteId = req.body.DisciplineID;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Mst_Discipline', 'DisciplineID', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
};

exports.Intake = async (req, res) => {

    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.IntakeID != undefined && request.IntakeID != '') {
        where += ' AND mi.IntakeID=?';
        where_array.push(request.IntakeID);
    }

    if (request.Type != undefined && request.Type != '') {
        where += ' AND mi.Type like ?';
        where_array.push('%' + request.Type + '%');
    }

    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }

    if (request.Status != undefined && request.Status != "") {
        where += ' AND mi.Active=? ';
        where_array.push(request.Status);
    }
    let query = `SELECT CAST(mi.IntakeID as CHAR) as IntakeID,Type,IntakeFrom,IntakeTo,Description,Active,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = mi.EntryBy) as EntryBy,
    DATE_FORMAT(mi.EntryDate,'%d %b %Y') as EntryDate,mi.EntryIP,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = mi.UpdateBy) as UpdateBy,
    DATE_FORMAT(mi.UpdateDate,'%d %b %Y') as UpdateDate,
    mi.UpdateIP from Mst_Intake as mi  WHERE 1 `+ where + ` ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Mst_Intake as mi', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddIntake = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.IntakeID > 0) {
        where_data = {
            'IntakeID': request.IntakeID,
        };
    }
    update_data['IntakeFrom'] = request.IntakeFrom;
    if (request.Type != undefined && request.Type != 'null') {
        update_data['Type'] = request.Type;
    }
    if (request.Description != undefined && request.Description != 'null') {
        update_data['Description'] = request.Description;
    }
    if (request.IntakeTo != undefined && request.IntakeTo != 'null') {
        update_data['IntakeTo'] = request.IntakeTo;
    }
    if (request.Status != undefined && request.Status != 'null') {
        update_data['Active'] = request.Status;
    }

    let fieldshow = 'CAST(IntakeID as CHAR) as IntakeID,IntakeFrom,IntakeTo';
    let RequestData = {
        'tableName': 'Mst_Intake',
        'IdName': 'IntakeID',
        'ID': request.IntakeID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeleteIntake = (req, res) => {
    let deleteId = req.body.IntakeID;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Mst_Intake', 'IntakeID', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
};

exports.AssociateType = async (req, res) => {

    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.AssociateID != undefined && request.AssociateID != '') {
        where += ' AND mat.AssociateID=?';
        where_array.push(request.AssociateID);
    }
    if (request.Name != undefined && request.Name != '') {
        where += ' AND mat.ComapnyName like ?';
        where_array.push('%' + request.Name + '%');
    }
    if (request.CompanyEmail != undefined && request.CompanyEmail != '') {
        where += ' AND mat.CompanyEmail like ?';
        where_array.push('%' + request.CompanyEmail + '%');
    }
    if (request.Website != undefined && request.Website != '') {
        where += ' AND mat.Website like ?';
        where_array.push('%' + request.Website + '%');
    }
    if (request.Phoneno != undefined && request.Phoneno != '') {
        where += ' AND (mat.Phone1= ' + request.Phoneno + ' OR mat.Phone2= ' + request.Phoneno + ' OR mat.ContactPhoneNo= ' + request.Phoneno + ')';
    }

    if (request.CountryID != undefined && request.CountryID != '') {
        where += ' AND mat.CountryID=?';
        where_array.push(request.CountryID);
    }
    if (request.StateID != undefined && request.StateID != '') {
        where += ' AND mat.StateID=?';
        where_array.push(request.StateID);
    }
    if (request.CityID != undefined && request.CityID != '') {
        where += ' AND mat.CityID=?';
        where_array.push(request.CityID);
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }

    if (request.Status != undefined && request.Status != "") {
        where += ' AND mat.Active=? ';
        where_array.push(request.Status);
    }

    let query = `SELECT CAST(mat.AssociateID as CHAR) as AssociateID,mat.ComapnyName,mat.CountryID,mat.StateID,mat.CityID,mc.CountryName,mc.PhoneCode,ms.StateName,mcity.CityName,mat.CompanyEmail,mat.Website,mat.Skype,mat.Phone1,mat.Phone1_CountryCode,mat.Phone2,mat.Phone2_CountryCode,mat.RegisterNo,DATE_FORMAT(mat.Regsiter_StarDate,'%d %b %Y') as Regsiter_StarDate,DATE_FORMAT(mat.Regsiter_EndDate,'%d %b %Y') as Regsiter_EndDate,mat.UserName,mat.Password,mat.LoginUrl,mat.FirstName,mat.LastName,mat.Email,mat.Designation,mat.StreetAddress,mat.PostCode,mat.ContactPhoneNo,mat.ContactPhoneNo_CountryCode,mat.ComapnyPhoto,mat.Active,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = mat.EntryBy) as EntryBy,
    DATE_FORMAT(mat.EntryDate,'%d %b %Y') as EntryDate,mat.EntryIP,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = mat.UpdateBy) as UpdateBy,
    DATE_FORMAT(mat.UpdateDate,'%d %b %Y') as UpdateDate,
    mat.UpdateIP from Mst_AssociateType as mat left join Mst_Country as mc on mc.CountryID = mat.CountryID
    left join Mst_State as ms on  ms.StateID =mat.StateID
    left join Mst_City as mcity on mcity.CityID = mat.CityID WHERE 1 `+ where + ` ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Mst_AssociateType as mat', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddAssociateType = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.AssociateID > 0) {
        where_data = {
            'AssociateID': request.AssociateID,
        };
    }
    update_data['ComapnyName'] = request.ComapnyName;
    update_data['CompanyEmail'] = request.CompanyEmail;

    if (request.Website != undefined && request.Website != 'null') {
        update_data['Website'] = request.Website;
    }
    if (request.Skype != undefined && request.Skype != 'null') {
        update_data['Skype'] = request.Skype;
    }
    if (request.Phone1 != undefined && request.Phone1 != 'null') {
        update_data['Phone1'] = request.Phone1;
    }
    if (request.Phone1_CountryCode != undefined && request.Phone1_CountryCode != 'null') {
        update_data['Phone1_CountryCode'] = request.Phone1_CountryCode;
    }
    if (request.Phone2 != undefined && request.Phone2 != 'null') {
        update_data['Phone2'] = request.Phone2;
    }
    if (request.Phone2_CountryCode != undefined && request.Phone2_CountryCode != 'null') {
        update_data['Phone2_CountryCode'] = request.Phone2_CountryCode;
    }
    if (request.RegisterNo != undefined && request.RegisterNo != 'null') {
        update_data['RegisterNo'] = request.RegisterNo;
    }
    if (request.Regsiter_StarDate != undefined && request.Regsiter_StarDate != 'null') {
        update_data['Regsiter_StarDate'] = request.Regsiter_StarDate;
    }
    if (request.Regsiter_EndDate != undefined && request.Regsiter_EndDate != 'null') {
        update_data['Regsiter_EndDate'] = request.Regsiter_EndDate;
    }
    if (request.UserName != undefined && request.UserName != 'null') {
        update_data['UserName'] = request.UserName;
    }
    if (request.Password != undefined && request.Password != 'null') {
        update_data['Password'] = request.Password;
    }
    if (request.LoginUrl != undefined && request.LoginUrl != 'null') {
        update_data['LoginUrl'] = request.LoginUrl;
    }
    if (request.FirstName != undefined && request.FirstName != 'null') {
        update_data['FirstName'] = request.FirstName;
    }
    if (request.LastName != undefined && request.LastName != 'null') {
        update_data['LastName'] = request.LastName;
    }
    if (request.Email != undefined && request.Email != 'null') {
        update_data['Email'] = request.Email;
    }
    if (request.Designation != undefined && request.Designation != 'null') {
        update_data['Designation'] = request.Designation;
    }
    if (request.StreetAddress != undefined && request.StreetAddress != 'null') {
        update_data['StreetAddress'] = request.StreetAddress;
    }
    if (request.PostCode != undefined && request.PostCode != 'null') {
        update_data['PostCode'] = request.PostCode;
    }
    if (request.CountryID != undefined && request.CountryID != 'null') {
        update_data['CountryID'] = request.CountryID;
    }
    if (request.StateID != undefined && request.StateID != 'null') {
        update_data['StateID'] = request.StateID;
    }
    if (request.StreetAddress != undefined && request.StreetAddress != 'null') {
        update_data['StreetAddress'] = request.StreetAddress;
    }

    if (request.CityID != undefined && request.CityID != 'null') {
        update_data['CityID'] = request.CityID;
    }
    if (request.ContactPhoneNo != undefined && request.ContactPhoneNo != 'null') {
        update_data['ContactPhoneNo'] = request.ContactPhoneNo;
    }
    if (request.ContactPhoneNo_CountryCode != undefined && request.ContactPhoneNo_CountryCode != 'null') {
        update_data['ContactPhoneNo_CountryCode'] = request.ContactPhoneNo_CountryCode;
    }
    if (request.Status != undefined) {
        update_data['Active'] = request.Status;
    }
    update_data['ComapnyPhoto'] = request.oldfile;
    if (req.files.recfile) {
        if (Object.entries(req.files.recfile).length) {
            resimage = await upload.uploadFiles(req.files.recfile, 'Mst_Services');
        }
        if (Object.entries(req.files.recfile).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            update_data['ComapnyPhoto'] = resimage[0];
        }
    }
    let fieldshow = 'CAST(AssociateID as CHAR) as AssociateID,ComapnyName,CompanyEmail';
    let RequestData = {
        'tableName': 'Mst_AssociateType',
        'IdName': 'AssociateID',
        'ID': request.AssociateID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeleteAssociateType = (req, res) => {
    let deleteId = req.body.AssociateID;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Mst_AssociateType', 'AssociateID', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
};

exports.PromoCode = async (req, res) => {

    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.PromoCodeID != undefined && request.PromoCodeID != "") {
        where += ' AND pro.PromoCodeID=? ';
        where_array.push(request.PromoCodeID);
    }
    if (request.Title != undefined && request.Title != '') {
        where += ' AND pro.Title like ?';
        where_array.push('%' + request.Title + '%');
    }
    if (request.StartDate != undefined && request.StartDate != "") {
        where += ' AND date(pro.StartDate)=? ';
        where_array.push(request.StartDate);
    }
    if (request.EndDate != undefined && request.EndDate != "") {
        where += ' AND pro.EndDate like ? ';
        where_array.push('%' + request.EndDate + '%');
    }
    if (request.DiscountType != undefined && request.DiscountType != '') {
        where += ' AND pro.DiscountType like ?';
        where_array.push('%' + request.DiscountType + '%');
    }
    if (request.CoupanCode != undefined && request.CoupanCode != '') {
        where += ' AND pro.CoupanCode like ?';
        where_array.push('%' + request.CoupanCode + '%');
    }

    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }

    if (request.Status != undefined && request.Status != "") {
        where += ' AND pro.Active=? ';
        where_array.push(request.Status);
    }
    let query = `SELECT CAST(pro.PromoCodeID as CHAR) as PromoCodeID,pro.Title,CoupanCode,DATE_FORMAT(pro.StartDate,'%d %b %Y') as StartDate,pro.StartDate as StartDate2,DATE_FORMAT(pro.EndDate,'%d %b %Y') as EndDate,pro.EndDate as EndDate2,DiscountType,Discount,TotalLimit,PerUserLimit,Description,Active,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = pro.EntryBy) as EntryBy,
    DATE_FORMAT(pro.EntryDate,'%d %b %Y') as EntryDate,pro.EntryIP,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = pro.UpdateBy) as UpdateBy,
    DATE_FORMAT(pro.UpdateDate,'%d %b %Y') as UpdateDate,
    pro.UpdateIP from Mst_PromoCode as pro WHERE 1 `+ where + ` ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Mst_PromoCode as pro', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddPromoCode = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.PromoCodeID > 0) {
        where_data = {
            'PromoCodeID': request.PromoCodeID,
        };
    }
    update_data['Title'] = request.Title;
    update_data['CoupanCode'] = request.CoupanCode;
    update_data['StartDate'] = request.StartDate;
    update_data['EndDate'] = request.EndDate;
    update_data['DiscountType'] = request.DiscountType;
    update_data['Discount'] = request.Discount;
    update_data['TotalLimit'] = request.TotalLimit;
    update_data['PerUserLimit'] = request.PerUserLimit;

    if (request.Description != undefined && request.Description != 'null') {
        update_data['Description'] = request.Description;
    }
    if (request.Status != undefined && request.Status != 'null') {
        update_data['Active'] = request.Status;
    }
    let fieldshow = 'CAST(PromoCodeID as CHAR) as PromoCodeID,Title,CoupanCode';
    let RequestData = {
        'tableName': 'Mst_PromoCode',
        'IdName': 'PromoCodeID',
        'ID': request.PromoCodeID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeletePromoCode = (req, res) => {
    let deleteId = req.body.PromoCodeID;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Mst_PromoCode', 'PromoCodeID', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
};

exports.PropertyType = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.PropertyTypeID != undefined && request.PropertyTypeID != "") {
        where += ' AND pt.PropertyTypeID=? ';
        where_array.push(request.PropertyTypeID);
    }
    if (request.PropertyTypeName != undefined && request.PropertyTypeName != '') {
        where += ' AND pt.PropertyTypeName like ?';
        where_array.push('%' + request.PropertyTypeName + '%');
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }
    if (request.Status != undefined && request.Status != "") {
        where += ' AND pt.Active=? ';
        where_array.push(request.Status);
    }
    let query = `SELECT CAST(pt.PropertyTypeID as CHAR) as PropertyTypeID,PropertyTypeName,DisplayOrder,Description,Active,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = pt.EntryBy) as EntryBy,
    DATE_FORMAT(pt.EntryDate,'%d %b %Y') as EntryDate,pt.EntryIP,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = pt.UpdateBy) as UpdateBy,
    DATE_FORMAT(pt.UpdateDate,'%d %b %Y') as UpdateDate,
    pt.UpdateIP from Mst_PropertyType as pt WHERE 1 `+ where + ` ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Mst_PropertyType as pt', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddPropertyType = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.PropertyTypeID > 0) {
        where_data = {
            'PropertyTypeID': request.PropertyTypeID,
        };
    }
    update_data['PropertyTypeName'] = request.PropertyTypeName;
    if (request.DisplayOrder != undefined && request.DisplayOrder != 'null') {
        update_data['DisplayOrder'] = request.DisplayOrder;
    }
    if (request.Description != undefined && request.Description != 'null') {
        update_data['Description'] = request.Description;
    }
    if (request.Status != undefined && request.Status != 'null') {
        update_data['Active'] = request.Status;
    }
    let fieldshow = 'CAST(PropertyTypeID as CHAR) as PropertyTypeID,PropertyTypeName,DisplayOrder';
    let RequestData = {
        'tableName': 'Mst_PropertyType',
        'IdName': 'PropertyTypeID',
        'ID': request.PropertyTypeID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeletePropertyType = (req, res) => {
    let deleteId = req.body.PropertyTypeID;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Mst_PropertyType', 'PropertyTypeID', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
};

exports.Role = async (req, res) => {

    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);
    if (request.RID != undefined && request.RID != "") {
        where += ' AND rl.RoleID=? ';
        where_array.push(request.RID);
    }
    if (request.RoleName != undefined && request.RoleName != '') {
        where += ' AND rl.RoleName like ?';
        where_array.push('%' + request.RoleName + '%');
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }

    if (request.Status != undefined && request.Status != "") {
        where += ' AND rl.Active=? ';
        where_array.push(request.Status);
    }
    let query = `SELECT CAST(rl.RoleID as CHAR) as RID,RoleName,Active,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = rl.EntryBy) as EntryBy,
    DATE_FORMAT(rl.EntryDate,'%d %b %Y') as EntryDate,rl.EntryIP,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = rl.UpdateBy) as UpdateBy,
    DATE_FORMAT(rl.UpdateDate,'%d %b %Y') as UpdateDate,
    rl.UpdateIP from Mst_Role as rl WHERE 1 `+ where + ` ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Mst_Role as rl', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddRole = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.RID > 0) {
        where_data = {
            'RoleID': request.RID,
        };
    }
    update_data['RoleName'] = request.RoleName;


    if (request.Status != undefined && request.Status != 'null') {
        update_data['Active'] = request.Status;
    }
    let fieldshow = 'CAST(RoleID as CHAR) as RoleID,RoleName';
    let RequestData = {
        'tableName': 'Mst_Role',
        'IdName': 'RoleID',
        'ID': request.RID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeleteRole = (req, res) => {
    let deleteId = req.body.RID;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Mst_Role', 'RoleID', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
};

exports.QuickLink = async (req, res) => {

    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);
    if (request.QuickLinkID != undefined && request.QuickLinkID != "") {
        where += ' AND Ql.QuickLinkID=? ';
        where_array.push(request.QuickLinkID);
    }
    if (request.PageName != undefined && request.PageName != '') {
        where += ' AND Ql.PageName like ?';
        where_array.push('%' + request.PageName + '%');
    }
    if (request.MetaTitle != undefined && request.MetaTitle != '') {
        where += ' AND Ql.MetaTitle like ?';
        where_array.push('%' + request.MetaTitle + '%');
    }
    if (request.MetaDes != undefined && request.MetaDes != '') {
        where += ' AND Ql.MetaDes like ?';
        where_array.push('%' + request.MetaDes + '%');
    }
    if (request.MetaKeyword != undefined && request.MetaKeyword != '') {
        where += ' AND Ql.MetaKeyword like ?';
        where_array.push('%' + request.MetaKeyword + '%');
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }

    if (request.Status != undefined && request.Status != "") {
        where += ' AND Ql.Active=? ';
        where_array.push(request.Status);
    }
    let query = `SELECT CAST(Ql.QuickLinkID as CHAR) as QuickLinkID,Ql.PageName,Content,Ql.Active,MetaTitle,MetaDes,MetaKeyword,Description,QuickSlug
     from Mst_QuickLink as Ql  WHERE 1 `+ where + ` ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Mst_QuickLink as Ql', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddQuickLink = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.QuickLinkID > 0) {
        where_data = {
            'QuickLinkID': request.QuickLinkID,
        };
    }
    update_data['PageName'] = request.PageName;

    if (request.Content != undefined && request.Content != 'null') {
        update_data['Content'] = request.Content;
    }
    if (request.Description != undefined && request.Description != 'null') {
        update_data['Description'] = request.Description;
    }
    if (request.MetaTitle != undefined && request.MetaTitle != 'null') {
        update_data['MetaTitle'] = request.MetaTitle;
    }
    if (request.MetaDes != undefined && request.MetaDes != 'null') {
        update_data['MetaDes'] = request.MetaDes;
    }
    if (request.MetaKeyword != undefined && request.MetaKeyword != 'null') {
        update_data['MetaKeyword'] = request.MetaKeyword;
    }
    if (request.QuickSlug != undefined && request.QuickSlug != 'null') {
        update_data['QuickSlug'] = request.QuickSlug;
    }
    if (request.Status != undefined && request.Status != 'null') {
        update_data['Active'] = request.Status;
    }
    let fieldshow = 'CAST(QuickLinkID as CHAR) as QuickLinkID,Content';
    let RequestData = {
        'tableName': 'Mst_QuickLink',
        'IdName': 'QuickLinkID',
        'ID': request.QuickLinkID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeleteQuickLink = (req, res) => {
    let deleteId = req.body.QuickLinkID;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Mst_QuickLink', 'QuickLinkID', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
};

exports.Banner = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.BannerID != undefined && request.BannerID != "") {
        where += ' AND mb.BannerID=? ';
        where_array.push(request.BannerID);
    }
    if (request.Caption != undefined && request.Caption != '') {
        where += ' AND mb.Caption like ?';
        where_array.push('%' + request.Caption + '%');
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }

    if (request.Status != undefined && request.Status != "") {
        where += ' AND mb.Active=? ';
        where_array.push(request.Status);
    }

    let query = `SELECT CAST(mb.BannerID as CHAR) as BannerID,BannerType as BannerTypeId,if(BannerType='1','MainSlider',if(BannerType='2','SubSlider','-')) as BannerType,Caption,Image,DisplyaOrder,Description,Active,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = mb.EntryBy) as EntryBy,
    DATE_FORMAT(mb.EntryDate,'%d %b %Y') as EntryDate,mb.EntryIP,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = mb.UpdateBy) as UpdateBy,
    DATE_FORMAT(mb.UpdateDate,'%d %b %Y') as UpdateDate,
    mb.UpdateIP from Mst_Banner as mb WHERE 1 `+ where + ` ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Mst_Banner as mb', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddBanner = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.BannerID > 0) {
        where_data = {
            'BannerID': request.BannerID,
        };
    }
    update_data['Caption'] = request.Caption;
    update_data['BannerType'] = request.BannerType;

    if (request.DisplyaOrder != undefined && request.DisplyaOrder != 'null') {
        update_data['DisplyaOrder'] = request.DisplyaOrder;
    }
    if (request.Description != undefined && request.Description != 'null') {
        update_data['Description'] = request.Description;
    }
    if (request.Status != undefined && request.Status != 'null') {
        update_data['Active'] = request.Status;
    }
    update_data['Image'] = request.oldfile;
    if (req.files.recfile) {
        if (request.BannerID > 0) {
            await Commom.S3FileDelete({ TableName: 'Mst_Banner', FieldName: 'Image', IDName: 'BannerID', ID: request.BannerID });
        }
        if (Object.entries(req.files.recfile).length) {
            resimage = await upload.uploadFiles(req.files.recfile, 'Mst_Services');
        }
        if (Object.entries(req.files.recfile).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            update_data['Image'] = resimage[0];
        }
    }
    let fieldshow = 'CAST(BannerID as CHAR) as BannerID,Caption';
    let RequestData = {
        'tableName': 'Mst_Banner',
        'IdName': 'BannerID',
        'ID': request.BannerID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeleteBanner = (req, res) => {
    let deleteId = req.body.BannerID;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Mst_Banner', 'BannerID', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
};

exports.Blog = async (req, res) => {

    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.SearchAll != undefined && request.SearchAll != "") {
        where += ' AND (mb.BlogTitle like "%' + request.SearchAll + '%" OR mb.PageTitle like "%' + request.SearchAll + '%" OR mb.SeoKeyword like "%' + request.SearchAll + '%" OR mb.Type like "%' + request.SearchAll + '%" OR mb.StartDate like "%' + request.SearchAll + '%" OR mb.EndDate like "%' + request.SearchAll + '%") ';
    }
    if (request.BlogID != undefined && request.BlogID != "") {
        where += ' AND mb.BlogID=? ';
        where_array.push(request.BlogID);
    }
    if (request.BlogTitle != undefined && request.BlogTitle != '') {
        where += ' AND mb.BlogTitle like ?';
        where_array.push('%' + request.BlogTitle + '%');
    }
    if (request.PageTitle != undefined && request.PageTitle != '') {
        where += ' AND mb.PageTitle like ?';
        where_array.push('%' + request.PageTitle + '%');
    }
    if (request.Type != undefined && request.Type != "") {
        where += ' AND mb.Type=? ';
        where_array.push(request.Type);
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }

    if (request.Status != undefined && request.Status != "") {
        where += ' AND mb.Active=? ';
        where_array.push(request.Status);
    }
    let query = `SELECT CAST(mb.BlogID as CHAR) as BlogID,
    CONCAT('`+ process.env.STUDENT_PANEL_LINK + `blog/',PageSlug) as PageSlug,PageSlug as BlogUrl,
    BlogTitle,Body,PageTitle,PageDescription,SeoKeyword,MediaImage,ThumbnailImage,MiniImage,Description,DisplayOrder,Type,DATE_FORMAT(StartDate,'%d %b %Y') as StartDate,DATE_FORMAT(EndDate,'%d %b %Y') as EndDate,Active,BlogCategory,BlogTag,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = mb.EntryBy) as EntryBy,
    DATE_FORMAT(mb.EntryDate,'%d %b %Y') as EntryDate,mb.EntryIP,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = mb.UpdateBy) as UpdateBy,
    DATE_FORMAT(mb.UpdateDate,'%d %b %Y') as UpdateDate,
    mb.UpdateIP,mb.IsheaderBlog,mb.WordPressID from Mst_Blogs as mb WHERE 1 `+ where + ` order by mb.BlogID desc ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Mst_Blogs as mb', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['page_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddBlog = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let TagArry = request.BlogTag.split(',');
    // console.log(TagArry);
    if (TagArry) {
        let check_tag_query = `select CAST(ParameterValueID as CHAR) as id from Mst_ParameterValue as mpv where mpv.ParameterTypeID='41' AND mpv.ParameterValueID in ('` + TagArry.join("','") + `')`;
        // console.log(check_tag_query);
        let ParameterValueIDs = await sqlhelper.select(check_tag_query, [], (err, res) => {
            if (err) {
                console.log(err);
                return [];
            } else if (_.isEmpty(res)) {
                return [];
            } else {
                return res;
            }
        });
        // console.log(_.difference(TagArry,_.map(ParameterValueIDs,'id')));
        let NewBlogTag = _.difference(TagArry, _.map(ParameterValueIDs, 'id'));
        for (const [key, value] of Object.entries(NewBlogTag)) {
            let InsertTagObj = {
                ParameterTypeID: 41,
                ParameterValue: value,
                ParameterValueCode: value,
                DisplayOrder: key,
                Remark: 'Add Auto in Blog Page',
                EntryBy: request.UserID,
                EntryDate: moment().format('YYYY-MM-DD HH:mm:ss'),
                EntryIP: request.IpAddress
            }
            let ParameterValueID = "";
            if (value && value != "null" && value != "undefined" && value != undefined && value != null) {
                ParameterValueID = await sqlhelper.insert('Mst_ParameterValue', InsertTagObj, (err, res) => {
                    if (err) {
                        callback(err, new Array());
                        return 0;
                    } else {
                        return res.insertId;
                    }
                });
            }
            let index = _.findIndex(TagArry, function (o) { return o == value; });
            TagArry[index] = ParameterValueID.toString();
        }
    }
    // console.log(TagArry);
    if (req.files.file) {
        let FileDetail = {
            TableName: 'Mst_Blogs',
            FieldName: 'MediaImage',
            IDName: 'BlogID',
            ID: request.BlogID || 0,
            Files: req.files.file[0].originalname,
            FolderName: 'Blogs/'
        };
        let ISFileExit = await Commom.CheckFileExit(FileDetail);
        if (!ISFileExit) {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "This image name allready exit. please upload another name.", '0'), "Data": [] });
            return;
        }
    }
    let update_data = {};
    let where_data = {};
    if (request.BlogID > 0 && request.BlogID != "" && request.BlogID != undefined) {
        where_data = {
            'BlogID': request.BlogID,
        };
    }
    update_data['BlogTitle'] = request.BlogTitle;
    update_data['PageTitle'] = request.PageTitle;
    update_data['SeoKeyword'] = request.SeoKeyword;
    update_data['BlogTag'] = TagArry.join(',');
    update_data['BlogCategory'] = request.BlogCategory;
    update_data['IsheaderBlog'] = '1';
    update_data['PageSlug'] = request.BlogTitle.replace(/[^a-zA-Z0-9 ]/g, "").replace(/ /g, '-').toLocaleLowerCase();

    if (request.BlogUrl && request.BlogUrl != 'undefined' && request.BlogUrl != 'null') {
        update_data['PageSlug'] = request.BlogUrl;
    }
    if (request.PageDescription != undefined && request.PageDescription != 'null') {
        update_data['PageDescription'] = request.PageDescription;
    }
    if (request.Body != undefined && request.Body != 'null') {
        update_data['Body'] = request.Body;
    }
    if (request.Description != undefined && request.Description != 'null') {
        update_data['Description'] = request.Description;
    }
    if (request.DisplayOrder != undefined && request.DisplayOrder != 'null') {
        update_data['DisplayOrder'] = request.DisplayOrder;
    }
    if (request.Type != undefined && request.Type != 'null') {
        update_data['Type'] = request.Type;
    }
    if (request.StartDate != undefined && request.StartDate != 'null') {
        update_data['StartDate'] = request.StartDate;
    }
    if (request.EndDate != undefined && request.EndDate != 'null') {
        update_data['EndDate'] = request.EndDate;
    }
    if (request.Status != undefined && request.Status != 'null') {
        update_data['Active'] = request.Status;
    }
    update_data['MediaImage'] = request.Mainoldfile;
    update_data['ThumbnailImage'] = request.oldfile;
    update_data['MiniImage'] = request.Minioldfile;

    if (req.files.file) {
        if (Object.entries(req.files.file).length) {
            resimage = await upload.uploadFiles(req.files.file, 'Blogs', '1');
        }
        if (Object.entries(req.files.file).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            update_data['MediaImage'] = resimage[0];
        }
        // let ThumbFile = await upload.CreateThumnail(req.files.recfile,150,150);
        // if(ThumbFile.Status == '1')
        // {
        //     if (Object.entries(ThumbFile.FileArray).length) {
        //         resimage = await upload.uploadFiles(ThumbFile.FileArray, 'Blogs');
        //     }
        //     if (Object.entries(ThumbFile.FileArray).length) {
        //         let filearray = resimage[0].split("/");
        //         let filename=filearray[filearray.length-1];
        //         update_data['MiniImage'] = resimage[0];
        //     } 
        // }
    }

    if (req.files.recfile2) {
        if (Object.entries(req.files.recfile2).length) {
            resimage = await upload.uploadFiles(req.files.recfile2, 'MiniBlogs');
        }
        if (Object.entries(req.files.recfile2).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            update_data['MiniImage'] = resimage[0];
        }
    }

    if (req.files.recfile) {
        if (Object.entries(req.files.recfile).length) {
            resimage = await upload.uploadFiles(req.files.recfile, 'ThumbBlogImage');
        }
        if (Object.entries(req.files.recfile).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            update_data['ThumbnailImage'] = resimage[0];
        }
    }

    let fieldshow = 'CAST(BlogID as CHAR) as BlogID,BlogTitle,MediaImage,PageTitle';
    let RequestData = {
        'tableName': 'Mst_Blogs',
        'IdName': 'BlogID',
        'ID': request.BlogID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, async (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            // var Emails = await Commom.GetSubscribeEmails();
            // var EmailData = await Commom.GetEmailTemplate('BlogAdd');
            // EmailData.ToMail = _.map(Emails, 'EmailAddress');
            // var para_data = await Send_Mail.Ocxee_SMTP_Mail_Multiple2(EmailData);
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeleteBlog = async (req, res) => {
    let deleteId = req.body.BlogID;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let FileDetail = { TableName: 'Mst_Blogs', FieldName: 'MediaImage', IDName: 'BlogID', ID: deleteId || 0 };
    await Commom.S3FileDelete(FileDetail);
    Service.Delete('Mst_Blogs', 'BlogID', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
};

exports.NewsMedia = async (req, res) => {

    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);
    // request.Date.split('-')[0]
    if (request.SearchAll != undefined && request.SearchAll != "") {
        where += ' AND (mn.MediaType like "%' + request.SearchAll + '%" OR mn.NewsType like "%' + request.SearchAll + '%" OR mn.NewsApply like "%' + request.SearchAll + '%" OR mn.MediaURL like "%' + request.SearchAll + '%" OR mn.EndDate like "%' + request.SearchAll + '%" OR mn.SeoKeyword like "%' + request.SearchAll + '%" OR mn.StartDate like "%' + request.SearchAll + '%" OR mn.Title like "%' + request.SearchAll + '%") ';
    }
    if (request.NewsID != undefined && request.NewsID != "") {
        where += ' AND mn.NewsID=? ';
        where_array.push(request.NewsID);
    }
    if (request.MediaType != undefined && request.MediaType != '') {
        where += ' AND mn.MediaType like ?';
        where_array.push('%' + request.MediaType + '%');
    }
    if (request.NewsType != undefined && request.NewsType != '') {
        where += ' AND mn.NewsType like ?';
        where_array.push('%' + request.NewsType + '%');
    }
    if (request.NewsApply != undefined && request.NewsApply != '') {
        where += ' AND mn.NewsApply like ?';
        where_array.push('%' + request.NewsApply + '%');
    }
    if (request.Type != undefined && request.Type != "") {
        where += ' AND mn.Type=? ';
        where_array.push(request.Type);
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }
    if (request.StartDate != undefined && request.StartDate != "") {
        where += ' AND date(mn.EntryDate)>=? ';
        where_array.push(request.StartDate);
    }
    if (request.EndDate != undefined && request.EndDate != "") {
        where += ' AND date(mn.EntryDate)<=? ';
        where_array.push(request.EndDate);
    }
    // column_name BETWEEN value1 AND value2
    if (request.Status != undefined && request.Status != "") {
        where += ' AND mn.Active=? ';
        where_array.push(request.Status);
    }

    if (request.RoleID != undefined && request.RoleID == '2') {
        where += ' AND mn.Type="Channel Parnter" ';
    }

    let query = `SELECT CAST(mn.NewsID as CHAR) as NewsID,MediaType,PageTitle,NewsType,Type,NewsApply,ThumbnailImage,MainImage,MediaURL,Title,SeoKeyword,Description,DisplayOrder,DATE_FORMAT(StartDate,'%d %b %Y') as StartDate,StartDate as StartDate2,DATE_FORMAT(EndDate,'%d %b %Y') as EndDate,EndDate as EndDate2,Active,NewsCategory,NewsTag,SeoDescription,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = mn.EntryBy) as EntryBy,
    DATE_FORMAT(mn.EntryDate,'%d %b %Y') as EntryDate,mn.EntryIP,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = mn.UpdateBy) as UpdateBy,
    DATE_FORMAT(mn.UpdateDate,'%d %b %Y') as UpdateDate,
    mn.UpdateIP from Mst_News as mn WHERE 1 `+ where + ` order by mn.EntryDate desc ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Mst_News as mn', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['page_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddNewsMedia = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    if (req.files.recfile) {
        let FileDetail = {
            TableName: 'Mst_News',
            FieldName: 'MainImage',
            IDName: 'NewsID',
            ID: request.NewsID || 0,
            Files: req.files.recfile[0].originalname,
            FolderName: 'News/'
        };
        let ISFileExit = await Commom.CheckFileExit(FileDetail);
        if (!ISFileExit) {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "This image name allready exit. please upload another name.", '0'), "Data": [] });
            return;
        }
    }

    let update_data = {};
    let where_data = {};
    if (request.NewsID > 0 && request.NewsID != "" && request.NewsID != undefined) {
        where_data = {
            'NewsID': request.NewsID,
        };
    }
    if (request.Title != undefined && request.Title != 'null') {
        update_data['Title'] = request.Title;
    }

    update_data['PageTitle'] = request.PageTitle;
    update_data['NewsTag'] = request.NewsTag;
    update_data['NewsCategory'] = request.NewsCategory;
    update_data['SeoDescription'] = request.SeoDescription;
    if (request.MediaType != undefined && request.MediaType != 'null') {
        update_data['MediaType'] = request.MediaType;
    }
    if (request.NewsType != undefined && request.NewsType != 'null') {
        update_data['NewsType'] = request.NewsType;
    }
    if (request.NewsApply != undefined && request.NewsApply != 'null') {
        update_data['NewsApply'] = request.NewsApply;
    }
    if (request.MediaURL != undefined && request.MediaURL != 'null') {
        update_data['MediaURL'] = request.MediaURL;
    }
    if (request.Type != undefined && request.Type != 'null') {
        update_data['Type'] = request.Type;
    }
    if (request.SeoKeyword != undefined && request.SeoKeyword != 'null') {
        update_data['SeoKeyword'] = request.SeoKeyword;
    }
    if (request.Description != undefined && request.Description != 'null') {
        update_data['Description'] = request.Description;
    }
    if (request.DisplayOrder != undefined && request.DisplayOrder != 'null') {
        update_data['DisplayOrder'] = request.DisplayOrder;
    }
    if (request.StartDate != undefined && request.StartDate != 'null') {
        update_data['StartDate'] = request.StartDate;
    }
    if (request.EndDate != undefined && request.EndDate != 'null') {
        update_data['EndDate'] = request.EndDate;
    }
    if (request.Status != undefined && request.Status != 'null') {
        update_data['Active'] = request.Status;
    }
    update_data['MainImage'] = request.oldfile;
    if (req.files.recfile) {
        if (Object.entries(req.files.recfile).length) {
            resimage = await upload.uploadFiles(req.files.recfile, 'News', '1');
        }
        if (Object.entries(req.files.recfile).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            update_data['MainImage'] = resimage[0];
        }
        update_data['ThumbnailImage'] = update_data['MainImage'];
        // let ThumbFile = await upload.CreateThumnail(req.files.recfile,250,250);
        // if(ThumbFile.Status == '1')
        // {
        //     if (Object.entries(ThumbFile.FileArray).length) {
        //         resimage = await upload.uploadFiles(ThumbFile.FileArray, 'News','1');
        //     }
        //     if (Object.entries(ThumbFile.FileArray).length) {
        //         let filearray = resimage[0].split("/");
        //         let filename=filearray[filearray.length-1];
        //         update_data['ThumbnailImage'] = resimage[0];
        //     } 
        // }
    }
    let fieldshow = 'CAST(NewsID as CHAR) as NewsID,MediaType,NewsType,ThumbnailImage';
    let RequestData = {
        'tableName': 'Mst_News',
        'IdName': 'NewsID',
        'ID': request.NewsID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, async (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            // var Emails = await Commom.GetSubscribeEmails();
            // var EmailData = await Commom.GetEmailTemplate('NewsAdd');
            // EmailData.ToMail = _.map(Emails, 'EmailAddress');
            // var para_data = await Send_Mail.Ocxee_SMTP_Mail_Multiple2(EmailData);
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeleteNewsMedia = async (req, res) => {
    let deleteId = req.body.NewsID;
    let FileDetail = { TableName: 'Mst_News', FieldName: 'MainImage', IDName: 'NewsID', ID: deleteId || 0 };
    await Commom.S3FileDelete(FileDetail);
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Mst_News', 'NewsID', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
};

exports.Landlord = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.SearchAll != undefined && request.SearchAll != "") {
        where += ' AND (ll.Firstname like "%' + request.SearchAll + '%" OR ll.Email like "%' + request.SearchAll + '%" OR ll.PhoneNo like "%' + request.SearchAll + '%" OR ll.Addressline1 like "%' + request.SearchAll + '%") ';
    }
    if (request.LandlordID != undefined && request.LandlordID != "") {
        where += ' AND ll.LandlordID=? ';
        where_array.push(request.LandlordID);
    }
    if (request.Name != undefined && request.Name != '') {
        where += ' AND ll.FirstName LIKE ? ';
        where_array.push('%' + request.Name + '%');
    }
    if (request.Email != undefined && request.Email != '') {
        where += ' AND ll.Email like ?';
        where_array.push('%' + request.Email + '%');
    }
    if (request.PhoneNo != undefined && request.PhoneNo != '') {
        where += ' AND ll.PhoneNo like ?';
        where_array.push('%' + request.PhoneNo + '%');
    }
    if (request.CountryID != undefined && request.CountryID != "") {
        where += ' AND ll.CountryID=? ';
        where_array.push(request.CountryID);
    }
    if (request.StateID != undefined && request.StateID != "") {
        where += ' AND ll.StateID=? ';
        where_array.push(request.StateID);
    }
    if (request.CityID != undefined && request.CityID != "") {
        where += ' AND ll.CityID=? ';
        where_array.push(request.CityID);
    }
    if (request.PostCode != undefined && request.PostCode != "") {
        where += ' AND ll.PostCode=? ';
        where_array.push(request.PostCode);
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }

    if (request.Status != undefined && request.Status != "") {
        where += ' AND ll.Active=? ';
        where_array.push(request.Status);
    }
    let query = `SELECT CAST(ll.LandlordID as CHAR) as LandlordID,Firstname,Lastname,logo,ll.CountryID,ll.CityID,ll.StateID,ll.PhoneCode,PhoneNo,Email,Addressline1,Addressline2,Faxno,PostCode,Message,mc.CountryName,ms.StateName,mCity.CityName,ll.Active,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = ll.EntryBy) as EntryBy,
    DATE_FORMAT(ll.EntryDate,'%d %b %Y') as EntryDate,ll.EntryIP,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = ll.UpdateBy) as UpdateBy,
    DATE_FORMAT(ll.UpdateDate,'%d %b %Y') as UpdateDate,
    ll.UpdateIP from Landlord as ll left join Mst_Country as mc on mc.CountryID = ll.CountryID left join Mst_State as ms on ms.StateID = ll.StateID left join Mst_City as mCity on mCity.CityID = ll.CityID WHERE 1 `+ where + ` order by ll.EntryDate desc ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Landlord as ll', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['page_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddLandlord = async (req, res) => {
    console.log(req.body)
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.LandlordID > 0 && request.LandlordID != "" && request.LandlordID != undefined) {
        where_data = {
            'LandlordID': request.LandlordID,
        };
    }
    update_data['Firstname'] = request.Firstname;
    // update_data['Lastname'] = request.Lastname;
    update_data['Email'] = request.Email;
    update_data['Addressline1'] = request.Addressline1;
    update_data['Active'] = request.Status;
    if (request.PhoneCode != undefined && request.PhoneCode != 'null') {
        update_data['PhoneCode'] = request.PhoneCode;
    }
    if (request.PhoneNo != undefined && request.PhoneNo != 'null') {
        update_data['PhoneNo'] = request.PhoneNo;
    }
    if (request.Addressline2 != undefined && request.Addressline2 != 'null') {
        update_data['Addressline2'] = request.Addressline2;
    }
    if (request.Faxno != undefined && request.Faxno != 'null') {
        update_data['Faxno'] = request.Faxno;
    }
    if (request.CountryID != undefined && request.CountryID != 'null') {
        update_data['CountryID'] = request.CountryID;
    }
    if (request.StateID != undefined && request.StateID != 'null') {
        update_data['StateID'] = request.StateID;
    }
    if (request.CityID != undefined && request.CityID != 'null') {
        update_data['CityID'] = request.CityID;
    }
    if (request.PostCode != undefined && request.PostCode != 'null') {
        update_data['PostCode'] = request.PostCode;
    }
    if (request.Message != undefined && request.Message != 'null') {
        update_data['Message'] = request.Message;
    }
    update_data['logo'] = request.oldfile;
    if (req.files.recfile) {
        if (Object.entries(req.files.recfile).length) {
            resimage = await upload.uploadFiles(req.files.recfile, 'LandLord');
        }
        if (Object.entries(req.files.recfile).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            update_data['logo'] = resimage[0];
        }
    }
    let fieldshow = 'CAST(LandlordID as CHAR) as LandlordID,Firstname,Lastname,PhoneCode';
    let RequestData = {
        'tableName': 'Landlord',
        'IdName': 'LandlordID',
        'ID': request.LandlordID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddLandlord(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeleteLandlord = (req, res) => {
    let deleteId = req.body.LandlordID;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Landlord', 'LandlordID', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
};

exports.ChangePass = async (req, res) => {
    let request = req.body;

    let RequestData = {};
    if (request.RoleID == '2') {
        let check_query = `SELECT ChannelPartnerID FROM ChannelPartner WHERE PersonalPassword ="` + md5(request.Cpass) + `" and ChannelPartnerID =` + request.UserID;
        let where_data = {
            'ChannelPartnerID': request.UserID,
        };
        let update_data = {
            'PersonalPassword': md5(request.Npass),
        };

        RequestData = {
            'tableName': 'ChannelPartner',
            'query': check_query,
            'update_data': update_data,
            'where_data': where_data,
            'reqData': request
        };
    } else {
        let check_query = `SELECT *  FROM Mst_User WHERE Password ="` + md5(request.Cpass) + `" and UserID =` + request.UserID;
        if (request.UserID > 0 && request.UserID != "" && request.UserID != undefined) {
            where_data = {
                'UserID': request.UserID,
            };
        }
        let update_data = {};

        update_data['Password'] = md5(request.Npass);
        update_data['UserID'] = request.UserID;

        RequestData = {
            'tableName': 'Mst_User',
            'query': check_query,
            'update_data': update_data,
            'where_data': where_data,
            'reqData': request
        };
    }
    // console.log(RequestData)
    Service.UpdateData(RequestData, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.CheckPass = async (req, res) => {
    let request = req.body;
    let check_query = '';
    if (request.RoleID == '2') {
        check_query = `SELECT *  FROM ChannelPartner WHERE PersonalPassword ="` + md5(request.Cpass) + `" and ChannelPartnerID=` + request.UserID;
        console.log(check_query);
    } else {
        check_query = `SELECT *  FROM Mst_User WHERE Password ="` + md5(request.Cpass) + `" and UserID =` + request.UserID;
    }
    Service.CheckPass(check_query, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.Setting = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.settingID != undefined && request.settingID != "") {
        where += ' AND mst.settingID=? ';
        where_array.push(request.settingID);
    }
    if (request.settingTitle != undefined && request.settingTitle != '') {
        where += ' AND mst.settingTitle like ?';
        where_array.push('%' + request.settingTitle + '%');
    }
    if (request.settingKey != undefined && request.settingKey != '') {
        where += ' AND mst.settingKey like ?';
        where_array.push('%' + request.settingKey + '%');
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }

    if (request.Status != undefined && request.Status != "") {
        where += ' AND mst.Active=? ';
        where_array.push(request.Status);
    }
    let query = `SELECT CAST(mst.settingID as CHAR) as settingID,settingType,settingTitle,settingKey,settingValue,Active,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = mst.EntryBy) as EntryBy,
    DATE_FORMAT(mst.EntryDate,'%d %b %Y') as EntryDate,mst.EntryIP,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = mst.UpdateBy) as UpdateBy,
    DATE_FORMAT(mst.UpdateDate,'%d %b %Y') as UpdateDate,
    mst.UpdateIP from Mst_Setting as mst  WHERE 1 `+ where + ` ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Mst_Setting as mst', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['page_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddSetting = async (req, res) => {

    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.settingID > 0 && request.settingID != "" && request.settingID != undefined) {
        where_data = {
            'settingID': request.settingID,
        };
    }
    update_data['settingTitle'] = request.settingTitle;
    update_data['settingKey'] = request.settingKey;

    if (request.settingValue != undefined && request.settingValue != "null") {
        update_data['settingValue'] = request.settingValue;
        update_data['settingType'] = '1';
    }
    update_data['settingValue'] = request.oldfile;
    if (request.oldfile != "") {
        update_data['settingType'] = '2';
    }
    if (req.files.recfile) {
        if (Object.entries(req.files.recfile).length) {
            resimage = await upload.uploadFiles(req.files.recfile, 'Mst_Services');
        }
        if (Object.entries(req.files.recfile).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            update_data['settingValue'] = resimage[0];
            update_data['settingType'] = '2';
        }
    }
    if (request.Status != undefined) {
        update_data['Active'] = request.Status;
    }
    let fieldshow = 'CAST(settingID as CHAR) as settingID,settingTitle,settingKey,settingValue';
    let RequestData = {
        'tableName': 'Mst_Setting',
        'IdName': 'settingID',
        'ID': request.settingID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeleteSetting = (req, res) => {
    let deleteId = req.body.settingID;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Mst_Setting', 'settingID', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
};

exports.ApiMapping = async (req, res) => {
    Service.ApiMapping(req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            var response = {
                'list': data,
            }
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, 'Data fetched successfully.'), "Data": response });
        }
    });
};

exports.TableName = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);
    let query = `select * from Table_Name  WHERE 1 ` + where + ` ` + limit;
    async.waterfall([
        function (done) {
            Service.AllListCount('Table_Name', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['page_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddApiMapping = async (req, res) => {
    let request = req.body;
    let update_data = [];
    let insert_data = [];
    _.each(request, (tableData, tableKay) => {
        _.each(request[tableKay], (item, key) => {
            delete request['Token'];
            delete request['UserID'];
            delete request['Source'];
            // if(item.MappingID==undefined){
            //     item.MappingID = 0;
            // }
            if (item.MappingID > 0) {
                update_data.push(item);
            } else {
                insert_data.push(item);
            }
        });
    });
    // console.log(insert_data)
    let RequestData = {
        'tableName': 'Accommodation_Mapping',
        'IdName': 'MappingID',
        'update_data': update_data,
        'insert_data': insert_data,
    };
    Service.AddApiMapping(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.AccBookingRequest = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.BookingID != undefined && request.BookingID != "") {
        where += ' AND Abr.BookingID=? ';
        where_array.push(request.BookingID);
    }
    if (request.StudentRemark != undefined && request.StudentRemark != "") {
        where += ' AND Abr.StudentRemark=? ';
        where_array.push(request.StudentRemark);
    }
    if (request.StartDate != undefined && request.StartDate != "") {
        where += ' AND date(Abr.BookingDate) >=? ';
        where_array.push(request.StartDate);
    }
    if (request.EndDate != undefined && request.EndDate != "") {
        where += ' AND date(Abr.BookingDate) <= ? ';
        where_array.push(request.EndDate);
    }
    if (request.EntryDate != undefined && request.EntryDate != "") {
        where += ' AND date(Abr.EntryDate) >= ? ';
        where_array.push(request.EntryDate);
    }
    if (request.StudentName != undefined && request.StudentName != "") {
        where += ' AND CONCAT(stu.FirstName, " ", stu.LastName) like ? ';
        where_array.push('%' + request.StudentName + '%');
    }
    if (request.AccommodationName != undefined && request.AccommodationName != "") {
        where += ' AND acc.AltAccommodationName like ? ';
        where_array.push('%' + request.AccommodationName + '%');
    }
    if (request.AccommodationID != undefined && request.AccommodationID != "") {
        where += ' AND acc.AccommodationID=? ';
        where_array.push(request.AccommodationID);
    }
    if (request.ACountryID != undefined && request.ACountryID != "") {
        where += ' AND acc.CountryID=? ';
        where_array.push(request.ACountryID);
    }
    if (request.ACityID != undefined && request.ACityID != "") {
        where += ' AND acc.CityID=? ';
        where_array.push(request.ACityID);
    }
    if (request.stuCountryID != undefined && request.stuCountryID != "") {
        where += ' AND stu.CountryID=? ';
        where_array.push(request.stuCountryID);
    }
    if (request.stuCityID != undefined && request.stuCityID != "") {
        where += ' AND stu.CityID=? ';
        where_array.push(request.stuCityID);
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }
    if (request.Status != undefined && request.Status != "") {
        where += ' AND Abr.Status=? ';
        where_array.push(request.Status);
    }
    if (request.ReferNo != undefined && request.ReferNo != '') {
        where += ' AND Abr.BookingNo = ?';
        where_array.push(request.ReferNo);
    }
    if (request.TransactionID != undefined && request.TransactionID != '') {
        where += ' AND Abr.TransactionID = ?';
        where_array.push(request.TransactionID);
    }
    if (request.PaidStatus == "1") {
        where += ' AND Abr.PayStatus="1" ';
    }
    if (request.PaidStatus == "0") {
        where += ' AND Abr.PayStatus!="1" ';
    }

    if (request.PaymentFromDate && request.PayemntToDate) {
        where += ' AND (date(Abr.PaymentDate) BETWEEN "' + request.PaymentFromDate + '" AND "' + request.PayemntToDate + '")';
    }
    if (request.OrderID != undefined && request.OrderID != '') {
        where += ' AND Abr.OrderID = ?';
        where_array.push(request.OrderID);
    }
    if (request.RoleID == '2') {
        where += ' AND Abr.ChannelPartnerID=? ';
        where_array.push(request.UserID);
    }
    let query = `SELECT CAST(Abr.BookingID as CHAR) as BookingID,Abr.StudentID,CAST(Abr.PayStatus as CHAR) as PayStatus,CAST(Abr.TransactionID as CHAR) as TransactionID,Abr.AccommodationID,acc.AltAccommodationName as AccommodationName,stu.FirstName,stu.LastName,stu.PhoneNo,stu.Email,Abr.Status,StudentRemark,DATE_FORMAT(StartDate,'%d %b %Y') as StartDate,DATE_FORMAT(EndDate,'%d %b %Y') as EndDate,RentAmount,NoOfDays,TotalAmount,DepositAmount,DATE_FORMAT(Abr.BookingDate,'%d %b %Y') as BookingDate,Remark,Source,
    DATE_FORMAT(Abr.EntryDate,'%d %b %Y') as EntryDate,Abr.EntryIP,Abr.CleaningCharge,Abr.AgencyFee as AdministratorFees,
    DATE_FORMAT(Abr.UpdateDate,'%d %b %Y') as UpdateDate,BookingNo as ReferNo,Abr.Message,Abr.Rating,Abr.CurrencySymbol,Abr.EstimatedBills,Abr.PayAmount,
    Abr.PaymentDate,Abr.ReceiptUrl,Abr.InvoiceNo,Abr.FormUrl,accp.FormType,
    IF(Abr.BookingID in (select BookingID from Student_Details2 as sd where Abr.StudentID=sd.StudentID),1,IF(FormUrl!="",CASE WHEN FormUrl IS NULL THEN 0 ELSE 2 END,0)) as IsStudDetail,
    stu.ChannelPartnerID as StudentCpId,Abr.ChannelPartnerID as AbrCpId,
    if(!stu.ChannelPartnerID,'2',if(!Abr.ChannelPartnerID,'1','0')) as IsMapCp,CONCAT(cp.FirstName,' ',cp.LastName) as CpName,
    uo.OrderID,uo.Subtotal as OrderSubtotal,uo.CityWiseAmoount
    from Accommodation_BookingRequest as Abr left join Accommodation acc on acc.AccommodationID = Abr.AccommodationID
    left join Student stu on stu.StudentID = Abr.StudentID
    left join Accommodation_Provider as accp on accp.ProviderID=acc.ProviderID
    left join ChannelPartner cp on cp.ChannelPartnerID = Abr.ChannelPartnerID and cp.Active=1
    left join User_Order as uo on uo.OrderID=Abr.OrderID
    WHERE 1 `+ where + ` order by Abr.BookingID desc ` + limit;

    async.waterfall([
        function (done) {
            Service.JoinListCount('Accommodation_BookingRequest as Abr left join Accommodation acc on acc.AccommodationID = Abr.AccommodationID left join Student stu on stu.StudentID = Abr.StudentID', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['page_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};
exports.GetStudentDetail = async (req, res) => {
    let request = req.body;
    var data = {};
    let where = '';
    let where_array = [];
    if (request.BookingID != undefined && request.BookingID != "") {
        where += ' AND sd.BookingID=? ';
        where_array.push(request.BookingID);
    }
    // ,(case sd.RoomClass WHEN '1' THEN 'Basic' WHEN '2' THEN 'Classic' WHEN '3' THEN 'Premium1' WHEN '4' THEN 'Premium2' WHEN '5' THEN 'Premium3' ELSE '' END) as RoomClass
    // let query2 = `Select CAST(sd.Student_DetailID as CHAR) as Student_DetailID,CAST(sd.StudentID as CHAR) as StudentID,CAST(sd.BookingID as CHAR) as BookingID,CONCAT(s.FirstName, " ", s.LastName) AS StudentName,accp.Name,acc.AccommodationName,sd.YearOfStudy,sd.University,sd.CourseTitle,sd.LandlineNo,sd.AddressLine1,sd.AddressLine2,sd.City,sd.ZipCode,sd.Nationality,sd.PropertyName1,sd.PropertyName2,sd.RoomType
    // ,sd.RoomClass,sd.TenancyLength,(case sd.FlatGenderType WHEN '1' THEN 'No' WHEN '2' THEN 'Mixed' WHEN '3' THEN 'All Males' WHEN '4' THEN 'All Female' ELSE 'No Preference' END) as FlatGenderType,sd.RoomShareWith,sd.SpecialRequirements,sd.GI_ApartmentNumber,sd.GI_Area,sd.GI_City,sd.GI_City,sd.GI_Country,sd.GI_DateOfBirth,sd.GI_EmailAddress,sd.GI_FirstName,sd.GI_LastName,sd.GI_Relationship,sd.GI_Street,sd.GI_TelNo,sd.GI_Title,sd.GI_ZipCode,sd.EMC_ApartmentNumber,sd.EMC_Area,sd.EMC_City,sd.EMC_Country,sd.EMC_DateOfBirth,sd.EMC_EmailAddress,sd.EMC_FirstName,sd.EMC_LastName,sd.EMC_Relationship,sd.EMC_Street,sd.EMC_TelNo,sd.EMC_Title,sd.EMC_ZipCode FROM Student_Details as sd 
    // JOIN Student s on s.StudentID=sd.StudentID JOIN Accommodation_BookingRequest as accb on accb.AccommodationID=sd.AccommodationID LEFT JOIN Accommodation as acc on accb.AccommodationID=acc.AccommodationID LEFT JOIN Accommodation_Provider as accp on accp.ProviderID=acc.ProviderID WHERE 1 `+ where;
    let query2 = `Select CAST(sd.Student_DetailID as CHAR) as Student_DetailID,CAST(sd.StudentID as CHAR)
     as StudentID,CAST(sd.BookingID as CHAR) as BookingID,CONCAT(s.FirstName, " ", s.LastName) AS StudentName,
     accp.Name,acc.AltAccommodationName as AccommodationName,sd.Nationality,sd.DateofBirth,
     (case sd.Gender WHEN '1' THEN 'Male' WHEN '2' THEN 'Female' WHEN '3' THEN 'Other' ELSE '' END) as Gender,
     sd.EmailAddress,sd.PhoneNumber,sd.OtherPreferences,sd.CurrentUniversity,sd.DestinationUniversity,
     sd.YearofStudy,sd.Course,sd.GI_FirstName,sd.GI_LastName,sd.GI_Relationship,sd.GI_DateofBirth,
     sd.GI_EmailAddress,sd.GI_PhoneNumber,sd.GI_Address,sd.GI_City,sd.GI_State,sd.GI_Postalcode,sd.GI_Country,
     sd.Address,sd.City,sd.State,sd.Postalcode,sd.Country,sd.Active,sd.FormProcess,DATE_FORMAT(accb.StartDate,'%d %b %Y') as StartDate,DATE_FORMAT(accb.EndDate,'%d %b %Y') as EndDate,
     acc.AddressLine1,acc.AddressLine2,acc.ReferenceNumber,accb.NoOfDays,accb.TotalAmount,accb.CurrencySymbol FROM 
     Student_Details2 as sd JOIN Student s on s.StudentID=sd.StudentID 
     JOIN Accommodation_BookingRequest as accb on accb.AccommodationID=sd.AccommodationID 
     LEFT JOIN Accommodation as acc on accb.AccommodationID=acc.AccommodationID 
     LEFT JOIN Accommodation_Provider as accp on accp.ProviderID=acc.ProviderID WHERE 1 ` + where;

    Service.AllList(query2, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['StudDetail'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.AddRemark = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.BookingRemarkID > 0 && request.BookingRemarkID != "" && request.BookingRemarkID != undefined) {
        where_data = {
            'BookingRemarkID': request.BookingRemarkID,
        };
    }
    update_data['BookingID'] = request.BookingID;
    update_data['Title'] = request.Title;
    update_data['Remark'] = request.Remark;
    update_data['Source'] = request.Source;
    update_data['Description'] = request.Description;
    if (request.Status != undefined) {
        update_data['Active'] = request.Status;
    }
    let fieldshow = 'CAST(BookingRemarkID as CHAR) as BookingRemarkID,Title,Remark,Source';
    let RequestData = {
        'tableName': 'Accommodation_BookingRemark',
        'IdName': 'BookingRemarkID',
        'ID': request.BookingRemarkID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.Remark = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.BookingRemarkID != undefined && request.BookingRemarkID != "") {
        where += ' AND Abr.BookingRemarkID=? ';
        where_array.push(request.BookingRemarkID);
    }
    if (request.BookingID != undefined && request.BookingID != "") {
        where += ' AND Abr.BookingID=? ';
        where_array.push(request.BookingID);
    }
    if (request.Title != undefined && request.Title != '') {
        where += ' AND Abr.Title like ?';
        where_array.push('%' + request.Title + '%');
    }
    if (request.RemarkS != undefined && request.RemarkS != '') {
        where += ' AND Abr.Remark like ?';
        where_array.push('%' + request.RemarkS + '%');
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }
    if (request.Status != undefined && request.Status != "") {
        where += ' AND Abr.Active=? ';
        where_array.push(request.Status);
    }
    let query = `SELECT CAST(Abr.BookingRemarkID as CHAR) as BookingRemarkID,Title,Remark,Source,Description,Active,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = Abr.EntryBy) as EntryBy,
    DATE_FORMAT(Abr.EntryDate,'%d %b %Y') as EntryDate,Abr.EntryIP,
    (select mu2.UserName from Mst_User as mu2 where mu2.UserID = Abr.UpdateBy) as UpdateBy,
    DATE_FORMAT(Abr.UpdateDate,'%d %b %Y') as UpdateDate,Abr.UpdateIP from Accommodation_BookingRemark Abr
    WHERE 1 `+ where + ` ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Accommodation_BookingRemark as Abr', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['page_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.DeleteRemark = (req, res) => {
    let deleteId = req.body.BookingRemarkID;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Accommodation_BookingRemark', 'BookingRemarkID', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
};

exports.BookingStatusUpdate = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    Service.BookingStatusUpdate(request, async (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            var EmailData = {};
            if (request.Status == '3') {
                let TempData = await Commom.GetEmailTemplate('ServiceStatus');
                if (TempData) {
                    EmailData.TemplateBody = TempData.TemplateBody.replace('{link}', 'https://www.ocxee.com/feedback?studentname=' + Commom.Encode(request.Name) + '&servicename=' + Commom.Encode(request.ServiceName) + '&servicetype=1&inquiryid=' + Commom.Encode(request.BookingID) + '&referenceno=' + Commom.Encode(request.ReferenceNo) + '');
                    EmailData.TemplateBody = TempData.TemplateBody.replace('{ServiceName}', request.ServiceName);
                }
            } else {
                EmailData = await Commom.GetEmailTemplate('ServiceStatusPending');
            }
            if (EmailData) {
                EmailData.ToMail = request.EmailID;
                EmailData.TemplateBody = EmailData.TemplateBody.replace('{First Name}', request.Name);
                var para_data = await Send_Mail.Ocxee_SMTP_Mail_Multiple2(EmailData);
            }
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.Student_Inquiry = async (req, res) => {

    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.InquiryID != undefined && request.InquiryID != "") {
        where += ' AND SInquiry.InquiryID=? ';
        where_array.push(request.InquiryID);
    }
    if (request.InquiryNo != undefined && request.InquiryNo != "") {
        where += ' AND SInquiry.InquiryNo=? ';
        where_array.push(request.InquiryNo);
    }
    if (request.ServiceID != undefined && request.ServiceID != "") {
        where += ' AND SInquiry.ServiceID=? ';
        where_array.push(request.ServiceID);
    }
    if (request.ServiceProviderID != undefined && request.ServiceProviderID != "") {
        where += ' AND SInquiry.ServiceProviderID=? ';
        where_array.push(request.ServiceProviderID);
    }
    if (request.Type != undefined && request.Type != "") {
        where += ' AND SInquiry.Type=? ';
        where_array.push(request.Type);
    }
    if (request.StartDate != undefined && request.StartDate != "") {
        where += ' AND date(SInquiry.EntryDate)>=? ';
        where_array.push(request.StartDate);
    }
    if (request.EndDate != undefined && request.EndDate != "") {
        where += ' AND date(SInquiry.EntryDate)<=? ';
        where_array.push(request.EndDate);
    }
    // if (request.Name!=undefined && request.Name!='') {
    //     where += ' AND SInquiry.Name like ?';
    //     where_array.push('%'+request.Name+'%');
    // }
    if (request.StudentName != undefined && request.StudentName != '') {
        where += ' AND SInquiry.StudentName like ?';
        where_array.push('%' + request.StudentName + '%');
    }
    if (request.CurrentCountry != undefined && request.CurrentCountry != '') {
        where += ' AND SInquiry.CurrentCountry like ?';
        where_array.push('%' + request.CurrentCountry + '%');
    }
    if (request.CurrentCity != undefined && request.CurrentCity != '') {
        where += ' AND SInquiry.CurrentCity like ?';
        where_array.push('%' + request.CurrentCity + '%');
    }
    if (request.ReferNo != undefined && request.ReferNo != '') {
        where += ' AND SInquiry.InquiryNo = ?';
        where_array.push(request.ReferNo);
    }
    if (request.Status != undefined && request.Status != "") {
        where += ' AND SInquiry.Status=? ';
        where_array.push(request.Status);
    }
    if (request.RoleID == '2') {
        // where += ' AND (si.StudentID IN(SELECT st1.StudentID FROM Student AS st1 WHERE st1.ChannelPartnerID="'+request.UserID+'") OR si.ChannelPartnerID="'+request.UserID+'") ';
        where += ' AND SInquiry.ChannelPartnerID=? ';
        where_array.push(request.UserID);
    }
    else if (request.ChannelPartnerID != undefined && request.ChannelPartnerID != '') {
        where += ' AND SInquiry.ChannelPartnerID = ?';
        where_array.push(request.ChannelPartnerID);
    }
    else if (request.CpID != undefined && request.CpID != '') {
        where += ' AND SInquiry.ChannelPartnerID = ?';
        where_array.push(request.CpID);
    }
    if (request.TransactionID != undefined && request.TransactionID != '') {
        where += ' AND SInquiry.TransactionID = ?';
        where_array.push(request.TransactionID);
    }
    if (request.OrderID != undefined && request.OrderID != '') {
        where += ' AND SInquiry.OrderID = ?';
        where_array.push(request.OrderID);
    }

    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }
    if (request.PaidStatus == "1") {
        where += ' AND SInquiry.PayStatus="1" ';
    }
    if (request.PaidStatus == "0") {
        where += ' AND SInquiry.PayStatus!="1" ';
    }

    if (request.PaymentFromDate && request.PayemntToDate) {
        where += ' AND (date(SInquiry.PaymentDate) BETWEEN "' + request.PaymentFromDate + '" AND "' + request.PayemntToDate + '")';
    }

    // var where = "";
    if (request.RoleID == '2' && request.IsDashbordData == "1") {
        if (request.StartDate != '' && request.StartDate != undefined && request.StartDate != null) {
            where += " AND DATE(SInquiry.EntryDate)>='" + moment(request.StartDate).format('YYYY-MM-DD') + "'";
        } else {
            where += " AND DATE(SInquiry.EntryDate)='" + moment().format('YYYY-MM-DD') + "'";
        }
        if (request.EndDate != '' && request.EndDate != undefined && request.EndDate != null) {
            where += " AND DATE(SInquiry.EntryDate)<='" + moment(request.EndDate).format('YYYY-MM-DD') + "'";
        } else {
            where += " AND DATE(SInquiry.EntryDate)='" + moment().format('YYYY-MM-DD') + "'";
        }
    }
    // let query = `SELECT CAST(si.InquiryID as CHAR) as InquiryID,Status,DATE_FORMAT(si.EntryDate,'%d %b %Y') as EntryDate,FirstName,LastName,Source,si.CurrentCountry,msp.Name as ProviderName,InquiryNo,si.ServiceID,ms.Name,si.ServiceProviderID,si.Type,Email,PhoneNo,Status,CurrentLocation,CurrentCity,CurrentState,CurrentCountry,DestinationLocation,DestinationCity,DestinationState,DestinationCountry,InquiryType,LoanAmount,NoOfPerson,DepatureDate,TravelDate,JourneyDate,FromLocation,ToLocation,Remark,MinNoOfRooms,MaxNoOfRooms,MinPrice,MaxPrice,MoveInDate,DurationInMonth,PropertyType,PropertyType,UniversityName
    // from Student_Inquiry si left join Mst_Services ms on ms.ServiceID = si.ServiceID left join Mst_ServicesProvider msp on msp.ServiceProviderID = si.ServiceProviderID  WHERE 1  `+where+` `+limit;
    let from = `CAST(si.InquiryID as CHAR) as InquiryID,si.ServiceTypeID,DATE_FORMAT(si.EntryDate,'%d %b %Y') as InquiryDate,si.EntryDate,DATE_FORMAT(si.UpdateDate,'%d %b %Y') as InquiryUpdateDate,si.UpdateDate,si.Status,si.Source,si.CurrentCountry,si.PhoneNo_CountryCode,si.InquiryNo,si.Type,si.Email,si.PhoneNo,si.CurrentLocation,si.CurrentCity,si.CurrentState,si.DestinationLocation,si.DestinationCity,si.DestinationState,si.DestinationCountry,si.InquiryType,si.LoanAmount,si.NoOfPerson,si.DepatureDate,si.TravelDate,si.JourneyDate,si.FromLocation,si.ToLocation,si.Remark,si.ReplyMessage,si.MinNoOfRooms,si.MaxNoOfRooms,si.MinPrice,si.MaxPrice,si.MoveInDate,si.DurationInMonth,si.PropertyType,si.UniversityName,si.ServiceID,
    si.CurrencySymbol,si.ServiceProviderID,CAST(si.PayStatus as CHAR) as PayStatus,CAST(si.TransactionID as CHAR) as TransactionID,si.InquiryNo as ReferNo,si.Message,si.Rating,si.AccLocation,si.EntryIP,si.PayAmount,si.PaymentDate,si.ReceiptUrl,si.InvoiceNo,si.OrderID,si.StudentID,`

    let Squery = `((SELECT ` + from + ` CONCAT(si.FirstName, " ", si.LastName) AS StudentName,'0' as IsMapCp,CONCAT(cp.FirstName, " ", cp.LastName) As PartnerName,cp.ChannelPartnerID AS UID,cp.ChannelPartnerID, cp.PersonalEmail AS EamilCP,'0' as StudentCpID FROM Student_Inquiry AS si INNER JOIN ChannelPartner AS cp WHERE cp.ChannelPartnerID=si.ChannelPartnerID AND si.Type="1") 
    UNION 
    (SELECT `+ from + ` CONCAT(sm.FirstName, " ", sm.LastName) AS StudentName,if(!sm.ChannelPartnerID,'2',if(!si.ChannelPartnerID,'1','0')) as IsMapCp,'' As PartnerName, sm.StudentID AS UID,si.ChannelPartnerID,sm.Email AS EamilST,sm.ChannelPartnerID as StudentCpID FROM Student_Inquiry AS si left JOIN Student AS sm on sm.StudentID=si.StudentID AND si.Type="2")
    ) as SInquiry
    left join Mst_Services ms on ms.ServiceID = SInquiry.ServiceID 
    left join Mst_ServicesProvider msp on msp.ServiceProviderID = SInquiry.ServiceProviderID 
    left join Mst_ServicesType as stype on stype.ServiceTypeID = SInquiry.ServiceTypeID
    left join User_Order as uo on uo.OrderID = SInquiry.OrderID
    WHERE 1 `+ where + ``;

    let query = `select SInquiry.*,msp.Name as ProviderName,stype.Type as ServiceTypeName,uo.Subtotal as OrderSubtotal,uo.CityWiseAmoount,uo.OrderID from ` + Squery + ` GROUP by SInquiry.InquiryID ORDER by SInquiry.EntryDate DESC ` + limit;
    //count
    let Countquery = `select count(DISTINCT SInquiry.InquiryID) as total from ` + Squery;
    // console.log(query);
    var start = new Date();
    async.waterfall([
        function (done) {
            Service.UniunJoinListCount(Countquery, where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['page_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    console.log('Request took:', new Date() - start, 'ms');
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.InquiryStatusUpdate = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    where_data = {
        'InquiryID': request.InquiryID,
    };
    update_data['ReplyMessage'] = request.Remark;
    update_data['Status'] = request.Status;
    let RequestData = {
        'tableName': 'Student_Inquiry',
        'IdName': 'InquiryID',
        'ID': request.InquiryID,
        'update_data': update_data,
        'where_data': where_data,
    };
    Service.InquiryStatusUpdate(RequestData, request, async (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            if (request.Status == '6' || request.Status == '3') {
                var EmailData = await Commom.GetEmailTemplate('ServiceStatus');
                EmailData.TemplateBody = EmailData.TemplateBody.replace('{link}', 'https://www.ocxee.com/feedback?studentname=' + Commom.Encode(request.Name) + '&servicename=' + Commom.Encode(request.ServiceName) + '&servicetype=1&inquiryid=' + Commom.Encode(request.InquiryID) + '&referenceno=' + Commom.Encode(request.ReferenceNo) + '');
                EmailData.TemplateBody = EmailData.TemplateBody.replace('{ServiceName}', request.ServiceName);
            } else if (request.Status == '2' || request.Status == '5') {
                var EmailData = await Commom.GetEmailTemplate('ServiceStatusPending');
            }
            if (EmailData != undefined && EmailData != "") {
                // rohitandkhatri@gmail.com
                EmailData.ToMail = request.EmailID;
                EmailData.TemplateBody = EmailData.TemplateBody.replace('{First Name}', request.Name);
                var para_data = await Send_Mail.Ocxee_SMTP_Mail_Multiple2(EmailData);
            }
            // console.log(data);
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.NotificationList = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.NotificationID != undefined && request.NotificationID != "") {
        where += ' AND mm.NotificationID=? ';
        where_array.push(request.NotificationID);
    }
    if (request.RID != undefined && request.RID != "") {
        where += ' AND mm.RoleID=? ';
        where_array.push(request.RID);
    }
    if (request.Title != undefined && request.Title != "") {
        where += ' AND mm.Title like ? ';
        where_array.push('%' + request.Title + '%');
    }
    if (request.Description != undefined && request.Description != "") {
        where += ' AND mm.Description like ? ';
        where_array.push('%' + request.Description + '%');
    }
    if (request.remark != undefined && request.remark != "") {
        where += ' AND mm.remark like ? ';
        where_array.push('%' + request.remark + '%');
    }
    if (request.NotificationDate != undefined && request.NotificationDate != "") {
        where += ' AND date(mm.NotificationDate)=? ';
        where_array.push(request.NotificationDate);
    }
    if (request.Status != undefined && request.Status != "") {
        where += ' AND mm.Active=? ';
        where_array.push(request.Status);
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }

    let query = `SELECT CAST(mm.NotificationID as CHAR) as NotificationID,Sender,Source,mm.RoleID,Title,Description,Remark,NotificationStatus,DATE_FORMAT(NotificationDate,'%Y-%c-%d') as NotificationDate2,DATE_FORMAT(mm.NotificationDate,'%d %b %Y') as NotificationDate,SendDateTime,NotificationStartTime,NotificationEndTime,mm.Active
    from Notification as mm  WHERE 1  `+ where + ` ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Notification as mm', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['page_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddNotification = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.NotificationID > 0 && request.NotificationID != "" && request.NotificationID != undefined) {
        where_data = {
            'NotificationID': request.NotificationID,
        };
    }
    update_data['RoleID'] = request.RID;
    update_data['Sender'] = request.Sender;
    update_data['Title'] = request.Title;
    update_data['Remark'] = request.Remark;
    update_data['NotificationStatus'] = request.NotificationStatus;
    update_data['Source'] = request.Source;
    update_data['Description'] = request.Description;
    update_data['NotificationDate'] = request.NotificationDate;
    // update_data['SendDateTime'] = request.SendDateTime;
    update_data['NotificationStartTime'] = request.NotificationStartTime;
    update_data['NotificationEndTime'] = request.NotificationEndTime;
    update_data['Source'] = request.Source;

    if (request.Status != undefined) {
        update_data['Active'] = request.Status;
    }
    let fieldshow = 'CAST(NotificationID as CHAR) as NotificationID,Title,Remark,Description';
    let RequestData = {
        'tableName': 'Notification',
        'IdName': 'NotificationID',
        'ID': request.NotificationID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    let NotificationRequest = {
        'FCM_Token': 'fAfqDhbcRsqFwo187qnrfl:APA91bHqIFAd4XJfPFzj24Tr-1gaXnKBcrwIKFfV9W0-v0A3dbDM1vKzh3WJ_wWzCIxBY2lwz0F02NbCDJfNlfOjsyJrWMpWOZCs-W394BC-5PWezTpngW1fajxoAL4o8th2C-k-4_EL',
        'Title': 'Test',
        'Body': 'Test Body',
        'Data': [],
        'result': 'fsdfgsd',
    }
    let Notification = await Commom.PushSendNotification(NotificationRequest);
    // console.log(Notification)
    // if (Notification.status=='1') {
    //     return next();
    // }
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeleteNotification = (req, res) => {
    let deleteId = req.body.NotificationID;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Notification', 'NotificationID', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
};

exports.ChannelPartnerList = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let where = ""
    if (request.Active != undefined) {
        where = " Where Active=" + 1;
    }
    if (request.ChannelPartnerID != undefined && request.ChannelPartnerID != 0) {
        where = " Where ChannelPartnerID=" + request.ChannelPartnerID;
    }
    let query = `select ChannelPartnerID as ID,CONCAT(FirstName," ",LastName) as Name,CompanyName from ChannelPartner ` + where;
    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.GetStudentList = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let query = `select StudentID as ID,CONCAT(FirstName," ",LastName) as Name,Email from Student`;
    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.LoginHistory = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.HstID != undefined && request.HstID != "") {
        where += ' AND Login.HstID=? ';
        where_array.push(request.HstID);
    }
    if (request.UID != undefined && request.UID != "") {
        where += ' AND Login.UserID=? ';
        where_array.push(request.UID);
    }
    if (request.UserType != undefined && request.UserType != "") {
        where += ' AND Login.UserType=? ';
        where_array.push(request.UserType);
    }
    if (request.FromDate && request.ToDate) {
        where += ' AND (date(Login.LoginDate) BETWEEN "' + request.FromDate + '" AND "' + request.ToDate + '")';
    }
    if (request.UserName != undefined && request.UserName != "") {
        where += ' AND UserName like ? ';
        where_array.push('%' + request.UserName + '%');
    }
    if (request.Email != undefined && request.Email != "") {
        where += ' AND Email like ? ';
        where_array.push('%' + request.Email + '%');
    }
    if (request.MobileNo != undefined && request.MobileNo != "") {
        where += ' AND MobileNo like ? ';
        where_array.push('%' + request.MobileNo + '%');
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }

    // let query = `SELECT CAST(Login.HstID as CHAR) as HstID,lh.UserID,lh.Source,lh.UserType,lh.AppVersion,lh.DeviceID,DATE_FORMAT(lh.LoginDate,'%d %b %Y') as LoginDate,lh.EntryIP,DATE_FORMAT(lh.LogoutDate,'%d %b %Y') as LogoutDate,mu.UserName,mu.Email,mu.MobileNo,mr.RoleName
    // from HST_Login as lh left join Mst_User mu on mu.UserID = lh.UserID left join Mst_Role mr on mr.RoleID = lh.UserType  WHERE 1  `+where+` `+limit;
    let Squery = `((SELECT CAST(lh.HstID as CHAR) as HstID,lh.UserID,mr.RoleName,lh.Source,lh.UserType,lh.AppVersion,lh.DeviceID,lh.LoginDate,lh.EntryIP,DATE_FORMAT(lh.LogoutDate,'%d %b %Y') as LogoutDate,UserName,Email,MobileNo
    from HST_Login as lh inner join Mst_User mu on mu.UserID = lh.UserID And UserType = '1' left join Mst_Role mr on mr.RoleID = lh.UserType)
    UNION 
    (SELECT CAST(lh.HstID as CHAR) as HstID,lh.UserID,mr.RoleName,lh.Source,lh.UserType,lh.AppVersion,lh.DeviceID,lh.LoginDate,lh.EntryIP,DATE_FORMAT(lh.LogoutDate,'%d %b %Y') as LogoutDate,FirstName as UserName,PersonalEmail as Email,ContactPhoneNo as MobileNo
    from HST_Login as lh inner join ChannelPartner cp on cp.ChannelPartnerID = lh.UserID And UserType = '2' left join Mst_Role mr on mr.RoleID = lh.UserType))  as Login
    WHERE 1 `+ where + ` ORDER by date(Login.LoginDate) DESC`;

    let query = `select Login.* from ` + Squery + ` ` + limit;
    let Countquery = `select count(*) as total from ` + Squery;

    async.waterfall([
        function (done) {
            Service.UniunJoinListCount(Countquery, where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['page_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.GenerateStudentExcel = async (req, res) => {
    console.log(req.body)
    let request = req.body;
    var data = {};
    let where_array = [];
    let where = '';
    if (request.Ids != undefined && request.Ids != "") {
        where += ' AND FIND_IN_SET (StudentID,?) ';
        where_array.push(request.Ids);
    }
    if (request.name != undefined && request.name != 'null' && request.name != '') {
        where += ' AND (std.FirstName LIKE "%' + request.name + '%" OR  std.LastName LIKE "%' + request.name + '%" OR CONCAT(std.FirstName ," ",std.LastName) like "%' + request.name + '%")';
    }

    if (request.search != undefined && request.search != 'null' && request.search != '') {
        where += ' AND (std.FirstName LIKE "%' + request.search + '%" OR  std.LastName LIKE "%' + request.search + '%" OR CONCAT(std.FirstName ," ",std.LastName) like "%' + request.search + '%" OR std.Email = "' + request.search + '" OR REPLACE(std.PhoneNo," ","") LIKE "%' + request.search.replace(" ", "") + '%" OR std.StudentCode = "' + request.search + '" )';
    }

    if (request.email != undefined && request.email != 'null' && request.email != '') {
        where += ' AND std.Email like ?';
        where_array.push('%' + request.email + '%');
    }
    if (request.PhoneNo != undefined && request.PhoneNo != 'null' && request.PhoneNo != '') {
        where += ' AND std.PhoneNo like ?';
        where_array.push('%' + request.PhoneNo + '%');
    }
    if (request.StudentCode != undefined && request.StudentCode != 'null' && request.StudentCode != '') {
        where += ' AND std.StudentCode like ?';
        where_array.push('%' + request.StudentCode + '%');
    }
    if (request.StudentCode != undefined && request.StudentCode != 'null' && request.StudentCode != '') {
        where += ' AND std.StudentCode like ?';
        where_array.push('%' + request.StudentCode + '%');
    }
    if (request.Active != undefined && request.Active != 'null' && request.Active != '') {
        where += ' AND std.Active = ?';
        where_array.push(request.Active);
    }
    if (request.ChannelPartnerID != undefined && request.ChannelPartnerID != 'null' && request.ChannelPartnerID != '') {
        where += ' AND std.ChannelPartnerID = ?';
        where_array.push(request.ChannelPartnerID);
    }
    if (request.UserID != undefined && request.UserID != 'null' && request.UserID != '' && request.RoleID != 1) {
        where += ' AND std.ChannelPartnerID = ?';
        where_array.push(request.UserID);
    }
    // if(request.RoleID!=undefined && request.RoleID!='null' && request.RoleID!='')
    // {
    //     where += ' AND std.RoleID = ?';            
    //     where_array.push(request.RoleID);
    // }
    if (request.EntryDate != undefined && request.EntryDate != 'null' && request.EntryDate != '') {
        where += ' AND std.EntryDate BETWEEN "' + request.EntryDate + ' 00:00:00" AND "' + request.EntryDate + ' 23:59:00"';
    }

    if (req.body.StartDate != undefined && req.body.StartDate != null && req.body.StartDate != '') {
        where += ' AND std.EntryDate BETWEEN "' + req.body.StartDate + ' 00:00:00" AND "' + req.body.EndDate + ' 23:59:00"';
    }


    let query = `select FirstName,MiddleName,LastName,Email,PhoneNo_CountryCode,PhoneNo,WhatsappNo_CountryCode,WhatsappNo,CitizenShip,FirstLanguage,Skype,DATE_FORMAT(DateOfBirth,'%d %b %Y') as DateOfBirth,PlaceOfBirth,Gender,MaterialStatus,PassportNo,DATE_FORMAT(PassortIssueDate,'%d %b %Y') as PassortIssueDate,DATE_FORMAT(PassportExpiryDate,'%d %b %Y') as PassportExpiryDate,PassportIssueBy,PassportFile from Student as std where 1 ` + where + ` ORDER BY std.StudentID DESC`;
    Service.GenerateExcel(query, where_array, 'StudentList', async (err, data2) => {
        if (err) {
            console.log(err)
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['JsonData'] = data2.data;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data2.message, data2.status), "Data": data });
        }
    });
};

exports.GenerateLandlordExcel = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let where = '';
    if (request.Ids != undefined && request.Ids != "") {
        where += ' AND FIND_IN_SET (LandlordID,?) ';
        where_array.push(request.Ids);
    }
    if (request.Name != undefined && request.Name != '') {
        where += ' AND ll.Firstname like ? ';
        where_array.push('%' + request.Name + '%');
    }
    if (request.Email != undefined && request.Email != '') {
        where += ' AND ll.Email like ?';
        where_array.push('%' + request.Email + '%');
    }
    if (request.PhoneNo != undefined && request.PhoneNo != '') {
        where += ' AND ll.PhoneNo like ?';
        where_array.push('%' + request.PhoneNo + '%');
    }
    if (request.CountryID != undefined && request.CountryID != "") {
        where += ' AND ll.CountryID=? ';
        where_array.push(request.CountryID);
    }
    if (request.StateID != undefined && request.StateID != "") {
        where += ' AND ll.StateID=? ';
        where_array.push(request.StateID);
    }
    if (request.CityID != undefined && request.CityID != "") {
        where += ' AND ll.CityID=? ';
        where_array.push(request.CityID);
    }
    if (request.PostCode != undefined && request.PostCode != "") {
        where += ' AND ll.PostCode=? ';
        where_array.push(request.PostCode);
    }
    if (request.Status != undefined && request.Status != "") {
        where += ' AND ll.Active=? ';
        where_array.push(request.Status);
    }
    let query = `select Firstname as Name,Email,ll.PhoneCode,PhoneNo,Addressline1,Addressline2,Faxno,mc.CountryName,ms.StateName,mCity.CityName,PostCode,Message from Landlord as ll 
    left join Mst_Country as mc on mc.CountryID = ll.CountryID left join Mst_State as ms on ms.StateID = ll.StateID left join Mst_City as mCity on mCity.CityID = ll.CityID where 1  `+ where + ` order by ll.EntryDate desc `;
    Service.GenerateExcel(query, where_array, 'Landlord', async (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['JsonData'] = data2.data;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data2.message, data2.status), "Data": data });
        }
    });
};

exports.GenerateCPartnerExcel = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let where = '';
    if (request.Ids != undefined && request.Ids != "") {
        where += ' AND FIND_IN_SET (ChannelPartnerID,?) ';
        where_array.push(request.Ids);
    }
    if (request.Search != undefined && request.Search != '') {
        where += ' AND ( CONCAT(cp.FirstName, ",", cp.LastName) LIKE ? ';
        where_array.push('%' + request.Search + '%');

        where += ' OR cp.PersonalEmail LIKE ? ';
        where_array.push('%' + request.Search + '%');

        where += ' OR cp.ContactPhoneNo LIKE ? ';
        where_array.push('%' + request.Search + '%');

        where += ' OR cp.CompanyName LIKE ? ) ';
        where_array.push('%' + request.Search + '%');
    }

    if (request.Name != undefined && request.Name != '') {
        where += ' AND CONCAT(cp.FirstName) LIKE ? ';
        where_array.push('%' + request.Name + '%');
    }

    if (request.ContactNo != undefined && request.ContactNo != '') {
        where += ' AND cp.ContactPhoneNo LIKE ? ';
        where_array.push('%' + request.ContactNo + '%');
    }

    if (request.ContactEmail != undefined && request.ContactEmail != '') {
        where += ' AND cp.PersonalEmail LIKE ? ';
        where_array.push('%' + request.ContactEmail + '%');
    }

    if (request.ReferenceNo != undefined && request.ReferenceNo != '') {
        where += ' AND cp.ReferenceNo LIKE ? ';
        where_array.push('%' + request.ReferenceNo + '%');
    }

    if (request.CompanyName != undefined && request.CompanyName != '') {
        where += ' AND cp.CompanyName LIKE ? ';
        where_array.push('%' + request.CompanyName + '%');
    }

    if (request.CityID != undefined && request.CityID > 0) {
        where += ' AND cp.CityID=? ';
        where_array.push(request.CityID);
    }

    if (request.StateID != undefined && request.StateID > 0) {
        where += ' AND cp.StateID=? ';
        where_array.push(request.StateID);
    }

    if (request.CountryID != undefined && request.CountryID > 0) {
        where += ' AND cp.CountryID=? ';
        where_array.push(request.CountryID);
    }

    if (request.EntryDate != undefined && request.EntryDate != '') {
        where += ' AND DATE(cp.EntryDate)=? ';
        where_array.push(request.EntryDate);
    }

    if (request.Active != undefined && request.Active != '') {
        where += ' AND cp.Active=? ';
        where_array.push(request.Active);
    }
    let query = `select Firstname as Name,PersonalEmail,PersonalPassword,ReferenceNo,CompanyName,YearOfFoundation,Whatsapp,Instagram,Facebook,Skype,RegisterOfficeAddress,CorrespondenceAddress,Commission,IsAssociate,CompanyDescription,ContactPhoneNo_CountyCode,ContactPhoneNo,OfficePhoneNo_CountyCode,OfficePhoneNo,GeneralEmail,CPCRMEmail,GSTIN,PanNo,AccountName,AccountEmail,HeadOffice,BranchOffice,NatureOfBusiness,CountriesServing,NumberOfStudents,PostCode
    from ChannelPartner as cp where 1  `+ where + `ORDER BY cp.ChannelPartnerID DESC`;
    Service.GenerateExcel(query, where_array, 'ChannelPartner', async (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['JsonData'] = data2.data;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data2.message, data2.status), "Data": data });
        }
    });
};

exports.GenerateUniversityExcel = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let where = '';
    if (request.Ids != undefined && request.Ids != "") {
        where += ' AND FIND_IN_SET (UniversityID,?) ';
        where_array.push(request.Ids);
    }
    if (request.Search != undefined && request.Search != '') {
        where += ' AND (um.UniversityName LIKE ? ';
        where_array.push('%' + request.Search + '%');

        where += ' OR um.Email LIKE ? ';
        where_array.push('%' + request.Search + '%');

        where += ' OR um.PhoneNo LIKE ?) ';
        where_array.push('%' + request.Search + '%');
    }

    if (request.Name != undefined && request.Name != '') {
        where += ' AND um.UniversityName LIKE ? ';
        where_array.push('%' + request.Name + '%');
    }

    if (request.ContactEmail != undefined && request.ContactEmail != '') {
        where += ' AND um.Email LIKE ? ';
        where_array.push('%' + request.ContactEmail + '%');
    }

    if (request.ContactNo != undefined && request.ContactNo != '') {
        where += ' AND um.PhoneNo LIKE ? ';
        where_array.push('%' + request.ContactNo + '%');
    }

    if (request.CityID != undefined && request.CityID > 0) {
        where += ' AND um.CityID=? ';
        where_array.push(request.CityID);
    }

    if (request.StateID != undefined && request.StateID > 0) {
        where += ' AND um.StateID=? ';
        where_array.push(request.StateID);
    }

    if (request.CountryID != undefined && request.CountryID > 0) {
        where += ' AND um.CountryID=? ';
        where_array.push(request.CountryID);
    }

    if (request.EntryDate != undefined && request.EntryDate != '') {
        where += ' AND DATE(um.EntryDate)=? ';
        where_array.push(request.EntryDate);
    }

    if (request.Active != undefined && request.Active != '') {
        where += ' AND um.Active=? ';
        where_array.push(request.Active);
    }

    let query = `select UniversityName,Latitude,Longitude,mc.CountryName,ms.StateName,mCity.CityName,Pincode,AddressLine1,AddressLine2,Phone_CountryCode,PhoneNo,Email,FaxNo,Fees,Reference,ProcessDays,Commission,UcasNo,UniversityRank,RankReference,StudentStength,LegalForm,CourseLanguages,ForeignStudents
    from University as um left join Mst_Country as mc on mc.CountryID = um.CountryID left join Mst_State as ms on ms.StateID = um.StateID left join Mst_City as mCity on mCity.CityID = um.CityID where 1  `+ where + `ORDER BY um.UniversityID DESC`;
    Service.GenerateExcel(query, where_array, 'University', async (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['JsonData'] = data2.data;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data2.message, data2.status), "Data": data });
        }
    });
};

exports.GenerateAccommodationExcel = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let where = "";
    // let where = "AND (acc.CountryID=0 OR acc.StateID=0 OR acc.CityID=0)";
    where_having = "";
    let offset = (request.Pageno * request.Limit - request.Limit);
    let limit = "";
    if (request.Search != undefined && request.Search != '') {
        where += ' AND ( acc.AltAccommodationName LIKE ? ';
        where_array.push('%' + request.Search + '%');

        where += ' OR CONCAT(acc.AddressLine1, ",", acc.AddressLine2) LIKE ? ';
        where_array.push('%' + request.Search + '%');

        where += ' OR acc.Latitude LIKE ? ';
        where_array.push('%' + request.Search + '%');

        where += ' OR acc.Longitude LIKE ? ';
        where_array.push('%' + request.Search + '%');

        where += ' OR acc.Area LIKE ? ';
        where_array.push('%' + request.Search + '%');

        where += ' OR acc.PostCode LIKE ? )';
        where_array.push('%' + request.Search + '%');
    }

    if (request.MainSearch != undefined && request.MainSearch != '') {
        where += ' AND ( acc.AltAccommodationName LIKE ? ';
        where_array.push('%' + request.MainSearch + '%');

        where += ' OR CONCAT(acc.AddressLine1, ",", acc.AddressLine2) LIKE ? ';
        where_array.push('%' + request.MainSearch + '%');

        where += ' OR acc.Area LIKE ? ';
        where_array.push('%' + request.MainSearch + '%');

        where += ' OR acc_pro.Name LIKE ? ';
        where_array.push('%' + request.MainSearch + '%');

        where += ' OR cn.CountryName LIKE ? ';
        where_array.push('%' + request.MainSearch + '%');

        where += ' OR st.StateName LIKE ? ';
        where_array.push('%' + request.MainSearch + '%');

        where += ' OR ct.CityName LIKE ? )';
        where_array.push('%' + request.MainSearch + '%');
    }
    let locationquery = "";
    if (request.LocationSearch != undefined && request.LocationSearch != '') {
        locationquery = 'TRUNCATE((3959 * acos(cos(radians(' + request.Latitude + ')) * cos(radians(acc.Latitude)) * cos(radians(acc.Longitude) - radians(' + request.Longitude + ')) + sin(radians(' + request.Latitude + ')) * sin(radians(acc.Latitude)))), 2) AS Miles,';
        where_having += ' AND Miles <= ' + request.Miles;
    }

    if (request.Name != undefined && request.Name != '') {
        where += ' AND acc.AltAccommodationName LIKE ? ';
        where_array.push('%' + request.Name + '%');
    }

    if (request.CityId != undefined && request.CityId > 0) {
        where += ' AND acc.CityID=? ';
        where_array.push(request.CityId);
    }

    if (request.StateId != undefined && request.StateId > 0) {
        where += ' AND acc.StateID=? ';
        where_array.push(request.StateId);
    }

    if (request.CountryId != undefined && request.CountryId > 0) {
        where += ' AND acc.CountryID=? ';
        where_array.push(request.CountryId);
    }


    if (request.Distance != undefined && request.Distance > 0) {
        where += ' AND acc.Distance=? ';
        where_array.push(request.Distance);
    }


    if (request.EntryDate != undefined && request.EntryDate != '') {
        where += ' AND DATE(acc.EntryDate)=? ';
        where_array.push(request.EntryDate);
    }

    if (request.ProviderId != undefined && request.ProviderId != '') {
        where += ' AND acc.ProviderID IN (' + request.ProviderId + ') ';
    }

    if (request.PropertyTypeId != undefined && request.PropertyTypeId != '') {
        let PropertyTypeId = request.PropertyTypeId.split(',');
        let where_or = '';
        _.each(PropertyTypeId, (val, index) => {
            where_or += (index == 0 ? ' AND (FIND_IN_SET(?, acc.PropertyType) ' : ' OR FIND_IN_SET(?, acc.PropertyType) ');
            where_array.push(val);
        });
        where += (where_or != '' ? where_or + ') ' : '');
    }

    if (request.IsFeature != undefined && request.IsFeature != '') {
        let IsFeature = request.IsFeature.split(',');
        let where_or = '';
        _.each(IsFeature, (val, index) => {
            where_or += (index == 0 ? ' AND (FIND_IN_SET(?, acc.IsFeatures) ' : ' OR FIND_IN_SET(?, acc.IsFeatures) ');
            where_array.push(val);
        });
        where += (where_or != '' ? where_or + ') ' : '');
    }

    if (request.MinPrice != undefined && request.MinPrice != '') {
        where += ' AND acc.WeeklyRate >= ? ';
        where_array.push(request.MinPrice);
    }

    if (request.MaxPrice != undefined && request.MaxPrice != '') {
        where += ' AND acc.WeeklyRate <= ? ';
        where_array.push(request.MaxPrice);
    }

    if (request.Active != undefined && request.Active != '') {
        where += ' AND acc.Active=? ';
        where_array.push(request.Active);
    } else {
        where += ' AND acc.Active="1" ';
    }

    if (request.ContactEmail != undefined && request.ContactEmail != '') {
        where += ' AND acc_con.Email LIKE ? ';
        where_array.push('%' + request.ContactEmail + '%');
    }

    if (request.ContactNo != undefined && request.ContactNo != '') {
        where += ' AND acc_con.PhoneNo LIKE ? ';
        where_array.push('%' + request.ContactNo + '%');
    }

    if (request.MinBed != undefined && request.MinBed != '' && request.MinBed > 0) {
        where += ' AND arc.TotalBed>=? ';
        where_array.push(request.MinBed);
    }

    if (request.MaxBed != undefined && request.MaxBed != '' && request.MaxBed > 0) {
        where += ' AND arc.TotalBed<=? ';
        where_array.push(request.MaxBed);
    }
    if (request.Limit != undefined && request.Pageno != null) {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }
    if (request.Ids != undefined && request.Ids != "" && request.Ids != null && request.Ids != 'undefined' && request.Ids != 'null') {
        where = ' AND FIND_IN_SET (acc.AccommodationID,?) ';
        where_array = [request.Ids];
        // where_array.push(request.Ids);
    }
    if (request.ProviderType != undefined && request.ProviderType != '') {
        if (request.ProviderType == 2) {
            where += ' AND acc_pro.IsSturents=? ';
            where_array.push(1);
        } else {
            where += ' AND acc_pro.IsOffline=? ';
            where_array.push(request.ProviderType);
        }
    }

    if (request.RoomStatus != undefined && request.RoomStatus != '') {
        if (request.RoomStatus == '1') {
            where += ' AND arr.Status="1"';
        }

        if (request.RoomStatus == '2') {
            where += ' AND arr.Status in(1,3)';
        }

        if (request.RoomStatus == '3') {
            where += ' AND arr.Status="3"';
        }

        if (request.RoomStatus == '0') {
            where += ' AND arr.Status is Null';
        }
    }

    if (request.RoomCategory != undefined && request.RoomCategory != '') {
        where += ' AND ar.RoomCategoryID in(' + request.RoomCategory + ')';
    }
    if (request.ProviderMainType != "" && request.ProviderMainType) {
        where += ' AND acc_pro.ProviderType = "' + request.ProviderMainType + '" ';
    }

    let order_by = ' ORDER BY acc.AccommodationID DESC';

    if (request.LocationSearch != undefined && request.LocationSearch != '') {
        order_by = ' ORDER BY Miles ASC ';
    }
    if (request.SortBy != undefined && request.SortBy != null && request.SortBy == '0') {
        order_by = ' ORDER BY acc.WeeklyRate ASC';
    } else if (request.SortBy != undefined && request.SortBy != null && request.SortBy == '1') {
        order_by = ' ORDER BY acc.WeeklyRate DESC';
    }
    // limit = "limit 1000";
    let query = `SELECT 
    acc.UniqueID,
    acc.AltAccommodationName as AccommodationName,
    `+ locationquery + `
    IF(acc.ProviderID='0', 'Ocxee Accommodation', acc_pro.Name) as ProviderName,
    IF(acc.ProviderID='0', 'Ocxee Accommodation', acc_pro.ParentName) as ProviderParentName,
    IF(acc_pro.IsOffline='1' OR acc.ProviderID='0', 'Offline', 'API') as Integration,
    IF(acc_pro.IsSturents=1 OR acc.ProviderID='0', 'Yes', 'No') as Sturents,
    (select GROUP_CONCAT(mp.ParameterValue) from Mst_ParameterValue as mp where acc_pro.ProviderType=mp.ParameterValueID and mp.ParameterTypeID='48') as PrviderType,
    IF(acc.Active='1', 'true', 'false') as PropertyStatus,
    (select GROUP_CONCAT(mp.ParameterValue) from Mst_ParameterValue as mp where FIND_IN_SET(mp.ParameterValueID,acc.PropertyType)) as PropertyType,
    cn.CountryName,
    st.StateName,
    ct.CityName,
    acc.AddressLine1,
    acc.AddressLine2,
    acc.AccRating,
    acc.AccSize,
    ar.RoomCategory,
    IF(arr.IsCustom IS NULL, NULL, IF(arr.IsCustom="1", "true", "false")) as Date_Range_Type,
    DATE_FORMAT(arr.StartDate,'%d %b %Y') as StartDate,
    DATE_FORMAT(arr.EndDate,'%d %b %Y') as EndDate,
    it.ParameterValue as Intake_Name,
    arr.MinIntakYearID as Min_Year, 
    arr.MaxIntakYearID as Max_Year,
    IF(arr.MinTenture>0, CONCAT(arr.MinTenture,' Weeks'), NULL) as MinTenture,
    IF(arr.MaxTenture>0, CONCAT(arr.MaxTenture,' Weeks'), NULL) as MaxTenture,
    arr.DeposoitAmount,
    CONCAT(mcc.CurrencySymbol,' ',IF(arr.WeeklyRate!=0,arr.WeeklyRate,'-')) as RentAmountPerWeek,
    IF(ar.Active IS NULL, NULL, IF(ar.Active="1", "true", "false")) as Room_Category_Active_Status,
    IF(arr.Status IS NULL, "Other", IF(arr.Status="1", "Available", IF(arr.Status="3", "Sold ", IF(arr.Status="2", "Filling Fast ", IF(arr.Status="4", "Limited", NULL))))) as Booking_status,
    ar.TotalBeds
    FROM Accommodation AS acc 
    LEFT JOIN Accommodation_Provider AS acc_pro ON acc_pro.ProviderID=acc.ProviderID 
    LEFT JOIN Accommodation_Contacts AS acc_con ON acc_con.AccommodationID=acc.AccommodationID 
    LEFT JOIN Mst_Country AS cn ON cn.CountryID=acc.CountryID 
    LEFT JOIN Mst_State AS st ON st.StateID=acc.StateID 
    LEFT JOIN Mst_City AS ct ON ct.CityID=acc.CityID
    LEFT JOIN Accommodation_RoomCategory AS ar ON ar.AccommodationID=acc.AccommodationID AND ar.Active='1'
    LEFT JOIN Mst_Country AS mcc ON mcc.CountryID=ar.CurrencyID AND ar.Active='1'
    LEFT JOIN Accommodation_RoomCategoryRent AS arr ON arr.AccRoomCategoryID=ar.AccRoomCategoryID AND arr.Active='1'
    LEFT JOIN Mst_ParameterValue AS it ON it.ParameterValueID=arr.IntakeTypeID AND it.ParameterTypeID = '9'
    LEFT JOIN Landlord AS ll ON ll.LandlordID=acc.LandlordID 
    WHERE 1  `+ where + ` HAVING 1 ` + where_having + ` ` + order_by + ` ` + limit;
    // LEFT JOIN Accommodation_RoomCategoryGallery as arg on ar.AccRoomCategoryID=arg.AccRoomCategoryID    
    // And ar.TotalRooms=0 OR arg.MediaFile='' OR ar.ShortDescription=''    
    // group by acc.AccommodationID

    Service.AccGenerateExcel(query, where_array, 'Accommodation', async (err, data2) => {
        if (err) {
            console.log(err);
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['Url'] = data2.data;
            console.log(res.socket.destroyed);
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data2.message, data2.status), "Data": data });
        }
    });
};

exports.GetCountryToCity = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let where = '';
    if (request.CountryID != undefined && request.CountryID != '') {
        where += ' AND CountryID=? ';
        where_array.push(request.CountryID);
    }
    let query = `select CityID as ID,CityName,CountryID from Mst_City where 1 ` + where;
    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            // console.log(data2);
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.GetSProvider = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let where = '';
    if (request.ServiceID != undefined && request.ServiceID != '') {
        where += ' AND msp.ServiceID=? ';
        where_array.push(request.ServiceID);
    }
    let query = `select sp.ServiceProviderID as ID,sp.Name from Mst_ServicesProviderMapping as msp left join Mst_ServicesProvider sp on sp.ServiceProviderID = msp.ServiceProviderID where 1 ` + where;
    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.GetLandlordkeyword = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let where = '';
    if (request.SearchAll != undefined && request.SearchAll != '') {
        where += ' AND land.name like "%' + request.SearchAll + '%"';
    }
    let query = `select "1" AS id,land.* from (select Firstname as name from Landlord union
    select Lastname as name from Landlord union
    select PhoneNo as name from Landlord union
    select Email as name from Landlord union
    select Addressline1 as name from Landlord) as land where 1 `+ where;
    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.GetNewskeyword = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let where = '';
    if (request.SearchAll != undefined && request.SearchAll != '') {
        where += ' AND MNews.name like "%' + request.SearchAll + '%"';
    }
    let query = `select MNews.* from (select MediaType as name from Mst_News union
    select NewsType as name from Mst_News union
    select NewsApply as name from Mst_News union
    select MediaURL as name from Mst_News union
    select Title as name from Mst_News union
    select SeoKeyword as name from Mst_News union
    select StartDate as name from Mst_News union
    select EndDate as name from Mst_News) as MNews where 1 `+ where;
    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.GetBlogListkeyword = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let where = '';
    if (request.SearchAll != undefined && request.SearchAll != '') {
        where += ' AND Blog.name like "%' + request.SearchAll + '%"';
    }
    let query = `select Blog.* from (select BlogTitle as name from Mst_Blogs union
    select PageTitle as name from Mst_Blogs union
    select SeoKeyword as name from Mst_Blogs union
    select Type as name from Mst_Blogs union
    select StartDate as name from Mst_Blogs union
    select EndDate as name from Mst_Blogs) as Blog where 1 `+ where;
    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.GetChannelPartnerkeyword = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let where = '';
    if (request.SearchAll != undefined && request.SearchAll != '') {
        where += ' AND CP.name like "%' + request.SearchAll + '%"';
    }
    let query = `select CP.* from (select CONCAT(FirstName, " ", LastName) as name from ChannelPartner union
    select PersonalEmail as name from ChannelPartner union
    select ContactPhoneNo as name from ChannelPartner union
    select CompanyName as name from ChannelPartner) as CP where 1 `+ where;
    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.GetUniversitykeyword = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let where = '';
    if (request.SearchAll != undefined && request.SearchAll != '') {
        where += ' AND US.name like "%' + request.SearchAll + '%"';
    }
    let query = `select US.* from (select UniversityName as name from University union
    select Email as name from University union
    select PhoneNo as name from University) as US where 1 `+ where;
    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.GetStudentkword = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let where = '';
    if (request.SearchAll != undefined && request.SearchAll != '') {
        where += ' AND St.name like "%' + request.SearchAll + '%"';
    }

    let query = `select St.* from (select CONCAT(FirstName ," ",LastName) as name from Student union
    select Email as name from Student union
    select REPLACE(PhoneNo," ","") as name from Student union
    select StudentCode as name from Student) as St where 1 `+ where;

    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.GetUserkword = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let where = '';
    if (request.SearchAll != undefined && request.SearchAll != '') {
        where += ' AND User.name like "%' + request.SearchAll + '%"';
    }
    let query = `select User.* from (select UserName as name from Mst_User union
    select Email as name from Mst_User union
    select Name as name from Mst_User union
    select MobileNo as name from Mst_User) as User where 1 `+ where;
    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};


exports.GetServiceMasterkword = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let where = '';
    if (request.SearchAll != undefined && request.SearchAll != '') {
        where += ' AND Mst.name like "%' + request.SearchAll + '%"';
    }
    let query = `select Mst.* from (select Name as name from Mst_Services union
    select PageTitle as name from Mst_Services union
    select LendingType as name from Mst_Services union
    select Type as name from Mst_Services) as Mst where 1 `+ where;
    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};


exports.GetServiceProkword = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let where = '';
    if (request.SearchAll != undefined && request.SearchAll != '') {
        where += ' AND Msp.name like "%' + request.SearchAll + '%"';
    }
    let query = `select Msp.* from (select Name as name from Mst_ServicesProvider union
    select Type as name from Mst_ServicesProvider union
    select Offer as name from Mst_ServicesProvider union
    select ProviderURL as name from Mst_ServicesProvider) as Msp where 1 `+ where;
    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.GetServiceMapkword = async (req, res) => {

    let request = req.body;
    var data = {};
    let where_array = [];
    let where = '';
    if (request.SearchAll != undefined && request.SearchAll != '') {
        where += ' AND Global.name like "%' + request.SearchAll + '%"';
    }
    let query = `select Global.* from (select Name as name from Mst_ServicesProviderMapping as msp left join Mst_Services as ms on ms.ServiceID = msp.ServiceID union
    select Name as name from Mst_ServicesProviderMapping as msp left join Mst_ServicesProvider as mspro on mspro.ServiceProviderID = msp.ServiceProviderID union
    select CountryName as name from Mst_ServicesProviderMapping as msp left join Mst_Country as mc on mc.CountryID = msp.CountryID union
    select DisplayOrder as name from Mst_ServicesProviderMapping) as Global  where 1 `+ where;
    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.ActivityLogList = async (req, res) => {

    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);
    if (request.SearchAll != undefined && request.SearchAll != "") {
        where += ' AND (Name like "%' + request.SearchAll + '%" OR Type like "%' + request.SearchAll + '%" OR Offer like "%' + request.SearchAll + '%" OR ProviderURL like "%' + request.SearchAll + '%") ';
    }
    if (request.UserId != undefined && request.UserId != '') {
        where += ' AND alog.UserId=?';
        where_array.push(request.UserId);
    }
    if (request.TableID != undefined && request.TableID != '') {
        where += ' AND TableID=?';
        where_array.push(request.TableID);
    }
    if (request.Activity != undefined && request.Activity != '') {
        where += ' AND Activity=?';
        where_array.push(request.Activity);
    }
    if (request.TableName != undefined && request.TableName != '') {
        where += ' AND TableName like ?';
        where_array.push('%' + request.TableName + '%');
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }
    if (request.Module != undefined && request.Module != '') {
        where += ' AND Module like ?';
        where_array.push('%' + request.Module + '%');
    }
    if (request.FromDate && request.ToDate) {
        where += ' AND (date(alog.EntryDate) BETWEEN "' + request.FromDate + '" AND "' + request.ToDate + '")';
    }

    let query = `SELECT CAST(LogID as CHAR) as LogID,mu.UserName,TableName,TableID,Module,Activity,Remark,alog.EntryDate from Trn_Admin_log  as alog left join Mst_User as mu on mu.UserID = alog.UserId WHERE 1 ` + where + ` order by date(alog.EntryDate) desc ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Trn_Admin_log  as alog', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.ModuleList = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let where = '';
    let query = `SELECT DISTINCT Module FROM Trn_Admin_log  where 1 ` + where;
    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.TableList = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let where = '';
    let query = `SELECT DISTINCT TableName FROM Trn_Admin_log  where 1 ` + where;
    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.ServicesSection = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.ServiceID != undefined && request.ServiceID != '') {
        where += ' AND mss.ServiceID=?';
        where_array.push(request.ServiceID);
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }
    if (request.SectionTitle != undefined && request.SectionTitle != '') {
        where += ' AND mss.SectionTitle like ?';
        where_array.push('%' + request.SectionTitle + '%');
    }
    if (request.SectionType != undefined && request.SectionType != '') {
        where += ' AND mss.SectionType=?';
        where_array.push(request.SectionType);
    }
    if (request.Status != undefined && request.Status != "") {
        where += ' AND mss.Active=? ';
        where_array.push(request.Status);
    }
    let query = `SELECT CAST(mss.SectionID as CHAR) as SectionID,ServiceID,SectionType,SectionTitle,SectionDes,DisplayOrder from Mst_Services_Section as mss WHERE 1 ` + where + ` ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Mst_Services_Section as mss', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                // console.log(data2)
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddServicesSection = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.SectionID > 0) {
        where_data = {
            'SectionID': request.SectionID,
        };
    }
    update_data['ServiceID'] = request.ServiceID;
    update_data['SectionType'] = request.SectionType;
    update_data['SectionTitle'] = request.SectionTitle;
    update_data['SectionDes'] = request.SectionDes;
    update_data['DisplayOrder'] = request.DisplayOrder;
    if (request.SectionID == "" || request.SectionID == undefined) {
        request.SectionID = 0;
    }

    let fieldshow = 'CAST(SectionID as CHAR) as SectionID,SectionType,SectionTitle';
    let RequestData = {
        'tableName': 'Mst_Services_Section',
        'IdName': 'SectionID',
        'ID': request.SectionID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeleteServicesSection = (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Mst_Services_Section', 'SectionID', req.body.SectionID, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": [] });
        }
    });
};

exports.ServicesSectionItem = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.SectionID != undefined && request.SectionID != '') {
        where += ' AND msst.SectionID=?';
        where_array.push(request.SectionID);
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }
    if (request.ItemTitle != undefined && request.ItemTitle != '') {
        where += ' AND msst.ItemTitle like ?';
        where_array.push('%' + request.ItemTitle + '%');
    }
    if (request.ItemDes != undefined && request.ItemDes != '') {
        where += ' AND msst.ItemDes like ?';
        where_array.push('%' + request.ItemDes + '%');
    }
    let query = `SELECT CAST(msst.ItemID as CHAR) as ItemID,SectionID,ItemTitle,ItemDes,ItemImage,DisplayOrder from Mst_Services_Section_Item as msst WHERE 1 ` + where + ` ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Mst_Services_Section_Item as msst', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                // console.log(data2)
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddServicesSectionItem = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.ItemID > 0) {
        where_data = {
            'ItemID': request.ItemID,
        };
    }
    update_data['SectionID'] = request.SectionID;
    update_data['DisplayOrder'] = request.DisplayOrder;
    update_data['ItemTitle'] = request.ItemTitle;
    update_data['ItemDes'] = request.ItemDes;
    update_data['ItemImage'] = request.oldfile;

    if (request.ItemID == "" || request.ItemID == undefined) {
        request.ItemID = 0;
    }
    if (req.files.recfile) {
        if (Object.entries(req.files.recfile).length) {
            resimage = await upload.uploadFiles(req.files.recfile, 'Mst_Services');
        }
        if (Object.entries(req.files.recfile).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            update_data['ItemImage'] = resimage[0];
        }
    }
    let fieldshow = 'CAST(ItemID as CHAR) as ItemID,ItemTitle,ItemDes';
    let RequestData = {
        'tableName': 'Mst_Services_Section_Item',
        'IdName': 'ItemID',
        'ID': request.ItemID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeleteServicesSectionItem = (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Mst_Services_Section_Item', 'ItemID', req.body.ItemID, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": [] });
        }
    });
};

exports.ReviewList = async (req, res) => {

    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.AccommodationName != undefined && request.AccommodationName != '') {
        where += ' AND acc.AltAccommodationName like ?';
        where_array.push('%' + request.AccommodationName + '%');
    }
    if (request.StudentName != undefined && request.StudentName != '') {
        where += ' AND CONCAT(st.FirstName," ",st.LastName) like ?';
        where_array.push('%' + request.StudentName + '%');
    }
    if (request.IsApprove != undefined && request.IsApprove != "") {
        where += ' AND ar.IsApprove = ? ';
        where_array.push(request.IsApprove);
    }
    if (request.FromDate && request.ToDate) {
        where += ' AND (date(ar.ReviewDate) BETWEEN "' + request.FromDate + '" AND "' + request.ToDate + '")';
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }

    let query = `SELECT CAST(ar.RatingID as CHAR) as RatingID,CONCAT(st.FirstName," ",st.LastName) as StudentName,ar.StudentID,acc.AltAccommodationName as AccommodationName,ar.AccommodationID,FacilitiesRating,LocationRating,TransportationRating,
    SafetyRating,StaffRating,ValueRating,AverageRating,Review AS Raview,ReviewDate,ar.IsApprove from Accommodation_Rating as ar left join Accommodation acc on acc.AccommodationID = ar.AccommodationID 
    left join Student as st on st.StudentID = ar.StudentID WHERE 1 `+ where + ` order by ReviewDate desc ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Accommodation_Rating as ar left join Accommodation acc on acc.AccommodationID = ar.AccommodationID left join Student as st on st.StudentID = ar.StudentID', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.ReviewApproval = (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    Service.ReviewApproval(request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, 'Status Change', data.Status), "Data": [] });
        }
    });
};

exports.PropertyView = async (req, res) => {

    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.StartDate != undefined && request.StartDate != "") {
        where += ' AND date(acv.ViewDate)>= ? ';
        where_array.push(request.StartDate);

        where += ' AND date(acv.ViewDate)<= ? ';
        where_array.push(request.EndDate);
    }
    if (request.accId != undefined && request.accId != '') {
        where += ' AND acv.AccommodationID= ? ';
        where_array.push(request.accId);
    }
    if (request.stdId != undefined && request.stdId != '') {
        where += ' AND acv.StudentID= ? ';
        where_array.push(request.stdId);
    }

    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }


    let query = `SELECT ac.AltAccommodationName as AccommodationName,IF(std.FirstName IS NOT NULL, CONCAT(std.FirstName, ' ', std.LastName), 'Guest') as StudentName,DATE_FORMAT(acv.ViewDate,'%d %b %Y') as VisitedDate,acv.ViewCount as Count,std.PhoneNo as PhoneNumber,std.Email as Email, std.CountryID,ac.CountryID FROM Accommodation_View as acv LEFT JOIN Student as std on std.StudentID=acv.StudentID LEFT JOIN Accommodation as ac on ac.AccommodationID =acv.AccommodationID WHERE 1 ` + where + ` Order by Count desc ` + limit;
    async.waterfall([
        function (done) {
            Service.AllListCount('Accommodation_View as acv', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.PropertyViewSearch = (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = 0;

    if (request.Search != undefined && request.Search != '') {
        where += ' AND ac.AltAccommodationName like ?';
        where_array.push(request.Search + '%');
    }

    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }

    let search_query = 'SELECT ac.AccommodationID as id, trim(ac.AltAccommodationName) AS name FROM Accommodation AS ac WHERE 1 ' + where + ' ORDER BY name ASC ' + limit;

    Service.AllList(search_query, where_array, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.PropertyStdSearch = (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = 0;
    if (request.CPID != undefined && request.CPID != '' && request.CPID != 0) {
        where += ' AND std.ChannelPartnerID=?';
        where_array.push(request.ChannelPartnerID + '%');
    }
    if (request.Search != undefined && request.Search != '') {
        where += ' AND std.FirstName like ?';
        where_array.push(request.Search + '%');
        where += ' OR std.MiddleName like ?';
        where_array.push(request.Search + '%');
        where += ' OR std.LastName like ?';
        where_array.push(request.Search + '%');
        where += ' OR concat(std.FirstName," ",std.LastName) like ?';
        where_array.push(request.Search + '%');
        where += ' OR std.PhoneNo like ?';
        where_array.push(request.Search + '%');
    }

    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }

    let search_query = 'SELECT std.StudentID as id, CONCAT(std.FirstName," ",std.LastName," ",std.PhoneNo) AS name,std.Email FROM Student AS std WHERE 1 ' + where + ' ORDER BY name ASC ' + limit;

    Service.AllList(search_query, where_array, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.PartnerInquiry = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');

    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    console.log(request)
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);


    if (request.serviceName != undefined && request.serviceName != '') {
        where += ' AND pi.OrganizationType like ?';
        where_array.push('%' + request.serviceName + '%');
    }

    if (request.Orgname != undefined && request.Orgname != '') {
        where += ' AND pi.OrganizationName= ?';
        where_array.push(request.Orgname);
    }

    if (request.Pername != undefined && request.Pername != '') {
        where += ' AND pi.PersonName=?';
        where_array.push(request.Pername);
    }

    if (request.PerId != undefined && request.PerId != '') {
        where += ' AND pi.InquiryID=?';
        where_array.push(request.PerId);
    }

    if (request.permobil != undefined && request.permobil != '') {
        where += ' AND pi.PersonPhoneNo like ?';
        where_array.push('%' + request.permobil + '%');
    }

    if (request.CountryID != undefined && request.CountryID != '') {
        where += ' AND FIND_IN_SET(?,pi.ServeCountries)';
        where_array.push(request.CountryID);
    }
    if (request.StartDate && request.EndDate) {
        where += ' AND (date(pi.EntryDate) BETWEEN "' + request.StartDate + '" AND "' + request.EndDate + '")';
    }

    limit = "LIMIT " + offset + ', ' + request.Limit;
    if (request.AllData != undefined && request.AllData != '') {
        limit = ''
    }
    let query = `SELECT OrganizationName as OrgName,OrganizationType as serviceName,Source as Sourceby,PersonDesignation as Position,PersonName as Name,PersonEmail as Email,(select GROUP_CONCAT(mc.CountryName) from Mst_Country as mc where FIND_IN_SET(mc.CountryID,pi.ServeCountries)) as CountryName,PersonPhoneNo as Phone, Description as note,pi.EntryDate 
    FROM PartnerWithUs_Inquiry as pi WHERE 1`+ where + ` Order by pi.EntryDate desc ` + limit;
    async.waterfall([
        function (done) {
            Service.AllListCount('PartnerWithUs_Inquiry as pi', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    console.log(err)
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.PartnerInqurySearch = (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = 0;

    if (request.Search != undefined && request.Search != '') {
        where += ' AND Name like ?';
        where_array.push(request.Search + '%');
    }

    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }

    let search_query = 'SELECT ServiceID as id,trim(Name) AS name  FROM `Mst_Services` WHERE 1 ' + where + ' ORDER BY Name ASC ' + limit;

    Service.AllList(search_query, where_array, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.PartnerPersonSearch = (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = 0;

    if (request.Search != undefined && request.Search != '') {
        where += ' AND PersonName like ?';
        where_array.push(request.Search + '%');
        where += ' OR PersonPhoneNo like ?';
        where_array.push(request.Search + '%');
    }
    if (request.OrgSearch != undefined && request.OrgSearch != '') {
        where += ' AND OrganizationName like ?';
        where_array.push(request.OrgSearch + '%');
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }
    var search_queryass = '';

    if (request.OrgSearch != undefined && request.OrgSearch != '') {
        search_queryass = 'SELECT InquiryID as id,OrganizationName as name FROM PartnerWithUs_Inquiry WHERE 1' + where + ' Order by EntryDate desc ' + limit;
    }
    else if (request.Search != undefined && request.Search != '') {
        search_queryass = 'SELECT InquiryID as id,concat(PersonName,"-",PersonPhoneNo) as name,PersonName as Pername FROM PartnerWithUs_Inquiry WHERE 1' + where + ' Order by EntryDate desc ' + limit;
    }
    let search_query = search_queryass;
    Service.AllList(search_query, where_array, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.ContactUsList = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);
    if (request.Source2 != undefined && request.Source2 != "") {
        where += ' AND cu.Source= ?';
        where_array.push(request.Source2);
    }
    if (request.StudentName != undefined && request.StudentName != '') {
        where += ' AND CONCAT(cu.FirstName," ",cu.LastName) like ?';
        where_array.push('%' + request.StudentName + '%');
    }
    if (request.Email != undefined && request.Email != "") {
        where += ' AND cu.Email like ? ';
        where_array.push('%' + request.Email + '%');
    }
    if (request.Subject != undefined && request.Subject != "") {
        where += ' AND cu.Subject= ?';
        where_array.push(request.Subject);
    }
    if (request.PhoneNo != undefined && request.PhoneNo != "") {
        where += ' AND cu.PhoneNo= ?';
        where_array.push(request.PhoneNo);
    }
    if (request.EntryDate != undefined && request.EntryDate != "") {
        where += ' AND date(cu.EntryDate) = ? ';
        where_array.push(request.EntryDate);
    }

    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }
    let query = `SELECT CAST(cu.ContactID as CHAR) as ContactID,CONCAT(cu.FirstName," ",cu.LastName) as StudentName,Source,FirstName,LastName,Email,PhoneNo,Subject,Message,EntryDate,EntryIP from ContactUs as cu WHERE 1 ` + where + ` order by EntryDate desc ` + limit;
    // console.log(query);
    async.waterfall([
        function (done) {
            Service.AllListCount('ContactUs as cu', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};


exports.SearchingActivityLogList = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.StudentName != undefined && request.StudentName != '') {
        where += ' AND CONCAT(st.FirstName," ",st.LastName) like ?';
        where_array.push('%' + request.StudentName + '%');
    }
    if (request.SearchText != undefined && request.SearchText != "") {
        where += ' AND sal.SearchText like ? ';
        where_array.push('%' + request.SearchText + '%');
    }
    if (request.CountryID != undefined && request.CountryID != "") {
        where += ' AND sal.CountryID= ? ';
        where_array.push(request.CountryID);
    }
    if (request.StateID != undefined && request.StateID != "") {
        where += ' AND sal.StateID= ? ';
        where_array.push(request.StateID);
    }
    if (request.CityID != undefined && request.CityID != "") {
        where += ' AND sal.CityID= ? ';
        where_array.push(request.CityID);
    }
    if (request.FromDate && request.ToDate) {
        where += ' AND (date(sal.EntryDate) BETWEEN "' + request.FromDate + '" AND "' + request.ToDate + '")';
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }

    let query = `SELECT CAST(sal.LogID as CHAR) as LogID,sal.Source,sal.StudentID,CONCAT(st.FirstName," ",st.LastName) as StudentName,sal.SearchText,sal.Distance,sal.CityID,mcity.CityName,sal.StateID,ms.StateName,sal.CountryID,mc.CountryName,sal.Latitude,sal.Longitude,sal.PropertyType,
    (select group_concat(mpv.ParameterValue) from Mst_ParameterValue as mpv where FIND_IN_SET(mpv.ParameterValueID,sal.PropertyType) and  mpv.ParameterTypeID=5 ) as PropertyTypeName,sal.MinBed,sal.MaxBed,sal.MinPrice,sal.MaxPrice,sal.EntryDate as SerachingDate,sal.EntryIP
        from Searching_Activity_Log as sal left join Student as st on st.StudentID = sal.StudentID
        left join Mst_Country as mc on mc.CountryID = sal.CountryID
        left join Mst_State as ms on ms.StateID = sal.StateID
        left join Mst_City as mcity on mcity.CityID = sal.CityID
        WHERE 1 `+ where + ` order by sal.LogID desc ` + limit;
    async.waterfall([
        function (done) {
            Service.JoinListCount(`Searching_Activity_Log as sal left join Student as st on st.StudentID = sal.StudentID `, where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.GetStudentlike = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let where = ' AND CONCAT(st.FirstName," ",st.LastName) like "%' + request.SearchAll + '%"';
    let query = `select CONCAT(st.FirstName,' ',st.LastName) as name,Email from Student as st where 1 ` + where;
    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.UploadServiceImage = async (req, res) => {
    let request = req.body;
    if (req.files.recfile) {
        let FileDetail = {
            TableName: 'Service_Images',
            FieldName: 'Image',
            IDName: 'ServiceImageID',
            ID: request.ServiceImageID || 0,
            Files: req.files.recfile[0].originalname,
            FolderName: 'Mst_Services/'
        };
        let ISFileExit = await Commom.CheckFileExit(FileDetail);
        if (!ISFileExit) {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "This image name allready exit. please upload another name.", '0'), "Data": [] });
            return;
        }
    }

    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    var Insertdata = {};
    var data = [];
    let where_data = {};
    if (request.ServiceImageID > 0) {
        where_data = {
            'ServiceImageID': request.ServiceImageID,
        };
    }
    if (request['ServiceID'] != undefined) {
        Insertdata['ServiceID'] = request['ServiceID'];
    }
    if (request['Text'] != undefined) {
        Insertdata['Text'] = request['Text'];
    }
    if (request['DisplayOrder'] != undefined) {
        Insertdata['DisplayOrder'] = request['DisplayOrder'];
    }
    if (request['Description'] != undefined) {
        Insertdata['Description'] = request['Description'];
    }
    if (request['Url'] != undefined) {
        Insertdata['Url'] = request['Url'];
    }
    if (req.files.recfile) {
        if (Object.entries(req.files.recfile).length) {
            resimage = await upload.S3FileUpload(req.files.recfile, 'Mst_Services', '1');
        }
        if (Object.entries(req.files.recfile).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            Insertdata['Image'] = resimage[0];
        }
    }
    let fieldshow = 'CAST(ServiceImageID as CHAR) as ID,Text,Image';
    let RequestData = {
        'tableName': 'Service_Images',
        'IdName': 'ServiceImageID',
        'ID': request.ServiceImageID,
        'update_data': Insertdata,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.InsertImageData(RequestData, request, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Image upload successfully.", '1'), "Data": data });
        }
    });
};

exports.ServiceImageFetch = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let where = ' AND ServiceID = ' + request.ServiceID;
    let query = `select ServiceImageID,Text,Description,DisplayOrder,ServiceID,Image,Url from Service_Images where 1 ` + where + ` order by DisplayOrder asc`;
    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};


exports.ServiceImageDelete = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    // if (req.body.Image) {
    //     let file_location = req.body.Image.replace(CommonDefault.S3Location, '');
    //     console.log(file_location);
    //     await upload.S3FileDelete(file_location);
    // }
    let FileDetail = { TableName: 'Service_Images', FieldName: 'Image', IDName: 'ServiceImageID', ID: req.body.ServiceImageID || 0 };
    await Commom.S3FileDelete(FileDetail);
    Service.Delete('Service_Images', 'ServiceImageID', req.body.ServiceImageID, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": [] });
        }
    });
};


exports.ImageDeleteS3 = async (req, res) => {
    if (req.body.Image) {
        let file_location = req.body.Image.replace(CommonDefault.S3Location, '');
        console.log(file_location);
        await upload.S3FileDelete(file_location);
    }
    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, 'Image delete', '1'), "Data": [] });
};

exports.PopularPropoertiesList = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.Title != undefined && request.Title != "") {
        where += ' AND pop.Title like ? ';
        where_array.push('%' + request.Title + '%');
    }
    if (request.Fetures != undefined && request.Fetures != "") {
        where += ' AND pop.Fetures like ? ';
        where_array.push('%' + request.Fetures + '%');
    }
    if (request.CountryID != undefined && request.CountryID != "") {
        where += ' AND pop.CountryID= ? ';
        where_array.push(request.CountryID);
    }
    if (request.StateID != undefined && request.StateID != "") {
        where += ' AND pop.StateID= ? ';
        where_array.push(request.StateID);
    }
    if (request.CityID != undefined && request.CityID != "") {
        where += ' AND pop.CityID= ? ';
        where_array.push(request.CityID);
    }
    if (request.EntryDate != undefined && request.EntryDate != "") {
        where += ' AND date(pop.EntryDate) = ? ';
        where_array.push(request.EntryDate);
    }
    if (request.Status != undefined && request.Status != "") {
        where += ' AND pop.Active= ? ';
        where_array.push(request.Status);
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }

    let query = `SELECT CAST(pop.PopularPropoertieID as CHAR) as PopularPropoertieID,pop.Title,pop.Description,pop.Image,pop.Fetures,pop.CityID,mcity.CityName,pop.StateID,ms.StateName,pop.CountryID,mc.CountryName,pop.MinRating,pop.MaxRating,pop.MinPrice,pop.MaxPrice,pop.MinBed,pop.MaxBed,pop.MaxProperty,pop.DisplayOrder,pop.Active,pop.EntryDate,
    (select group_concat(mpv.ParameterValue) from Mst_ParameterValue as mpv where Find_in_set(mpv.ParameterValueID,pop.Fetures)) as FetureValues,pop.PropertyType,pop.ProviderID,pop.LandlordID,if(pop.PriceOrder=1,'asc','desc') as PriceOrderlist,pop.PriceOrder,
    (select group_concat(mpvp.ParameterValue) from Mst_ParameterValue as mpvp where Find_in_set(mpvp.ParameterValueID,pop.PropertyType)) as PropertyTypeList,
    (select group_concat(ap.Name) from Accommodation_Provider as ap where Find_in_set(ap.ProviderID,pop.ProviderID)) as ProviderList,
    (select group_concat(ll.FirstName) from Landlord as ll where Find_in_set(ll.LandlordID,pop.LandlordID)) as LandlordList
    from Popular_Propoerties as pop 
    left join Mst_Country as mc on mc.CountryID = pop.CountryID
    left join Mst_State as ms on ms.StateID = pop.StateID   
    left join Mst_City as mcity on mcity.CityID = pop.CityID
    WHERE 1 `+ where + ` order by EntryDate desc ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount(`Popular_Propoerties as pop`, where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddPopularPropoerties = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.PopularPropoertieID > 0) {
        where_data = {
            'PopularPropoertieID': request.PopularPropoertieID,
        };
    }
    update_data['Title'] = request.Title;
    update_data['Propoertiekey'] = request.Title.replace(/[^a-zA-Z0-9 ]/g, "").replace(/ /g, '-').toLocaleLowerCase();
    update_data['Description'] = request.Description;
    update_data['Fetures'] = request.Fetures;
    update_data['CountryID'] = request.CountryID;
    update_data['StateID'] = request.StateID;
    update_data['CityID'] = request.CityID;
    update_data['MinRating'] = request.MinRating;
    update_data['MaxRating'] = request.MaxRating;
    update_data['MinPrice'] = request.MinPrice;
    update_data['MaxPrice'] = request.MaxPrice;
    update_data['MinBed'] = request.MinBed;
    update_data['MaxBed'] = request.MaxBed;
    update_data['MaxProperty'] = request.MaxProperty;
    update_data['DisplayOrder'] = request.DisplayOrder;
    update_data['Active'] = request.Status;
    update_data['Image'] = request.oldfile;
    update_data['PropertyType'] = request.PropertyType;
    update_data['ProviderID'] = request.Provider;
    update_data['LandlordID'] = request.Landlord;
    update_data['PriceOrder'] = request.PriceOrder;

    if (req.files.recfile) {
        if (Object.entries(req.files.recfile).length) {
            resimage = await upload.uploadFiles(req.files.recfile, 'Mst_Services');
        }
        if (Object.entries(req.files.recfile).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            update_data['Image'] = resimage[0];
        }
    }
    if (request.PopularPropoertieID == "" || request.PopularPropoertieID == undefined) {
        request.PopularPropoertieID = 0;
    }

    let fieldshow = 'CAST(PopularPropoertieID as CHAR) as ID,Title,Description,Image';
    let RequestData = {
        'tableName': 'Popular_Propoerties',
        'IdName': 'PopularPropoertieID',
        'ID': request.PopularPropoertieID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeletePopularPropoerties = (req, res) => {
    let deleteId = req.body.PopularPropoertieID;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Popular_Propoerties', 'PopularPropoertieID', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
};

exports.GetParameterValues = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let where = '';
    let query = `select mpv.ParameterValue as text,mpv.ParameterValue as Name,ParameterValueID as Id,ParameterValueID as id,ParameterValue as Value from Mst_ParameterValue as mpv where mpv.ParameterTypeID in (` + request.ParameterTypeID + `) `;
    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.GetSliderTypeList = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let where = '';
    let query = `select SliderTypeID as ID,Name from Slider_Type`;
    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.GetLondlordList = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let where = '';
    let query = `select LandlordID as ID,CONCAT(FirstName,' ',LastName) as Name from Landlord`;
    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};


exports.homeMapSliderList = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.Title != undefined && request.Title != "") {
        where += ' AND mhs.Title like ? ';
        where_array.push('%' + request.Title + '%');
    }
    if (request.Status != undefined && request.Status != "") {
        where += ' AND mhs.Active= ? ';
        where_array.push(request.Status);
    }
    if (request.SliderType != undefined && request.SliderType != "") {
        where += ' AND mhs.SliderType= ? ';
        where_array.push(request.SliderType);
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }

    let query = `SELECT CAST(mhs.MapId as CHAR) as MapId,mhs.IconeMaping,mhs.Title,Description,SliderImage,DisplayOrder,Active,mhs.EntryDate,st.Name as SliderTypeName,SliderType as SliderTypeNo,mhs.AltName
    from Mst_HomeMap_Slider as mhs 
    left join Slider_Type as st on st.SliderTypeID =  mhs.SliderType
    WHERE 1 `+ where + ` order by EntryDate desc ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount(`Mst_HomeMap_Slider as mhs`, where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddhomeMapSlider = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;

    let FileDetail = { TableName: 'Mst_HomeMap_Slider', IDName: 'MapId', ID: request.MapId || 0 };
    if (req.files.recfile) {
        FileDetail.FieldName = 'IconeMaping';
        FileDetail.FolderName = 'Mst_Services/Icone/';
        FileDetail.Files = req.files.recfile[0].originalname;
        let ISFileExit = await Commom.CheckFileExit(FileDetail);
        if (!ISFileExit) {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "This icon image name allready exit. please upload another name.", '0'), "Data": [] });
            return;
        }
    }

    if (req.files.recfile2) {
        FileDetail.FieldName = 'SliderImage';
        FileDetail.FolderName = 'Mst_Services/SliderImage/';
        FileDetail.Files = req.files.recfile2[0].originalname;
        let ISFileExit = await Commom.CheckFileExit(FileDetail);
        if (!ISFileExit) {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "This slider image name allready exit. please upload another name.", '0'), "Data": [] });
            return;
        }
    }

    let update_data = {};
    let where_data = {};
    if (request.MapId > 0) {
        where_data = {
            'MapId': request.MapId,
        };
    }
    update_data['Title'] = request.Title;
    update_data['SliderType'] = request.SliderType;
    update_data['Description'] = request.Description;
    update_data['DisplayOrder'] = request.DisplayOrder;
    update_data['Active'] = request.Status;
    update_data['IconeMaping'] = request.oldIconeMaping;
    update_data['SliderImage'] = request.oldSliderImage;
    update_data['Url'] = request.Url;
    if (req.files.recfile) {
        if (Object.entries(req.files.recfile).length) {
            // resimage = await upload.uploadFiles(req.files.recfile, 'Mst_Services');
            resimage = await upload.S3FileUpload(req.files.recfile, 'Mst_Services/Icone', '1');
        }
        if (Object.entries(req.files.recfile).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            update_data['IconeMaping'] = resimage[0];
        }
    }
    if (req.files.recfile2) {
        if (Object.entries(req.files.recfile2).length) {
            // resimage = await upload.uploadFiles(req.files.recfile2, 'Mst_Services');
            resimage = await upload.S3FileUpload(req.files.recfile2, 'Mst_Services/SliderImage', '1');
        }
        if (Object.entries(req.files.recfile2).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            update_data['SliderImage'] = resimage[0];
            update_data['AltName'] = filename;
        }
    }
    if (request.MapId == "" || request.MapId == undefined) {
        request.MapId = 0;
    }

    let fieldshow = 'CAST(MapId as CHAR) as ID,Title,Description ';
    let RequestData = {
        'tableName': 'Mst_HomeMap_Slider',
        'IdName': 'MapId',
        'ID': request.MapId,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeletehomeMapSlider = (req, res) => {
    let deleteId = req.body.MapId;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Mst_HomeMap_Slider', 'MapId', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
};


exports.StudentWorkExpXlsImport = (req, res) => {
    if (req.files.recfile != undefined && req.files.recfile != '') {
        var ext = "";
        let SheetJsonData = [];
        req.files.recfile.map((item) => {
            // console.log(item);
            ext = path.extname(item.originalname);
            if (ext.toLowerCase() == '.xlsx') {
                const workbook = xlsx.read(item.buffer, { cellDates: true });
                const sheet_name_list = workbook.SheetNames;
                model_name = sheet_name_list[0];
                SheetJsonData[model_name] = xlsx.utils.sheet_to_json(workbook.Sheets[model_name]);
                Service.StudentWorkExpXlsImport('Student_WorkExperience', SheetJsonData[model_name], req.body, (err, data) => {
                    if (err) {
                        res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0') });
                    } else {
                        res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status) });
                    }
                });
            }
            else {
                res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, "Please Select only excel file", '0') });
            }
        });
    }
};

exports.StudentExamXlsImport = (req, res) => {
    if (req.files.recfile != undefined && req.files.recfile != '') {
        var ext = "";
        let SheetJsonData = [];
        req.files.recfile.map((item) => {
            // console.log(item);
            ext = path.extname(item.originalname);
            if (ext.toLowerCase() == '.xlsx') {
                const workbook = xlsx.read(item.buffer, { cellDates: true });
                const sheet_name_list = workbook.SheetNames;
                model_name = sheet_name_list[0];
                SheetJsonData[model_name] = xlsx.utils.sheet_to_json(workbook.Sheets[model_name]);
                Service.StudentExamXlsImport('Student_AdditionalQualification', SheetJsonData[model_name], req.body, (err, data) => {
                    if (err) {
                        res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0') });
                    } else {
                        res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status) });
                    }
                });
            }
            else {
                res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, "Please Select only excel file", '0') });
            }
        });
    }
};

exports.ServiceProviderXlsImport = (req, res) => {
    if (req.files.recfile != undefined && req.files.recfile != '') {
        var ext = "";
        let SheetJsonData = [];
        req.files.recfile.map((item) => {
            ext = path.extname(item.originalname);
            if (ext.toLowerCase() == '.xlsx') {
                const workbook = xlsx.read(item.buffer, { cellDates: true });
                const sheet_name_list = workbook.SheetNames;
                model_name = sheet_name_list[0];
                SheetJsonData[model_name] = xlsx.utils.sheet_to_json(workbook.Sheets[model_name]);
                Service.ServiceProviderXlsImport('Landlord', SheetJsonData[model_name], req.body, (err, data) => {
                    if (err) {
                        res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0') });
                    } else {
                        res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status) });
                    }
                });
            }
            else {
                res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, "Please Select only excel file", '0') });
            }
        });
    }
};


exports.CareerList = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.Name != undefined && request.Name != "") {
        where += ' AND concat(jf.Firstname," ",jf.Lastname) like ? ';
        where_array.push('%' + request.Name + '%');
    }
    if (request.Phone != undefined && request.Phone != "") {
        where += ' AND jf.Phone= ? ';
        where_array.push(request.Phone);
    }
    if (request.EntryDate != undefined && request.EntryDate != "") {
        where += ' AND date(jf.EntryDate)= ? ';
        where_array.push(request.EntryDate);
    }

    limit = "LIMIT " + offset + ', ' + request.Limit;
    let query = `SELECT Firstname,Lastname,Email,Phone,Message,CV,Active,EntryDate 
    from JoiningForm as jf 
    WHERE 1 `+ where + ` order by EntryDate desc ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount(`JoiningForm as jf`, where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};


exports.AddBestAcc = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.AccommodationBestID > 0) {
        where_data = {
            'AccommodationBestID': request.AccommodationBestID,
        };
    }
    update_data['AccommodationID'] = request.AccommodationID;
    update_data['Type'] = request.Type;
    update_data['Month'] = request.Month;

    if (request.AccommodationBestID == "" || request.AccommodationBestID == undefined) {
        request.AccommodationBestID = 0;
    }

    let fieldshow = 'AccommodationID,Type';
    let RequestData = {
        'tableName': 'Accommodation_Best',
        'IdName': 'AccommodationBestID',
        'ID': request.AccommodationBestID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };

    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.BestAccList = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.Type != undefined && request.Type != "") {
        where += ' AND ab.Type= ? ';
        where_array.push(request.Type);
    }
    if (request.Month != undefined && request.Month != "") {
        where += ' AND ab.Month= ? ';
        where_array.push(request.Month);
    }
    if (request.FromDate && request.ToDate) {
        where += ' AND (date(ab.EntryDate) BETWEEN "' + request.FromDate + '" AND "' + request.ToDate + '")';
    }
    limit = "LIMIT " + offset + ', ' + request.Limit;
    let query = `SELECT AccommodationBestID,Type,Month,Ismail,EntryDate,
    (select GROUP_CONCAT(acc.AltAccommodationName) from Accommodation as acc where FIND_IN_SET(acc.AccommodationID,ab.AccommodationID)) AS AccommodationName
    from Accommodation_Best as ab 
    WHERE 1 `+ where + ` order by EntryDate desc ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount(`Accommodation_Best as ab`, where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};


exports.ArrangeCallList = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);
    if (request.StudentName != undefined && request.StudentName != "") {
        where += ' AND concat(stu.FirstName," ",stu.LastName) like ? ';
        where_array.push(request.StudentName);
    }
    if (request.PhoneNo != undefined && request.PhoneNo != "") {
        where += ' AND stu.PhoneNo= ? ';
        where_array.push(request.PhoneNo);
    }

    if (request.FromTime && request.ToTime) {
        where += ' AND (ai.CallTime BETWEEN "' + request.FromTime + '" AND "' + request.ToTime + '")';
    }
    // if (request.EntryDate!=undefined && request.EntryDate!="") {
    //     where += ' AND date(ai.EntryDate)= ? ';
    //     where_array.push(request.EntryDate);
    // }
    if (request.FromDate && request.ToDate) {
        where += ' AND (date(ai.CallDate) BETWEEN "' + request.FromDate + '" AND "' + request.ToDate + '")';
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }
    //    limit = "LIMIT " + offset + ', ' + request.Limit;
    let query = `SELECT ai.ArrangeCallID,acc.AltAccommodationName as AccommodationName,stu.PhoneNo,concat(stu.FirstName,' ',stu.LastName) as StudentName,ai.CallDate,ai.CallTime,ai.Message,ai.EntryDate,ai.EntryIP
    from ArrangeCall_Inquiry as ai left join Accommodation acc on acc.AccommodationID = ai.AccommodationID
    left join Student stu on stu.StudentID = ai.StudentID 
    WHERE 1 `+ where + ` order by EntryDate desc ` + limit;
    async.waterfall([
        function (done) {
            Service.JoinListCount(`ArrangeCall_Inquiry as ai left join Accommodation acc on acc.AccommodationID = ai.AccommodationID left join Student stu on stu.StudentID = ai.StudentID`, where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.StudentLoginHistory = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.HstID != undefined && request.HstID != "") {
        where += ' AND slh.HstID=? ';
        where_array.push(request.HstID);
    }
    if (request.UserName != undefined && request.UserName != "") {
        where += ' AND CONCAT(st.FirstName," ",st.LastName) like ? ';
        where_array.push('%' + request.UserName + '%');
    }
    if (request.Email != undefined && request.Email != "") {
        where += ' AND st.Email like ? ';
        where_array.push('%' + request.Email + '%');
    }
    if (request.MobileNo != undefined && request.MobileNo != "") {
        where += ' AND st.PhoneNo like ? ';
        where_array.push('%' + request.MobileNo + '%');
    }

    if (request.FromDate && request.ToDate) {
        where += ' AND (date(slh.LoginDate) BETWEEN "' + request.FromDate + '" AND "' + request.ToDate + '")';
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }

    let query = `SELECT CAST(slh.HstID as CHAR) as HstID,slh.StudentID,CONCAT(st.FirstName,' ',st.LastName) as StudentName,st.Email,st.PhoneNo,if(slh.Source='1','web',if(slh.Source='2','Android','IOS')) as Source,slh.AppVersion,slh.DeviceID,slh.EntryIP,slh.LogoutDate,slh.DeviceToken,slh.LoginDate
    from HST_Student_Login as slh inner join Student st on st.StudentID = slh.StudentID WHERE 1  `+ where + ` order by slh.LoginDate desc ` + limit;

    async.waterfall([
        function (done) {
            Service.JoinListCount('HST_Student_Login as slh inner join Student st on st.StudentID = slh.StudentID', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['page_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};


exports.CustomRegistrationStudent = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    Service.CustomRegistrationStudent(request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};


exports.EmailLogList = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.UserName != undefined && request.UserName != "") {
        where += ' AND CONCAT(st.FirstName," ",st.LastName) like ? ';
        where_array.push('%' + request.UserName + '%');
    }
    if (request.Email != undefined && request.Email != "") {
        where += ' AND slt.Email like ? ';
        where_array.push('%' + request.Email + '%');
    }
    if (request.TemplateSubject != undefined && request.TemplateSubject != "") {
        where += ' AND slt.TemplateSubject like ? ';
        where_array.push('%' + request.TemplateSubject + '%');
    }

    if (request.FromDate && request.ToDate) {
        where += ' AND (date(slt.EntryDate) BETWEEN "' + request.FromDate + '" AND "' + request.ToDate + '")';
    }

    if (request.EntryBy != undefined && request.EntryBy != "") {
        where += ' AND slt.EntryBy=? ';
        where_array.push(request.EntryBy);
    }

    // if (request.AllData==undefined || request.AllData=='') {
    limit = "LIMIT " + offset + ', ' + request.Limit;
    // }

    let query = `select slt.StudentID,slt.HstID,slt.Email,mst.TemplateName,slt.EntryBy,slt.EntryDate,slt.TemplateID,slt.TemplateSubject,slt.CcEmail,slt.BccEmail,
    (select group_concat(acc.AltAccommodationName) from Accommodation as acc where FIND_IN_SET(acc.AccommodationID,slt.AccommodationID)) as AccommodationName,slt.AccommodationID,
    (select group_concat(CONCAT(st.FirstName,' ',st.LastName)) from Student as st where FIND_IN_SET(st.StudentID,slt.StudentID)) as StudentName,
    (select mu.UserName from Mst_User as mu where mu.UserID = slt.EntryBy) as SendBy
    from HST_Student_Email as slt 
    left join Student as st on st.StudentID = slt.StudentID  
    left join Mst_MessageTemplate as mst on mst.TemplateID = slt.TemplateID
    WHERE 1  `+ where + ` order by slt.EntryDate desc ` + limit;

    async.waterfall([
        function (done) {
            Service.JoinListCount('HST_Student_Email as slt left join Student st on st.StudentID = slt.StudentID left join Mst_MessageTemplate mst on mst.TemplateID = slt.TemplateID', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['page_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.ServiceLogList = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.StudentName != undefined && request.StudentName != "") {
        where += ' AND CONCAT(st.FirstName," ",st.LastName) like ? ';
        where_array.push('%' + request.StudentName + '%');
    }
    if (request.ServiceName != undefined && request.ServiceName != "") {
        where += ' AND ms.ServiceName like ? ';
        where_array.push('%' + request.ServiceName + '%');
    }
    if (request.ServiceID != undefined && request.ServiceID != "") {
        where += ' AND sl.ServiceID = ? ';
        where_array.push(request.ServiceID);
    }

    if (request.Sources != undefined && request.Sources != "") {
        where += ' AND sl.Source = ? ';
        where_array.push(request.Sources);
    }

    if (request.FromDate && request.ToDate) {
        where += ' AND (date(sl.EntryDate) BETWEEN "' + request.FromDate + '" AND "' + request.ToDate + '")';
    }

    // if (request.AllData==undefined || request.AllData=='') {
    limit = "LIMIT " + offset + ', ' + request.Limit;
    // }

    let query = `select sl.HST_ID,sl.StudentID,ms.Name as ServiceName,sl.ServiceID,CONCAT(st.FirstName,' ',st.LastName) as StudentName,sl.EntryBy,sl.EntryDate,if(sl.Source='1','web',if(sl.Source='2','Android','IOS')) as Source,sl.EntryIP
    from HST_Service_log as sl 
    left join Student as st on st.StudentID = sl.StudentID  
    left join Mst_Services as ms on ms.ServiceID = sl.ServiceID
    WHERE 1  `+ where + ` order by sl.EntryDate desc ` + limit;

    async.waterfall([
        function (done) {
            Service.JoinListCount('HST_Service_log as sl left join Student st on st.StudentID = sl.StudentID left join Mst_Services as ms on ms.ServiceID = sl.ServiceID', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['page_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.SeoDescriptionList = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);
    if (request.CountryID != undefined && request.CountryID != "") {
        where += ' AND sd.CountryID = ? ';
        where_array.push(request.CountryID);
    }
    if (request.CityID != undefined && request.CityID != "") {
        where += ' AND sd.CityID = ? ';
        where_array.push(request.CityID);
    }
    if (request.Active != undefined && request.Active != "") {
        where += ' AND sd.Active = ? ';
        where_array.push(request.Active);
    }
    if (request.FromDate && request.ToDate) {
        where += ' AND (date(sd.EntryDate) BETWEEN "' + request.FromDate + '" AND "' + request.ToDate + '")';
    }

    // if (request.AllData==undefined || request.AllData=='') {
    limit = "LIMIT " + offset + ', ' + request.Limit;
    // }

    let query = `select sd.AccSeoID,sd.Type,sd.CountryID,sd.CityID,mc.CountryName,mcc.CityName,sd.MetaTitle,sd.MetaDescription,sd.MetaKeyword,sd.Active,sd.EntryDate,sd.UpdateDate,
    (select mu.UserName from Mst_User as mu where mu.UserID = sd.EntryBy) as EntryBy,
    (select mu.UserName from Mst_User as mu where mu.UserID = sd.UpdateBy) as UpdateBy
    from Accommodation_SEO_Content as sd left join Mst_Country as mc on mc.CountryID=sd.CountryID
    left join Mst_City as mcc on mcc.CityID=sd.CityID where 1 `+ where + ` order by sd.AccSeoID desc ` + limit;

    async.waterfall([
        function (done) {
            Service.JoinListCount('Accommodation_SEO_Content as sd left join Mst_Country as mc on mc.CountryID=sd.CountryID left join Mst_City as mcc on mcc.CityID=sd.CityID ', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['page_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.SeoDescriptionList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddSeoDescription = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.AccSeoID > 0) {
        where_data = {
            'AccSeoID': request.AccSeoID,
        };
    }
    update_data['Type'] = request.Type;
    update_data['CountryID'] = request.CountryID;

    if (request.CityID != undefined && request.CityID != null && request.CityID != "") {
        update_data['CityID'] = request.CityID;
    } else {
        update_data['CityID'] = 0;
    }
    if (request.MetaTitle != undefined && request.MetaTitle != null && request.MetaTitle != "") {
        update_data['MetaTitle'] = request.MetaTitle;
    }
    if (request.MetaDescription != undefined && request.MetaDescription != null && request.MetaDescription != "") {
        update_data['MetaDescription'] = request.MetaDescription;
    }
    if (request.MetaKeyword != undefined && request.MetaKeyword != null && request.MetaKeyword != "") {
        update_data['MetaKeyword'] = request.MetaKeyword;
    }
    if (request.Active != undefined && request.Active != null && request.Active != "") {
        update_data['Active'] = request.Active;
    }
    if (request.AccSeoID == "" || request.AccSeoID == undefined) {
        request.AccSeoID = 0;
    }

    let fieldshow = 'AccSeoID,Type';
    let RequestData = {
        'tableName': 'Accommodation_SEO_Content',
        'IdName': 'AccSeoID',
        'ID': request.AccSeoID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };

    Service.AddSeoDescription(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};


exports.DeleteSeoDescription = (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Accommodation_SEO_Content', 'AccSeoID', req.body.AccSeoID, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": [] });
        }
    });
};

exports.DeleteSubSeoDescription = (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Accommodation_SEO_Content_multiple', 'AccSeoDetailsID', req.body.AccSeoDetailsID, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": [] });
        }
    });
};

exports.GenerateSeoContentExcel = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let where = '';
    if (request.CountryID != undefined && request.CountryID != "") {
        where += ' AND sd.CountryID = ? ';
        where_array.push(request.CountryID);
    }
    if (request.CityID != undefined && request.CityID != "") {
        where += ' AND sd.CityID = ? ';
        where_array.push(request.CityID);
    }
    if (request.Active != undefined && request.Active != "") {
        where += ' AND sd.Active = ? ';
        where_array.push(request.Active);
    }
    if (request.FromDate && request.ToDate) {
        where += ' AND (date(sd.EntryDate) BETWEEN "' + request.FromDate + '" AND "' + request.ToDate + '")';
    }
    let query = `select ascm.Title as SeoTitle,mc.CountryName,mcc.CityName,sd.MetaTitle,sd.MetaDescription,sd.MetaKeyword,sd.EntryDate,sd.UpdateDate,
    (select mu.UserName from Mst_User as mu where mu.UserID = sd.EntryBy) as EntryBy,
    (select mu.UserName from Mst_User as mu where mu.UserID = sd.UpdateBy) as UpdateBy
    from Accommodation_SEO_Content_multiple as ascm 
    left join Accommodation_SEO_Content as sd on sd.AccSeoID = ascm.AccSeoID
    left join Mst_Country as mc on mc.CountryID=sd.CountryID
    left join Mst_City as mcc on mcc.CityID=sd.CityID where 1 `+ where + ` order by sd.AccSeoID desc `;

    Service.GenerateExcel(query, where_array, (err, data2) => {
        if (err) {
            console.log(err);
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['JsonData'] = data2.data;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data2.message, data2.status), "Data": data });
        }
    });
};


exports.SendReverificationStudentlink = async (req, res) => {
    let Session = {};
    let request = req.body;
    let qry = `SELECT StudentID,FirstName,LastName,Email from Student where Active='0' AND StudentID in (` + request.UserIDS + `)`;
    let EmailData = {};
    let mailstatus = '0';
    let mailmessage = 'Something wrong in email OR Email service is stop';
    var EmailTamplate = await Commom.GetEmailTemplate('FrontEnd.Reverification');
    Service.AllList(qry, async (err, UserEmailData) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            if (EmailTamplate && process.env.AllowMail == 'true') {
                for (const [key, value] of Object.entries(UserEmailData)) {
                    EmailData = {};
                    Session = {
                        'UserId': value.StudentID,
                        'ExpiredTime': moment().add(24, 'hours').format('YYYYMMDDHHmmss')
                    }
                    // console.log(Session);
                    Session = await Commom.TokenEncrypt(JSON.stringify(Session));
                    let reset_pass_link = process.env.STUDENT_PANEL_LINK + 'email-verification?Session=' + encodeURIComponent(Session);
                    // console.log(reset_pass_link);
                    let user_name = value.FirstName + ' ' + value.LastName;
                    EmailData.ToMail = value.Email;
                    EmailData.TemplateSubject = EmailTamplate.TemplateSubject;
                    EmailData.TemplateBody = EmailTamplate.TemplateBody.replace('{First Name}', user_name)
                        .replace('{link}', reset_pass_link);
                    let status = await Send_Mail.Ocxee_SMTP_Mail_Multiple2(EmailData);
                }
                mailmessage = 'Email successfully send';
                mailstatus = '1';
            }
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, mailmessage, mailstatus), "Data": [] });
        }
    });
};
exports.UpdateSigleRecord = async (req, res) => {
    Service.UpdateSigleRecord(req, request, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
}
exports.UpdateDocStatus = async (req, res) => {
    Service.UpdateDocStatus(req, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
}
exports.BlogImageUpload = async (req, res) => {
    console.log(req.files.file);
    let filename = "";
    if (req.files.file) {
        if (Object.entries(req.files.file).length) {
            resimage = await upload.uploadFiles(req.files.file, 'Angular-editor', '2');
        }
        if (Object.entries(req.files.file).length) {
            let filearray = resimage[0].split("/");
            filename = filearray[filearray.length - 1];
        }
    }
    let ress = {
        "status": true,
        "originalName": filename,
        "generatedName": filename,
        "msg": "Image upload successful",
        "imageUrl": resimage[0],
    };
    res.status(200).json(ress);
};

exports.GenerlInquiryList = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.UserName != undefined && request.UserName != "") {
        where += ' AND CONCAT(Gi.FirstName," ",Gi.LastName) like ? ';
        where_array.push('%' + request.UserName + '%');
    }
    if (request.Email != undefined && request.Email != "") {
        where += ' AND Gi.Email like ? ';
        where_array.push('%' + request.Email + '%');
    }
    if (request.PageUrl != undefined && request.PageUrl != "") {
        where += ' AND Gi.PageUrl like ? ';
        where_array.push('%' + request.PageUrl + '%');
    }

    if (request.FromDate && request.ToDate) {
        where += ' AND (date(Gi.EntryDate) BETWEEN "' + request.FromDate + '" AND "' + request.ToDate + '")';
    }

    if (request.MobileNo != undefined && request.MobileNo != "") {
        where += ' AND Gi.MobileNo=? ';
        where_array.push(request.MobileNo);
    }

    if (request.Isexcel) {
        let query2 = `select FirstName,LastName,Email,CONCAT(CountryID,' ',MobileNo) as MobileNo,UniversityName,CONCAT('` + process.env.STUDENT_PANEL_LINK + `',PageUrl) as PageUrl,Description,if(Gi.Source='3','IOS',if(Gi.Source='2','Android','Web')) as Source,EntryDate as Date,EntryIP as IpAddress,LatLong,SerchKeyword
        from GenearlInquiry as Gi where 1 `+ where + ` order by Gi.EntryDate desc`;
        Service.AllList(query2, where_array, async (err, data2) => {
            if (err) {
                res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
            } else {
                let GetUrl = await Commom.GenerateExcel(data2, 'IMMEDIATE INQUIRY');
                data['Url'] = GetUrl;
                res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
            }
        });
    } else {
        limit = "LIMIT " + offset + ', ' + request.Limit;
        let query = `select GenearlInquiryID,FirstName,LastName,Email,MobileNo,CountryID,UniversityName,CONCAT('` + process.env.STUDENT_PANEL_LINK + `',PageUrl) as PageUrl,Description,if(Gi.Source='3','IOS',if(Gi.Source='2','Android','Web')) as Source,EntryDate,EntryIP,LatLong,SerchKeyword
        from GenearlInquiry as Gi where 1 `+ where + ` order by Gi.EntryDate desc ` + limit;
        async.waterfall([
            function (done) {
                Service.JoinListCount('GenearlInquiry as Gi', where, where_array, (err, data1) => {
                    if (err) {
                        res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                    } else {
                        let para_data = {};
                        para_data['TotalRecord'] = data1[0].total.toString();
                        para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                        para_data['CurrentPage'] = req.body.PageNo;
                        data['page_data'] = para_data;
                        done(null, data);
                    }
                });
            },
            function (data, done) {
                Service.AllList(query, where_array, async (err, data2) => {
                    if (err) {
                        res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                    } else {
                        data['list'] = data2;
                        res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                    }
                });
            },
        ], function (err, result) {
        });
    }
};

exports.AdsList = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);
    limit = "LIMIT " + offset + ', ' + request.Limit;

    if (request.Link != undefined && request.Link != "") {
        where += ' AND Am.Link like ? ';
        where_array.push('%' + request.Link + '%');
    }
    if (request.FromDate && request.ToDate) {
        where += ' AND (date(Am.EntryDate) BETWEEN "' + request.FromDate + '" AND "' + request.ToDate + '")';
    }
    if (request.ModuleType != undefined && request.ModuleType != "") {
        where += ' AND Am.ModuleType=? ';
        where_array.push(request.ModuleType);
    }
    if (request.AdType != undefined && request.AdType != "") {
        where += ' AND Am.AdType=? ';
        where_array.push(request.AdType);
    }
    if (request.Remark != undefined && request.Remark != "") {
        where += ' AND Am.Remark like ? ';
        where_array.push('%' + request.Remark + '%');
    }
    if (request.Active != undefined && request.Active != "") {
        where += ' AND Am.Active=? ';
        where_array.push(request.Active);
    }

    let query = `select Ad_ID,Photo,Link,if(ModuleType='2','Accommdation',if(ModuleType='1','Blog','Accommdation')) as ModuleType,AdType,OrderNo,Remark,Active,ModuleType as ModuleTypeID
     from Ad_Master as Am where 1 `+ where + ` order by Am.EntryDate desc ` + limit;

    async.waterfall([
        function (done) {
            Service.JoinListCount('Ad_Master as Am', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['page_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddAds = async (req, res) => {
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.Ad_ID > 0) {
        where_data = {
            'Ad_ID': request.Ad_ID,
        };
    }
    update_data['Link'] = request.Link;
    update_data['ModuleType'] = request.ModuleType;
    update_data['AdType'] = request.AdType;
    update_data['OrderNo'] = request.OrderNo;
    update_data['Remark'] = request.Remark;
    update_data['Active'] = request.Status;
    // update_data['Photo'] = request.oldPhoto;

    if (req.files.recfile) {
        if (Object.entries(req.files.recfile).length) {
            resimage = await upload.uploadFiles(req.files.recfile, 'Mst_Services');
        }
        if (Object.entries(req.files.recfile).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            update_data['Photo'] = resimage[0];
        }
    }
    if (request.Ad_ID == "" || request.Ad_ID == undefined) {
        request.Ad_ID = 0;
    }

    let fieldshow = 'CAST(Ad_ID as CHAR) as ID,Link,Remark,Photo';
    let RequestData = {
        'tableName': 'Ad_Master',
        'IdName': 'Ad_ID',
        'ID': request.Ad_ID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeleteAds = (req, res) => {
    Service.Delete('Ad_Master', 'Ad_ID', req.body.Ad_ID, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": [] });
        }
    });
};

exports.Get_Payment_Link = async (req, res) => {
    var Ref_Id = req.body.Ref_Id;
    var Service_Name = req.body.Service_Name;
    var Currency = req.body.Currency;
    var Amount = req.body.Amount;
    var Ref_Id_Enc = req.body.Ref_Id_Enc;

    let query = `SELECT PayStatus from Accommodation_BookingRequest where BookingNo= '` + Ref_Id.trim() + `' limit 1`;
    // console.log(query);
    Service.AllList(query, [], async (error, data) => {
        console.log(data);
        if (error != null && error.sqlMessage != undefined) {
            res.status(500).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, error.message, '0'), "Data": [] });
        } else {
            if (!_.isEmpty(data)) {
                if (data[0].PayStatus == '1') {
                    res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Noalert, "Payment already done.", '1'), "Data": [] });
                } else {
                    var amount = parseFloat(Amount) * 100;

                    const session = await stripe.checkout.sessions.create({
                        payment_method_types: [
                            'card',
                        ],
                        line_items: [
                            {
                                price_data: {
                                    currency: Currency,
                                    product_data: {
                                        name: Ref_Id,
                                    },
                                    unit_amount_decimal: amount.toFixed(2),
                                },
                                quantity: 1,
                            },
                        ],
                        mode: 'payment',
                        success_url: process.env.STUDENT_PANEL_LINK + `Payment?RefID=` + Ref_Id_Enc,
                        cancel_url: process.env.STUDENT_PANEL_LINK + `Cancel-Payment?RefID=` + Ref_Id,
                    });
                    var UpdateData = {
                        TransactionID: session.payment_intent,
                        PayAmount: Amount
                    }
                    var where = {};
                    where['BookingNo'] = Ref_Id;
                    let updateREquest = '';
                    updateREquest = await sqlhelper.update('Accommodation_BookingRequest', UpdateData, where, (err, res) => {
                        if (err) {
                            callback(err, new Array());
                            return 0;
                        } else {
                            return res;
                        }
                    });
                    var res_data = {
                        id: session.id,
                        url: session.url,
                        transaction_id: session.payment_intent
                    }
                    // console.log(res_data);
                    res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": res_data });
                }

            } else {
                let query = `SELECT PayStatus from Student_Inquiry where InquiryNo= '` + Ref_Id.trim() + `' limit 1`;
                Service.AllList(query, [], async (error, data) => {
                    if (error != null && error.sqlMessage != undefined) {
                        res.status(500).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, error.message, '0'), "Data": [] });
                    } else {
                        if (!_.isEmpty(data)) {
                            if (data[0].PayStatus == '1') {
                                res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Noalert, "Payment already done.", '1'), "Data": [] });
                            } else {
                                var amount = parseFloat(Amount) * 100;

                                const session = await stripe.checkout.sessions.create({
                                    payment_method_types: [
                                        'card',
                                    ],
                                    line_items: [
                                        {
                                            price_data: {
                                                currency: Currency,
                                                product_data: {
                                                    name: Ref_Id,
                                                },
                                                unit_amount_decimal: amount.toFixed(2),
                                            },
                                            quantity: 1,
                                        },
                                    ],
                                    mode: 'payment',
                                    success_url: process.env.STUDENT_PANEL_LINK + `Payment?RefID=` + Ref_Id_Enc,
                                    cancel_url: process.env.STUDENT_PANEL_LINK + `Cancel-Payment?RefID=` + Ref_Id,
                                });
                                var UpdateData = {
                                    TransactionID: session.payment_intent,
                                    PayAmount: Amount
                                }
                                var where = {};
                                where['InquiryNo'] = Ref_Id;
                                let updateREquest = '';
                                updateREquest = await sqlhelper.update('Student_Inquiry', UpdateData, where, (err, res) => {
                                    if (err) {
                                        callback(err, new Array());
                                        return 0;
                                    } else {
                                        return res;
                                    }
                                });
                                var res_data = {
                                    id: session.id,
                                    url: session.url,
                                    transaction_id: session.payment_intent
                                }

                                res.status(200).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": res_data });
                            }

                        } else {

                            res.status(500).send({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, 'Something goes wrong.', '0'), "Data": [] });
                        }
                    }
                });
            }
        }
    });
};


exports.AccAdsList = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);
    limit = "LIMIT " + offset + ', ' + request.Limit;

    if (request.Link != undefined && request.Link != "") {
        where += ' AND Am.AdLink like ? ';
        where_array.push('%' + request.Link + '%');
    }
    if (request.FromDate && request.ToDate) {
        where += ' AND (date(Am.EntryDate) BETWEEN "' + request.FromDate + '" AND "' + request.ToDate + '")';
    }
    if (request.AdType != undefined && request.AdType != "") {
        where += ' AND Am.AdType=? ';
        where_array.push(request.AdType);
    }
    if (request.CountryID != undefined && request.CountryID != "") {
        where += ' AND Am.CountryID=? ';
        where_array.push(request.CountryID);
    }
    if (request.CityID != undefined && request.CityID != "") {
        where += ' AND find_in_set(' + request.CityID + ', Am.CityID)';
        // where_array.push(request.CityID);
    }
    if (request.Active != undefined && request.Active != "") {
        where += ' AND Am.Active=? ';
        where_array.push(request.Active);
    }
    if (request.IsCity != undefined && request.IsCity != "") {
        where += ' AND Am.IsCity=? ';
        where_array.push(request.IsCity);
    }
    let query = `select Am.AccAdsID,Am.Ad,Am.CountryID,GROUP_CONCAT(mcc.CityName) as CityName,Am.CityID,Am.AdType,if(Am.AdType='1','Square ','Baner') as AdTypeText,Am.OrderNo,Am.AdLink,Am.Active,Am.EntryDate,Am.UpdateDate,Am.EntryIP,Am.UpdateIP,
        mc.CountryName,Am.IsCity from Accommodation_Ads as Am
        left join Mst_Country as mc on mc.CountryID = Am.CountryID
        left JOIN Mst_City as mcc on find_in_set(mcc.CityID, Am.CityID) where 1 `+ where + `GROUP BY Am.AccAdsID order by Am.AccAdsID desc ` + limit;

    async.waterfall([
        function (done) {
            Service.JoinListCount('Accommodation_Ads as Am', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['page_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};


exports.AddAccAds = async (req, res) => {
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.AccAdsID > 0) {
        where_data = {
            'AccAdsID': request.AccAdsID,
        };
    }
    update_data['CountryID'] = request.CountryID;
    update_data['CityID'] = request.CityID;
    update_data['AdType'] = request.AdType;
    update_data['OrderNo'] = request.OrderNo;
    update_data['AdLink'] = request.AdLink;
    update_data['Active'] = request.Status;
    update_data['IsCity'] = request.IsCity;


    if (req.files.recfile) {
        // console.log(req.files.recfile);
        if (Object.entries(req.files.recfile).length) {
            resimage = await upload.uploadFiles(req.files.recfile, 'Mst_Services');
        }
        if (Object.entries(req.files.recfile).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            update_data['Ad'] = resimage[0];
        }
    }
    if (request.AccAdsID == "" || request.AccAdsID == undefined) {
        request.AccAdsID = 0;
    }

    let fieldshow = 'CAST(AccAdsID as CHAR) as ID';
    let RequestData = {
        'tableName': 'Accommodation_Ads',
        'IdName': 'AccAdsID',
        'ID': request.AccAdsID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeleteAccAds = (req, res) => {
    Service.Delete('Accommodation_Ads', 'AccAdsID', req.body.AccAdsID, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": [] });
        }
    });
};

//05-10-2021
exports.ImpressionList = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.CountryID != undefined && request.CountryID != "") {
        where += ' AND sal.CountryID= ? ';
        where_array.push(request.CountryID);
    }
    if (request.CityID != undefined && request.CityID != "") {
        where += ' AND sal.CityID= ? ';
        where_array.push(request.CityID);
    }

    if (request.FromDate && request.ToDate) {
        where += ' AND (date(aim.EntryDate) BETWEEN "' + request.FromDate + '" AND "' + request.ToDate + '")';
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = " LIMIT " + offset + ', ' + request.Limit;
    }
    let GroupBy = "GROUP by ads.CountryID,ads.CityID,aim.OfferID";
    let query = `SELECT IFNULL(mc.CountryName, "Default") as CountryName,
    IFNULL(mcc.CityName, "Default") as CityName,ads.Ad,count(case aim.ImpType when '1' then 1 else null end) as View,count(case aim.ImpType when '2' then 1 else null end) as Click,sal.SearchText,aim.EntryDate,aim.EntryIP 
    FROM Acc_Ads_Impression as aim left join Searching_Activity_Log as sal on sal.LogID=aim.LogID 
    right join Accommodation_Ads as ads on ads.AccAdsID = aim.OfferID and ads.Active=1 
    left join Mst_Country as mc on mc.CountryID=ads.CountryID 
    left join Mst_City as mcc on mcc.CityID=ads.CityID
    where 1 `+ where + ` ` + GroupBy + ` order by View Desc,Click Desc ` + limit;
    async.waterfall([
        function (done) {
            where += " " + GroupBy + " ) As totalCount"
            Service.JoinListCount(`(SELECT count(*) as subtotal from (Acc_Ads_Impression as aim right join Accommodation_Ads as ads on ads.AccAdsID = aim.OfferID and ads.Active=1 
            left join Searching_Activity_Log as sal on sal.LogID=aim.LogID)`, where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AccProviderlist = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.ParentName != undefined && request.ParentName != "") {
        where += " AND ParentName='" + request.ParentName + "'";
        // where_array.push();
    }
    if (request.ProviderID != undefined && request.ProviderID != "") {
        where += " AND ProviderID= ? ";
        where_array.push(request.ProviderID);
    }
    if (request.ProviderType != undefined && request.ProviderType != "") {
        where += " AND ProviderType= ? ";
        where_array.push(request.ProviderType);
    }
    if (request.SunToSat != undefined && request.SunToSat != "") {
        where += " AND " + request.SunToSat + "= ? ";
        where_array.push("1");
    }
    if (request.IsCronType != undefined && request.IsCronType != "") {
        where += " AND IsCronType= ? ";
        where_array.push(request.IsCronType);
    }
    if (request.IsOffline != undefined && request.IsOffline != "") {
        where += " AND IsOffline= ? ";
        where_array.push(request.IsOffline);
    }
    if (request.Active != undefined && request.Active != "") {
        where += " AND Active= ? ";
        where_array.push(request.Active);
    }
    if (request.Name != undefined && request.Name != "") {
        where += " AND Name= ? ";
        where_array.push(request.Name);
    }
    if (request.CommonData != undefined && request.CommonData != "") {
        where += " AND CommonData= ? ";
        where_array.push(request.CommonData);
    } if (request.PropertyDescription != undefined && request.PropertyDescription != "") {
        where += " AND PropertyDescription= ? ";
        where_array.push(request.PropertyDescription);
    } if (request.PaymentDescription != undefined && request.PaymentDescription != "") {
        where += " AND PaymentDescription= ? ";
        where_array.push(request.PaymentDescription);
    } if (request.RentyType != undefined && request.RentyType != "") {
        where += " AND RentyType= ? ";
        where_array.push(request.RentyType);
    } if (request.LandlordID != undefined && request.LandlordID != "") {
        where += " AND LandlordID= ? ";
        where_array.push(request.LandlordID);
    }
    if (request.FromDate && request.ToDate) {
        where += ' AND (date(RegisterDate) BETWEEN "' + request.FromDate + '" AND "' + request.ToDate + '")';
    }

    if (request.AllData == undefined || request.AllData == '') {
        limit = " LIMIT " + offset + ', ' + request.Limit;
    }
    let query = `select ProviderID,ParentName,Name,if(ProviderType>0,(select mp.ParameterValue from Mst_ParameterValue as mp where mp.ParameterValueID=ProviderType),'') as ProviderType ,ImageUrl,ProviderUrl,case IsCronType WHEN '1' THEN 'Unique Cron' WHEN '2' THEN 'Separate Cron' ELSE '' END as IsCronType,CronTime,case IsOffline WHEN 0 THEN 'Offline' WHEN 1 THEN 'Online' ELSE '' END as IsOffline,case FormType WHEN 0 THEN 'Form' WHEN 1 THEN 'Data' ELSE '' END as FormType,FilePath,Sun,Mon,Tue,Wed,Thu,Sat,Fri,CronTime,Active,AuthorizationKey,Username,Password,PageParaName,LimitParaName,ResParaName,ResCountParaName,Descrption,CommonData,PropertyDescription,PaymentDescription,RentyType,LandlordID,IsSturents from Accommodation_Provider WHERE 1 ` + where + ` order by ProviderID Desc ` + limit;
    async.waterfall([
        function (done) {
            //where += " "+GroupBy+" ) As totalCount"
            Service.JoinListCount(`Accommodation_Provider `, where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddAccProvider = async (req, res) => {
    console.log(req.body)
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.ProviderID > 0) {
        where_data = {
            'ProviderID': request.ProviderID,
        };
    }
    update_data['ParentName'] = request.ParentName;
    update_data['Name'] = request.Name;
    update_data['ProviderType'] = request.ProviderType;
    update_data['Sun'] = request.Sun;
    update_data['Mon'] = request.Mon;
    update_data['Tue'] = request.Tue;
    update_data['Wed'] = request.Wed;
    update_data['Thu'] = request.Thu;
    update_data['Fri'] = request.Fri;
    update_data['Sat'] = request.Sat;
    update_data['CronTime'] = request.CronTime;
    update_data['IsCronType'] = request.IsCronType;
    update_data['IsOffline'] = request.IsOffline;
    update_data['Active'] = request.Status;
    update_data['FormType'] = request.FormType;
    if (req.files.recfile) {
        if (Object.entries(req.files.recfile).length) {
            resimage = await upload.uploadFiles(req.files.recfile, 'Mst_Services');
        }
        if (Object.entries(req.files.recfile).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            update_data['ImageUrl'] = resimage[0];
        }
    }
    if (request.ProviderID == "" || request.ProviderID == undefined) {
        request.ProviderID = 0;
    }
    if (request.Description != undefined && request.Description != '') {
        update_data['Descrption'] = request.Description;
    }
    if (request.RegisterDate != undefined && request.RegisterDate != '') {
        update_data['RegisterDate'] = request.RegisterDate;
    }
    if (request.ProviderUrl != undefined && request.ProviderUrl != '') {
        update_data['ProviderUrl'] = request.ProviderUrl;
    }
    if (request.AuthorizationKey != undefined && request.AuthorizationKey != '') {
        update_data['AuthorizationKey'] = request.AuthorizationKey;
    }
    if (request.Username != undefined && request.Username != '') {
        update_data['Username'] = request.Username;
    }
    if (request.Password != undefined && request.Password != '') {
        update_data['Password'] = request.Password;
    }

    if (request.PageParaName != undefined && request.PageParaName != '') {
        update_data['PageParaName'] = request.PageParaName;
    }
    if (request.LimitParaName != undefined && request.LimitParaName != '') {
        update_data['LimitParaName'] = request.LimitParaName;
    }
    if (request.ResParaName != undefined && request.ResParaName != '') {
        update_data['ResParaName'] = request.ResParaName;
    }
    if (request.ResCountParaName != undefined && request.ResCountParaName != '') {
        update_data['ResCountParaName'] = request.ResCountParaName;
    }
    if (request.CommonData != undefined && request.CommonData != "") {
        update_data['CommonData'] = request.CommonData;
    } if (request.PropertyDescription != undefined && request.PropertyDescription != "") {
        update_data['PropertyDescription'] = request.PropertyDescription;
    } if (request.PaymentDescription != undefined && request.PaymentDescription != "") {
        update_data['PaymentDescription'] = request.PaymentDescription;
    } if (request.RentyType != undefined && request.RentyType != "") {
        update_data['RentyType'] = request.RentyType;
    } if (request.LandlordID != undefined && request.LandlordID != "") {
        update_data['LandlordID'] = request.LandlordID;
    }
    if (request.oldPhoto != "" || request.oldPhoto != undefined && request.ImageUrl == '') {
        update_data['ImageUrl'] = request.oldPhoto;
    }
    if (request.IsSturents != "" || request.IsSturents != undefined && request.ImageUrl == '') {
        update_data['IsSturents'] = request.IsSturents;
    }

    if (req.files.recfile2) {
        if (Object.entries(req.files.recfile2).length) {
            resimage = await upload.uploadFiles(req.files.recfile2, 'Mst_Services');
        }
        if (Object.entries(req.files.recfile2).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            update_data['FilePath'] = resimage[0];
        }
    }
    else {
        update_data['FilePath'] = '';
    }
    let fieldshow = 'CAST(ProviderID as CHAR) as ID';
    let RequestData = {
        'tableName': 'Accommodation_Provider',
        'IdName': 'ProviderID',
        'ID': request.ProviderID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeleteAccProvider = (req, res) => {
    Service.Delete('Accommodation_Provider', 'ProviderID', req.body.ProviderID, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": [] });
        }
    });
};

exports.InvoiceReport = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.ServiceID != undefined && request.ServiceID != "") {
        where += " AND invoice_report.ServiceID= ? ";
        where_array.push(request.ServiceID);
    }

    if (request.InquiryType != undefined && request.InquiryType != "") {
        where += " AND invoice_report.InquiryType= ? ";
        where_array.push(request.InquiryType);
    }

    if (request.InvoiceNo != undefined && request.InvoiceNo != "") {
        where += " AND InvoiceNo= ? ";
        where_array.push(request.InvoiceNo);
    }
    if (request.MailFromDate && request.MailToDate) {
        where += ' AND (date(MailSendDate) BETWEEN "' + request.MailFromDate + '" AND "' + request.MailToDate + '")';
    }
    if (request.PaymentFromDate && request.PaymentToDate) {
        where += ' AND (date(PaymentDate) BETWEEN "' + request.PaymentFromDate + '" AND "' + request.PaymentToDate + '")';
    }

    if (request.AllData == undefined || request.AllData == '') {
        limit = " LIMIT " + offset + ', ' + request.Limit;
    }

    if (request.PaidStatus == "1") {
        where += ' AND invoice_report.PayStatus="1" ';
    }
    if (request.PaidStatus == "0") {
        where += ' AND invoice_report.PayStatus!="1" ';
    }
    // let Squery = `(SELECT InquiryID as ID,InquiryNo as BookingNo,s.Name,si.StudentID,ChannelPartnerID,FirstName,MiddleName,LastName,ReceiptUrl,TotalAmount,InvoiceNo,IsMailSend,MailSendDate,PaymentDate
    //     FROM Student_Inquiry as si join Mst_Services as s on si.ServiceID=s.ServiceID
    //     UNION
    //     SELECT BookingID as ID,BookingNo,'8' as ServiceID,abr.StudentID,
    //     '' as ChannelPartnerID,st.FirstName,st.MiddleName,st.LastName,
    //     ReceiptUrl,PayAmount as TotalAmount,InvoiceNo,IsMailSend,MailSendDate,PaymentDate
    //     FROM Accommodation_BookingRequest as abr left join Student as st on st.StudentID=abr.StudentID)`;

    let Squery = `(SELECT InvoiceNo,'Inquiry' as InquiryType,s.Name as Service,InquiryNo as BookingNo, CONCAT(FirstName, " ", LastName) as Name,MiddleName,InquiryID as ID,s.ServiceID,si.StudentID,ChannelPartnerID,
       ReceiptUrl,TotalAmount,PaymentDate,IsMailSend,MailSendDate,si.PayAmount,si.PayStatus,si.InvoiceUrl
        FROM Student_Inquiry as si join Mst_Services as s on si.ServiceID=s.ServiceID
        UNION
        SELECT InvoiceNo,'Booking' as InquiryType,(select Name from Mst_Services where ServiceID=8) as Service,BookingNo,CONCAT(st.FirstName, " ", st.LastName) as Name,st.MiddleName,BookingID as ID,'8' as ServiceID,
        abr.StudentID,'' as ChannelPartnerID,ReceiptUrl,PayAmount as TotalAmount,PaymentDate,IsMailSend,MailSendDate
        ,abr.PayAmount,abr.PayStatus,abr.InvoiceUrl
        FROM Accommodation_BookingRequest as abr left join Student as st on st.StudentID=abr.StudentID)`;

    let query = `select invoice_report.* from ` + Squery + ` as invoice_report where 1 And invoice_report.IsMailSend=1 ` + where
    let Countquery = `select count(*) as total from(` + query + `) as Total`;
    query += `Order by invoice_report.MailSendDate desc` + limit;
    async.waterfall([
        function (done) {
            Service.UniunJoinListCount(Countquery, where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};
exports.GetServiceList = async (req, res) => {
    let request = req.body;
    var data = {};
    let where_array = [];
    let query = "select ServiceID, Name from Mst_Services";
    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            // console.log(data2);
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.SearchStudent = (req, res) => {
    Channel.SearchStudent(req.body, (err, summary_data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully."), "Data": summary_data });
        }
    });
}
exports.UpdateChannelPartner = async (req, res) => {
    Service.UpdateChannelPartner(req, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
}
exports.LinkPropertyList = (req, res) => {
    let where_array = {}
    let data = {}
    let where = ''
    if (req.body.InquiryID != undefined || req.body.InquiryID != '') {
        where = " AND si.InquiryID=" + req.body.InquiryID + " And si.AccommodationID>0"
    }
    let query = "SELECT si.InquiryID, acc.AltAccommodationName as AccommodationName,acrc.RoomCategory,si.StartDate,si.EndDate,si.TotalAmount,si.NoOfDays  from Student_Inquiry as si LEFT JOIN Accommodation as acc on si.AccommodationID=acc.AccommodationID LEFT JOIN Accommodation_RoomCategory as acrc on acrc.AccRoomCategoryID=si.AccRoomCategoryID where 1 " + where;

    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.StudentList2 = async (req, res) => {
    console.log(req.body)
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);
    if (req.body.name != undefined && req.body.name != null && req.body.name != '') {
        where += ' AND (std.FirstName LIKE "%' + req.body.name + '%" OR  std.LastName LIKE "%' + req.body.name + '%" OR CONCAT(std.FirstName ," ",std.LastName) like "%' + req.body.name + '%")';
    }

    if (req.body.Search != undefined && req.body.Search != null && req.body.Search != '') {
        where += ' AND (std.FirstName LIKE "%' + req.body.Search + '%" OR  std.LastName LIKE "%' + req.body.Search + '%" OR CONCAT(std.FirstName ," ",std.LastName) like "%' + req.body.Search + '%" OR std.Email = "' + req.body.Search + '" OR REPLACE(std.PhoneNo," ","") LIKE "%' + req.body.Search.replace(" ", "") + '%" OR std.StudentCode = "' + req.body.Search + '" )';
    }

    if (req.body.email != undefined && req.body.email != null && req.body.email != '') {
        where += ' AND std.Email = "' + req.body.email + '"';
    }

    if (req.body.PhoneNo != undefined && req.body.PhoneNo != null && req.body.PhoneNo != '') {
        where += ' AND  REPLACE(std.PhoneNo," ","") LIKE "%' + req.body.PhoneNo.replace(" ", "") + '%"';
    }

    if (req.body.StudentCode != undefined && req.body.StudentCode != null && req.body.StudentCode != '') {
        where += ' AND std.StudentCode = "' + req.body.StudentCode + '"';
    }

    if (req.body.Active != undefined && req.body.Active != null && req.body.Active != '') {
        where += ' AND std.Active = "' + req.body.Active + '"';
    }

    if (req.body.stdStatus != undefined && req.body.stdStatus != null && req.body.stdStatus != '') {
        where += ' AND std.Status = "' + req.body.stdStatus + '"';
    }

    if (req.body.EntryDate != undefined && req.body.EntryDate != null && req.body.EntryDate != '') {
        where += ' AND std.EntryDate BETWEEN "' + req.body.EntryDate + ' 00:00:00" AND "' + req.body.EntryDate + ' 23:59:00"';
    }
    // if (req.body.EntryDate != undefined && req.body.EntryDate != null && req.body.EntryDate != '' && req.body.ListType=='') {
    //     where += ' AND std.EntryDate BETWEEN "' + req.body.EntryDate + ' 00:00:00" AND "' + req.body.EntryDate + ' 23:59:00"';
    // }

    if (req.body.StartDate != undefined && req.body.StartDate != null && req.body.StartDate != '') {
        where += ' AND std.EntryDate BETWEEN "' + req.body.StartDate + ' 00:00:00" AND "' + req.body.EndDate + ' 23:59:00"';
    }

    if (req.body.ChannelPartnerID != undefined && req.body.ChannelPartnerID != null && req.body.ChannelPartnerID != '') {
        where += ' AND std.ChannelPartnerID = "' + req.body.ChannelPartnerID + '"';
    }

    if (req.body.RoleID != undefined && req.body.RoleID != null && req.body.RoleID == '2') {
        where += ' AND std.ChannelPartnerID = "' + req.body.UserId + '"';
    }

    if (req.body.CountryID != undefined && req.body.CountryID != null && req.body.CountryID != '') {
        where += ' AND std.CountryID = "' + req.body.CountryID + '"';
    }

    if (req.body.CityID != undefined && req.body.CityID != null && req.body.CityID != '') {
        where += ' AND std.CityID = "' + req.body.CityID + '"';
    }

    if (req.body.StateId != undefined && req.body.StateId != null && req.body.StateId != '') {
        where += ' AND std.StateID = "' + req.body.StateId + '"';
    }
    if (req.body.StudentID != undefined && req.body.StudentID != null && req.body.StudentID != '') {
        where += ' AND std.StudentID in(' + req.body.StudentID + ')';
    }
    if (req.body.IsVerified != undefined && req.body.IsVerified != null && req.body.IsVerified != '') {
        where += ' AND (std.IsStudentVerify=' + req.body.IsVerified + " OR std.Active=" + req.body.IsVerified + ")";
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }
    var SetLimit = '';
    if (req.body.ListType == '3') {
        SetLimit = "LIMIT 10";
    }
    let query = `SELECT std.StudentID, std.FirstName, std.LastName, std.Email, std.Photo, std.PhoneNo_CountryCode, std.PhoneNo, std.StudentCode, std.ChannelPartnerID, IF(std.IsApprove!=1,'Email Unverified','Email Verified') as IsApprove , IF(std.Active!=1,'Inactive','Active') as Active,std.IsVisitAbord,std.RequestSource,IF(std.IsStudentVerify=1,'Document Verified','Document Unverified') as IsStudentVerify,pv.ParameterValue as Status, \
    mc.CountryName,ms.StateName,mct.CityName,std.File,DATE(std.EntryDate) as EntryDate,Address FROM Student as std LEFT JOIN Mst_ParameterValue as pv on pv.ParameterValueID=std.Status \
    left join Mst_Country as mc on mc.CountryID = std.CountryID \
    left join Mst_State as ms on ms.StateID = std.StateID \
    left join Mst_City as mct on mct.CityID = std.CityID where 1 `+ where;

    let Countquery = `select count(*) as total from(` + query + SetLimit + `) as Total`;
    query += ` ORDER BY std.StudentID DESC ` + limit;
    async.waterfall([
        function (done) {
            Service.UniunJoinListCount(Countquery, where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};
exports.HtmlToPdf = (req, res) => {
    let request = req.body;
    let htmldata = ''
    var options = { format: 'Letter' };
    if (request.htmlbind != undefined && request.htmlbind != "") {
        htmldata = request.htmlbind
    }
    // pdf.create(htmldata, options).buffer
    pdf.create(htmldata, options).toBuffer(function (err, buffer) {
        res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": buffer.toString('base64') });
        // console.log( );
    });
}
exports.AddVideo = (req, res) => {
    // console.log("HEllo")
    Service.AddVideo(req, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
}
exports.UpdateChannelPartnerData = async (req, res) => {
    Service.UpdateChannelPartnerData(req, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
}

exports.Mst_WalletList = (req, res) => {
    let data = {
        ...req.body,
        isAll: req.query.all && req.query.all == "true" ? true : false
    }

    Service.Mst_WalletList(data, (err, data) => {
        if (err)
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": data })
        else
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "success"), "Data": data });
    });
}

exports.Mst_OrderList = (req, res) => {
    let data = {
        ...req.body,
        isAll: req.query.all && req.query.all == "true" ? true : false
    }

    Service.Mst_OrderList(data, (err, data) => {
        if (err)
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": data })
        else
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "success"), "Data": data });
    });
}

exports.Mst_LedgerList = (req, res) => {
    let data = {
        ...req.body,
        isAll: req.query.all && req.query.all == "true" ? true : false
    }
    Service.Mst_LedgerList(data, (err, data) => {
        if (err)
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": data })
        else
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "success"), "Data": data });
    });
}

exports.withdrawrequest = async (req, res) => {
    // console.log(req.body)
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.Name != undefined && request.Name != "") {
        where += " AND UserID= ? ";
        where_array.push(request.Name);
    }
    if (request.LedgerID != undefined && parseInt(request.LedgerID) != 0) {
        where += " AND UserID= ? ";
        where_array.push(request.CpUserID);
    }
    if (request.Status != undefined && request.Status != "" && request.Status != 0) {
        where += " AND Status= ? ";
        where_array.push(request.Status);
    }

    if (request.FromDate && request.ToDate) {
        where += ' AND (date(WWR.EntryDate) BETWEEN "' + request.FromDate + '" AND "' + request.ToDate + '")';
    }

    if (request.AprFromDate && request.AprToDate) {
        where += ' AND (date(WWR.ApproveDate) BETWEEN "' + request.AprFromDate + '" AND "' + request.AprToDate + '")';
    }

    if (request.BankName != undefined && request.BankName != "") {
        where += " AND BankName like ? ";
        where_array.push("%" + request.BankName + "%");
    }

    if (request.AccountNo != undefined && request.AccountNo != "") {
        where += " AND AccountNo like ? ";
        where_array.push("%" + request.AccountNo + "%");
    }

    if (request.UserType != undefined && request.UserType != "") {
        where += " AND UserType like ? ";
        where_array.push("%" + request.UserType + "%");
    }

    if (request.AccountName != undefined && request.AccountName != "") {
        where += " AND WWR.AccountName like ? ";
        where_array.push("%" + request.AccountName + "%");
    }

    if (request.OrderID != undefined && request.OrderID != '') {
        where += ' AND WWR.OrderID = ?';
        where_array.push(request.OrderID);
    }

    if (request.AllData == undefined || request.AllData == '') {
        limit = " LIMIT " + offset + ', ' + request.Limit;
    }

    // case Status WHEN 1 THEN 'Pending' WHEN 2 THEN 'Success' WHEN 3 THEN 'Reject' END as Status
    let query = `select WithdrawID,CONCAT(cp.FirstName ," ",cp.LastName) as Name,OrderID,UserType,WWR.Status, Amount,WWR.EntryDate,TxnID,ApproveDate,cp.FirstName as ApproveBy,BankName,IFSCCode,MicroNo,AccountNo,WWR.AccountName,cp.LedgerID FROM Wallet_WithDrawRequest as WWR LEFT JOIN ChannelPartner as cp on cp.ChannelPartnerID=WWR.UserID WHERE 1 ` + where + ` order by WithdrawID desc `;
    async.waterfall([
        function (done) {
            Service.AllListCount('Wallet_WithDrawRequest as WWR LEFT JOIN ChannelPartner as cp on cp.ChannelPartnerID=WWR.UserID ', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['page_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.WithdrawStatusUpdate = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    // console.log(request)
    Service.WithdrawStatusUpdate(request, async (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            if (request.Status == 3 && request.Status != undefined) {

            }
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.GetChannelPatnerDetail = async (req, res) => {
    // await Commom.BalanceCalculation('103');
    // await sqlhelper.update('ChannelPartner', { 'Balance': await Commom.BalanceCalculation('103') }, { 'LedgerID': '103' }, (err, res) => {
    //     if (err) console.log(err);
    //     else console.log("ChannelPartner Update For Balance");
    // });
    let where_array = {}
    let data = {}
    let where = " AND cp.ChannelPartnerID='" + req.body.ChannelPartnerID + "' AND cp.Active=1";
    
    let query = "SELECT cp.CountryID,cp.RegisterCityName,cp.RegisterCountryName,cp.RegisterStateName,cp.RegistrationNo,cp.StateID,cp.CityID,cp.ChannelPartnerID,cp.PersonalPhoto,cp.AgreementProof,cp.BasicInfoStatus,cp.AdditionalDocStatus,cp.AdditionalInfoStatus,  cp.FirstName,cp.RegisterOfficeAddress, cp.LastName, cp.CompanyName, IF(cp.CompanyLogo!='', cp.CompanyLogo, '') AS CompanyLogo, cp.Active, cp.PersonalEmail, TRIM(cp.ContactPhoneNo_CountyCode) AS ContactPhoneNo_CountyCode, cp.ContactPhoneNo,cp.YearOfFoundation,cp.Whatsapp,cp.Instagram,cp.Facebook,cp.Skype,cp.RegisterOfficeAddress,cp.CorrespondenceAddress,cp.PostCode,cp.CompanyDescription, \
    IFNULL((SELECT DATE_FORMAT(log.LoginDate, '%Y-%m-%d %H:%i:%s') FROM HST_Login AS log WHERE log.UserID=cp.ChannelPartnerID AND log.UserType=2  LIMIT 1), '') AS LoginDate, \
    cp.SubDomainName,cp.AddressProof,cp.IdentityProof,cp.AdditionalDocuments,cp.AdditionalInformation,cp.Whatsapp_CountyCode FROM ChannelPartner AS cp WHERE 1 "+ where + " ";

    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2[0];
            data['Cpslug'] = process.env.STUDENT_PANEL_LINK + "partner/" + data2[0].CompanyName.replace(/\s/g, '');
            if(data2[0].SubDomainName){
                data['Cpslug'] = `https://${data2[0].SubDomainName}.ocxee.com`;
            }
            let Message = `Your profile is incomplete, please|to complete your profile.`;
            // let Message = "Your profile is incomplete; please complete your profile. You can click here to access your profile.";
            if (data2[0].BasicInfoStatus == '1' && data2[0].AdditionalDocStatus == '1') { Message = ""; }
            data['ProfileMessage'] = Message;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.CpProfilePic = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    request.file = req.files;
    Service.CpProfilePic(request, async (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.studentEntry = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    Service.studentEntry(request, async (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": [] });
        }
    });
};

exports.CpProfileUpdate = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let reqs = req.body;
    let request = JSON.parse(reqs.FormGroups);
    request.file = req.files;
    let EntryData = {
        "FirstName": request.FirstName,
        "LastName": request.LastName,
        "ContactPhoneNo": request.ContactPhoneNo,
        "CompanyName": request.CompanyName,
        "YearOfFoundation": request.YearOfFoundation,
        "Whatsapp": request.Whatsapp,
        "Instagram": request.Instagram,
        "Facebook": request.Facebook,
        "Skype": request.Skype,
        "RegisterOfficeAddress": request.RegisterOfficeAddress,
        "CompanyDescription": request.CompanyDescription,
        "OfficePhoneNo_CountyCode": request.OfficePhoneNo_CountyCode,
        "OfficePhoneNo": request.OfficePhoneNo,
        "GeneralEmail": request.GeneralEmail,
        "CPCRMEmail": request.CPCRMEmail,
        "WebsiteURL": request.WebsiteURL,
        "GSTIN": request.GSTIN,
        "PanNo": request.PanNo,
        "AccountName": request.AccountName,
        "AccountEmail": request.AccountEmail,
        "AccountPhoneNo": request.AccountPhoneNo,
        "AuthorizedName": request.AuthorizedName,
        "AuthorizedEmail": request.AuthorizedEmail,
        "AuthorizedDesignation": request.AuthorizedDesignation,
        "AuthorizedPhoneNo_CountryCode": request.AuthorizedPhoneNo_CountryCode,
        "AuthorizedPhoneNo": request.AuthorizedPhoneNo,
        "BasicInfoStatus": "1",
        "CityID": request.CityID,
        "CorrespondenceAddress": request.CorrespondenceAddress,
        "CountryID": request.CountryID,
        "PostCode": request.PostCode,
        "StateID": request.StateID,
        "RegisterCountryName": request.RegisterCountryName,
        "RegisterStateName": request.RegisterStateName,
        "RegisterCityName": request.RegisterCityName,
        "RegistrationNo": request.RegistrationNo,
        "ContactPhoneNo_CountyCode": request.CountryCode,
        "Whatsapp_CountyCode": request.Whatsapp_CountyCode
    }
    EntryData['CompanyLogo'] = reqs.OldCompanyLogo;
    if (request.file.recfile) {
        if (Object.entries(request.file.recfile).length) {
            resimage = await upload.uploadFiles(request.file.recfile, 'ChannelPartner/Document');
        }
        if (Object.entries(request.file.recfile).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            EntryData['CompanyLogo'] = resimage[0];
        }
    }
    Service.CpProfileUpdate(request, EntryData, async (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Basic Information Added Successfully", data.Status), "Data": data.data });
        }
    });
};

exports.CpDocUpdate = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    // console.log(req.files);
    request.file = req.files;
    let EntryData = {};
    let status = '';
    let MessageData = "Document Uploaded Successfully"
    if (request.IsDeleteOldAddress) {
        EntryData['AddressProof'] = "";
        await upload.S3FileDelete(request.IsDeleteOldAddress);
        status = '0';
        MessageData = "Document removed Successfully"
    }
    if (request.IsDeleteOldIdentity) {
        EntryData['IdentityProof'] = "";
        await upload.S3FileDelete(request.IsDeleteOldIdentity);
        status = '0';
        MessageData = "Document removed Successfully"
    }
    if (request.IsDeleteOldAgreement) {
        EntryData['AgreementProof'] = "";
        await upload.S3FileDelete(request.IsDeleteOldAgreement);
        status = '0';
        MessageData = "Document removed Successfully"
    }
    if (request.IsDeleteOldAdditionalDoc) {
        EntryData['AdditionalDocuments'] = "";
        await upload.S3FileDelete(request.IsDeleteOldAdditionalDoc);
        status = '0';
        MessageData = "Document removed Successfully"
    }

    if (request.file.recfile) {
        if (Object.entries(request.file.recfile).length) {
            resimage = await upload.uploadFiles(request.file.recfile, 'ChannelPartner/Document');
        }
        if (Object.entries(request.file.recfile).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            EntryData['AddressProof'] = {
                "Status": "0",
                "Image": resimage[0]
            };
            EntryData['AddressProof'] = JSON.stringify(EntryData['AddressProof']);
        }
        status = '0';
    }

    if (request.file.recfile2) {
        if (Object.entries(request.file.recfile2).length) {
            resimage = await upload.uploadFiles(request.file.recfile2, 'ChannelPartner/Document');
        }
        if (Object.entries(request.file.recfile2).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            EntryData['IdentityProof'] = {
                "Status": "0",
                "Image": resimage[0]
            };
            EntryData['IdentityProof'] = JSON.stringify(EntryData['IdentityProof']);
        }
        status = '0';
    }

    if (request.file.file) {
        if (Object.entries(request.file.file).length) {
            resimage = await upload.uploadFiles(request.file.file, 'ChannelPartner/Document');
        }
        if (Object.entries(request.file.file).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            EntryData['AgreementProof'] = {
                "Status": "0",
                "Image": resimage[0]
            };
            EntryData['AgreementProof'] = JSON.stringify(EntryData['AgreementProof']);
        }
        status = '0';
    }

    if (request.file['recfile3[]']) {
        EntryData['AdditionalDocuments'] = { "Status": "0" };
        EntryData['AdditionalDocuments']['Image'] = [];
        await Promise.all(request.file['recfile3[]'].map(async file => {
            // console.log(file);
            if (file) {
                resimage = await upload.uploadFiles([file], 'ChannelPartner/Document');
            }
            if (file) {
                let filearray = resimage[0].split("/");
                let filename = filearray[filearray.length - 1];
                EntryData['AdditionalDocuments']['Image'].push(resimage[0]);
            }
        }));
        // console.log(JSON.parse(request.OldAdditionalDoc));
        if (request.OldAdditionalDoc) EntryData['AdditionalDocuments']['Image'] = EntryData['AdditionalDocuments']['Image'].concat(JSON.parse(request.OldAdditionalDoc));
        EntryData['AdditionalDocuments'] = JSON.stringify(EntryData['AdditionalDocuments']);
        status = '0';
    } else {
        MessageData = "Document removed Successfully"
        EntryData['AdditionalDocuments'] = request.OldAdditionalDoc;
    }

    if (status) EntryData['AdditionalDocStatus'] = status;

    Service.CpProfileUpdate(request, EntryData, async (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, MessageData, data.Status), "Data": data.data });
        }
    });
};

exports.CpInfoUpdate = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let EntryData = {};
    EntryData['AdditionalInformation'] = request.AdditionalInfo;
    EntryData['AdditionalInfoStatus'] = '1';
    Service.CpProfileUpdate(request, EntryData, async (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Additional Information Added  Successfully", data.Status), "Data": data.data });
        }
    });
};

exports.RedirectProperty = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let value = req.body;
    let AccSlug = await Commom.GenerateAccSlug(value.AccommodationName, value.CountryName, value.StateName, value.CityName, value.UniqueID);
    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "", "1"), "Data": AccSlug });
}
exports.UpdateCPDocStatus = async (req, res) => {
    Service.UpdateCPDocStatus(req, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
}

exports.GetOrderType = (req, res) => {
    let where_array = {}
    let data = {}
    let where = ''
    let query = "SELECT Transction_Type_ID as ID,Title as Name FROM Mst_Transaction where 1 " + where;
    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.GetUniversityKeword = (req, res) => {
    let request = req.body;
    let data = {};
    let query = `SELECT UniversityName as name from Mst_University where UniversityName like '%` + request.keryword.trim() + `%' limit 50`;
    // console.log(query);
    Service.AllList(query, [], (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};

exports.FinalBalanceCalculation = async (req, res) => {
    let LedgerID = await Commom.GetLedgerID(req.body.ChannelPartnerID);
    await Commom.BalanceCalculation(LedgerID);
    await sqlhelper.update('ChannelPartner', { 'Balance': await Commom.BalanceCalculation(LedgerID) }, { 'LedgerID': LedgerID }, (err, res) => {
        if (err) console.log(err);
        else console.log("ChannelPartner Updated For Balance");
    });
    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": "" });
};

exports.AccCommission = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.FromWeek != undefined && request.FromWeek != "") {
        where += ' AND ac.FromWeek=? ';
        where_array.push(request.FromWeek);
    }
    if (request.CommissionID != undefined && request.CommissionID != "") {
        where += ' AND ac.CommissionID=? ';
        where_array.push(request.CommissionID);
    }
    if (request.ToWeek != undefined && request.ToWeek != '') {
        where += ' AND ac.ToWeek like ?';
        where_array.push('%' + request.ToWeek + '%');
    }
    if (request.Charge != undefined && request.Charge != '') {
        where += ' AND ac.Charge like ?';
        where_array.push('%' + request.Charge + '%');
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }

    if (request.Status != undefined && request.Status != "") {
        where += ' AND ac.Active=? ';
        where_array.push(request.Status);
    }

    let query = `SELECT CAST(ac.CommissionID as CHAR) as CommissionID,FromWeek,ToWeek,Charge,Active, (select mu2.UserName from Mst_User as mu2 where mu2.UserID = ac.EntryBy) as EntryBy, DATE_FORMAT(ac.EntryDate,'%d %b %Y') as EntryDate, (select mu2.UserName from Mst_User as mu2 where mu2.UserID = ac.UpdateBy) as UpdateBy, DATE_FORMAT(ac.UpdateDate,'%d %b %Y') as UpdateDate from Accommodation_commission as ac WHERE 1 ` + where + ` ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Accommodation_commission as ac', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.AddAccCommission = async (req, res) => {
    console.log(req.body)
    // req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.CommissionID > 0) {
        where_data = {
            'CommissionID': request.CommissionID,
        };
    }
    update_data['FromWeek'] = request.FromWeek;
    update_data['ToWeek'] = request.ToWeek;
    update_data['Charge'] = request.Charge;
    if (request.Status != undefined && request.Status != 'null') {
        update_data['Active'] = request.Status;
    }

    let fieldshow = 'CAST(CommissionID as CHAR) as CommissionID';
    let RequestData = {
        'tableName': 'Accommodation_commission',
        'IdName': 'CommissionID',
        'ID': request.CommissionID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            console.log(err)
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeleteAccCommission = (req, res) => {
    let deleteId = req.body.CommissionID;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Accommodation_commission', 'CommissionID', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
};

exports.BookingCpMaping = async (req, res) => {
    Service.BookingCpMaping(req, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
}
exports.AddNearBySearchData = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    Service.AddNearBySearchData(request, async (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": [] });
        }
    });
}
exports.GetNearBySearchData = async (req, res) => {
    let request = req.body;
    let data = {};
    let query = `SELECT NearBySearchID,Type,CountryID,	CityID,	Title,Url,Sequence,Active from Mst_NearBySearch where AccSeoID =` + request.AccSeoID.trim();
    // console.log(query);
    Service.AllList(query, [], (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data fatched successfully.", '1'), "Data": data });
        }
    });
}
exports.RemoveNearBySearchData = async (req, res) => {
    let deleteId = req.body.NearBySearchID;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Mst_NearBySearch', 'NearBySearchID', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
}
exports.UpdateNearBySearchData = async (req, res) => {

    let request = req.body;
    // console.log(request)
    Service.UpdateNearBySearchData(request, async (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
}

exports.AccommodationChartView = (req, res) => {
    Service.AccommodationChartView(req.body, (err, data) => {
        if (err)
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": data })
        else
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "success"), "Data": data });
    });
};
exports.GetAccViewInDetail = (req, res) => {
    Service.GetAccViewInDetail(req.body, (err, data) => {
        if (err)
            console.log(err)
        // res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": data })
        else
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "success"), "Data": data });
    });
};
exports.SearchStuds = (req, res) => {
    Service.SearchStuds(req.body, (err, summary_data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully."), "Data": summary_data });
        }
    });
}
exports.GetMarketPlaceDetailView = async (req, res) => {
    let request = req.body
    request.PageNo = (request.PageNo > 0 ? request.PageNo : '1');
    let where = '';
    let limit = '';
    let where_array = [];
    var data = {};
    let offset = (request.PageNo * request.Limit - request.Limit);
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }
    if (request.StartDate != undefined && request.StartDate != "") {
        where += ' AND date(mn.EntryDate)>=? ';
        where_array.push(request.StartDate);
    }
    if (request.FromDate != undefined && request.FromDate != '' && request.ToDate != undefined && request.ToDate != '') {
        where = ` And AM.ViewDate >= '` + request.FromDate + ` 00:00:00' AND  AM.ViewDate<='` + request.ToDate + ` 23:59:59'`
    }
    if (request.FromDate != undefined && request.FromDate != '' && (request.ToDate == undefined || request.ToDate == '')) {
        where = ` And AM.ViewDate >= '` + request.FromDate + ` 00:00:00'`
    }
    if ((request.FromDate == undefined || request.FromDate == '') && request.ToDate != undefined && request.ToDate != '') {
        where = ` And AM.ViewDate<='` + request.ToDate + ` 23:59:59'`
    }
    if (request.ProviderID != undefined && request.ProviderID != '') {
        where += ` And acp.ProviderID=?`
        where_array.push(request.ProviderID);
    }
    if (request.StudentID != undefined && request.StudentID != 0) {
        where += ` And st.StudentID=?`
        where_array.push(request.StudentID);
    }
    let query = "SELECT acc.AccommodationName as Name,acc.PropertyLink,acc.AccommodationID,acp.Name as Pname,IF(AM.StudentID = 0,'Guest', concat(st.FirstName,' ',st.LastName)) as UserName,AM.StudentID,AM.ViewDate FROM Acc_MarketPlaceView as AM LEFT JOIN Accommodation as acc on acc.AccommodationID=AM.AccommodationID LEFT JOIN Accommodation_Provider as acp on acp.ProviderID=acc.ProviderID left JOIN Student as st on st.StudentID=AM.StudentID WHERE 1 " + where + " AND acc.Active=1 order by AM.ViewDate DESC " + limit;
    console.log(query)
    async.waterfall([
        function (done) {
            Service.AllListCount('Acc_MarketPlaceView as AM LEFT JOIN Accommodation as acc on acc.AccommodationID=AM.AccommodationID LEFT JOIN Accommodation_Provider as acp on acp.ProviderID=acc.ProviderID left JOIN Student as st on st.StudentID=AM.StudentID ', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['page_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
}

exports.GenerateMarketplaceviewExcel = async (req, res) => {
    let request = req.body
    request.PageNo = (request.PageNo > 0 ? request.PageNo : '1');
    let where = '';
    let limit = '';
    let where_array = [];
    var data = {};
    let offset = (request.PageNo * request.Limit - request.Limit);
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }
    if (request.StartDate != undefined && request.StartDate != "") {
        where += ' AND date(mn.EntryDate)>=? ';
        where_array.push(request.StartDate);
    }
    if (request.FromDate != undefined && request.FromDate != '' && request.ToDate != undefined && request.ToDate != '') {
        where = ` And AM.ViewDate >= '` + request.FromDate + ` 00:00:00' AND  AM.ViewDate<='` + request.ToDate + ` 23:59:59'`
    }
    if (request.FromDate != undefined && request.FromDate != '' && (request.ToDate == undefined || request.ToDate == '')) {
        where = ` And AM.FromDate >= '` + request.StartDate + ` 00:00:00'`
    }
    if ((request.FromDate == undefined || request.FromDate == '') && request.ToDate != undefined && request.ToDate != '') {
        where = ` And AM.ViewDate<='` + request.ToDate + ` 23:59:59'`
    }
    if (request.ProviderID != undefined && request.ProviderID != '') {
        where += ` And acp.ProviderID=?`
        where_array.push(request.ProviderID);
    }
    if (request.StudentID != undefined && request.StudentID != 0) {
        where += ` And st.StudentID=?`
        where_array.push(request.StudentID);
    }
    let query = "SELECT acp.Name as PoviderName,IF(AM.StudentID = 0,'Guest', concat(st.FirstName,' ',st.LastName)) as StudentName,acc.AccommodationName as PropertyName,acc.PropertyLink as ProviderUrl,AM.ViewDate FROM Acc_MarketPlaceView as AM LEFT JOIN Accommodation as acc on acc.AccommodationID=AM.AccommodationID LEFT JOIN Accommodation_Provider as acp on acp.ProviderID=acc.ProviderID left JOIN Student as st on st.StudentID=AM.StudentID WHERE 1 " + where + " AND acc.Active=1 order by AM.ViewDate DESC ";
    // let query = `select FirstName,MiddleName,LastName,Email,PhoneNo_CountryCode,PhoneNo,WhatsappNo_CountryCode,WhatsappNo,CitizenShip,FirstLanguage,Skype,DATE_FORMAT(DateOfBirth,'%d %b %Y') as DateOfBirth,PlaceOfBirth,Gender,MaterialStatus,PassportNo,DATE_FORMAT(PassortIssueDate,'%d %b %Y') as PassortIssueDate,DATE_FORMAT(PassportExpiryDate,'%d %b %Y') as PassportExpiryDate,PassportIssueBy,PassportFile from Student as std where 1 ` + where + ` ORDER BY std.StudentID DESC`;
    Service.GenerateExcel(query, where_array, 'MarketplaceViewReport', async (err, data2) => {
        if (err) {
            console.log(err)
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['JsonData'] = data2.data;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data2.message, data2.status), "Data": data });
        }
    });
}
exports.CheckSubdomain = async (req, res) => {
    let Data = {
        'Apistatus': '0',
        'message': 'This domain already exists on the platform; try a different one.'
    };
    let emailid_query = "SELECT SubDomainName FROM ChannelPartner WHERE SubDomainName=? LIMIT 1";
    let emailid_exits = await sqlhelper.select(emailid_query, [req.body.SubDomainName], (err, res) => {
        if (err) {
            return 0;
        } else if (res.length > 0) {
            return 0;
        } else {
            Data['Apistatus'] = '1';
            Data['message'] = 'Domain name is available';
            return 1;
        }
    });
    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, Data.message, Data.Apistatus), "Data": Data });
};

exports.SubDomainClone = async (req, res) => {
    // let BlogJsonData = await Commom.ReadFileData("./ChannelPartner_domain_list.xlsx");
    let update_data = {};
    var workbook = xlsx.readFile("./ChannelPartner_domain_list.xlsx");
    var sheet_name_list = workbook.SheetNames;
    let Data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    let AllData = [];
    for (const [key, value] of Object.entries(Data)) {
        if (value.PersonalEmail != "") {
            update_data['SubDomainName'] = value.SubDomainName.replace('.ocxee.com', '').replace('.com', '');
            // let status = await Commom.CreateSubDomain(update_data['SubDomainName']);
            // console.log(status);
            // if(update_data){
            //     await sqlhelper.update('ChannelPartner', update_data,{
            //         PersonalEmail: value.PersonalEmail
            //     }, (err, res) => {
            //         if (err) {
            //             console.log(err);
            //             return 0;
            //         } else {
            //             AllData.push({"DomainStatus":status,
            //         "UpDateData":update_data});
            //             console.log('New PersonalEmail Upload ID No ===> '+value.PersonalEmail);
            //             return res.affectedRows;
            //         }
            //     });
            // }
        }
    }
    res.send({ update_data: AllData });
}

exports.AddFAQDescription = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.AccSeoID > 0) {
        where_data = {
            'AccSeoID': request.AccSeoID,
        };
    }

    let fieldshow = 'AccSeoID,QueAndAns';
    let RequestData = {
        'tableName': 'Accommodation_FAQ_Content',
        'IdName': 'AccSeoID',
        'ID': request.AccSeoID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    let object = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": []
    }
    console.log(request.FAQFormArray)
    for (const [key, value] of Object.entries(request.FAQFormArray)) {
        let tempobje = {
            "@type": "Question",
            "name": value.Question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": value.Answer
            }
        }
        object.mainEntity.push(tempobje)
    }
    console.log(object)
    update_data['QueAndAns'] = JSON.stringify(object);
    update_data['AccSeoID'] = request.AccSeoID;
    Service.AddFAQDescription(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};
exports.GetFAQDescription = (req, res) => {
    let query = "select QueAndAns from Accommodation_FAQ_Content where AccSeoID=" + req.body.AccSeoID
    Service.AllList(query, [], async (err, data2) => {
        if (err) {
            console.log(err);
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, '', 1), "Data": data2 });
        }
    });
}
exports.RemoveFAQDescription = async (req, res) => {
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.AccSeoID > 0) {
        where_data = {
            'AccSeoID': request.AccSeoID,
        };
    }
    let query = "select QueAndAns from Accommodation_FAQ_Content where AccSeoID=" + req.body.AccSeoID
    let data
    await Service.AllList(query, [], async (err, data2) => {
        if (err) {
            console.log(err);
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            data = data2[0];
        }
    });
    let QueAndAns = JSON.parse(data['QueAndAns'])
    console.log(QueAndAns)
    let mainEntity = QueAndAns['mainEntity'];
    mainEntity.splice(req.body.index, 1)
    console.log(mainEntity)
    let object = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": []
    }
    if (mainEntity.length > 0) {
        mainEntity.forEach(element => {
            object.mainEntity.push(element)
        });
        console.log("mainEntity1")
    } else {
        object = ''
    }
    update_data['QueAndAns'] = JSON.stringify(object);
    update_data['AccSeoID'] = request.AccSeoID;
    let fieldshow = 'AccSeoID,QueAndAns';
    let RequestData = {
        'tableName': 'Accommodation_FAQ_Content',
        'IdName': 'AccSeoID',
        'ID': request.AccSeoID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddFAQDescription(RequestData, request, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
}

exports.GetNewAccomodationCommission = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.CountryID != undefined && request.CountryID != "") {
        where += ' AND ac.CountryID=? ';
        where_array.push(request.CountryID);
    }
    if (request.CommissionID != undefined && request.CommissionID != "") {
        where += ' AND ac.CommissionID=? ';
        where_array.push(request.CommissionID);
    }
    if (request.CityID != undefined && request.CityID != '') {
        where += ' AND ac.CityID = ?';
        where_array.push(request.CityID);
    }
    if (request.CpMin != undefined && request.CpMin != '') {
        where += ' AND ac.CpMin=?';
        where_array.push(request.CpMin);
    }
    if (request.CpMax != undefined && request.CpMax != '') {
        where += ' AND ac.CpMax=?';
        where_array.push(request.CpMax);
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }

    if (request.Status != undefined && request.Status != "") {
        where += ' AND ac.Active=? ';
        where_array.push(request.Status);
    }

    let query = `SELECT CAST(ac.CommissionID as CHAR) as CommissionID,	Active, (select CountryName from Mst_Country where CountryID=ac.CountryID) as CountryName,(select CityName from Mst_City where CityID=ac.CityID) as CityName,	CpMin,CpMax,CountryID,CityID from Accommodation_City_Commission as ac WHERE 1 ` + where + ` ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Accommodation_City_Commission as ac', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};
exports.AddAccCommissionNew = async (req, res) => {
    // console.log(req.body)
    // req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.CommissionID > 0) {
        where_data = {
            'CommissionID': request.CommissionID,
        };
    }
    update_data['CountryID'] = request.CountryID;
    update_data['CityID'] = request.CityID;
    update_data['CpMin'] = request.CpMin;
    update_data['CpMax'] = request.CpMax;
    if (request.Status != undefined && request.Status != 'null') {
        update_data['Active'] = request.Status;
    }

    let fieldshow = 'CAST(CommissionID as CHAR) as CommissionID';
    let RequestData = {
        'tableName': 'Accommodation_City_Commission',
        'IdName': 'CommissionID',
        'ID': request.CommissionID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            console.log(err)
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};
exports.DeleteAccCommissionNew = (req, res) => {
    let deleteId = req.body.CommissionID;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Accommodation_City_Commission', 'CommissionID', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
};
exports.StudentAddXlsImport = (req, res) => {
    if (req.files.recfile != undefined && req.files.recfile != '') {
        var ext = "";
        let SheetJsonData = [];
        req.files.recfile.map((item) => {
            // console.log(item);
            ext = path.extname(item.originalname);
            if (ext.toLowerCase() == '.xlsx') {
                const workbook = xlsx.read(item.buffer, { cellDates: true });
                const sheet_name_list = workbook.SheetNames;
                model_name = sheet_name_list[0];
                SheetJsonData[model_name] = xlsx.utils.sheet_to_json(workbook.Sheets[model_name]);
                Service.StudentAddXlsImport('Student', SheetJsonData[model_name], req, (err, data) => {
                    if (err) {
                        res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0') });
                    } else {
                        res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Toaster, data.message, data.status), "Data": data.Data });
                    }
                });
            }
            else {
                res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, "Please Select only excel file", '0') });
            }
        });
    }
};
exports.NearByDataAddByXls = (req, res) => {
    if (req.files.recfile != undefined && req.files.recfile != '') {
        var ext = "";
        let SheetJsonData = [];
        req.files.recfile.map((item) => {
            // console.log(item);
            ext = path.extname(item.originalname);
            if (ext.toLowerCase() == '.xlsx') {
                const workbook = xlsx.read(item.buffer, { cellDates: true });
                const sheet_name_list = workbook.SheetNames;
                model_name = sheet_name_list[0];
                SheetJsonData[model_name] = xlsx.utils.sheet_to_json(workbook.Sheets[model_name]);
                Service.NearByDataAddByXls('Mst_NearBySearch', SheetJsonData[model_name], req, (err, data) => {
                    if (err) {
                        res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0') });
                    } else {
                        res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Toaster, data.message, data.status), "Data": data.Data });
                    }
                });
            }
            else {
                res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, "Please Select only excel file", '0') });
            }
        });
    }
};

exports.ExportStudent_Inquiry = async (req, res) => {

    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.InquiryID != undefined && request.InquiryID != "") {
        where += ' AND SInquiry.InquiryID=? ';
        where_array.push(request.InquiryID);
    }
    if (request.InquiryNo != undefined && request.InquiryNo != "") {
        where += ' AND SInquiry.InquiryNo=? ';
        where_array.push(request.InquiryNo);
    }
    if (request.ServiceID != undefined && request.ServiceID != "") {
        where += ' AND SInquiry.ServiceID=? ';
        where_array.push(request.ServiceID);
    }
    if (request.ServiceProviderID != undefined && request.ServiceProviderID != "") {
        where += ' AND SInquiry.ServiceProviderID=? ';
        where_array.push(request.ServiceProviderID);
    }
    if (request.Type != undefined && request.Type != "") {
        where += ' AND SInquiry.Type=? ';
        where_array.push(request.Type);
    }
    if (request.StartDate != undefined && request.StartDate != "") {
        where += ' AND date(SInquiry.EntryDate)>=? ';
        where_array.push(request.StartDate);
    }
    if (request.EndDate != undefined && request.EndDate != "") {
        where += ' AND date(SInquiry.EntryDate)<=? ';
        where_array.push(request.EndDate);
    }
    // if (request.Name!=undefined && request.Name!='') {
    //     where += ' AND SInquiry.Name like ?';
    //     where_array.push('%'+request.Name+'%');
    // }
    if (request.StudentName != undefined && request.StudentName != '') {
        where += ' AND SInquiry.Name like ?';
        where_array.push('%' + request.StudentName + '%');
    }
    if (request.CurrentCountry != undefined && request.CurrentCountry != '') {
        where += ' AND SInquiry.CurrentCountry like ?';
        where_array.push('%' + request.CurrentCountry + '%');
    }
    if (request.CurrentCity != undefined && request.CurrentCity != '') {
        where += ' AND SInquiry.CurrentCity like ?';
        where_array.push('%' + request.CurrentCity + '%');
    }
    if (request.ReferNo != undefined && request.ReferNo != '') {
        where += ' AND SInquiry.InquiryNo = ?';
        where_array.push(request.ReferNo);
    }
    if (request.Status != undefined && request.Status != "") {
        where += ' AND SInquiry.Status=? ';
        where_array.push(request.Status);
    }
    if (request.RoleID == '2') {
        // where += ' AND (si.StudentID IN(SELECT st1.StudentID FROM Student AS st1 WHERE st1.ChannelPartnerID="'+request.UserID+'") OR si.ChannelPartnerID="'+request.UserID+'") ';
        where += ' AND SInquiry.UID=? ';
        where_array.push(request.UserID);
    }
    else if (request.ChannelPartnerID != undefined && request.ChannelPartnerID != '') {
        where += ' AND SInquiry.UID = ?';
        where_array.push(request.ChannelPartnerID);
    }
    else if (request.CpID != undefined && request.CpID != '') {
        where += ' AND SInquiry.ChannelPartnerID = ?';
        where_array.push(request.CpID);
    }
    if (request.TransactionID != undefined && request.TransactionID != '') {
        where += ' AND SInquiry.TransactionID = ?';
        where_array.push(request.TransactionID);
    }
    if (request.OrderID != undefined && request.OrderID != '') {
        where += ' AND SInquiry.OrderID = ?';
        where_array.push(request.OrderID);
    }

    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }
    if (request.PaidStatus == "1") {
        where += ' AND SInquiry.PayStatus="1" ';
    }
    if (request.PaidStatus == "0") {
        where += ' AND SInquiry.PayStatus!="1" ';
    }

    if (request.PaymentFromDate && request.PayemntToDate) {
        where += ' AND (date(SInquiry.PaymentDate) BETWEEN "' + request.PaymentFromDate + '" AND "' + request.PayemntToDate + '")';
    }

    // var where = "";
    if (request.RoleID == '2' && request.IsDashbordData == "1") {
        if (request.StartDate != '' && request.StartDate != undefined && request.StartDate != null) {
            where += " AND DATE(SInquiry.EntryDate)>='" + moment(request.StartDate).format('YYYY-MM-DD') + "'";
        } else {
            where += " AND DATE(SInquiry.EntryDate)='" + moment().format('YYYY-MM-DD') + "'";
        }
        if (request.EndDate != '' && request.EndDate != undefined && request.EndDate != null) {
            where += " AND DATE(SInquiry.EntryDate)<='" + moment(request.EndDate).format('YYYY-MM-DD') + "'";
        } else {
            where += " AND DATE(SInquiry.EntryDate)='" + moment().format('YYYY-MM-DD') + "'";
        }
    }
    // let query = `SELECT CAST(si.InquiryID as CHAR) as InquiryID,Status,DATE_FORMAT(si.EntryDate,'%d %b %Y') as EntryDate,FirstName,LastName,Source,si.CurrentCountry,msp.Name as ProviderName,InquiryNo,si.ServiceID,ms.Name,si.ServiceProviderID,si.Type,Email,PhoneNo,Status,CurrentLocation,CurrentCity,CurrentState,CurrentCountry,DestinationLocation,DestinationCity,DestinationState,DestinationCountry,InquiryType,LoanAmount,NoOfPerson,DepatureDate,TravelDate,JourneyDate,FromLocation,ToLocation,Remark,MinNoOfRooms,MaxNoOfRooms,MinPrice,MaxPrice,MoveInDate,DurationInMonth,PropertyType,PropertyType,UniversityName
    // from Student_Inquiry si left join Mst_Services ms on ms.ServiceID = si.ServiceID left join Mst_ServicesProvider msp on msp.ServiceProviderID = si.ServiceProviderID  WHERE 1  `+where+` `+limit;
    let from = `CAST(si.InquiryID as CHAR) as InquiryID,si.ServiceTypeID,DATE_FORMAT(si.EntryDate,'%d %b %Y') as InquiryDate,si.EntryDate,DATE_FORMAT(si.UpdateDate,'%d %b %Y') as InquiryUpdateDate,si.UpdateDate,si.Status,si.Source,si.CurrentCountry,si.PhoneNo_CountryCode,si.InquiryNo,si.Type,si.Email,si.PhoneNo,si.CurrentLocation,si.CurrentCity,si.CurrentState,si.DestinationLocation,si.DestinationCity,si.DestinationState,si.DestinationCountry,si.InquiryType,si.LoanAmount,si.NoOfPerson,si.DepatureDate,si.TravelDate,si.JourneyDate,si.FromLocation,si.ToLocation,si.Remark,si.ReplyMessage,si.MinNoOfRooms,si.MaxNoOfRooms,si.MinPrice,si.MaxPrice,si.MoveInDate,si.DurationInMonth,si.PropertyType,si.UniversityName,si.ServiceID,
    si.CurrencySymbol,si.ServiceProviderID,CAST(si.PayStatus as CHAR) as PayStatus,CAST(si.TransactionID as CHAR) as TransactionID,si.InquiryNo as ReferNo,si.Message,si.Rating,si.AccLocation,si.EntryIP,si.PayAmount,si.PaymentDate,si.ReceiptUrl,si.InvoiceNo,si.OrderID,si.StudentID,`

    let Squery = `((SELECT ` + from + ` CONCAT(si.FirstName, " ", si.LastName) AS StudentName,'0' as IsMapCp,CONCAT(cp.FirstName, " ", cp.LastName) As PartnerName,cp.ChannelPartnerID AS UID,cp.ChannelPartnerID, cp.PersonalEmail AS EamilCP,'0' as StudentCpID FROM Student_Inquiry AS si INNER JOIN ChannelPartner AS cp WHERE cp.ChannelPartnerID=si.ChannelPartnerID AND si.Type="1") 
    UNION 
    (SELECT `+ from + ` CONCAT(sm.FirstName, " ", sm.LastName) AS StudentName,if(!sm.ChannelPartnerID,'2',if(!si.ChannelPartnerID,'1','0')) as IsMapCp,'' As PartnerName, sm.StudentID AS UID,si.ChannelPartnerID,sm.Email AS EamilST,sm.ChannelPartnerID as StudentCpID FROM Student_Inquiry AS si left JOIN Student AS sm on sm.StudentID=si.StudentID AND si.Type="2")
    ) as SInquiry
    left join Mst_Services ms on ms.ServiceID = SInquiry.ServiceID 
    left join Mst_ServicesProvider msp on msp.ServiceProviderID = SInquiry.ServiceProviderID 
    left join Mst_ServicesType as stype on stype.ServiceTypeID = SInquiry.ServiceTypeID
    left join User_Order as uo on uo.OrderID = SInquiry.OrderID
    WHERE 1 `+ where + ``;

    let query = `select SInquiry.*,msp.Name as ProviderName,stype.Type as ServiceTypeName,uo.Subtotal as OrderSubtotal,uo.CityWiseAmoount,uo.OrderID from ` + Squery + ` GROUP by SInquiry.InquiryID ORDER by SInquiry.EntryDate DESC ` + limit;
    //count
    let Countquery = `select count(DISTINCT SInquiry.InquiryID) as total from ` + Squery;
    // console.log(query);
    var start = new Date();
    async.waterfall([
        function (done) {
            Service.UniunJoinListCount(Countquery, where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['page_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    console.log('Request took:', new Date() - start, 'ms');
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};

exports.PartnerLevels = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.CP_Category_Title != undefined && request.CP_Category_Title != "") {
        where += ' AND CPC.CP_Category_Title=? ';
        where_array.push(request.CP_Category_Title);
    }
    if (request.Min_Student != undefined && request.Min_Student != "") {
        where += ' AND CPC.Min_Student>=? ';
        where_array.push(request.Min_Student);
    }
    if (request.Max_Student != undefined && request.Max_Student != '') {
        where += ' AND CPC.Max_Student <= ?';
        where_array.push(request.Max_Student);
    }
    if (request.Commission_Per_Student != undefined && request.Commission_Per_Student != '') {
        where += ' AND CPC.Commission_Per_Student=?';
        where_array.push(request.Commission_Per_Student);
    }
    if (request.Cash_Incentive != undefined && request.Cash_Incentive != '') {
        where += ' AND CPC.Cash_Incentive=?';
        where_array.push(request.Cash_Incentive);
    }
    if (request.Commission_Per_services != undefined && request.Commission_Per_services != '') {
        where += ' AND CPC.Commission_Per_services=?';
        where_array.push(request.Commission_Per_services);
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }
    if (request.Status != undefined && request.Status != "") {
        where += ' AND CPC.Is_Active=? ';
        where_array.push(request.Status);
    }

    let query = `SELECT CAST(CP_Category_Id as CHAR) as ID,	Is_Active, CP_Category_Title,Min_Student,Max_Student,Commission_Per_Student,Commission_Per_services,Cash_Incentive from CP_Category AS CPC WHERE 1 ` + where + ` ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('CP_Category AS CPC', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};
exports.AddPartnerLevels = async (req, res) => {
    // console.log(req.body)
    // req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.ID > 0) {
        where_data = {
            'CP_Category_Id': request.ID,
        };
    }
    update_data['CP_Category_Title'] = request.CP_Category_Title;
    update_data['Min_Student'] = request.Min_Student;
    update_data['Max_Student'] = request.Max_Student;
    update_data['Commission_Per_Student'] = request.Commission_Per_Student;
    update_data['Commission_Per_services'] = request.Commission_Per_services;
    update_data['Cash_Incentive'] = request.Cash_Incentive;
    if (request.Status != undefined && request.Status != 'null') {
        update_data['Is_Active'] = request.Status;
    }

    let fieldshow = 'CAST(CP_Category_Id as CHAR) as CP_Category_Id';
    let RequestData = {
        'tableName': 'CP_Category',
        'IdName': 'CP_Category_Id',
        'ID': request.ID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            console.log(err)
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeletePartnerLevels = (req, res) => {
    let deleteId = req.body.CP_Category_Id;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('CP_Category', 'CP_Category_Id', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
};
exports.AddMarketingMaill = async (req, res) => {
    // console.log(req.body)
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    // req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    console.log(request)
    let update_data = {};
    let where_data = {};
    // if (request.ID > 0) {
    //     where_data = {
    //         'CP_Category_Id': request.ID,
    //     };
    // }
    let StudentID = []
    let isData = 0;
    if (request.Service != undefined && request.Service != '') {
        let where = ''
        let where_data = []
        where += ' AND ServiceID=?'
        where_data.push(request.Service)
        if (request.StartDate != undefined && request.StartDate != '' && request.EndDate != undefined && request.EndDate != '') {
            where += ' AND (date(EntryDate) BETWEEN "' + request.StartDate + '" AND "' + request.EndDate + '")';
        }
        if (request.CountryID != undefined && request.CountryID != '0') {
            where += ' AND CurrentCountry=?'
            where_data.push(request.CountryID)
        }
        if (request.CityID != undefined && request.CityID != '0') {
            where += ' AND CurrentCity=?'
            where_data.push(request.CityID)
        }
        let Query = `select DISTINCT Email from Student_Inquiry where 1` + where;
        let StudentIDList = await sqlhelper.select(Query, where_data, (err, res) => {
            if (err) {
                console.log(err);
                return [];
            } else if (_.isEmpty(res)) {
                return [];
            } else {
                return res;
            }
        });
        for (var i = 0; i < StudentIDList.length; i++) {
            StudentID.push(StudentIDList[i].Email)
            isData = 1;
        }

        update_data['ServiceID'] = request.Service;
        update_data['StudentList'] = StudentID.join();
    }

    if (request.StudentList != undefined && request.StudentList != '') {
        update_data['StudentList'] = request.StudentList;
        StudentID = request.StudentList.split(",")
        isData = 1;
    }
    if (request.AllStudent == "true" && request.AllStudent != undefined && request.AllStudent != '') {
        let Query = `select DISTINCT Email from Student_Inquiry where 1`;
        let StudentIDList2 = await sqlhelper.select(Query, where_data, (err, res) => {
            if (err) {
                console.log(err);
                return [];
            } else if (_.isEmpty(res)) {
                return [];
            } else {
                return res;
            }
        });
        for (var i = 0; i < StudentIDList2.length; i++) {
            StudentID.push(StudentIDList2[i].Email)
            isData = 1;
        }
    }
    else if (request.Students != undefined && request.Students != '') {

        update_data['StudentList'] = request.Students;
        StudentID = request.Students.split(",")
        isData = 1;
    }
    if (request.Subject != undefined && request.Subject != '') {
        update_data['Subject'] = request.Subject;
    }
    if (request.StartDate != undefined && request.StartDate != '') {
        update_data['StartDate'] = request.StartDate;
    }
    if (request.EndDate != undefined && request.EndDate != '') {
        update_data['EndDate'] = request.EndDate;
    }
    if (request.TemplateBody != undefined && request.TemplateBody != '') {
        update_data['TemplateBody'] = request.TemplateBody;
    }
    let attachments = {
        content: '',
        filename: '',
        type: '',
        disposition: 'attachment'
    }
    if (req.files.recfile) {
        if (Object.entries(req.files.recfile).length) {
            resimage = await upload.uploadFiles(req.files.recfile, 'Mst_Services');

        }
        if (Object.entries(req.files.recfile).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            update_data['Attechment'] = resimage[0];
            attachments.content = req.files.recfile[0].buffer.toString('base64');
            attachments.filename = req.files.recfile[0].originalname;
            attachments.type = req.files.recfile[0].mimetype;
        }
    }
    if (StudentID.length <= 0) {
        res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, 'No Student Found', '2'), "Data": '' });
        return
    }
    if (isData == 1) {
        let EmailData = {
            StudentList: StudentID,
            Subject: request.Subject,
            Body: request.TemplateBody,
        }
        if (req.files.recfile)
            EmailData[attachments] = attachments
        let IsMailSend = await Commom.SendGridMail(EmailData);
    }
    // console.log(StudentID)
    let fieldshow = 'CAST(Email_temp_id as CHAR) as Email_temp_id';
    let RequestData = {
        'tableName': 'MarketingMail',
        'IdName': '	Email_temp_id',
        'ID': request.ID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            console.log(err)
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
    return
};

exports.StudentCVlist = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    console.log(request)
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.StartDate != undefined && request.StartDate != "") {
        where += ' AND date(CV.EntryDate)>=? ';
        where_array.push(request.StartDate);
    }
    if (request.EndDate != undefined && request.EndDate != "") {
        where += ' AND date(CV.EntryDate)<=? ';
        where_array.push(request.EndDate);
    }
    console.log(request.StudentName.name)
    if (request.StudentName != undefined && request.StudentName != '') {
        where += ' AND CONCAT(ss.FirstName, " ", ss.LastName) like ?';
        where_array.push('%' + request.StudentName.name + '%');
    }
    if (request.ResumeId != undefined && request.ResumeId != '') {
        where += ' AND CV.ResumeId=?';
        where_array.push(request.ResumeId);
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }
    let query = `SELECT CONCAT(ss.FirstName, " ", ss.LastName) as StudentName,CV.* from Student_CV_Detail AS CV left join Student as ss on ss.StudentID=CV.StudentID WHERE 1 ` + where + ` ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Student_CV_Detail AS CV left join Student as ss on ss.StudentID=CV.StudentID', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    console.log(Math.ceil(data1[0].total / req.body.Limit).toString())
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};
exports.GetAllCampaigns = async (req, res) => {
    const client = require('@sendgrid/client');

    console.log(process.env.SENDGRID_API_KEY);
    client.setApiKey(process.env.SENDGRID_API_KEY);
    // dotenv.config()
    const headers = {
        "on-behalf-of": "The subuser's username. This header generates the API call as if the subuser account was making the call."
    };
    const data = {
        "id": 986724,
        "title": "May Newsletter",
        "subject": "New Products for Summer!",
        "sender_id": 124451,
        "list_ids": [
            110,
            124
        ],
        "segment_ids": [
            110
        ],
        "categories": [
            "summer line"
        ],
        "suppression_group_id": 42,
        "custom_unsubscribe_url": "",
        "ip_pool": "marketing",
        "html_content": "<html><head><title></title></head><body><p>Check out our summer line!</p></body></html>",
        "plain_content": "Check out our summer line!",
        "status": "Draft"
    };

    const request = {
        url: `/v3/campaigns`,
        method: 'POST',
        headers: headers,
        body: data
    }

    client.request(request)
        .then(([response, body]) => {
            console.log(response.statusCode);
            console.log(response.body);
        })
        .catch(error => {
            console.error(error);
        });
    // const client = require('@sendgrid/client');
    client.setApiKey(process.env.SENDGRID_API_KEY);

    const headers2 = {
        "on-behalf-of": "The subuser's username. This header generates the API call as if the subuser account was making the call."
    };
    const queryParams2 = {
        "limit": 10
    };

    const request2 = {
        url: `/v3/campaigns`,
        method: 'GET',
        headers: headers2,
        qs: queryParams2
    }

    client.request(request2)
        .then(([response, body]) => {
            console.log(response.statusCode);
            console.log(response.body);
        })
        .catch(error => {
            console.error(error);
        });


};
exports.FoodPartner = async (req, res) => {
    console.log(req.body)
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);
    
    if (request.ProviderID != undefined && request.ProviderID != "") {
        where += ' AND FP.Food_Provider_Id=? ';
        where_array.push(request.ProviderID);
    }
    if (request.Name != undefined && request.Name != "") {
        where += ' AND FP.Name=? ';
        where_array.push(request.Name);
    }

    if (request.Website != undefined && request.Website != '') {
        where += ' AND FP.Website <= ?';
        where_array.push(request.Website);
    }

    if (request.CompanyName != undefined && request.CompanyName != '') {
        where += ' AND FP.Food_Provider_Id=?';
        where_array.push(request.CompanyName);
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }
    if (request.Status != undefined && request.Status != "") {
        where += ' AND FP.Active=? ';
        where_array.push(request.Status);
    }

    let query = `SELECT CAST(Food_Provider_Id as CHAR) as ID,Name,Email,Website,PhoneNo,CompanyName,CompanyLogo,Active,DisplayOrder,
    Thumbnail from Food_Provider AS FP WHERE 1 ` + where + ` order by  Food_Provider_Id desc ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Food_Provider AS FP', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};
exports.AddFoodPartner = async (req, res) => {
    // console.log(req.body)
    // req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.ID > 0) {
        where_data = {
            'Food_Provider_Id': request.ID,
        };
    }
    update_data['Name'] = request.Name;
    update_data['Email'] = request.Email;
    update_data['Website'] = request.Website;
    update_data['PhoneNo'] = request.PhoneNo;
    update_data['CompanyName'] = request.CompanyName;
    update_data['DisplayOrder'] = request.DisplayOrder;
    update_data['CompanyLogo'] = request.oldfile;
    update_data['Thumbnail'] = request.oldfile2;
    if (request.Status != undefined && request.Status != 'null') {
        update_data['Active'] = request.Status;
    }
    if (req.files.recfile) {
        if (Object.entries(req.files.recfile).length) {
            resimage = await upload.uploadFiles(req.files.recfile, 'Mst_Services');

        }
        if (Object.entries(req.files.recfile).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            update_data['CompanyLogo'] = resimage[0];
        }
    }
    if (req.files.recfile2) {
        if (Object.entries(req.files.recfile2).length) {
            resimage = await upload.uploadFiles(req.files.recfile2, 'Mst_Services');
        }
        if (Object.entries(req.files.recfile2).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            update_data['Thumbnail'] = resimage[0];
        }
    }

    let fieldshow = 'CAST(Food_Provider_Id as CHAR) as Food_Provider_Id';
    let RequestData = {
        'tableName': 'Food_Provider',
        'IdName': 'Food_Provider_Id',
        'ID': request.ID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            console.log(err)
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeleteFoodPartner = (req, res) => {
    let deleteId = req.body.Food_Provider_Id;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('Food_Provider', 'Food_Provider_Id', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
};
exports.FoodPartnerOffer = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.FoodPartnerID != undefined && request.FoodPartnerID != "") {
        where += ' AND FPO.Food_Provider_Id=? ';
        where_array.push(request.FoodPartnerID);
    }
    if (request.OfferTitle != undefined && request.OfferTitle != "") {
        where += ' AND FPO.OfferTitle=? ';
        where_array.push(request.OfferTitle);
    }
    if (request.OfferStartDate != undefined && request.OfferStartDate != "") {
        where += ' AND FPO.OfferStartDate>=? ';
        where_array.push(request.OfferStartDate);
    }
    if (request.OfferEndDate != undefined && request.OfferEndDate != '') {
        where += ' AND FPO.OfferEndDate <= ?';
        where_array.push(request.OfferEndDate);
    }
    if (request.OfferDescription != undefined && request.OfferDescription != '') {
        where += ' AND FPO.OfferDescription=?';
        where_array.push(request.OfferDescription);
    }
    if (request.OfferCode != undefined && request.OfferCode != '') {
        where += ' AND FPO.OfferCode=?';
        where_array.push(request.OfferCode);
    }
    if (request.Offer_NoOfTime != undefined && request.Offer_NoOfTime != '') {
        where += ' AND FPO.Offer_NoOfTime=?';
        where_array.push(request.Offer_NoOfTime);
    }
    if (request.CountryID != undefined && request.CountryID != '') {
        where += ' AND FPO.CountryID=?';
        where_array.push(request.CountryID);
    }
    if (request.CityID != undefined && request.CityID != '') {
        where += ' AND find_in_set(' + request.CityID + ', FPO.CityID)';
        where_array.push(request.CityID);
    }
    if (request.AllData == undefined || request.AllData == '') {
        limit = "LIMIT " + offset + ', ' + request.Limit;
    }
    if (request.Status != undefined && request.Status != "") {
        where += ' AND FPO.Active=? ';
        where_array.push(request.Status);
    }
    if (request.Exclusive != undefined && request.Exclusive != "") {
        where += ' AND FPO.Exclusive=? ';
        where_array.push(request.Exclusive);
    }
    let query = `SELECT CAST(Offer_Id as CHAR) as ID,FP.CompanyName,FPO.Food_Provider_Id ,FPO.Active,OfferTitle,OfferDescription,Exclusive,OfferCode,OfferDisplayOrder,CAST(DATE(OfferStartDate) as CHAR) as OfferStartDate,CAST(DATE(OfferEndDate) as CHAR) as OfferEndDate,Offer_NoOfTime,OfferImage,FPO.CountryID,FPO.CityID,GROUP_CONCAT(mcc.CityName) as CityName,mc.CountryName as CountryName 
    from Food_Provider_Offer AS FPO 
    left join Food_Provider as FP on FP.Food_Provider_Id=FPO.Food_Provider_Id
    left join Mst_Country as mc on mc.CountryID = FPO.CountryID 
    left JOIN Mst_City as mcc on find_in_set(mcc.CityID, FPO.CityID) 
    WHERE 1
     ` + where + ` GROUP BY FPO.Offer_Id order by FPO.Offer_Id desc ` + limit;
    async.waterfall([
        function (done) {
            Service.AllListCount('Food_Provider_Offer AS FPO', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};
exports.AddFoodPartnerOffer = async (req, res) => {
    console.log(req.body)
    // return;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let request = req.body;
    let update_data = {};
    let where_data = {};
    if (request.ID > 0) {
        where_data = {
            'Offer_Id': request.ID,
        };
    }
    update_data['Food_Provider_Id'] = request.Food_Provider_Id
    update_data['OfferTitle'] = request.OfferTitle
    update_data['OfferDescription'] = request.OfferDescription
    update_data['OfferCode'] = request.OfferCode
    update_data['OfferDisplayOrder'] = request.OfferDisplayOrder
    update_data['OfferStartDate'] = request.OfferStartDate
    update_data['OfferEndDate'] = request.OfferEndDate
    update_data['Offer_NoOfTime'] = request.Offer_NoOfTime
    update_data['CountryID'] = request.CountryID
    update_data['CityID'] = request.CityID
    update_data['OfferImage'] = request.oldfile;
    // update_data['Thumbnail'] = request.oldfile2;
   
  
    if (request.Status != undefined && request.Status != 'null') {
        update_data['Active'] = request.Status;
    }
    if (request.Exclusive != undefined && request.Exclusive != 'null') {
        update_data['Exclusive'] = request.Exclusive;
    }
    if (req.files.recfile) {
        if (Object.entries(req.files.recfile).length) {
            resimage = await upload.uploadFiles(req.files.recfile, 'Mst_Services');

        }
        if (Object.entries(req.files.recfile).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            update_data['OfferImage'] = resimage[0];
        }
    }
    if (req.files.recfile2) {
        if (Object.entries(req.files.recfile2).length) {
            resimage = await upload.uploadFiles(req.files.recfile2, 'Mst_Services');

        }
        if (Object.entries(req.files.recfile2).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            update_data['Thumbnail'] = resimage[0];
        }
    }
    let fieldshow = 'CAST(Offer_Id as CHAR) as Offer_Id';
    let RequestData = {
        'tableName': 'Food_Provider_Offer',
        'IdName': 'Offer_Id',
        'ID': request.ID,
        'update_data': update_data,
        'where_data': where_data,
        'fieldshow': fieldshow,
    };
    Service.AddData(RequestData, request, (err, data) => {
        if (err) {
            console.log(err)
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "Data": data.data });
        }
    });
};

exports.DeleteFoodPartnerOffer = (req, res) => {
    let deleteId = req.body.Offer_Id;
    req.body.IpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Service.Delete('CP_Category', 'Offer_Id', deleteId, req.body, (err, data) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message, '0'), "Data": [] });
        } else {
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, data.message, data.Status), "DeleteId": deleteId });
        }
    });
};

exports.SrudentOffer = async (req, res) => {
    req.body.PageNo = (req.body.PageNo > 0 ? req.body.PageNo : '1');
    // req.body.Limit = ((req.body.Limit>0 && req.body.Limit<=100) ? req.body.Limit : req.body.Limit);
    let request = req.body;
    console.log(request)
    var data = {};
    let where = '';
    let limit = '';
    let where_array = [];
    let offset = (request.PageNo * request.Limit - request.Limit);

    if (request.StudentID.Email != undefined && request.StudentID.Email != "") {
        where += ' AND si.Email=? ';
        where_array.push(request.StudentID.Email);
    }
    if (request.FoodPartnerId != undefined && request.FoodPartnerId != "") {
        where += ' AND fp.Food_Provider_Id  =? ';
        where_array.push(request.FoodPartnerId);
    }

    let query = `SELECT CAST(so.Student_Offer_ID as CHAR) as ID,so.Food_Provider_Id, CONCAT(si.FirstName," ",si.LastName) as StudentName,so.StudentID,fpo.OfferTitle,fpo.OfferCode,fp.CompanyName from Student_Offer as so LEFT JOIN Student as si on si.StudentID=so.StudentID LEFT JOIN Food_Provider_Offer as fpo on fpo.Offer_Id=so.Offer_Id LEFT JOIN Food_Provider as fp on fpo.Food_Provider_Id=fp.Food_Provider_Id WHERE 1 ` + where + ` ` + limit;

    async.waterfall([
        function (done) {
            Service.AllListCount('Student_Offer as so LEFT JOIN Student as si on si.StudentID=so.StudentID LEFT JOIN Food_Provider_Offer as fpo on fpo.Offer_Id=so.Offer_Id LEFT JOIN Food_Provider as fp on fpo.Food_Provider_Id=fp.Food_Provider_Id', where, where_array, (err, data1) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    let para_data = {};
                    para_data['TotalRecord'] = data1[0].total.toString();
                    para_data['TotalPage'] = Math.ceil(data1[0].total / req.body.Limit).toString();
                    para_data['CurrentPage'] = req.body.PageNo;
                    data['para_data'] = para_data;
                    done(null, data);
                }
            });
        },
        function (data, done) {
            Service.AllList(query, where_array, (err, data2) => {
                if (err) {
                    res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
                } else {
                    data['list'] = data2;
                    res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
                }
            });
        },
    ], function (err, result) {
    });
};
exports.FoodProviderList = async (req, res) => {
    let request = req.body;
    var data = {};
    let where = '';
    let where_array = [];
    if (request.Food_Provider_Id != undefined && request.Food_Provider_Id != "") {
        where += ' AND Food_Provider_Id=? ';
        where_array.push(request.Food_Provider_Id);
    }
    let query = `select Food_Provider_Id as ID,CompanyName from Food_Provider WHERE 1 ` + where;
    Service.AllList(query, where_array, (err, data2) => {
        if (err) {
            res.status(500).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Error, Code.AlertTypeCode.Toaster, err.message), "Data": [] });
        } else {
            data['list'] = data2;
            res.status(200).json({ "ZMessage": Code.ResponseText(Code.ErrorCode.Success, Code.AlertTypeCode.Noalert, "Data Fetched successfully.", '1'), "Data": data });
        }
    });
};