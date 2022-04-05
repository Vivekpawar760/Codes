const sqlred = require("../config/read.db");
const sqlwr = require("../config/write.db");
const sqlhelper = require("../CommonMethod/sqlhelper");
const _ = require("lodash");
const moment = require('moment');
const upload = require("../middleware/upload");
const md5 = require('md5');
const path = require('path');
const Commom = require("../CommonMethod/CommonFunction");
const awsKey = require('../config/responseMsg');
const { connect } = require("../config/read.db");
const { exit } = require("process");
const { Console } = require("console");
const Send_Mail = require("../CommonMethod/sendEmail");
var xlsx = require('xlsx');
const Service = function (Service) {
    this.Device_Name = Service.Device_Name;
};

Service.AddData = async (RequestData, request, callback) => {

    let tableName = RequestData.tableName;
    let IdName = RequestData.IdName;
    let ID = RequestData.ID;
    let update_data = RequestData.update_data;
    let where_data = RequestData.where_data;
    let fieldshow = RequestData.fieldshow;

    var message = "";
    let ID2 = ID;
    if (ID > 0) {
        let check_query = 'SELECT ' + IdName + ' FROM ' + tableName + ' WHERE ' + IdName + '="' + ID + '"';
        let check_data = await sqlhelper.select(check_query, [], (err, res) => {
            if (err) {
                callback(err, new Array());
                return 0;
            } else if (_.isEmpty(res)) {
                callback(null, {
                    'message': 'Data not found',
                    'data': new Array()
                });
                return 0;
            } else {
                return res[0];
            }
        });
        if (check_data == 0) {
            return;
        }
        update_data['UpdateBy'] = request.UserID;
        update_data['UpdateDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
        update_data['UpdateIP'] = request.IpAddress;
        let para_update = await sqlhelper.update(tableName, update_data, where_data, (err, res) => {
            if (err) {
                callback(err, new Array());
                return 0;
            } else {
                return res;
            }
        });
        if (para_update == 0) {
            return;
        }
        var ActivityArray = {
            TableName: tableName,
            TableID: ID,
            Module: tableName,
            Activity: '2',
            Remark: 'Update ' + tableName + ' module Id No :' + ID,
            UserId: request.UserID,
        }
        Commom.SaveActivityLog(ActivityArray, request);
        message = "Data updated successfully";
    } else {
        update_data['EntryBy'] = request.UserID;
        update_data['EntryDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
        update_data['EntryIP'] = request.IpAddress;
        ID2 = await sqlhelper.insert(tableName, update_data, (err, res) => {
            if (err) {
                callback(err, new Array());
                return 0;
            } else {
                return res.insertId;
            }
        });
        if (ID2 == 0) {
            return;
        }
        var ActivityArray = {
            TableName: tableName,
            TableID: ID2,
            Module: tableName,
            Activity: '1',
            Remark: 'Insert ' + tableName + ' module Id No :' + ID2,
            UserId: request.UserID,
        }
        Commom.SaveActivityLog(ActivityArray, request);
        message = "Data inserted successfully";
    }
    let para_query = 'SELECT ' + fieldshow + ' FROM ' + tableName + ' WHERE ' + IdName + '="' + ID2 + '"';
    let para_data = await sqlhelper.select(para_query, [], (err, res) => {
        if (err) {
            callback(err, new Array());
            return 0;
        } else {
            return res[0];
        }
    })
    if (para_data == 0) {
        return;
    }
    callback(null, {
        'Status': '1',
        'message': message,
        'data': para_data
    });
}

Service.AllList = async (query, where_array, callback) => {
    var data = await sqlhelper.select(query, where_array, (err, res) => {
        if (err) {
            callback(err, new Array());
            return 0;
        } else if (_.isEmpty(res)) {
            callback(null, new Array());
            return 0;
        } else {
            return res;
        }
    });
    if (data == 0) {
        return;
    }
    callback(null, data);
}

Service.SeoDescriptionList = async (query, where_array, callback) => {
    var data = await sqlhelper.select(query, where_array, (err, res) => {
        if (err) {
            callback(err, new Array());
            return 0;
        } else if (_.isEmpty(res)) {
            callback(null, new Array());
            return 0;
        } else {
            return res;
        }
    });
    if (data == 0) {
        return;
    }
    for (const [key, value] of Object.entries(data)) {
        let subquery = `select AccSeoDetailsID,Title,Description,DisplayOrder from Accommodation_SEO_Content_multiple where AccSeoID =` + value.AccSeoID;
        var Subdata = await sqlhelper.select(subquery, where_array, (err, res) => {
            if (err) {
                callback(err, new Array());
                return 0;
            } else {
                return res;
            }
        });
        value.Description = Subdata;
    }
    callback(null, data);
}

Service.AllListCount = async (tableName, where, where_array, callback) => {
    let query = "SELECT count(*) as total  FROM " + tableName + "  WHERE 1 " + where;
    await sqlhelper.select(query, where_array, (err, res) => {
        if (err) {
            callback(err, new Array());
        } else {
            callback(null, res);
        }
    });
}

Service.JoinListCount = async (tableName, where, where_array, callback) => {
    let query = "SELECT count(*) as total  FROM " + tableName + "  WHERE 1 " + where;
    await sqlhelper.select(query, where_array, (err, res) => {
        if (err) {
            callback(err, new Array());
        } else {
            callback(null, res);
        }
    });
}

Service.UniunJoinListCount = async (query, where, where_array, callback) => {
    await sqlhelper.select(query, where_array, (err, res) => {
        if (err) {
            callback(err, new Array());
        } else {
            callback(null, res);
        }
    });
}

Service.Delete = async (tableName, IdName, ID, request, callback) => {
    let check_query = 'SELECT ' + IdName + '  FROM ' + tableName + ' WHERE ' + IdName + '="' + ID + '"';
    let check_data = await sqlhelper.select(check_query, [], (err, res) => {
        if (err) {
            callback(err, new Array());
            return 0;
        } else if (_.isEmpty(res)) {
            callback(null, {
                'message': 'Data not found',
                'data': new Array()
            });
            return 0;
        } else {
            return res[0];
        }
    });

    if (check_data == 0) {
        return;
    }

    let query = 'delete FROM ' + tableName + ' WHERE ' + IdName + '="' + ID + '"';
    let delete_data = await sqlhelper.select(query, [], (err, res) => {
        if (err) {
            console.log(err)
            callback(err, new Array());
            return 0;
        } else {
            return res.affectedRows;
        }
    });

    if (delete_data == 0) {
        return;
    }
    var ActivityArray = {
        TableName: tableName,
        TableID: ID,
        Module: tableName,
        Activity: '3',
        Remark: 'Delete ' + tableName + ' module Id No :' + ID,
        UserId: request.UserID,
    }
    Commom.SaveActivityLog(ActivityArray, request);
    callback(null, {
        'message': 'Data deleted successfully',
        'Status': '1',
        'deleteId': delete_data
    });
}

Service.UpdateData = async (reqestData, callback) => {
    // console.log(reqestData['reqData'].Npass+'=='+reqestData['reqData'].Cnfpass);
    if (reqestData['reqData'].Npass != reqestData['reqData'].Cnfpass) {
        callback(null, {
            'message': 'Password Not Match',
            'data': new Array()
        });
        return;
    }
    let check_data = await sqlhelper.select(reqestData['query'], [], (err, res) => {
        if (err) {
            callback(err, new Array());
            return 0;
        } else if (_.isEmpty(res)) {
            callback(null, {
                'message': 'Invalid Password',
                'data': new Array()
            });
            return 0;
        } else {
            return res[0];
        }
    });
    if (check_data == 0) {
        return;
    }
    let update = await sqlhelper.update(reqestData['tableName'], reqestData['update_data'], reqestData['where_data'], (err, res) => {
        if (err) {
            callback(err, new Array());
            return 0;
        } else {
            return res;
        }
    });
    if (update == 0) {
        return;
    }
    callback(null, {
        'message': 'Password changed successfully',
        'Status': '1',
        'Data': update
    });
}

Service.ReviewApproval = async (request, callback) => {
    let update = await sqlhelper.update('Accommodation_Rating', {
        'IsApprove': '1'
    }, {
        'RatingID': request.RatingID
    }, (err, res) => {
        if (err) {
            callback(err, new Array());
            return 0;
        } else {
            return res;
        }
    });
    if (update == 0) {
        return;
    }
    let check_query = 'SELECT count(RatingID) as count,sum(AverageRating) as total  FROM Accommodation_Rating WHERE IsApprove = "1" and AccommodationID =' + request.AccommodationID;
    let ReviewAvg = await sqlhelper.select(check_query, [], (err, res) => {
        if (err) {
            callback(err, new Array());
            return 0;
        } else if (_.isEmpty(res)) {
            callback(null, {
                'message': 'Data not found',
                'data': new Array()
            });
            return -1;
        } else {
            // console.log(res[0].total+' / '+res[0].count+' = '+res[0].total/res[0].count);
            return (res[0].total / res[0].count);
        }
    });
    if (ReviewAvg == -1) {
        return;
    }
    let updateAcc = await sqlhelper.update('Accommodation', {
        'AccRating': ReviewAvg
    }, {
        'AccommodationID': request.AccommodationID
    }, (err, res) => {
        if (err) {
            callback(err, new Array());
            return -1;
        } else {
            return res;
        }
    });
    if (updateAcc == -1) {
        return;
    }
    callback(null, {
        'message': 'updated successfully',
        'Status': '1',
        'Data': update
    });
}


Service.CheckPass = async (query, callback) => {
    let check_data = await sqlhelper.select(query, [], (err, res) => {
        if (err) {
            callback(err, new Array());
            return 0;
        } else if (_.isEmpty(res)) {
            callback(null, {
                'message': 'Password is wrong',
                'data': new Array()
            });
            return 0;
        } else {
            return res[0];
        }
    });
    if (check_data == 0) {
        return;
    }
    callback(null, {
        'message': 'Password is currect',
        'Status': '1',
        'Data': check_data
    });
}



Service.InsertImageData = async (RequestData, request, callback) => {

    let tableName = RequestData.tableName;
    let IdName = RequestData.IdName;
    let ID = RequestData.ID;
    let update_data = RequestData.update_data;
    let where_data = RequestData.where_data;
    let fieldshow = RequestData.fieldshow;

    var message = "";
    let ID2 = ID;
    if (ID > 0) {
        let check_query = 'SELECT ' + IdName + ' FROM ' + tableName + ' WHERE ' + IdName + '="' + ID + '"';
        let check_data = await sqlhelper.select(check_query, [], (err, res) => {
            if (err) {
                callback(err, new Array());
                return 0;
            } else if (_.isEmpty(res)) {
                callback(null, {
                    'message': 'Data not found',
                    'data': new Array()
                });
                return 0;
            } else {
                return res[0];
            }
        });
        if (check_data == 0) {
            return;
        }
        let para_update = await sqlhelper.update(tableName, update_data, where_data, (err, res) => {
            if (err) {
                callback(err, new Array());
                return 0;
            } else {
                return res;
            }
        });
        if (para_update == 0) {
            return;
        }
        var ActivityArray = {
            TableName: tableName,
            TableID: ID,
            Module: tableName,
            Activity: '2',
            Remark: 'Update ' + tableName + ' module Id No :' + ID,
            UserId: request.UserID,
        }
        Commom.SaveActivityLog(ActivityArray, request);
        message = "Data updated successfully";
    } else {
        ID2 = await sqlhelper.insert(tableName, update_data, (err, res) => {
            if (err) {
                callback(err, new Array());
                return 0;
            } else {
                return res.insertId;
            }
        });
        if (ID2 == 0) {
            return;
        }
        var ActivityArray = {
            TableName: tableName,
            TableID: ID2,
            Module: tableName,
            Activity: '1',
            Remark: 'Insert ' + tableName + ' module Id No :' + ID2,
            UserId: request.UserID,
        }
        Commom.SaveActivityLog(ActivityArray, request);
        message = "Data inserted successfully";
    }
    let para_query = 'SELECT ' + fieldshow + ' FROM ' + tableName + ' WHERE ' + IdName + '="' + ID2 + '"';
    let para_data = await sqlhelper.select(para_query, [], (err, res) => {
        if (err) {
            callback(err, new Array());
            return 0;
        } else {
            return res[0];
        }
    })
    if (para_data == 0) {
        return;
    }
    callback(null, {
        'Status': '1',
        'message': message,
        'data': para_data
    });
}

Service.ApiMapping = async (request, callback) => {
    if (request.ProviderID == 0) {
        callback(null, {
            'data': []
        });
        return;
    }
    var mapping_array = {
        '1': {
            '0_AccommodationName': '',
            '0_AddressLine1': '',
            '0_AddressLine2': '',
            '0_PropertyLink': '',
            '0_Latitude': '',
            '0_Longitude': '',
            '0_CountryID': '',
            '0_StateID': '',
            '0_CityID': '',
            '0_PostCode': '',
            '0_Area': '',
            '0_PropertyType': '',
            '0_PropertyDescription': '',
            '0_AccommodationMainPhoto': '',
            '0_FloorPlanPhoto': '',
            '0_IsFeatures': '',
            '0_IsApprove': '',
            '0_ApiID': '',
            '0_NightlyRate': '',
            '0_WeeklyRate': '',
            '0_MonthlyRate': '',
        },
        '2': {
            '0_GalleryData': '',
            '0_MediaType': '',
            '0_Caption': '',
            '0_Description': '',
            '0_MediaFile': '',
        },
        '3': {
            '0_FeaturesID': '',
            // '0_FeaturesName': '',
        },
        '4': {
            '0_OfferData': '',
            '0_Offer': '',
            '0_Description': '',
        },
        '5': {
            '0_FaqData': '',
            '0_Question': '',
            '0_Answer': '',
        },
        '6': {
            '0_Prefix': '',
            '0_Name': '',
            '0_Designation': '',
            '0_PhoneNo': '',
            '0_Email': '',
            '0_Description': '',
        },
        '7': {
            '0_Rules': '',
        },
        '8': {
            '0_Description': '',
            '0_Rate': '',
        },
        '9': {
            '0_RoomData': '',
            '0_RoomCategory': '',
            '0_RentTypeID': '',
            '0_ShortDescription': '',
            '0_CurrencyID': '',
            '0_TotalRooms': '',
            '0_CarpetArea': '',
            '0_TotalBeds': '',
            '0_DeposoitAmount': '',
        },
        '10': {
            '0_MediaType': '',
            '0_Caption': '',
            '0_Description': '',
            '0_MediaFile': '',
        },
        '11': {
            '0_FeaturesID': '',
            // '0_FeaturesName': '',
        },
        '12': {
            '0_IntakeTypeID': '',
            '0_RentAmount': '',
            '0_MinTenture': '',
            '0_MaxTenture': '',
            '0_MinIntakYearID': '',
            '0_MaxIntakYearID': '',
            '0_NightlyRate': '',
            '0_WeeklyRate': '',
            '0_MonthlyRate': '',
            '0_StartDate': '',
            '0_EndDate': '',
            '0_DeposoitAmount': '',
        },
    };

    let query = 'SELECT CAST(MappingID as CHAR) as MappingID, TableID, SystemColumn, ProviderColumn FROM Accommodation_Mapping WHERE ProviderID=?';
    var mapping_data = await sqlhelper.select(query, [request.ProviderID], (err, res) => {
        if (err) {
            console.log(err);
            return [];
        } else {
            return res;
        }
    });

    var final_mapping_data = {};
    if (mapping_data.length > 0) {
        var table_wise_grouped = _.mapValues(_.groupBy(mapping_data, 'TableID'),
            clist => clist.map(mapping_data => _.omit(mapping_data, 'TableID')));

        _.each(mapping_array, (maData, maIndax) => {
            if (final_mapping_data[maIndax] == undefined) {
                final_mapping_data[maIndax] = maData;
            }

            if (table_wise_grouped[maIndax] != undefined && table_wise_grouped[maIndax].length > 0) {
                let tmp_mapping_data = table_wise_grouped[maIndax];
                _.each(tmp_mapping_data, (tmData, tmIndex) => {
                    let old_tKey = '0_' + tmData['SystemColumn'];
                    let new_tKey = tmData['MappingID'] + '_' + tmData['SystemColumn'];

                    if (final_mapping_data[maIndax][old_tKey] != undefined) {
                        delete final_mapping_data[maIndax][old_tKey];
                        final_mapping_data[maIndax][new_tKey] = tmData['ProviderColumn'];
                    }
                });
            }
        });
    } else {
        final_mapping_data = mapping_array;
    }

    var final_mapping_array = {};
    _.each(final_mapping_data, (tableData, tableKay) => {
        final_mapping_array[tableKay] = [];
        _.each(tableData, (f_value, f_key) => {
            final_mapping_array[tableKay].push({
                'MappingID': f_key.split('_')[0],
                'TableID': tableKay,
                'SystemColumn': f_key.split('_')[1],
                'ProviderColumn': f_value,
                'ProviderID': request.ProviderID,
            });
        });
    })

    callback(null, final_mapping_array);
}

Service.AddApiMapping = async (RequestData, request, callback) => {

    let tableName = RequestData.tableName;
    let IdName = RequestData.IdName;
    let update_data = RequestData.update_data;
    let where_data = RequestData.where_data;
    let insert_data = RequestData.insert_data;
    // console.log("update_data---------------------")
    // console.log(update_data)
    var message = "";
    let ID2;
    let para_update = await sqlhelper.batch_update(tableName, update_data, IdName, (err, res) => {
        if (err) {
            callback(err, new Array());
            return 0;
        } else {
            return res;
        }
    });
    if (para_update == 0) {
        return;
    }
    message = "Data Updated successfully";

    if (insert_data != "") {
        ID2 = await sqlhelper.batch_insert(tableName, insert_data, (err, res) => {
            if (err) {
                callback(err, new Array());
                return 0;
            } else {
                return res.insertId;
            }
        });
        if (ID2 == 0) {
            return;
        }
        message = "Data inserted successfully";
    }
    callback(null, {
        'Status': '1',
        'message': message,
        'data': []
    });
}

Service.BookingStatusUpdate = async (request, callback) => {
    let update_data = {};
    let where_data = {};
    where_data = {
        'BookingID': request.BookingID,
    };
    update_data['Remark'] = request.Remark;
    update_data['Status'] = request.Status;
    update_data['UpdateBy'] = request.UserID;
    update_data['UpdateDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
    update_data['UpdateIP'] = request.IpAddress;

    let ID = request.BookingID;
    var message = "";
    if (ID > 0) {
        let check_query = `SELECT uo.Subtotal as TotalAmount,uo.Status as OrderStatus,ar.ChannelPartnerID,ar.StudentID,ar.BookingID,ar.OrderID ,ar.Status,acc.AccommodationName,st.FirstName as StudentName
        from Accommodation_BookingRequest as ar left join Student as st on st.StudentID = ar.StudentID
        left join Accommodation as acc on acc.AccommodationID = ar.AccommodationID
        left join User_Order as uo on uo.OrderID = ar.OrderID
        WHERE BookingID=? limit 1`;
        let BookingData = await sqlhelper.select(check_query, [ID], (err, res) => {
            if (err) {
                console.log(err);
                callback(err, new Array());
                return -1;
            } else if (_.isEmpty(res)) {
                callback(null, {
                    'message': 'Data not found',
                    'data': new Array()
                });
                return -1;
            } else {
                return res[0];
            }
        });
        if (BookingData == -1) {
            return;
        }

        let para_update = await sqlhelper.update('Accommodation_BookingRequest', update_data, where_data, (err, res) => {
            if (err) {
                console.log(err);
                callback(err, new Array());
                return -1;
            } else {
                return res;
            }
        });
        console.log(`Cp ID ${BookingData.ChannelPartnerID}`);
        if (para_update === -1) {
            return;
        } else if (BookingData.ChannelPartnerID) {
            message = "Data updated successfully";
            let LedgerID = await Commom.GetLedgerID(BookingData.ChannelPartnerID);
            let Amount = BookingData.TotalAmount;
            if (request.Status == '3' && BookingData.Status != '3' && (BookingData.OrderStatus == '1' || BookingData.OrderStatus == '3') && BookingData.ChannelPartnerID != 0) {
                // if (request.Status == '3' && BookingData.Status != '3' && BookingData.OrderStatus == '1' && BookingData.ChannelPartnerID != 0) {
                if (LedgerID && BookingData.OrderID) {
                    let User_Order = { 'Status': '2' };
                    Amount = request.Amount;
                    User_Order['Subtotal'] = request.Amount;
                    User_Order['OrderAmount'] = request.Amount;
                    let CommRequest = {
                        'LedgerID': LedgerID,
                        'Amount': Amount,
                        'OrderID': BookingData.OrderID,
                        'narretion': BookingData.StudentID + ' Student Accommodation Booking Order Commission',
                        'OrderTypeID': '5'
                    }
                    let Data = await Commom.Ac_Wallet_Transaction_Entry(CommRequest);
                    // console.log("Result For Common Commision fun ---> "+Data);
                    if (Data == 1) {
                        let FinalBalance = await Commom.BalanceCalculation(LedgerID);
                        // console.log("FinalBalance Final  Balance -->" + FinalBalance);
                        await sqlhelper.update('ChannelPartner', { 'Balance': FinalBalance }, { 'LedgerID': LedgerID }, (err, res) => {
                            if (err) console.log(err);
                            else console.log("ChannelPartner Updated For Balance");
                        });
                        await sqlhelper.update('User_Order', User_Order, { 'OrderID': BookingData.OrderID }, (err, res) => {
                            if (err) console.log(err);
                            else console.log("OrderID Status Update");
                        });
                        message = "Data updated successfully And Channel Partner Commssion send";
                        try {
                            let message_notti = Commom.GetNotificationMessage('BookingStatusUpdate').replace('{{ServiceName}}', BookingData.AccommodationName).replace('{{StudentName}}', BookingData.StudentName);
                            var ActivityArray = {
                                StudentID: BookingData.StudentID,
                                ChannelPartnerID: BookingData.ChannelPartnerID,
                                Message: message_notti,
                                Process: 'BookingStatusUpdate',
                                ProcessType: '1',
                                ProcessID: BookingData.OrderID,
                                ProcessSlug: 'Bookingrequest',
                            }
                            await Commom.SaveNotificationLog(ActivityArray, request);
                        } catch (error) {
                            console.log("Notification not inert -----");
                        }
                    } else {
                        await sqlhelper.select(`delete from User_Order where OrderID=?`, [BookingData.OrderID], (err, res) => {
                            if (err) console.log(err);
                        });
                    }
                } else {
                    console.log("Error : Not get any Commission ===> ");
                }
            } else {
                // Reject Entry
                if ((request.Status == '1' || request.Status == '4') && BookingData.OrderStatus == '2') {
                    if (LedgerID && BookingData.OrderID) {
                        let CommRequest = {
                            'LedgerID': LedgerID,
                            'Amount': Amount,
                            'OrderID': BookingData.OrderID,
                            'narretion': BookingData.StudentID + ' Student Accommodation Booking Order reverse commission after reject',
                            'OrderTypeID': '5'
                        }
                        let Data = await Commom.Ac_Wallet_Reverse_Transaction_Entry(CommRequest);
                        // console.log("Result For Common Commision fun ---> "+Data);
                        if (Data == 1) {
                            let FinalBalance = await Commom.BalanceCalculation(LedgerID);
                            console.log("FinalBalance Final  Balance -->" + FinalBalance);
                            await sqlhelper.update('ChannelPartner', { 'Balance': FinalBalance }, { 'LedgerID': LedgerID }, (err, res) => {
                                if (err) console.log(err);
                                else console.log("ChannelPartner Updated For Balance");
                            });
                            message = "Data updated successfully And Channel Partner Commssion send";
                        } else {
                            await sqlhelper.select(`delete from User_Order where OrderID=?`, [BookingData.OrderID], (err, res) => {
                                if (err) console.log(err);
                            });
                        }
                    }
                }

                let ChangeOrderStatus = '1';
                if (request.Status == '4') { ChangeOrderStatus = '3'; }
                await sqlhelper.update('User_Order', { 'Status': ChangeOrderStatus }, { 'OrderID': BookingData.OrderID }, (err, res) => {
                    if (err) console.log(err);
                    else console.log("OrderID Status Update");
                });
            }
            
            try {
                let message_notti = Commom.GetNotificationMessage('BookingStatusUpdate').replace('{{ServiceName}}', BookingData.AccommodationName).replace('{{StudentName}}', BookingData.StudentName);
                var ActivityArray = {
                    StudentID: BookingData.StudentID,
                    ChannelPartnerID: BookingData.ChannelPartnerID,
                    Message: message_notti,
                    Process: 'BookingStatusUpdate',
                    ProcessType: '1',
                    ProcessID: BookingData.OrderID,
                    ProcessSlug: 'Bookingrequest',
                }
                await Commom.SaveNotificationLog(ActivityArray, request);
            } catch (error) {
                console.log("Notification not inert -----");
            }
        }
    }
    callback(null, {
        'Status': '1',
        'message': message,
        'data': {}
    });
}


Service.InquiryStatusUpdate = async (RequestData, request, callback) => {
    console.log("object");
    let update_data = {};
    let where_data = {};
    where_data = {
        'InquiryID': request.InquiryID,
    };
    update_data['ReplyMessage'] = request.Remark;
    update_data['Status'] = request.Status;
    update_data['UpdateBy'] = request.UserID;
    update_data['UpdateDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
    update_data['UpdateIP'] = request.IpAddress;

    var message = "";

    if (request.InquiryID > 0) {
        let check_query = `SELECT uo.Subtotal as TotalAmount,uo.Status as OrderStatus,si.ChannelPartnerID,si.StudentID,si.ServiceID,si.InquiryID,si.OrderID,st.FirstName as StudentName,ms.Name as ServiceName
        from Student_Inquiry as si left join Student as st on st.StudentID = si.StudentID 
        left join Mst_Services as ms on ms.ServiceID = si.ServiceID
        left join User_Order as uo on uo.OrderID = si.OrderID
        WHERE InquiryID=? limit 1`;
        let InquiryData = await sqlhelper.select(check_query, [request.InquiryID], (err, res) => {
            if (err) {
                callback(err, new Array());
                return -1;
            } else if (_.isEmpty(res)) {
                callback(null, {
                    'message': 'Data not found',
                    'data': new Array()
                });
                return -1;
            } else {
                return res[0];
            }
        });

        if (InquiryData == -1) {
            return;
        }

        let OrderTypeID = "3";
        if (InquiryData.ServiceID == '8') {
            OrderTypeID = "2";
        }

        let InquiryUpdate = await sqlhelper.update('Student_Inquiry', update_data, where_data, (err, res) => {
            if (err) {
                callback(err, new Array());
                return -1;
            } else {
                return res;
            }
        });

        if (InquiryUpdate === -1) {
            return;
        } else if (InquiryData.ChannelPartnerID) {
            message = "Data updated successfully";
            // console.log(InquiryData);
            let LedgerID = await Commom.GetLedgerID(InquiryData.ChannelPartnerID);
            let Amount = InquiryData.TotalAmount;
            if (request.Status == '3' && (InquiryData.OrderStatus == '1' || InquiryData.OrderStatus == '3') && InquiryData.ChannelPartnerID != 0) {
                // let totalInquiryOrder = await Commom.getTotalInquiryOrder(InquiryData.StudentID);
                let totalInquiryOrder = 0;
                let status_complet_query = `SELECT COUNT(*) as Total FROM User_Order WHERE 1 AND ReferID = ? AND  Status = 2 AND OrderTypeID IN(3)`;
                totalInquiryOrder = await sqlhelper.select(status_complet_query, [InquiryData.StudentID, InquiryData.ChannelPartnerID], (err, res) => {
                    if (err) {
                        callback(err, new Array());
                        return -1;
                    } else if (_.isEmpty(res)) {
                        return 1;
                    } else {
                        return res[0]['Total'];
                    }
                });

                if (totalInquiryOrder === -1) {
                    return;
                }

                if ((totalInquiryOrder < 2 || InquiryData.ServiceID == '8') && LedgerID && InquiryData.OrderID) {
                    let User_Order = { 'Status': '2' };
                    if(InquiryData.ServiceID=='8') {
                        Amount = request.Amount;
                        User_Order['Subtotal'] = request.Amount;
                        User_Order['OrderAmount'] = request.Amount;
                    }
                    let CommRequest = {
                        'LedgerID': LedgerID,
                        'Amount': Amount,
                        'OrderID': InquiryData.OrderID,
                        'narretion': InquiryData.StudentID + ' Student Inquiry Commission',
                        'OrderTypeID': OrderTypeID
                    }

                    let Data = await Commom.Ac_Wallet_Transaction_Entry(CommRequest);
                    console.log("Result For Common Commision fun ---> " + Data);
                    if (Data == 1) {
                        let FinalBalance = await Commom.BalanceCalculation(LedgerID);
                        console.log("FinalBalance Final  Balance -->" + FinalBalance);

                        await sqlhelper.update('ChannelPartner', { 'Balance': FinalBalance }, { 'LedgerID': LedgerID }, (err, res) => {
                            if (err) console.log(err);
                            else console.log("ChannelPartner Updated For Balance");
                        });
                        await sqlhelper.update('User_Order', User_Order, { 'OrderID': InquiryData.OrderID }, (err, res) => {
                            if (err) console.log(err);
                            else console.log("OrderID Status Update");
                        });

                        message = "Data updated successfully And Channel Partner Commission send";
                    } else {
                        await sqlhelper.select(`delete from User_Order where OrderID=?`, [InquiryData.OrderID], (err, res) => {
                            if (err) console.log(err);
                        });
                    }
                } 
            } else {
                // Reject Entry
                if ((request.Status == '1' || request.Status == '4') && InquiryData.OrderStatus == '2') {
                    console.log(request.Status + " -------------> Reject");
                    if (LedgerID && InquiryData.OrderID) {
                        let CommRequest = {
                            'LedgerID': LedgerID,
                            'Amount': Amount,
                            'OrderID': InquiryData.OrderID,
                            'narretion': InquiryData.StudentID + ' Student Inquiry Commission Order reverse commission after reject',
                            'OrderTypeID': OrderTypeID
                        }
                        let Data = await Commom.Ac_Wallet_Reverse_Transaction_Entry(CommRequest);
                        // console.log("Result For Common Commision fun ---> "+Data);
                        if (Data == 1) {
                            let FinalBalance = await Commom.BalanceCalculation(LedgerID);
                            console.log("FinalBalance Final  Balance -->" + FinalBalance);
                            await sqlhelper.update('ChannelPartner', { 'Balance': FinalBalance }, { 'LedgerID': LedgerID }, (err, res) => {
                                if (err) console.log(err);
                                else console.log("ChannelPartner Updated For Balance");
                            });
                            message = "Data updated successfully And Channel Partner Commssion send";
                        } else {
                            await sqlhelper.select(`delete from User_Order where OrderID=?`, [InquiryData.OrderID], (err, res) => {
                                if (err) console.log(err);
                            });
                        }
                    }
                }

                let ChangeOrderStatus = '1';
                if (request.Status == '4') { ChangeOrderStatus = '3'; }

                await sqlhelper.update('User_Order', { 'Status': ChangeOrderStatus }, { 'OrderID': InquiryData.OrderID }, (err, res) => {
                    if (err) console.log(err);
                    else {
                        console.log("Not Order Found And not get commission");
                    }
                });
            }

            try {
                let message_notti = Commom.GetNotificationMessage('InquiryStatusUpdate').replace('{{ServiceName}}', 'Service').replace('{{StudentName}}', InquiryData.StudentName);
                var NotiArray = {
                    StudentID: InquiryData.StudentID,
                    ChannelPartnerID: InquiryData.ChannelPartnerID,
                    Message: message_notti,
                    Process: 'InquiryStatusUpdate',
                    ProcessType: '2',
                    ProcessID: InquiryData.OrderID,
                    ProcessSlug: 'studentinquiry',
                }
                await Commom.SaveNotificationLog(NotiArray, request);
            } catch (error) {
                console.log("Notification not inert -----");
            }
        }

        var ActivityArray = {
            TableName: 'Student_Inquiry',
            TableID: request.InquiryID,
            Module: 'Student_Inquiry',
            Activity: '2',
            Remark: 'Update Student_Inquiry module Id No :' + request.InquiryID,
            UserId: request.UserID,
        }
        Commom.SaveActivityLog(ActivityArray, request);

        message = "Data updated successfully";
    }
    callback(null, {
        'Status': '1',
        'message': message,
        'data': []
    });
}

Service.GenerateExcel = async (query, where_array, FileName = '', callback) => {
    var Data = await sqlhelper.select(query, where_array, (err, res) => {
        if (err) {
            callback(err, new Array());
            return 0;
        } else if (_.isEmpty(res)) {
            callback(null, {
                'status': '0',
                'message': 'Data not found',
                'data': new Array()
            });
            return 0;
        } else {
            return res;
        }
    });
    if (Data == 0) {
        return;
    }
    callback(null, {
        'status': '1',
        'message': "File exported successfully",
        'data': Data
    });
}

Service.AccGenerateExcel = async (query, where_array, FileName = '', callback) => {
    console.log("object");
    var Data = await sqlhelper.select(query, where_array, (err, res) => {
        if (err) {
            callback(err, new Array());
            return 0;
        } else if (_.isEmpty(res)) {
            callback(null, {
                'status': '0',
                'message': 'Data not found',
                'data': ''
            });
            return 0;
        } else {
            return res;
        }
    });
    if (Data == 0) {
        return;
    }
    console.log(Data);
    // GetUrl=Data;
    for (const [key, value] of Object.entries(Data)) {
        console.log('First Loop Key ------> ' + key);
        let AccSlug = await Commom.GenerateAccSlug(value.AccommodationName, value.CountryName, value.StateName, value.CityName, value.UniqueID);
        Data[key].Link = AccSlug;
        // delete Data[key].room_status;
        if (Data[key].Miles) delete Data[key].Miles;
        if (value.Intake_Name != undefined && value.Intake_Name != null && value.Intake_Name != '') {
            let newIntake_Name = ''
            if (value.Intake_Name.includes(' to ')) {
                let newIntakeArray = value.Intake_Name.split(' to ');
                newIntake_Name = newIntakeArray[0] + ' ' + value.MIN_YEAR + ' to ' + newIntakeArray[1] + ' ' + value.MAX_YEAR
            } else if (value.Intake_Name != 'All Intake') {
                if (value.MIN_YEAR == value.MAX_YEAR) {
                    newIntake_Name = value.Intake_Name + ' ' + value.MIN_YEAR;
                } else {
                    newIntake_Name = value.Intake_Name + ' ' + value.MIN_YEAR + ' to ' + value.Intake_Name + ' ' + value.MAX_YEAR;
                }
            }
            else {
                newIntake_Name = value.Intake_Name;
            }
            // console.log(newIntake_Name);
            value.Intake_Name = newIntake_Name;
        }
        delete Data[key].UniqueID;
    }
    let GetUrl = await Commom.GenerateExcel(Data, 'AccommodationExcel');
    console.log(GetUrl);
    callback(null, {
        'status': '1',
        'message': "File exported successfully",
        'data': GetUrl
    });
}

Service.StudentWorkExpXlsImport = async (TableName, Data, Request, callback) => {
    for (let [Index, Obj] of Data.entries()) {
        let query = `select StudentID from Student where OldStudentID = ` + Obj.StudentID;
        var StudentID = await sqlhelper.select(query, [], (err, res) => {
            if (err) {
                return 0;
            } else if (_.isEmpty(res)) {
                return 0;
            } else {
                return res.StudentID;
            }
        });
        Obj.StudentID = StudentID;
        if (Obj.WorkFrom != undefined && Obj.WorkFrom != null && Obj.WorkFrom != "-") {
            Obj.WorkFrom = moment(Obj.WorkFrom).format('YYYY-MM-DD HH:mm:ss');
        }
        if (Obj.WorkTo != undefined && Obj.WorkTo != null && Obj.WorkTo != "-") {
            Obj.WorkTo = moment(Obj.WorkTo).format('YYYY-MM-DD HH:mm:ss');
        }
        if (Obj.TotalYear != undefined && Obj.TotalYear != null && Obj.TotalYear != "-") {
            Obj.TotalYear = moment(Obj.TotalYear).format('YYYY-MM-DD HH:mm:ss');
        }
        if (Obj.EntryDate != undefined && Obj.EntryDate != null && Obj.EntryDate != "-") {
            Obj.EntryDate = moment(Obj.EntryDate).format('YYYY-MM-DD HH:mm:ss');
        }
        if (Obj.UpdateDate != undefined && Obj.UpdateDate != null && Obj.UpdateDate != "-") {
            Obj.UpdateDate = moment(Obj.UpdateDate).format('YYYY-MM-DD HH:mm:ss');
        }
        Data[Index] = JSON.parse(JSON.stringify(Obj, function (key, value) {
            return (value == '-') ? "" : value
        }));
    }
    // console.log(Data);
    let BatchInsert = await sqlhelper.batch_insert(TableName, Data, (err, res) => {
        if (err) {
            callback(err, new Array());
            return 0;
        } else {
            return res;
        }
    });
    if (BatchInsert == 0) {
        return;
    }
    callback(null, {
        'status': '1',
        'message': "Successfully Import file"
    });
}

Service.StudentExamXlsImport = async (TableName, Data, Request, callback) => {
    for (let [Index, Obj] of Data.entries()) {
        let query = `select StudentID from Student where OldStudentID = ` + Obj.StudentID;
        var StudentID = await sqlhelper.select(query, [], (err, res) => {
            if (err) {
                return 0;
            } else if (_.isEmpty(res)) {
                return 0;
            } else {
                return res.StudentID;
            }
        });
        Obj.StudentID = StudentID;
        if (Obj.ExamDate != undefined && Obj.ExamDate != null && Obj.ExamDate != "-") {
            Obj.ExamDate = moment(Obj.ExamDate).format('YYYY-MM-DD HH:mm:ss');
        }
        if (Obj.EntryDate != undefined && Obj.EntryDate != null && Obj.EntryDate != "-") {
            Obj.EntryDate = moment(Obj.EntryDate).format('YYYY-MM-DD HH:mm:ss');
        }
        if (Obj.UpdateDate != undefined && Obj.UpdateDate != null && Obj.UpdateDate != "-") {
            Obj.UpdateDate = moment(Obj.UpdateDate).format('YYYY-MM-DD HH:mm:ss');
        }
        Data[Index] = JSON.parse(JSON.stringify(Obj, function (key, value) {
            return (value == '-') ? "" : value
        }));
    }
    // console.log(Data);
    let BatchInsert = await sqlhelper.batch_insert(TableName, Data, (err, res) => {
        if (err) {
            callback(err, new Array());
            return 0;
        } else {
            return res;
        }
    });
    if (BatchInsert == 0) {
        return;
    }
    callback(null, {
        'status': '1',
        'message': "Successfully Import file"
    });
}

Service.ServiceProviderXlsImport = async (TableName, Data, Request, callback) => {
    // console.log(Data);
    for (let [Index, Obj] of Data.entries()) {
        if (Obj['MediaImage'] != '') {
            if (typeof (Obj['MediaImage']) == 'string') {
                if (Obj['MediaImage'].includes('Content')) {
                    Obj['MediaImage'] = 'http://uat.ocxee.com' + Obj['MediaImage'];
                    photoFileUrl = new URL(Obj['MediaImage']);
                    photoURL = photoFileUrl.href;
                } else {
                    photoURL = Obj['MediaImage'];
                }
            }
            if (photoURL != '') {
                let file_name = moment().format('x') + '.jpg';
                let file_data = await upload.GetFileUrlToBufferData(photoURL, file_name);
                // console.log(file_data);
                if (file_data.status == '1') {
                    var file_nametmp = awsKey.AWSs3Key.Mst_Services + '/' + moment().format('x') + '.' + file_data.fileext;
                    let file = {
                        file_name: file_nametmp,
                        base64: file_data.data,
                        type: file_data.fileMime,
                    };
                    let ImagePath = await upload.uploadToS3(file);
                    Obj['MediaImage'] = ImagePath[0];
                }
            }
        }
        Data[Index] = JSON.parse(JSON.stringify(Obj, function (key, value) {
            return (value == '-') ? "" : value
        }));
    }
    // console.log(Data);
    let BatchInsert = await sqlhelper.batch_insert(TableName, Data, (err, res) => {
        if (err) {
            callback(err, new Array());
            return 0;
        } else {
            return res;
        }
    });
    if (BatchInsert == 0) {
        return;
    }
    callback(null, {
        'status': '1',
        'message': "Successfully Import file"
    });
}

Service.CustomRegistrationStudent = async (request, callback) => {
    let FinalData = {
        oldrefData: [],
        NewInsertData: [],
        NewUpdateData: []
    };
    let query = "select InquiryID,FirstName,MiddleName,LastName,Email,PhoneNo_CountryCode,PhoneNo from Student_Inquiry where StudentID='0'";
    var InsertData = await sqlhelper.select(query, [], (err, res) => {
        if (err) {
            return -1;
        } else {
            return res;
        }
    });
    if (InsertData == -1) {
        FinalData = InsertData;
        return;
    }
    for (const [key, value] of Object.entries(InsertData)) {
        let checkData = `select * from Student where Email = '` + value.Email + `' OR PhoneNo='` + value.PhoneNo + `'`;
        var IsInsert = await sqlhelper.select(checkData, [], async (err, res) => {
            if (err) {
                return -1;
            } else if (_.isEmpty(res)) {
                return 1;
            } else {
                let updateData = {
                    'StudentID': res[0].StudentID
                }
                // let update = await sqlhelper.update('Student_Inquiry', updateData, {InquiryID : value.InquiryID}, (err, res) => {
                //     if (err) {
                //         callback(err, new Array());
                //         return 0;
                //     } else {
                //         console.log("Old Data update "+value.InquiryID);
                //         return res;
                //     }
                // });
                FinalData['oldrefData'].push(updateData);
                if (update == 0) {
                    return;
                }
                return "Done";
            }
        });
        console.log(IsInsert);
        if (IsInsert == 1) {
            let insertData = {
                "FirstName": value.FirstName,
                "MiddleName": value.MiddleName,
                "LastName": value.LastName,
                "Email": value.Email,
                "PhoneNo_CountryCode": value.PhoneNo_CountryCode,
                "PhoneNo": value.PhoneNo,
            }
            insertData['EntryDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
            // let studentID = await sqlhelper.insert('Student', insertData, (err, res) => {
            //     if (err) {
            //         callback(err, new Array());
            //         return 0;
            //     } else {
            //         console.log("New student Data insert "+res.insertId);
            //         return res.insertId;
            //     }
            // });
            if (studentID == 0) {
                return;
            }
            let updateData = {
                'StudentID': studentID
            }
            FinalData['NewInsertData'].push(insertData);
            // let update = await sqlhelper.update('Student_Inquiry', updateData, {InquiryID : value.InquiryID}, (err, res) => {
            //     if (err) {
            //         callback(err, new Array());
            //         return 0;
            //     } else {
            //         console.log("New inquiry update "+value.InquiryID);
            //         return res;
            //     }
            // });
            FinalData['NewUpdateData'].push(updateData);

            if (update == 0) {
                return;
            }
        }
    }
    callback(null, {
        'status': '1',
        'message': "Successfully Add",
        'data': FinalData
    });
}

Service.DeleteCustomInquiry = async (request, callback) => {
    let FinalData = [];
    let query = "select StudentID,InquiryID,FirstName,MiddleName,LastName,Email,PhoneNo_CountryCode,PhoneNo from Student_Inquiry";
    var InsertData = await sqlhelper.select(query, [], (err, res) => {
        if (err) {
            return -1;
        } else {
            return res;
        }
    });
    if (InsertData == -1) {
        FinalData = InsertData;
        return;
    }
    let i = 1;
    for (const [key, value] of Object.entries(InsertData)) {
        let checkData = `select * from Student where StudentID = ` + value.StudentID;
        var IsInsert = await sqlhelper.select(checkData, [], async (err, res) => {
            if (err) {
                return -1;
            } else if (_.isEmpty(res)) {
                FinalData.push(value.StudentID);
                console.log("data delete " + value.StudentID);
                return 1;
            } else {
                return "No Delete " + i;
            }
        });
        // console.log(IsInsert);
        i++;
    }
    callback(null, {
        'status': '1',
        'message': "Successfully Add",
        'data': FinalData
    });
}

Service.UpdateAccLocation = async (RequestData, request, callback) => {
    let EditCityID = request.CityID;
    if (request.CountryID && request.StateID && request.CityName != undefined && request.CityName != '') {
        let InsertCityData = {
            CountryID: request.CountryID,
            StateID: request.StateID,
            CityName: request.CityName
        }
        EditCityID = await sqlhelper.insert('Mst_City', InsertCityData, (err, res) => {
            if (err) {
                callback(err, new Array());
                return 0;
            } else {
                return res.insertId;
            }
        });
    }

    if (request.CountryID != undefined && request.CountryID != null && request.CountryID != '' && request.CountryID != 0) {
        let AcceptedValueCountry = request.AcceptedValueCountry;
        // +` and FIND_IN_SET(`+AcceptedValueCountry+`,AcceptedValue))`
        let query = `select CountryID,AcceptedValue,CountryName from Mst_Country where CountryID=` + request.CountryID;
        var AData = await sqlhelper.select(query, [], (err, res) => {
            if (err) {
                return -1;
            } else {
                let AValue = res[0].AcceptedValue;
                let status = 1;
                if (AValue != '') {
                    AValue = AValue.split(',');
                    if (AValue.includes(AcceptedValueCountry)) {
                        status = 0;
                    } else {
                        AcceptedValueCountry = res[0].AcceptedValue + ',' + AcceptedValueCountry;
                        status = 1;
                    }
                }
                if (AcceptedValueCountry == res[0].CountryName) {
                    status = 0;
                }
                return status;
            }
        });
        if (AData == -1) {
            return;
        }
        if (AData == 1) {
            await sqlhelper.update('Mst_Country', {
                AcceptedValue: AcceptedValueCountry
            }, {
                CountryID: request.CountryID
            }, (err, res) => {
                if (err) {
                    console.log(err);
                    callback(err, new Array());
                    return 0;
                } else {
                    return res;
                }
            });
        }
    }
    if (request.StateID != undefined && request.StateID != null && request.StateID != '' && request.StateID != 0) {
        let AcceptedValueState = request.AcceptedValueState;
        let query = `select StateID,AcceptedValue,StateName from Mst_State where StateID=` + request.StateID;
        var AData = await sqlhelper.select(query, [], (err, res) => {
            if (err) {
                return -1;
            } else {
                let AValue = res[0].AcceptedValue;
                let status = 1;
                if (AValue != '') {
                    AValue = AValue.split(',');
                    if (AValue.includes(AcceptedValueState)) {
                        AcceptedValueState = res[0].AcceptedValue;
                        status = 0;
                    } else {
                        AcceptedValueState = res[0].AcceptedValue + ',' + AcceptedValueState;
                        status = 1;
                    }
                }
                if (AcceptedValueState == res[0].StateName) {
                    status = 0;
                }
                return status;
            }
        });
        if (AData == -1) {
            return;
        }
        if (AData == 1) {
            let StateAccpt = await sqlhelper.update('Mst_State', {
                AcceptedValue: AcceptedValueState
            }, {
                StateID: request.StateID
            }, (err, res) => {
                if (err) {
                    console.log(err);
                    callback(err, new Array());
                    return 0;
                } else {
                    return res;
                }
            });
        }
    }
    if (EditCityID != undefined && EditCityID != null && EditCityID != '' && EditCityID != 0) {
        let AcceptedValueCity = request.AcceptedValueCity;
        let query = `select CityID,AcceptedValue,CityName from Mst_City where CityID=` + EditCityID;
        var AData = await sqlhelper.select(query, [], (err, res) => {
            if (err) {
                return -1;
            } else {
                let AValue = res[0].AcceptedValue;
                let status = 1;
                if (AValue != '') {
                    AValue = AValue.split(',');
                    if (AValue.includes(AcceptedValueCity)) {
                        AcceptedValueCity = res[0].AcceptedValue;
                        status = 0;
                    } else {
                        AcceptedValueCity = res[0].AcceptedValue + ',' + AcceptedValueCity;
                        status = 1;
                    }
                }
                if (AcceptedValueCity == res[0].CityName) {
                    status = 0;
                }
                return status;
            }
        });
        if (AData == -1) {
            return;
        }
        if (AData == 1) {
            let CityAccpt = await sqlhelper.update('Mst_City', {
                AcceptedValue: AcceptedValueCity
            }, {
                CityID: EditCityID
            }, (err, res) => {
                if (err) {
                    console.log(err);
                    callback(err, new Array());
                    return 0;
                } else {
                    return res;
                }
            });
        }
    }
    RequestData.update_data['CityID'] = EditCityID;
    let where_data = RequestData.where_data;
    // if(where_data!=undefined && where_data!=null && where_data!=''){
    let para_update = await sqlhelper.update(RequestData.tableName, RequestData.update_data, where_data, (err, res) => {
        if (err) {
            callback(err, new Array());
            return 0;
        } else {
            return res;
        }
    });
    if (para_update == 0) {
        return;
    }
    callback(null, {
        'status': '1',
        'message': "Location updated successfully",
        'data': []
    });
    // }else{
    //     callback(null, {'status' : '1','message' : "Successfully Addd" , 'data' : [] });
    // }
}

Service.AddAccFeatureIssue = async (request, callback) => {
    let FinalResp = [];
    let message = "Data not found";
    let update_data = {};
    let FetureID = request.FetureID;
    // update_data['FeaturesName'] = request.FeaturesName;
    update_data['FeaturesID'] = FetureID;
    let AcceptedValue = request.FeaturesName;
    let query = `select ParameterValueID,AcceptedValue from Mst_ParameterValue where ParameterValueID=` + FetureID + ` AND ParameterTypeID in(1,2,3)`;
    // console.log(query);
    var AData = await sqlhelper.select(query, [], (err, res) => {
        if (err) {
            return -10;
        } else if (_.isEmpty(res)) {
            return -1;
        } else {
            let AValue = res[0].AcceptedValue;
            let status = 1;
            if (AValue != '') {
                AValue = AValue.split(',');
                if (AValue.includes(AcceptedValue)) {
                    status = 0;
                } else {
                    AcceptedValue = res[0].AcceptedValue + ',' + AcceptedValue;
                    status = 1;
                }
            }
            if (AcceptedValue == res[0].CityName) {
                status = 0;
            }
            return status;
        }
    });
    if (AData == -10) {
        return;
    }
    if (AData == 1) {
        let AcceptUpdate = await sqlhelper.update('Mst_ParameterValue', {
            AcceptedValue: AcceptedValue.trim()
        }, {
            ParameterValueID: FetureID,
            ParameterTypeID: '1'
        }, (err, res) => {
            if (err) {
                console.log(err);
                callback(err, new Array());
                return 0;
            } else {
                return res;
            }
        });
    }
    if (AData == 1 || AData == 0) {
        if (request.FeaturesName != undefined && request.FeaturesName != null && request.FeaturesName != '') {
            let FetureUpdate = await sqlhelper.update('Accommodation_Features', update_data, {
                FeaturesName: request.FeaturesName,
                FeaturesID: '15'
            }, (err, res) => {
                if (err) {
                    console.log(err);
                    callback(err, new Array());
                    return 0;
                } else {
                    return res.affectedRows;
                }
            });
            FinalResp = FetureUpdate
            message = "Successfully Maping Feture";
        }
    }
    callback(null, {
        'status': '0',
        'message': message,
        'data': FinalResp
    });
}

Service.AddLandlord = async (RequestData, request, callback) => {

    let tableName = RequestData.tableName;
    let IdName = RequestData.IdName;
    let ID = RequestData.ID;
    let update_data = RequestData.update_data;
    let where_data = RequestData.where_data;
    let fieldshow = RequestData.fieldshow;

    var message = "";
    let ID2 = ID;

    let update_data_provider = {};
    update_data_provider['Name'] = request.Firstname
    update_data_provider['ParentName'] = request.Firstname
    update_data_provider['ImageUrl'] = update_data['logo'];
    update_data_provider['IsOffline'] = '1';
    update_data_provider['Active'] = request.Status;
    if (ID > 0) {
        let check_query = 'SELECT ' + IdName + ' FROM ' + tableName + ' WHERE ' + IdName + '="' + ID + '"';
        let check_data = await sqlhelper.select(check_query, [], (err, res) => {
            if (err) {
                callback(err, new Array());
                return 0;
            } else if (_.isEmpty(res)) {
                callback(null, {
                    'message': 'Data not found',
                    'data': new Array()
                });
                return 0;
            } else {
                return res[0];
            }
        });
        if (check_data == 0) {
            return;
        }
        update_data['UpdateBy'] = request.UserID;
        update_data['UpdateDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
        update_data['UpdateIP'] = request.IpAddress;
        let para_update = await sqlhelper.update(tableName, update_data, where_data, (err, res) => {
            if (err) {
                callback(err, new Array());
                return 0;
            } else {
                return res;
            }
        });
        if (para_update == 0) {
            return;
        }

        update_data_provider['UpdateBy'] = request.UserID;
        update_data_provider['UpdateDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
        update_data_provider['UpdateIP'] = request.IpAddress;
        let provider_update = await sqlhelper.update('Accommodation_Provider', update_data_provider, where_data, (err, res) => {
            if (err) {
                callback(err, new Array());
                return 0;
            } else {
                return res;
            }
        });
        var ActivityArray = {
            TableName: tableName,
            TableID: ID,
            Module: tableName,
            Activity: '2',
            Remark: 'Update ' + tableName + ' module Id No :' + ID,
            UserId: request.UserID,
        }
        Commom.SaveActivityLog(ActivityArray, request);
        message = "Data updated successfully";
    } else {
        update_data['EntryBy'] = request.UserID;
        update_data['EntryDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
        update_data['EntryIP'] = request.IpAddress;
        ID2 = await sqlhelper.insert(tableName, update_data, (err, res) => {
            if (err) {
                callback(err, new Array());
                return 0;
            } else {
                return res.insertId;
            }
        });
        if (ID2 == 0) {
            return;
        }
        update_data_provider['LandlordID'] = ID2;
        update_data_provider['EntryBy'] = request.UserID;
        update_data_provider['EntryDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
        update_data_provider['EntryIP'] = request.IpAddress;
        // console.log(update_data_provider);
        let provider_insert = await sqlhelper.insert('Accommodation_Provider', update_data_provider, (err, res) => {
            if (err) {
                callback(err, new Array());
                return 0;
            } else {
                return res.insertId;
            }
        });

        var ActivityArray = {
            TableName: tableName,
            TableID: ID2,
            Module: tableName,
            Activity: '1',
            Remark: 'Insert ' + tableName + ' module Id No :' + ID2,
            UserId: request.UserID,
        }
        message = "Data inserted successfully";
        Commom.SaveActivityLog(ActivityArray, request);
    }
    let para_query = 'SELECT ' + fieldshow + ' FROM ' + tableName + ' WHERE ' + IdName + '="' + ID2 + '"';
    let para_data = await sqlhelper.select(para_query, [], (err, res) => {
        if (err) {
            callback(err, new Array());
            return 0;
        } else {
            return res[0];
        }
    })

    if (para_data == 0) {
        return;
    }
    callback(null, {
        'Status': '1',
        'message': message,
        'data': para_data
    });
}

Service.AddSeoDescription = async (RequestData, request, callback) => {

    let tableName = RequestData.tableName;
    let IdName = RequestData.IdName;
    let ID = RequestData.ID;
    let update_data = RequestData.update_data;
    let where_data = RequestData.where_data;
    let fieldshow = RequestData.fieldshow;

    var message = "";
    let ID2 = ID;
    if (ID > 0) {
        let check_query = 'SELECT ' + IdName + ' FROM ' + tableName + ' WHERE ' + IdName + '="' + ID + '"';
        let check_data = await sqlhelper.select(check_query, [], (err, res) => {
            if (err) {
                callback(err, new Array());
                return 0;
            } else if (_.isEmpty(res)) {
                callback(null, {
                    'message': 'Data not found',
                    'data': new Array()
                });
                return 0;
            } else {
                return res[0];
            }
        });
        if (check_data == 0) {
            return;
        }
        update_data['UpdateBy'] = request.UserID;
        update_data['UpdateDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
        update_data['UpdateIP'] = request.IpAddress;
        let para_update = await sqlhelper.update(tableName, update_data, where_data, (err, res) => {
            if (err) {
                callback(err, new Array());
                return 0;
            } else {
                return res;
            }
        });
        if (para_update == 0) {
            return;
        }
        var ActivityArray = {
            TableName: tableName,
            TableID: ID,
            Module: tableName,
            Activity: '2',
            Remark: 'Update ' + tableName + ' module Id No :' + ID,
            UserId: request.UserID,
        }
        Commom.SaveActivityLog(ActivityArray, request);
        message = "Data updated successfully";
    } else {
        update_data['EntryBy'] = request.UserID;
        update_data['EntryDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
        update_data['EntryIP'] = request.IpAddress;
        ID2 = await sqlhelper.insert(tableName, update_data, (err, res) => {
            if (err) {
                callback(err, new Array());
                return 0;
            } else {
                return res.insertId;
            }
        });
        if (ID2 == 0) {
            return;
        }
        // let SEO_Content_multiple_Array = [];
        // for (const [key, value] of Object.entries(request.SeoFormArray)) {
        //     let SEO_Content_multiple = {};
        //     SEO_Content_multiple['AccSeoID'] = ID2;
        //     SEO_Content_multiple['Title'] = value.Title;
        //     SEO_Content_multiple['DisplayOrder'] = value.DisplayOrder;
        //     SEO_Content_multiple['Description'] = value.Description;
        //     SEO_Content_multiple['EntryDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
        //     SEO_Content_multiple_Array[key] = SEO_Content_multiple;
        // }
        // let SEO_Content_multiple_insert = await sqlhelper.batch_insert('Accommodation_SEO_Content_multiple', SEO_Content_multiple_Array, (err, res) => {
        //     if (err) {
        //         callback(err, new Array());
        //         return 0;
        //     } else {
        //         return res.insertId;
        //     }
        // });
        var ActivityArray = {
            TableName: tableName,
            TableID: ID2,
            Module: tableName,
            Activity: '1',
            Remark: 'Insert ' + tableName + ' module Id No :' + ID2,
            UserId: request.UserID,
        }
        Commom.SaveActivityLog(ActivityArray, request);
        message = "Data inserted successfully";
    }

    for (const [key, value] of Object.entries(request.SeoFormArray)) {
        let SEO_Content_multiple = {};
        SEO_Content_multiple['AccSeoID'] = ID2;
        SEO_Content_multiple['Title'] = value.Title;
        SEO_Content_multiple['DisplayOrder'] = value.DisplayOrder;
        SEO_Content_multiple['Description'] = value.Description;
        if (value.AccSeoDetailsID > 0) {
            SEO_Content_multiple['UpdateDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
            let SubUpdate = await sqlhelper.update('Accommodation_SEO_Content_multiple', SEO_Content_multiple, {
                'AccSeoDetailsID': value.AccSeoDetailsID
            }, (err, res) => {
                if (err) {
                    callback(err, new Array());
                    return 0;
                } else {
                    return res;
                }
            });
        } else {
            SEO_Content_multiple['EntryDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
            let SubInsert = await sqlhelper.insert('Accommodation_SEO_Content_multiple', SEO_Content_multiple, (err, res) => {
                if (err) {
                    callback(err, new Array());
                    return 0;
                } else {
                    return res.insertId;
                }
            });
        }
    }

    let para_query = 'SELECT ' + fieldshow + ' FROM ' + tableName + ' WHERE ' + IdName + '="' + ID2 + '"';
    let para_data = await sqlhelper.select(para_query, [], (err, res) => {
        if (err) {
            callback(err, new Array());
            return 0;
        } else {
            return res[0];
        }
    })
    if (para_data == 0) {
        return;
    }
    callback(null, {
        'Status': '1',
        'message': message,
        'data': para_data
    });
}
Service.UpdateSigleRecord = async (req, request, callback) => {

    let update_datas = {};
    let where_datas = {};
    let tableName = "";
    let IdName = "";
    let ID = "";
    let update_data = "";
    let where_data = "";
    let para_update
    var fieldshows
    var fieldshow
    let ids = {};
    if (req.body.UserIDS != undefined && req.body.UserIDS != '') {
        ids = req.body.UserIDS.split(',');
        fieldshow = 'CAST(StudentID as CHAR) as ID';
        tableName = 'Student'
        IdName = 'StudentID'
    }
    else if (req.body.InquiryIdList != undefined && req.body.InquiryIdList != '') {
        ids = req.body.InquiryIdList.split(',');
        fieldshow = 'CAST(InquiryID as CHAR) as ID,CurrentCity,CurrentCountry,ServiceID';
        tableName = 'Student_Inquiry'
        IdName = 'InquiryID'
    }
    for (const id of ids) {
        if (req.body.UserIDS != undefined && req.body.UserIDS != '') {
            update_datas['IsStudentVerify'] = 1;
            where_datas = {
                'StudentID': id,
            };
        }
        else if (req.body.InquiryIdList != undefined && req.body.InquiryIdList != '') {
            update_datas['ChannelPartnerID'] = req.body.ChannelPartnerID;
            update_datas['Type'] = 1;
            where_datas = {
                'InquiryID': id,
            };
        }
        ID = id
        update_data = update_datas,
            where_data = where_datas
        // fieldshow = fieldshows
        var message = "";
        let ID2 = ID;
        if (ID > 0) {
            let check_query = 'SELECT ' + fieldshow + ' ,StudentID FROM ' + tableName + ' WHERE ' + IdName + '="' + ID + '"';
            console.log(check_query);
            let check_data = await sqlhelper.select(check_query, [], (err, res) => {
                if (err) {
                    callback(err, new Array());
                    return 0;
                } else if (_.isEmpty(res)) {
                    callback(null, {
                        'message': 'Data not found',
                        'data': new Array()
                    });
                    return 0;
                } else {
                    return res[0];
                }
            });
            if (check_data == 0) {
                return;
            }

            console.log(check_data)
            if (req.body.InquiryIdList != undefined && req.body.InquiryIdList != '') {

                let OrderID = 0;
                let totalInquiryOrder = await Commom.getTotalInquiryOrder(check_data["StudentID"]);


                if (totalInquiryOrder < process.env.CPORDERLIMIT || check_data['ServiceID'] == '8') {
                    // console.log("Success : Success == > " + StatusCompletData);
                    // let Amount = await Commom.GetSettingValue('Student_OtherService_Commission');
                    let StudentCount = await Commom.ReferralStudentCalculation(req.body.ChannelPartnerID);
                    let CommissionData = await Commom.GetCommissionCategory(StudentCount);
                    let Amount = CommissionData.Commission_Per_services;
                    let CityWiseAmoount='';
                    if (check_data['ServiceID'] == '8') {
                        // let week = 0;
                        // week = parseInt((parseInt(request.DurationInMonth) * 30) / 7);
                        // if (week > 0) { Amount = await Commom.GetAccCommissionAmount(week); }
                        // OrderTypeID = '2';
                        OrderTypeID = '2';
                       let GetAmount = await Commom.GetAccCommissionAmount({Country:check_data["CurrentCountry"],City:check_data["CurrentCity"]});
                        Amount=GetAmount.Min;
                        CityWiseAmoount= `${GetAmount.Min}-${GetAmount.Max}`;
                    }
                    let OrderEntry = {
                        'UserID': req.body.ChannelPartnerID,
                        'UserType': 'Channel Partner',
                        'ReferID': check_data["StudentID"],
                        'OrderAmount': Amount,
                        'Subtotal': Amount,
                        'OrderTypeID': '3',
                        'Status': '1',
                        'OrderDate': moment().format('YYYY-MM-DD HH:mm:ss'),
                        'OrderNote': "Student Inquiry Order",
                        'CityWiseAmoount':CityWiseAmoount
                    }

                    OrderID = await sqlhelper.insert('User_Order', OrderEntry, (err, res) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Order Entry Successfully " + res.insertId);
                            return res.insertId;
                        }
                    });
                } else {
                    // console.log("Error : Error == > " + StatusCompletData);
                }

                update_data['UpdateBy'] = request.UserID;
                update_data['UpdateDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
                update_data['UpdateIP'] = request.IpAddress;
                update_data['OrderID'] = OrderID;
                update_data['Type'] = '1';
                para_update = await sqlhelper.update(tableName, update_data, where_data, (err, res) => {
                    if (err) {
                        callback(err, new Array());
                        return 0;
                    } else {
                        return res;
                    }
                });
                if (para_update == 0) {
                    return;
                }
            }
            var ActivityArray = {
                TableName: tableName,
                TableID: ID,
                Module: tableName,
                Activity: '2',
                Remark: 'Update ' + tableName + ' module Id No :' + ID,
                UserId: request.UserID,
            }
            Commom.SaveActivityLog(ActivityArray, request);
            message = "Data updated successfully";
        }
    }
    callback(null, {
        'Status': '1',
        'message': message,
        'data': ''
    });
}
Service.UpdateDocStatus = async (req, request, callback) => {

    // console.log(req.body.AllData)
    let update_datas = {};
    let where_datas = {};
    let tableName = "";
    let IdName = "";
    let update_data = "";
    let where_data = "";
    let fieldshow = "";
    let para_update
    let para_query
    let para_data
    let fieldshows
    let ID = 0;
    ID = req.body.id
    fieldshow = 'CAST(StudentID as CHAR) as ID';
    tableName = 'Student'
    IdName = 'StudentID'
    var jsonarray = JSON.parse(req.body.AllData)
    if (jsonarray["Address"] != undefined && req.body.Address) {
        jsonarray["Address"][1] = 1
    } else { jsonarray["Address"][1] = 0 }
    if (jsonarray["IdentiVerification"] != undefined && req.body.IdentityFile) {
        jsonarray["IdentiVerification"][1] = 1
    } else { jsonarray["IdentiVerification"][1] = 0 }
    if (jsonarray["Additional"] != undefined && req.body.AdditionalFile) {
        jsonarray["Additional"][jsonarray["Additional"].length - 1] = 1
    } else { jsonarray["Additional"][jsonarray["Additional"].length - 1] = 0 }
    update_datas['File'] = JSON.stringify(jsonarray);
    // console.log(update_datas['File'])
    where_datas = {
        'StudentID': ID,
    };
    update_data = update_datas,
        where_data = where_datas
    fieldshow = fieldshows
    var message = "";
    if (ID > 0) {
        let check_query = 'SELECT ' + IdName + ' FROM ' + tableName + ' WHERE ' + IdName + '="' + ID + '"';
        let check_data = await sqlhelper.select(check_query, [], (err, res) => {
            if (err) {
                callback(err, new Array());
                return 0;
            } else if (_.isEmpty(res)) {
                callback(null, {
                    'message': 'Data not found',
                    'data': new Array()
                });
                return 0;
            } else {
                return res[0];
            }
        });
        if (check_data == 0) {
            return;
        }
        update_data['UpdateBy'] = request.UserID;
        update_data['UpdateDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
        update_data['UpdateIP'] = request.IpAddress;
        para_update = await sqlhelper.update(tableName, update_data, where_data, (err, res) => {
            if (err) {
                callback(err, new Array());
                return 0;
            } else {
                return res;
            }
        });
        if (para_update == 0) {
            return;
        }
        var ActivityArray = {
            TableName: tableName,
            TableID: ID,
            Module: tableName,
            Activity: '2',
            Remark: 'Update ' + tableName + ' module Id No :' + ID,
            UserId: request.UserID,
        }
        Commom.SaveActivityLog(ActivityArray, request);
        message = "Data updated successfully";
    }
    callback(null, {
        'Status': '1',
        'message': message,
        'data': JSON.stringify(jsonarray)
    });
}
// Service.UpdateChannelPartner = async (req, request, callback) => {
//     let ids = req.body.InquiryIdList.split(',');
//     let update_datas = {};
//     let where_datas = {};
//     let tableName = "";
//     let IdName = "";
//     let ID = "";
//     let update_data = "";
//     let where_data = "";
//     let fieldshow = "";
//     let para_update
//     let para_query
//     let para_data
//     let fieldshows
//     for (const id of ids) {
//         update_datas['ChannelPartnerID'] = req.body.ChannelPartnerID;
//         update_datas['Type'] = 1;
//         where_datas = {
//             'InquiryID': id,
//         };
//         fieldshow = 'CAST(InquiryID as CHAR) as ID';

//         tableName = 'Student_Inquiry'
//         IdName = 'InquiryID'
//         ID = id
//         update_data = update_datas,
//             where_data = where_datas
//         fieldshow = fieldshows
//         var message = "";
//         let ID2 = ID;
//         if (ID > 0) {
//             let check_query = 'SELECT ' + IdName + ' FROM ' + tableName + ' WHERE ' + IdName + '="' + ID + '"';
//             let check_data = await sqlhelper.select(check_query, [], (err, res) => {
//                 if (err) {
//                     callback(err, new Array());
//                     return 0;
//                 } else if (_.isEmpty(res)) {
//                     callback(null, {
//                         'message': 'Data not found',
//                         'data': new Array()
//                     });
//                     return 0;
//                 } else {
//                     return res[0];
//                 }
//             });
//             if (check_data == 0) {
//                 return;
//             }
//             update_data['UpdateBy'] = request.UserID;
//             update_data['UpdateDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
//             update_data['UpdateIP'] = request.IpAddress;
//             para_update = await sqlhelper.update(tableName, update_data, where_data, (err, res) => {
//                 if (err) {
//                     callback(err, new Array());
//                     return 0;
//                 } else {
//                     return res;
//                 }
//             });
//             if (para_update == 0) {
//                 return;
//             }
//             var ActivityArray = {
//                 TableName: tableName,
//                 TableID: ID,
//                 Module: tableName,
//                 Activity: '2',
//                 Remark: 'Update ' + tableName + ' module Id No :' + ID,
//                 UserId: request.UserID,
//             }
//             Commom.SaveActivityLog(ActivityArray, request);
//             message = "Data updated successfully";
//         }
//     }
//     callback(null, {
//         'Status': '1',
//         'message': message,
//         'data': ''
//     });
// }

Service.AddVideo = async (req, callback) => {
    if (req.files.recfile) {
        if (Object.entries(req.files.recfile).length) {
            resimage = await upload.S3FileUpload(req.files.recfile, 'Mst_Services');
        }
        if (Object.entries(req.files.recfile).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
        }
        callback(null, {
            'Status': '1',
            'message': "Video Uploded Successfully.",
            'data': resimage[0].toString()
        });
    }
}
Service.UpdateChannelPartnerData = async (req, request, callback) => {
    let channelpartnerid = req.body.ChannelPartnerID;
    let AccountManagerID = req.body.AccountManagerID;
    let tableName = "ChannelPartner"
    let update_data = {
        AccountManagerID: parseInt(AccountManagerID)
    }
    let where_data = {
        ChannelPartnerID: parseInt(channelpartnerid)
    }
    try {
        let data = await sqlhelper.update(tableName, update_data, where_data, (err, updateData) => {
            if (err) {
                callback(err, new Array());
                return 0;
            } else {
                callback(null, {
                    'Status': '1',
                    'message': "Manager Uploded Successfully.",
                    'data': updateData
                });
            }
        })
    } catch (err) {
        console.info('---------------------------------')
        console.info('err =>', err)
        console.info('---------------------------------')
    }
}

Service.Mst_WalletList = async (request, callback) => {
    console.log(request)
    let response = {}
    if (!request.isAll) {
        let page = parseInt(_.get(request, "PageNo", 1)) > 0 ? parseInt(_.get(request, "PageNo", 1)) : 1;
        let numPerPage = parseInt(_.get(request, "Limit", 25))

        let LedgerID = _.get(request, "LedgerID", "");
        let CpID = _.get(request, "CpID", "");
        let RefLedgerID = _.get(request, "RefLedgerID", "");
        let fromDate = _.get(request, "FromDate", "");
        let toDate = _.get(request, "ToDate", "");
        let OrderType = _.get(request, "OrderType", "");
        let Narretion = _.get(request, "Narretion", "");

        var skip = (page - 1) * numPerPage
        var limit = skip + ',' + numPerPage;

        let compareDate = "";

        if (fromDate && toDate) {
            compareDate = `AND Ac_Wallet_Transaction.EntryDate >= '${fromDate}' AND Ac_Wallet_Transaction.EntryDate <= '${toDate}'`;
        } else if (fromDate) {
            compareDate = `AND Ac_Wallet_Transaction.EntryDate like '%${fromDate}%'`;
        } else if (toDate) {
            compareDate = `AND Ac_Wallet_Transaction.EntryDate <= '${toDate}'`;
        }
        let compareAmount = "";
        if (request.FromAmount && request.ToAmount) {
            compareAmount = ` AND Ac_Wallet_Transaction.CreditAmount >= '${request.FromAmount}' AND Ac_Wallet_Transaction.CreditAmount <= '${request.ToAmount}' || Ac_Wallet_Transaction.Debitamount >= '${request.FromAmount}' AND Ac_Wallet_Transaction.Debitamount <= '${request.ToAmount}'`;
        } else if (request.FromAmount) {
            compareAmount = ` AND (Ac_Wallet_Transaction.CreditAmount like '%${request.FromAmount}%') || (Ac_Wallet_Transaction.Debitamount like '%${request.FromAmount}%')`;
        } else if (request.ToAmount) {
            compareAmount = `AND (Ac_Wallet_Transaction.CreditAmount <= '${request.ToAmount}') || (Ac_Wallet_Transaction.Debitamount <= '${request.ToAmount}')`;
        }
        where = "";
        console.log(LedgerID);
        if (LedgerID != "0" && LedgerID) {
            where += ` AND Ac_Wallet_Transaction.LedgerID = '${LedgerID}'`;
        }
        if (request.CPID != "0" && request.CPID != undefined) {
            where += ` AND Ac_Wallet_Transaction.LedgerID = '${request.CPID}'`;
        }
        if (RefLedgerID != "0" && RefLedgerID) {
            where += ` AND Ac_Wallet_Transaction.RefLedgerID = '${RefLedgerID}' `;
        }
        if (OrderType) {
            where += ` AND Ac_Wallet_Transaction.OrderTypeID like '%${OrderType}%' `;
        }

        // if (CpID != "0" && CpID) {
        //     where += ` AND Ac_Wallet_Transaction.LedgerID = '${CpID}'`;
        // }

        where += compareDate;
        where += compareAmount;

        let query = `SELECT Ac_Wallet_Transaction.*,Mst_Ledger.LedgerName,UO.Title, ref_ledger.LedgerName as RefLedgerName FROM Ac_Wallet_Transaction 
        LEFT JOIN Mst_Ledger ON Ac_Wallet_Transaction.LedgerID = Mst_Ledger.Ledger_ID
        LEFT JOIN Mst_Ledger as ref_ledger ON Ac_Wallet_Transaction.RefLedgerID = ref_ledger.Ledger_ID
        LEFT JOIN Mst_Transaction as UO on Ac_Wallet_Transaction.OrderTypeID=UO.Transction_Type_ID
        WHERE 1 `+ where + ` 
        ORDER BY Ac_Wallet_Transaction.FasID DESC LIMIT ${limit}`;

        // console.log(query);

        let walletList = await sqlhelper.select(query, [], (err, res) => {
            if (err) {
                callback(err, new Array());
            }
            else return res;
        });
        let query2 = `SELECT AWT.LedgerID,Sum(AWT.CreditAmount) as TCredit,Sum(AWT.Debitamount) as TDebit FROM Ac_Wallet_Transaction as AWT 
        LEFT JOIN Mst_Ledger ON AWT.LedgerID = Mst_Ledger.Ledger_ID
        LEFT JOIN Mst_Ledger as ref_ledger ON AWT.RefLedgerID = ref_ledger.Ledger_ID
        WHERE 1 GROUP By AWT.LedgerID`
        let totalbalance = await sqlhelper.select(query2, [], (err, res) => {
            if (err) {
                callback(err, new Array());
            }
            else return res;
        });
        let totalRecords_query = `SELECT count(*) as records_count FROM Ac_Wallet_Transaction where 1 ` + where;
        let totalRecords = await sqlhelper.select(totalRecords_query, [], (err, res) => {
            if (err) console.log(err);
            else return res;
        });

        response['totalRecords'] = totalRecords[0].records_count;
        response['totalPages'] = Math.ceil(parseInt(totalRecords[0].records_count) / numPerPage)
        response['page'] = page;
        response['pagesize'] = numPerPage;
        response['walletList'] = walletList;
        response['totalbalance'] = totalbalance;
        callback(null, response);
    } else {
        let query = `SELECT Ac_Wallet_Transaction.*,Mst_Ledger.LedgerName, ref_ledger.LedgerName as RefLedgerName FROM Ac_Wallet_Transaction 
        LEFT JOIN Mst_Ledger ON Ac_Wallet_Transaction.LedgerID = Mst_Ledger.Ledger_ID
        LEFT JOIN Mst_Ledger as ref_ledger ON Ac_Wallet_Transaction.RefLedgerID = ref_ledger.Ledger_ID
        ORDER BY Ac_Wallet_Transaction.EntryDate DESC`;
        let walletList = await sqlhelper.select(query, [], (err, res) => {
            if (err) {
                callback(err, new Array());
            }
            else return res;
        });
        response['walletList'] = walletList;
        callback(null, response);
    }
}

Service.Mst_OrderList = async (request, callback) => {
    let response = {}
    if (!request.isAll) {
        let page = parseInt(_.get(request, "PageNo", 1)) > 0 ? parseInt(_.get(request, "PageNo", 1)) : 1;
        let numPerPage = parseInt(_.get(request, "Limit", 25))

        let ChannelPartnerID = _.get(request, "ChannelPartnerID", "");
        let userID = _.get(request, "UserID", "");
        let userType = _.get(request, "UserType", "");
        let referID = _.get(request, "ReferID", "");
        let status = _.get(request, "Status", "");
        let fromDate = _.get(request, "fromDate", "");
        let toDate = _.get(request, "toDate", "");
        let paymentType = _.get(request, "PaymentType", "");
        let bankName = _.get(request, "BankName", "");
        let CpID = _.get(request, "CpID", "");
        let LedgerID = _.get(request, "LedgerID", "");
        let UserID = _.get(request, "UserID", "");

        let compareDate = "";

        if (fromDate && toDate) {
            compareDate = `AND date(uo.OrderDate) >= '${fromDate}' AND date(uo.OrderDate) <= '${toDate}'`;
        } else if (fromDate && fromDate != "0") {
            compareDate = `AND date(uo.OrderDate) like '%${fromDate}%'`;
        } else if (toDate) {
            compareDate = `AND date(uo.OrderDate) <= '${toDate}'`;
        }


        var skip = (page - 1) * numPerPage
        var limit = skip + ',' + numPerPage;

        let where = "";
        if (ChannelPartnerID) {
            where += `AND uo.UserID like '%${ChannelPartnerID}%'`;
        }
        if (LedgerID && LedgerID != '0' && UserID) {
            where += `AND uo.UserID like '%${UserID}%'`;
        }
        if (userType) {
            where += `AND uo.UserType like '%${userType}%'`;
        }
        if (status) {
            where += `AND uo.Status like '%${status}%'`;
        }
        if (paymentType) {
            where += `AND uo.PaymentType like '%${paymentType}%'`;
        }
        if (bankName) {
            where += `AND uo.BankName like '%${bankName}%' `;
        }
        // if (CpID != "0" && CpID) {
        //     where += ` AND uo.UserID = '${CpID}'`;
        // }
        if (request.OrderID != undefined && request.OrderID != '') {
            where += ` AND uo.OrderID = '${request.OrderID}'`;
        }
        if (request.OrderTypeID && request.OrderTypeID != "" && request.OrderTypeID > 0) {
            where += `AND uo.OrderTypeID = '${request.OrderTypeID}' `;
        }
        where += compareDate;
        let query = `SELECT uo.*,CONCAT('/','',mt.Slug) as TransactionSlug,mt.Title as TransactionTitle, CONCAT(Student.FirstName,' ',Student.LastName) as studentName, CONCAT(ChannelPartner.FirstName,' ',ChannelPartner.LastName) as ChannelPartnerName 
        FROM User_Order as uo 
        LEFT JOIN ChannelPartner ON uo.UserID = ChannelPartner.ChannelPartnerID 
        LEFT JOIN Student ON uo.ReferID = Student.StudentID 
        LEFT JOIN Mst_Transaction as mt ON mt.Transction_Type_ID = uo.OrderTypeID
         where 1 ` + where + ` ORDER BY uo.OrderID DESC LIMIT ${limit}`;
        // console.log(query);
        let orderList = await sqlhelper.select(query, [], (err, res) => {
            if (err) {
                callback(err, new Array());
            }
            else return res;
        });

        let totalRecords_query = `SELECT count(*) as records_count FROM User_Order as uo 
        LEFT JOIN ChannelPartner ON uo.UserID = ChannelPartner.ChannelPartnerID 
        LEFT JOIN Student ON uo.ReferID = Student.StudentID 
        LEFT JOIN Mst_Transaction as mt ON mt.Transction_Type_ID = uo.OrderTypeID
        where 1 `+ where + ` ORDER BY uo.OrderID DESC`;
        // console.log(totalRecords_query);
        let totalRecords = await sqlhelper.select(totalRecords_query, [], (err, res) => {
            if (err) console.log(err);
            else return res;
        });
        console.log(totalRecords);
        response['totalRecords'] = totalRecords[0].records_count;
        response['totalPages'] = Math.ceil(parseInt(totalRecords[0].records_count) / numPerPage)
        response['page'] = page;
        response['pagesize'] = numPerPage;
        response['orderList'] = orderList;
        callback(null, response);

    } else {
        let query = `SELECT uo.*,CONCAT(Student.FirstName,' ',Student.LastName) as studentName, CONCAT(ChannelPartner.FirstName,' ',ChannelPartner.LastName) as ChannelPartnerName FROM User_Order LEFT JOIN ChannelPartner ON uo.UserID = ChannelPartner.ChannelPartnerID LEFT JOIN Student ON uo.ReferID = Student.StudentID ORDER BY uo.OrderID DESC`;
        let orderList = await sqlhelper.select(query, [], (err, res) => {
            if (err) {
                callback(err, new Array());
            }
            else return res;
        });
        response['orderList'] = orderList;
        callback(null, response);
    }
}

Service.Mst_LedgerList = async (request, callback) => {
    let response = {}
    if (!request.isAll) {
        let page = parseInt(_.get(request, "PageNo", 1)) > 0 ? parseInt(_.get(request, "PageNo", 1)) : 1;
        let numPerPage = parseInt(_.get(request, "Limit", 25))
        let ledgerName = _.get(request, "ledgerName", '')
        let mobileNumber = _.get(request, "mobileNumber", '')
        let email = _.get(request, "email", '')
        let isUser = _.get(request, "isUser", '')
        let userType = _.get(request, "userType", '')
        let entryDate = _.get(request, "entryDate", '')

        var skip = (page - 1) * numPerPage
        var limit = skip + ',' + numPerPage;

        let query = `SELECT * FROM Mst_Ledger where LedgerName like '%${ledgerName}%' AND Mobile like '%${mobileNumber}%' AND Email like '%${email}%' AND IsUser like '%${isUser}%' AND UserType like '%${userType}%' AND Entrydate like '%${entryDate}%' ORDER BY Entrydate DESC LIMIT ${limit}`;
        let ledgerList = await sqlhelper.select(query, [], (err, res) => {
            if (err) {
                callback(err, new Array());
            }
            else return res;
        });

        let totalRecords_query = `SELECT count(*) as records_count FROM Mst_Ledger where LedgerName like '%${ledgerName}%' AND Mobile like '%${mobileNumber}%' AND Email like '%${email}%' AND IsUser like '%${isUser}%' AND UserType like '%${userType}%' AND Entrydate like '%${entryDate}%'`;
        let totalRecords = await sqlhelper.select(totalRecords_query, [], (err, res) => {
            if (err) console.log(err);
            else return res;
        });

        response['totalRecords'] = totalRecords[0].records_count;
        response['totalPages'] = Math.ceil(parseInt(totalRecords[0].records_count) / numPerPage)
        response['page'] = page;
        response['pagesize'] = numPerPage;
        response['ledgerList'] = ledgerList;
        callback(null, response);
    } else {
        let query = `SELECT * FROM Mst_Ledger ORDER BY Entrydate DESC`;
        let ledgerList = await sqlhelper.select(query, [], (err, res) => {
            if (err) {
                callback(err, new Array());
            }
            else return res;
        });
        response['ledgerList'] = ledgerList;
        callback(null, response);
    }
}

Service.WithdrawStatusUpdate = async (request, callback) => {
    let update_data = {};
    let where_data = {};
    where_data = {
        'WithdrawID': request.WithdrawID,
    };
    update_data['Remark'] = request.Remark;
    update_data['Status'] = request.Status;
    update_data['TxnID'] = request.TxnID;
    update_data['ApproveBy'] = request.UserID;
    update_data['UpdateDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
    update_data['UpdateIP'] = request.IpAddress;
    update_data['ApproveDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
    let withdStatus = { "1": "Pending", "2": "Success", "3": "Reject" };
    let ID = request.WithdrawID;
    var message = "";
    if (ID > 0) {
        let check_query = `select WithdrawID,UserID as ChannelPartnerID,OrderID,UserType,wr.Status, Amount,wr.EntryDate,TxnID,ApproveDate,ApproveBy,BankName,IFSCCode,MicroNo,AccountNo,wr.AccountName,cp.LedgerID FROM Wallet_WithDrawRequest as wr LEFT JOIN ChannelPartner as cp on cp.ChannelPartnerID=wr.UserID WHERE WithdrawID=? limit 1`;
        let WithdData = await sqlhelper.select(check_query, [ID], (err, res) => {
            if (err) {
                console.log(err);
                callback(err, new Array());
                return -1;
            } else if (_.isEmpty(res)) {
                callback(null, {
                    'message': 'Data not found',
                    'data': new Array()
                });
                return -1;
            } else {
                return res[0];
            }
        });
        if (WithdData == -1) {
            return;
        }

        let update = await sqlhelper.update('Wallet_WithDrawRequest', update_data, where_data, async (err, res) => {
            if (err) {
                console.log(err);
                callback(err, new Array());
                return -1;
            } else {
                try {
                    let message_notti = Commom.GetNotificationMessage('WithdrawalStatus').replace('{{Status}}', withdStatus[request.Status.toString()]);
                    var ActivityArray = {
                        StudentID: '0',
                        ChannelPartnerID: WithdData.ChannelPartnerID,
                        Message: message_notti,
                        Process: 'WithdrawalStatus',
                        ProcessType: '3',
                        ProcessID: WithdData.OrderID,
                        ProcessSlug: 'orderlist',
                    }
                    await Commom.SaveNotificationLog(ActivityArray, request);
                } catch (error) {
                    console.log("Notification not inert -----");
                }
                return res;
            }
        });
        if (update == -1) {
            return;
        } else {

            let update = await sqlhelper.update('User_Order', { Status: request.Status, OrderDate: moment().format('YYYY-MM-DD HH:mm:ss') }, { OrderID: WithdData.OrderID }, async (err, res) => {
                if (err) {
                    console.log(err);
                    callback(err, new Array());
                    return -1;
                } else {
                    return res;
                }
            });
            message = "Data updated successfully.";
            if (request.Status == '3' && WithdData.OrderID != 0 && WithdData.UserID != 0) {

                if (parseInt(WithdData.LedgerID) > 0) {
                    let LedgerEntry = {
                        'OrderID': WithdData.OrderID,
                        'OrderTypeID': '4',
                        'EntryDate': moment().format('YYYY-MM-DD'),
                        'EntryDateTime': moment().format('YYYY-MM-DD HH:mm:ss'),
                        'narretion': request.Remark
                    }
                    LedgerEntry['LedgerID'] = WithdData.LedgerID;
                    LedgerEntry['RefLedgerID'] = '1';
                    LedgerEntry['Debitamount'] = '0';
                    LedgerEntry['CreditAmount'] = WithdData.Amount;
                    // LedgerEntry['Balance'] = 0;
                    await sqlhelper.insert('Ac_Wallet_Transaction', LedgerEntry, (err, res) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Wallet First Trasection success " + res.insertId);
                            return res.insertId;
                        }
                    });
                    // Reverse Entry
                    LedgerEntry['LedgerID'] = '1';
                    LedgerEntry['RefLedgerID'] = WithdData.LedgerID;
                    LedgerEntry['Debitamount'] = WithdData.Amount;
                    LedgerEntry['CreditAmount'] = '0';
                    // LedgerEntry['Balance'] = 0;
                    await sqlhelper.insert('Ac_Wallet_Transaction', LedgerEntry, (err, res) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Wallet Revese Trasection success " + res.insertId);
                            return res.insertId;
                        }
                    });
                    let OcxeeFinalBalance = await Commom.BalanceCalculation(WithdData.LedgerID);
                    await sqlhelper.update('ChannelPartner', { 'Balance': OcxeeFinalBalance }, { 'LedgerID': WithdData.LedgerID }, (err, res) => {
                        if (err) console.log(err);
                        else console.log("ChannelPartner Updated For Balance");
                    });
                    // console.log("Ocxee Final Balance "+ OcxeeFinalBalance);
                } else {
                }
            }
        }
    }
    callback(null, {
        'Status': '1',
        'message': message,
        'data': []
    });
}
Service.UpdateCPDocStatus = async (req, request, callback) => {

    let response = {}
    let update_datas = {};
    let where_datas = {};
    let tableName = "";
    let IdName = "";
    let update_data = "";
    let where_data = "";
    let fieldshow = "";
    let para_update
    let fieldshows
    let ID = 0;
    let apprdocs = { "AddressProof": [], "IdentityProof": [], "AdditionalDocuments": [], "AgreementProof": [] }
    let rejctdocs = { "AddressProof": [], "IdentityProof": [], "AdditionalDocuments": [], "AgreementProof": [] }
    ID = req.body.id
    fieldshow = 'CAST(ChannelPartnerID as CHAR) as ID';
    tableName = 'ChannelPartner'
    IdName = 'ChannelPartnerID'
    // console.log(req.body)
    if (req.body.QueVerify != undefined && req.body.QueVerify != '') {
        update_datas = { 'AdditionalInfoStatus': 1 };
    } else if (req.body.QueUnVerify != undefined && req.body.QueUnVerify != '') {
        update_datas = { 'AdditionalInfoStatus': 0 };
    } else {
        var jsonarray1 = req.body.objAddress != '' ? JSON.parse(req.body.objAddress) : ''
        var jsonarray2 = req.body.objIdentityFile != '' ? JSON.parse(req.body.objIdentityFile) : ''
        var jsonarray3 = req.body.objAdditionalFile != '' ? JSON.parse(req.body.objAdditionalFile) : ''
        // console.log(req.body.objAgreementProof)
        var jsonarray4 = req.body.objAgreementProof != '' ? JSON.parse(req.body.objAgreementProof) : ''
        if (req.body.Address && jsonarray1["Status"] != undefined && req.body.Address != '') {
            jsonarray1["Status"] = req.body.Address
        }
        if (req.body.IdentityFile && jsonarray2["Status"] != undefined && req.body.IdentityFile != '') {
            jsonarray2["Status"] = req.body.IdentityFile
        }
        if (req.body.AdditionalFile && jsonarray3["Status"] != undefined && req.body.AdditionalFile != '') {
            jsonarray3["Status"] = req.body.AdditionalFile
        }
        if (req.body.AgreementProof && jsonarray4["Status"] != undefined && req.body.AgreementProof != '') {
            jsonarray4["Status"] = req.body.AgreementProof
        }
        update_datas['AddressProof'] = JSON.stringify(jsonarray1);
        update_datas['IdentityProof'] = JSON.stringify(jsonarray2);
        update_datas['AdditionalDocuments'] = JSON.stringify(jsonarray3);
        update_datas['AgreementProof'] = JSON.stringify(jsonarray4);
        if (jsonarray1["Status"] == 1 && jsonarray2["Status"] == 1 && jsonarray3["Status"] == 1 && jsonarray4["Status"] == 1) {
            update_datas['AdditionalDocStatus'] = 1
        }
    }
    where_datas = {
        'ChannelPartnerID': ID,
    };
    update_data = update_datas,
        where_data = where_datas
    fieldshow = fieldshows
    var message = "";
    if (ID > 0) {

        let check_query = 'SELECT * FROM ' + tableName + ' WHERE ' + IdName + '="' + ID + '"';
        let check_data = await sqlhelper.select(check_query, [], (err, res) => {
            if (err) {
                callback(err, new Array());
                return 0;
            } else if (_.isEmpty(res)) {
                callback(null, {
                    'message': 'Data not found',
                    'data': new Array()
                });
                return 0;
            } else {
                return res[0];
            }
        });
        if (check_data == 0) {
            return;
        }
        update_data['UpdateBy'] = request.UserID;
        update_data['UpdateDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
        update_data['UpdateIP'] = request.IpAddress;
        para_update = await sqlhelper.update(tableName, update_data, where_data, async (err, res) => {
            if (err) {
                callback(err, new Array());
                return 0;
            } else {
                let EmailData = await Commom.GetEmailTemplate('Partner_Document_status');
                let EmailData2 = await Commom.GetEmailTemplate('Partner_Document_status');
                if (_.size(EmailData) > 0 || _.size(EmailData2) > 0) {

                    EmailData.ToMail = check_data['PersonalEmail'];
                    EmailData2.ToMail = check_data['PersonalEmail'];
                    let fullName = check_data['FirstName'] + ' ' + check_data['LastName'];
                    if (req.body.Address && jsonarray1["Status"] != undefined && req.body.Address != '') {
                        let docs
                        if (check_data['AddressProof'].includes("Status") && check_data['AddressProof'].includes("Image")) {
                            docs = JSON.parse(check_data['AddressProof'])
                            if (docs["Status"] != req.body.Address) {
                                if (req.body.Address == 1)
                                    apprdocs.AddressProof.push(docs["Image"])
                                else if (req.body.Address == 2)
                                    rejctdocs.AddressProof.push(docs["Image"])
                            }
                        }
                    }
                    if (req.body.IdentityFile && jsonarray2["Status"] != undefined && req.body.IdentityFile != '') {
                        let docs
                        if (check_data['IdentityProof'].includes("Status") && check_data['IdentityProof'].includes("Image")) {
                            docs = JSON.parse(check_data['IdentityProof'])
                            if (docs["Status"] != req.body.IdentityFile) {
                                if (req.body.IdentityFile == 1)
                                    apprdocs.IdentityProof.push(docs["Image"])
                                else if (req.body.IdentityFile == 2)
                                    rejctdocs.IdentityProof.push(docs["Image"])
                            }
                        }
                        // EmailData['TemplateBody'] = EmailData['TemplateBody']
                        //     .replace('{First Name}', fullName)                                                                                                                                                                                                                                                                                       
                        // await Send_Mail.Ocxee_SMTP_Mail_Multiple(EmailData, '', (err, res) => { });
                    }
                    if (req.body.AdditionalFile && jsonarray3["Status"] != undefined && req.body.AdditionalFile != '') {
                        let docs
                        if (check_data['AdditionalDocuments'].includes("Status") && check_data['AdditionalDocuments'].includes("Image")) {
                            docs = JSON.parse(check_data['AdditionalDocuments'])
                            if (docs["Status"] != req.body.AdditionalFile) {
                                if (req.body.AdditionalFile == 1) {
                                    docs["Image"].forEach(element => {
                                        apprdocs.AdditionalDocuments.push(element)
                                    });
                                }
                                else if (req.body.AdditionalFile == 2) {
                                    docs["Image"].forEach(element => {
                                        rejctdocs.AdditionalDocuments.push(element)
                                    });
                                }
                            }
                        }
                        // EmailData['TemplateBody'] = EmailData['TemplateBody']
                        //     .replace('{First Name}', fullName)
                        // await Send_Mail.Ocxee_SMTP_Mail_Multiple(EmailData, '', (err, res) => { });
                    }
                    if (req.body.AgreementProof && jsonarray4["Status"] != undefined && req.body.AgreementProof != '') {
                        let docs
                        if (check_data['AgreementProof'].includes("Status") && check_data['AgreementProof'].includes("Image")) {
                            docs = JSON.parse(check_data['AgreementProof'])
                            if (docs["Status"] != req.body.AgreementProof) {
                                if (req.body.AgreementProof == 1)
                                    apprdocs.AgreementProof.push(docs["Image"])
                                else if (req.body.AgreementProof == 2)
                                    rejctdocs.AgreementProof.push(docs["Image"])
                            }
                        }
                        // EmailData['TemplateBody'] = EmailData['TemplateBody']
                        //     .replace('{First Name}', fullName)
                        // await Send_Mail.Ocxee_SMTP_Mail_Multiple(EmailData, '', (err, res) => { });
                    }
                    if (apprdocs.AddressProof.length > 0 || apprdocs.IdentityProof.length > 0 || apprdocs.AdditionalDocuments.length > 0 || apprdocs.AgreementProof.length > 0) {
                        let Docs = ""
                        if (apprdocs.AddressProof.length > 0) {
                            Docs += "<h4>Address Proof</h4><a href='" + apprdocs.AddressProof[0] + "'>" + apprdocs.AddressProof[0] + "</a>";
                        }
                        if (apprdocs.IdentityProof.length > 0) {
                            Docs += "<h4>Identity Proof</h4><a href='" + apprdocs.IdentityProof[0] + "'>" + apprdocs.IdentityProof[0] + "</a>";
                        }
                        if (apprdocs.AdditionalDocuments.length > 0) {
                            Docs += "<h4>Additional Documents</h4>";
                            apprdocs.AdditionalDocuments.forEach(element => {
                                Docs += "<a href='" + element + "'>" + element + "</a>"
                            });
                        }
                        if (apprdocs.AgreementProof.length > 0) {
                            Docs += "<h4>Agreement Proof</h4><a href='" + apprdocs.AgreementProof[0] + "'>" + apprdocs.AgreementProof[0] + "</a>";
                        }
                        let StatusMsg = "We're pleased to confirm that the documents you uploaded have been approved."
                        let documents = Docs
                        let Msg = "You can log in to your Channel Partner Admin Portal via the link below:"
                        let Link = "<a href='https://partner.ocxee.com'>https://partner.ocxee.com</a>"
                        EmailData['TemplateBody'] = EmailData['TemplateBody']
                            .replace('{First Name}', fullName)
                            .replace('{Status}', StatusMsg)
                            .replace('{Docs}', documents)
                            .replace('{Msg}', Msg)
                            .replace('{Link}', Link)
                        // console.log(EmailData)
                        await Send_Mail.Ocxee_SMTP_Mail_Multiple(EmailData, '', (err, res) => {
                            if (err) console.log(err)
                        });
                    }
                    if (rejctdocs.AddressProof.length > 0 || rejctdocs.IdentityProof.length > 0 || rejctdocs.AdditionalDocuments.length > 0 || rejctdocs.AgreementProof.length > 0) {
                        let Docs = ""
                        if (rejctdocs.AddressProof.length > 0) {
                            Docs += "<h4>Address Proof</h4><a href='" + rejctdocs.AddressProof[0] + "'>" + rejctdocs.AddressProof[0] + "</a>";
                        }
                        if (rejctdocs.IdentityProof.length > 0) {
                            Docs += "<h4>Identity Proof</h4><a href='" + rejctdocs.IdentityProof[0] + "'>" + rejctdocs.IdentityProof[0] + "</a>";
                        }
                        if (rejctdocs.AdditionalDocuments.length > 0) {
                            Docs += "<h4>Additional Documents</h4>";
                            rejctdocs.AdditionalDocuments.forEach(element => {
                                Docs += "<a href='" + element + "'>" + element + "</a>"
                            });
                        }
                        if (rejctdocs.AgreementProof.length > 0) {
                            Docs += "<h4>Agreement Proof</h4><a href='" + rejctdocs.AgreementProof[0] + "'>" + rejctdocs.AgreementProof[0] + "</a>";
                        }
                        let StatusMsg = "Unfortunately, the documents you uploaded have not been approved."
                        let documents = Docs
                        let Msg = "Please log in to your Channel Partner Admin Portal via the link below, where you can upload any new documents as required:"
                        let Link = "<a href='https://partner.ocxee.com'>https://partner.ocxee.com</a>"
                        EmailData2['TemplateBody'] = EmailData2['TemplateBody']
                            .replace('{First Name}', fullName)
                            .replace('{Status}', StatusMsg)
                            .replace('{Docs}', documents)
                            .replace('{Msg}', Msg)
                            .replace('{Link}', Link)
                        console.log(EmailData2)
                        await Send_Mail.Ocxee_SMTP_Mail_Multiple(EmailData2, '', (err, res) => {
                            if (err) console.log(err)
                        });
                    }
                }
                return res;
            }
        });
        if (para_update == 0) {
            return;
        }
        var ActivityArray = {
            TableName: tableName,
            TableID: ID,
            Module: tableName,
            Activity: '2',
            Remark: 'Update ' + tableName + ' module Id No :' + ID,
            UserId: request.UserID,
        }
        Commom.SaveActivityLog(ActivityArray, request);
        message = "Data updated successfully";
    }
    if (req.body.QueVerify != undefined && req.body.QueVerify != '') {
        response['AdditionalInfoStatus'] = 1
        response["ID"] = ID
    } else if (req.body.QueUnVerify != undefined && req.body.QueUnVerify != '') {
        response['AdditionalInfoStatus'] = 0
        response["ID"] = ID
    }
    else {
        response['AddressProof'] = JSON.stringify(jsonarray1)
        response['IdentityProof'] = JSON.stringify(jsonarray2)
        response['AdditionalDocuments'] = JSON.stringify(jsonarray3)
        response['AgreementProof'] = JSON.stringify(jsonarray4)

        response["ID"] = ID
        // console.log(response)
    }
    callback(null, {
        'Status': '1',
        'message': message,
        'data': response
    });
}
Service.CpProfileUpdate = async (request, EntryData, callback) => {
    let message = "Something is wrong";
    where_data = { "ChannelPartnerID": request.ChannelPartnerID }
    EntryData['UpdateBy'] = request.UserID;
    EntryData['UpdateDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
    EntryData['UpdateIP'] = request.IpAddress;
    if (request.ChannelPartnerID > 0) {
        let para_update = await sqlhelper.update("ChannelPartner", EntryData, where_data, (err, res) => {
            if (err) {
                console.log(err);
                callback(err, new Array());
                return -1;
            } else {
                message = "Successfully updated profile";
                return res;
            }
        });
        if (para_update == -1) {
            return;
        }
    }

    callback(null, {
        'Status': '1',
        'message': message,
        'data': []
    });
}

Service.CpProfilePic = async (request, callback) => {
    let EntryData = {};
    if (request.file.recfile) {
        if (Object.entries(request.file.recfile).length) {
            resimage = await upload.uploadFiles(request.file.recfile, 'ChannelPartner/Profile');
        }
        if (Object.entries(request.file.recfile).length) {
            let filearray = resimage[0].split("/");
            let filename = filearray[filearray.length - 1];
            EntryData['PersonalPhoto'] = resimage[0];
        }
    }
    EntryData['UpdateBy'] = request.UserID;
    EntryData['UpdateDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
    EntryData['UpdateIP'] = request.IpAddress;
    let where_data = { "ChannelPartnerID": request.ChannelPartnerID }
    if (request.ChannelPartnerID > 0) {
        let para_update = await sqlhelper.update("ChannelPartner", EntryData, where_data, (err, res) => {
            if (err) {
                console.log(err);
                callback(err, new Array());
                return -1;
            } else {
                message = "Successfully updated profile";
                return res;
            }
        });
        if (para_update == -1) {
            return;
        }
    }

    callback(null, {
        'Status': '1',
        'message': message,
        'data': EntryData['PersonalPhoto']
    });
}


Service.studentEntry = async (request, callback) => {
    let emailid_query = "SELECT Email FROM Student WHERE Email=? LIMIT 1";
    let emailid_exits = await sqlhelper.select(emailid_query, [request.Email], (err, res) => {
        if (err) {
            console.log(err);
            callback(err, null);
            return -1;
        } else if (res.length > 0) {
            callback(null, {
                'status': '0',
                'message': 'This Email Id already exists on the platform; try a different one.'
            });
            return -1;
        } else {
            return 1;
        }
    });
    if (emailid_exits == -1) {
        return;
    }
    let mobile_query = "SELECT PhoneNo FROM Student WHERE PhoneNo=? LIMIT 1";
    let mobile_exits = await sqlhelper.select(mobile_query, [request.PhoneNo], (err, res) => {
        if (err) {
            callback(err, null);
            return -1;
        } else if (res.length > 0) {
            callback(null, {
                'status': '0',
                'message': 'This PhoneNo exists on the platform; try a different one.'
            });
            return -1;
        } else {
            return 1;
        }
    });
    if (mobile_exits == -1) {
        return;
    }
    if (emailid_exits == 1 && mobile_exits == 1 && request.UserID) {
        // let Amount = await Commom.GetSettingValue('Student_Varification_Commission');
        let StudentCount = await Commom.ReferralStudentCalculation(request.UserID);
        let CommissionData = await Commom.GetCommissionCategory(StudentCount);
        let Amount = CommissionData.Commission_Per_Student;
        let OrderEntry = {
            'UserID': request.UserID,
            'UserType': 'Channel Partner',
            'OrderAmount': Amount,
            'Subtotal': Amount,
            'OrderTypeID': '1',
            'Status': '1',
            'ReferID': '0',
            'OrderDate': moment().format('YYYY-MM-DD HH:mm:ss'),
        }
        let OrderID = await sqlhelper.insert('User_Order', OrderEntry, (err, res) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Order Entry Successfully " + res.insertId);
                return res.insertId;
            }
        });

        let student_data = {
            "OldStdID": 0,
            "FirstName": request.FirstName,
            "MiddleName": "",
            "LastName": request.LastName,
            "Email": request.Email,
            "Photo": "",
            "PhoneNo_CountryCode": request.PhoneNo_CountryCode ? request.PhoneNo_CountryCode : "",
            "PhoneNo": request.PhoneNo,
            'ChannelPartnerID': request.UserID,
            'IsRefer': request.IsRefer,
            'EntryBy': request.UserID,
            'EntryDate': moment().format('YYYY-MM-DD HH:mm:ss'),
            'EntryIP': request.IpAddress,
            'OrderID': OrderID
        }

        await sqlhelper.insert('Student', student_data, async (err, res) => {
            if (err) {
                callback(err, new Array());
                return -1;
            } else {
                console.log("else")
                let EmailData = await Commom.GetEmailTemplate('FrontEnd.EmailByCP');
                if (_.size(EmailData) > 0) {
                    console.log("inside1")
                    EmailData.ToMail = request.Email;
                    let fullName = request.FirstName + ' ' + request.LastName;
                    // console.log(request.UserID)
                    let Session = {
                        'UserId': res.insertId,
                        'ExpiredTime': moment().add(24, 'hours').format('YYYYMMDDHHmmss'),
                    }
                    Session = encodeURIComponent(Commom.TokenEncrypt(JSON.stringify(Session)));
                    let reset_pass_link = process.env.STUDENT_PANEL_LINK + 'set-password?Session=' + Session;
                    EmailData['TemplateBody'] = EmailData['TemplateBody']
                        .replace('{First Name}', fullName)
                        .replace('{cpname}', request.CpName)
                        .replace('{link}', reset_pass_link);
                    // console.log(EmailData)
                    await Send_Mail.Ocxee_SMTP_Mail_Multiple(EmailData, '', (err, res) => { });
                }
                let UpdateOrderData = {
                    'ReferID': res.insertId,
                    'OrderNote': "New Student Verification No " + res.insertId,
                }
                await sqlhelper.update('User_Order', UpdateOrderData, { 'OrderID': OrderID }, (err, res) => {
                    if (err) console.log(err);
                    else console.log("Stundent Updated For Commission");
                });
                studentID = res.insertId
            }
        })

    } else {
        return;
    }

    callback(null, {
        'Status': '1',
        'message': "New Student Successfully Added",
        'data': []
    });
}

Service.BookingCpMaping = async (req, request, callback) => {

    let update_datas = {};
    let where_datas = {};
    let tableName = "";
    let IdName = "";
    let ID = "";
    let update_data = "";
    let where_data = "";
    let para_update
    let fieldshows
    let ids = [];
    if (req.body.UserIDS != undefined && req.body.UserIDS != '') {
        ids = req.body.UserIDS.split(',');
        fieldshow = 'CAST(StudentID as CHAR) as ID';
        tableName = 'Student'
        IdName = 'StudentID'
    }
    else if (req.body.InquiryIdList != undefined && req.body.InquiryIdList != '') {
        ids = req.body.InquiryIdList.split(',');
        fieldshow = 'CAST(BookingID as CHAR) as ID';
        tableName = 'Accommodation_BookingRequest';
        IdName = 'BookingID'
    }
    for (const id of ids) {
        if (req.body.UserIDS != undefined && req.body.UserIDS != '') {
            update_datas['IsStudentVerify'] = 1;
            where_datas = {
                'StudentID': id,
            };
        }
        else if (req.body.InquiryIdList != undefined && req.body.InquiryIdList != '') {
            update_datas['ChannelPartnerID'] = req.body.ChannelPartnerID;
            where_datas = {
                'BookingID': id,
            };
        }
        ID = id
        update_data = update_datas,
        where_data = where_datas
        fieldshow = fieldshows
        var message = "";
        let ID2 = ID;
        if (ID > 0) {
            let check_query = 'SELECT ' + IdName + ' ,StudentID FROM ' + tableName + ' WHERE ' + IdName + '="' + ID + '"';
            let check_data = await sqlhelper.select(check_query, [], (err, res) => {
                if (err) {
                    callback(err, new Array());
                    return 0;
                } else if (_.isEmpty(res)) {
                    callback(null, {
                        'message': 'Data not found',
                        'data': new Array()
                    });
                    return 0;
                } else {
                    return res[0];
                }
            });
            if (check_data == 0) {
                return;
            }
            // console.log(check_data["StudentID"])
            if (req.body.InquiryIdList != undefined && req.body.InquiryIdList != '') {
                let OrderEntry = {
                    'UserID': req.body.ChannelPartnerID,
                    'UserType': 'Channel Partner',
                    'ReferID': check_data["StudentID"],
                    'OrderAmount': 0,
                    'Subtotal': 0,
                    'OrderTypeID': '5',
                    'Status': '1',
                    'OrderDate': moment().format('YYYY-MM-DD HH:mm:ss'),
                    'OrderNote': "Accommodation Booking Map",
                }
                
                let OrderID = await sqlhelper.insert('User_Order', OrderEntry, (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Order Entry Successfully " + res.insertId);
                        return res.insertId;
                    }
                });

                update_data['UpdateBy'] = request.UserID;
                update_data['UpdateDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
                update_data['UpdateIP'] = request.IpAddress;
                update_data['OrderID'] = OrderID;
                para_update = await sqlhelper.update(tableName, update_data, where_data, (err, res) => {
                    if (err) {
                        callback(err, new Array());
                        return 0;
                    } else {
                        return res;
                    }
                });
                if (para_update == 0) {
                    return;
                }
            }
            var ActivityArray = {
                TableName: tableName,
                TableID: ID,
                Module: tableName,
                Activity: '2',
                Remark: 'Update ' + tableName + ' module Id No :' + ID,
                UserId: request.UserID,
            }
            Commom.SaveActivityLog(ActivityArray, request);
            message = "Data updated successfully";
        }
    }
    callback(null, {
        'Status': '1',
        'message': message,
        'data': ''
    });
}

Service.AddNearBySearchData = async (request, callback) => {
    var DataArray = request.NearByDataArray;
    var InsertBulkarray = [];
    if (DataArray.length == 0) {
        callback(null, {
            'status': '0',
            'message': 'Please enter all the details.'
        });
        return false;
    } else {
        DataArray.forEach(element => {
            if (typeof element[5] === 'undefined' || element[5] == '') {
                let temparr = {};
                temparr['AccSeoID'] = request.AccSeoID;
                temparr['CountryID'] = request.CountryID;
                temparr['CityID'] = request.CityID;
                temparr['Type'] = element[0];
                temparr['Title'] = element[1];
                temparr['URL'] = element[2];
                temparr['Sequence'] = element[3];
                temparr['Active'] = element[4];
                temparr['EntryBy'] = request.UserID;
                temparr['EntryDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
                InsertBulkarray.push(temparr);
            }
        });
        if (DataArray.length > 0) {
            if (InsertBulkarray.length > 0) {
                let InsertID = await sqlhelper.batch_insert('Mst_NearBySearch', InsertBulkarray, (err, res) => {
                    if (err) {
                        callback(json_response(err), null);
                        return 0;
                    } else {

                        return 1;
                    }
                });
                if (InsertID == 0) {
                    return;
                } else {
                    callback(null, {
                        'Status': '1',
                        'message': 'New Data Inserted Successfully',
                        'data': []
                    });
                }
            } else {
                callback(null, {
                    'Status': '1',
                    'message': 'New Data Inserted Successfully',
                    'data': []
                });
            }
        } else {
            callback(null, {
                'status': '0',
                'message': 'Please enter all the details.'
            });
            return false;
        }
    }
}

Service.UpdateNearBySearchData = async (request, callback) => {
    var DataArray = request.NearByDataArray;
    if (DataArray.length == 0) {
        callback(null, {
            'status': '0',
            'message': 'Please enter all the details.'
        });
        return false;
    } else {
        let where_data = {};
        where_data = {
            'NearBySearchID': request.NearBySearchID,
        };
        let update_data = {};
        update_data['Type'] = DataArray[0];
        update_data['Title'] = DataArray[1];
        update_data['URL'] = DataArray[2];
        update_data['Sequence'] = DataArray[3];
        update_data['Active'] = DataArray[4];
        update_data['UpdateBy'] = request.UserID;
        update_data['UpdateDate'] = moment().format('YYYY-MM-DD HH:mm:ss');

        let update = await sqlhelper.update('Mst_NearBySearch', update_data, where_data, async (err, res) => {
            if (err) {
                console.log(err);
                callback(err, new Array());
                return -1;
            } else {

                return res;
            }
        });
        if (update == -1) {
            return;
        } else {
            callback(null, {
                'Status': '1',
                'message': 'Data updated successfully',
                'data': []
            });
        }
    }
}

Service.AccommodationChartView = async (request, callback) => {
    let DashboardDetail = {};
    let DashboardResponse = {};
    let where = ''
    if (request.StartDate != undefined && request.EndDate != undefined) {
        where = ` And AM.ViewDate >= '` + request.StartDate + ` 00:00:00' AND  AM.ViewDate<='` + request.EndDate + ` 23:59:59'`
    }
    let Acc_view = "SELECT COUNT(acc.ProviderID) as Count,acc.AccommodationID,acc.ProviderID as DataId,acp.Name as Name FROM Acc_MarketPlaceView as AM LEFT JOIN Accommodation as acc on acc.AccommodationID=AM.AccommodationID LEFT JOIN Accommodation_Provider as acp on acp.ProviderID=acc.ProviderID WHERE 1 AND acc.Active=1 " + where + " group by acc.ProviderID order by Count DESC LIMIT 0,20";
    let Acc_View_Chart = await sqlhelper.select(Acc_view, [], (err, res) => {
        if (err) console.log(err);
        else return res;
    });

    var total_view = 0;
    Object.keys(Acc_View_Chart).forEach(function (a) {
        total_view += Acc_View_Chart[a]['Count'];
    })
    for (let i = 0; i < Acc_View_Chart.length; i++) {
        var Acc_view_data = Acc_View_Chart[i];
        Acc_View_Chart[i]['Count_Per'] = (Acc_view_data['Count'] * 100) / total_view;
    }
    let Acc_View_PieChart = {};
    Acc_View_PieChart['Count'] = Acc_View_Chart.map(el => el.Count);
    Acc_View_PieChart['Name'] = Acc_View_Chart.map(el => el.Name);
    Acc_View_PieChart['Id'] = Acc_View_Chart.map(el => el.DataId);
    Acc_View_PieChart['Count_Per'] = Acc_View_Chart.map(el => el.Count_Per);
    DashboardResponse['Accommodation_By_Provider'] = Acc_View_PieChart;
    let query = "SELECT COUNT(acc.ProviderID) as Count,AM.AccommodationID as DataId,accp.ProviderID as PID,acc.AccommodationName as Name,accp.Name as Pname FROM Acc_MarketPlaceView as AM LEFT JOIN Accommodation as acc on acc.AccommodationID=AM.AccommodationID LEFT JOIN Accommodation_Provider as accp on accp.ProviderID=acc.ProviderID WHERE 1 AND acc.Active=1 " + where + " group by acc.ProviderID order by Count DESC LIMIT 0,20";
    let Acc_Provider_data = await sqlhelper.select(query, [], (err, res) => {
        if (err) console.log(err);
        else return res;
    });
    DashboardResponse['Acc_With_Provider'] = Acc_Provider_data;
    let query2 = "SELECT acc.AccommodationName as Name,acc.PropertyLink, acc.AccommodationID,accp.Name as Pname,IF(AM.StudentID = 0,'Guest', concat(st.FirstName,' ',st.LastName)) as UserName,AM.StudentID,AM.ViewDate FROM Acc_MarketPlaceView as AM LEFT JOIN Accommodation as acc on acc.AccommodationID=AM.AccommodationID LEFT JOIN Accommodation_Provider as accp on accp.ProviderID=acc.ProviderID left JOIN Student as st on st.StudentID=AM.StudentID WHERE 1 AND acc.Active=1 order by AM.ViewDate DESC LIMIT 0,10";
    let Acc_User_data = await sqlhelper.select(query2, [], (err, res) => {
        if (err) console.log(err);
        else return res;
    });
    DashboardResponse['Acc_With_User'] = Acc_User_data;


    callback(null, DashboardResponse);
}

Service.GetAccViewInDetail = async (request, callback) => {
    request.PageNo = (request.PageNo > 0 ? request.PageNo : '1');
    let DashboardDetail = {};
    let DashboardResponse = {};
    let offset = (request.PageNo * request.Limit - request.Limit);
    limit = " LIMIT " + offset + ', ' + request.Limit;
    let where = ''

    if (request.StartDate != undefined && request.EndDate != undefined) {
        where = ` And AM.ViewDate >= '` + request.StartDate + ` 00:00:00' AND  AM.ViewDate<='` + request.EndDate + ` 23:59:59'`
    }
    // if (request.AccommodationID != undefined && request.AccommodationID != '') {
    //     where += ` And acc.AccommodationID=` + request.AccommodationID
    // }
    if (request.ProviderID != undefined && request.ProviderID != '') {
        where += ` And acp.ProviderID=` + request.ProviderID
    }
    let query = "SELECT acc.AccommodationID,acp.Name,acc.AccommodationName,acc.PropertyLink,IF(AM.StudentID = 0,'Guest', concat(st.FirstName,' ',st.LastName)) as UserName,AM.ViewDate FROM Acc_MarketPlaceView as AM LEFT JOIN Accommodation as acc on acc.AccommodationID=AM.AccommodationID LEFT JOIN Accommodation_Provider as acp on acp.ProviderID=acc.ProviderID left JOIN Student as st on st.StudentID=AM.StudentID WHERE 1 " + where + " AND acc.Active=1 order by AM.ViewDate DESC" + limit;
    let data = await sqlhelper.select(query, [], (err, res) => {
        if (err) console.log(err);
        else return res;
    });
    DashboardResponse['DetailsView'] = data;
    query2 = "SELECT Count(AM.AccommodationID) as Count FROM Acc_MarketPlaceView as AM LEFT JOIN Accommodation as acc on acc.AccommodationID=AM.AccommodationID LEFT JOIN Accommodation_Provider as acp on acp.ProviderID=acc.ProviderID left JOIN Student as st on st.StudentID=AM.StudentID WHERE 1 " + where + " AND acc.Active=1";
    DashboardResponse['TotalRecord'] = await sqlhelper.select(query2, [], (err, res) => {
        if (err) console.log(err);
        else return res[0].Count;
    });


    callback(null, DashboardResponse);
}
Service.SearchStuds = async (request, callback) => {
    try {
        let search = request.search ? request.search : ""
        // let query = "SELECT * FROM `Student` WHERE FirstName LIKE %'" + request.search + "' AND Active=1"
        let query = `SELECT StudentID as id,CONCAT(FirstName," ",LastName) as text,FirstName,LastName FROM Student WHERE (FirstName LIKE '%${search}%' OR LastName LIKE '%${search}%' OR CONCAT(FirstName," ",LastName) LIKE '%${search}%' OR Email LIKE '%${search}%' OR PhoneNo LIKE '%${search}%')`
        let student_data = await sqlhelper.select(query, [], (err, res) => {
            return res;
        });
        callback(null, { status: '1', message: "Student Found successfully", data: student_data });
    } catch (err) {
        callback(err, new Array());
    }
}
Service.AddFAQDescription = async (RequestData, request, callback) => {

    let tableName = RequestData.tableName;
    let IdName = RequestData.IdName;
    let ID = RequestData.ID;
    let update_data = RequestData.update_data;
    let where_data = RequestData.where_data;
    let fieldshow = RequestData.fieldshow;

    var message = "";
    let ID2 = ID;
    if (ID > 0) {
        let check_query = 'SELECT ' + IdName + ' FROM ' + tableName + ' WHERE ' + IdName + '="' + ID + '"';
        let check_data = await sqlhelper.select(check_query, [], (err, res) => {
            if (err) {
                callback(err, new Array());
                return 0;
            } else if (_.isEmpty(res)) {
                return 0;
            } else {
                return res[0];
            }
        });
        if (check_data == 0) {
            update_data['EntryBy'] = request.UserID;
            update_data['EntryDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
            update_data['EntryIP'] = request.IpAddress;
            ID2 = await sqlhelper.insert(tableName, update_data, (err, res) => {
                if (err) {
                    callback(err, new Array());
                    return 0;
                } else {
                    return res.insertId;
                }
            });
            if (ID2 == 0) {
                return;
            }
            var ActivityArray = {
                TableName: tableName,
                TableID: ID2,
                Module: tableName,
                Activity: '1',
                Remark: 'Insert ' + tableName + ' module Id No :' + ID2,
                UserId: request.UserID,
            }
            Commom.SaveActivityLog(ActivityArray, request);
            message = "Data inserted successfully";
        }
        update_data['UpdateBy'] = request.UserID;
        update_data['UpdateDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
        update_data['UpdateIP'] = request.IpAddress;
        let para_update = await sqlhelper.update(tableName, update_data, where_data, (err, res) => {
            if (err) {
                callback(err, new Array());
                return 0;
            } else {
                return res;
            }
        });
        if (para_update == 0) {
            return;
        }
        var ActivityArray = {
            TableName: tableName,
            TableID: ID,
            Module: tableName,
            Activity: '2',
            Remark: 'Update ' + tableName + ' module Id No :' + ID,
            UserId: request.UserID,
        }
        Commom.SaveActivityLog(ActivityArray, request);
        message = "Data updated successfully";
    }

    let para_query = 'SELECT ' + fieldshow + ' FROM ' + tableName + ' WHERE ' + IdName + '="' + ID2 + '"';
    let para_data = await sqlhelper.select(para_query, [], (err, res) => {
        if (err) {
            callback(err, new Array());
            return 0;
        } else {
            return res[0];
        }
    })
    if (para_data == 0) {
        return;
    }
    callback(null, {
        'Status': '1',
        'message': message,
        'data': para_data
    });
}
Service.StudentAddXlsImport = async (TableName, Data, req, callback) => {
    let request = req.body
    let error = 0
    let copyData = Data
    for (let [Index, Obj] of Data.entries()) {
        let errormsg = ''
        console.log(Index + " " + Obj.FirstName)
        if (!Obj.FirstName || !Obj.LastName || !Obj.Email || !Obj.PhoneNo) {
            error = 1
            if (!Obj.FirstName) {
                errormsg += "First name reqeuired, "
            }
            if (!Obj.LastName) {
                errormsg += "Last name reqeuired, "
            }
            if (!Obj.Email) {
                errormsg += "Email reqeuired, "
            }
            if (!Obj.PhoneNo) {
                errormsg += "PhoneNo reqeuired, "
            }
            copyData[Index].Error = errormsg
            continue

        }
        let query = "select StudentID from Student where Email='" + Obj.Email + "'";
        var StudentID = await sqlhelper.select(query, [], (err, res) => {
            if (err) {
                return 0;
            } else if (_.isEmpty(res)) {
                return 0;
            } else {
                return res.StudentID;
            }
        });
        if (StudentID != 0) {
            error = 1
            errormsg += "Email already exist, "
            copyData[Index].Error = errormsg
            continue
        }

        query = `select StudentID from Student where PhoneNo = ` + Obj.PhoneNo;
        let StudentID2 = await sqlhelper.select(query, [], (err, res) => {
            if (err) {
                return 0;
            } else if (_.isEmpty(res)) {
                return 0;
            } else {
                return res.StudentID;
            }
        });
        if (StudentID2 != 0) {
            error = 1
            errormsg += "PhoneNo already exist,"
            copyData[Index].Error = errormsg
            continue
        }
        if (StudentID == 0 && StudentID2 == 0) {
            // let Amount = await Commom.GetSettingValue('Student_Varification_Commission');
            let TotalStudent = Commom.ReferralStudentCalculation(request.UserID);
            let Amount = Commom.GetCommissionCategory(TotalStudent);
            Amount = Amount.Commission_Per_Student;

            let OrderEntry = {
                'UserID': request.UserID,
                'UserType': 'Channel Partner',
                'OrderAmount': Amount,
                'Subtotal': Amount,
                'OrderTypeID': '1',
                'Status': '1',
                'ReferID': '0',
                'OrderDate': moment().format('YYYY-MM-DD HH:mm:ss'),
            }

            let OrderID = await sqlhelper.insert('User_Order', OrderEntry, (err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Order Entry Successfully " + res.insertId);
                    return res.insertId;
                }
            });

            let student_data = {
                "OldStdID": 0,
                'FirstName': Obj.FirstName,
                'LastName': Obj.LastName,
                'MiddleName': Obj.MiddleName,
                'Email': Obj.Email,
                'PhoneNo': Obj.PhoneNo,
                'Gender': Obj.Gender != '' ? Obj.Gender == "Male" ? "Male" : "Female" : '',
                "PhoneNo_CountryCode": Obj.PhoneNo_CountryCode,
                'ChannelPartnerID': request.CpId,
                'EntryBy': request.UserID,
                'EntryDate': moment().format('YYYY-MM-DD HH:mm:ss'),
                'EntryIP': request.IpAddress,
                "OrderID": OrderID,
            }
            await sqlhelper.insert('Student', student_data, async (err, res) => {
                if (err) {
                    callback(err, new Array());
                }
                else {
                    let EmailData = await Commom.GetEmailTemplate('FrontEnd.EmailByCP');
                    if (_.size(EmailData) > 0) {
                        EmailData.ToMail = request.Email;
                        let fullName = request.FirstName + ' ' + request.LastName;
                        // console.log(request.UserID)
                        let Session = {
                            'UserId': res.insertId,
                            'ExpiredTime': moment().add(24, 'hours').format('YYYYMMDDHHmmss'),
                        }
                        Session = encodeURIComponent(Commom.TokenEncrypt(JSON.stringify(Session)));
                        let CpName = await sqlhelper.select("select CompanyName as CpName from ChannelPartner where ChannelPartnerID=" + request.CpId, [], (err, res) => {
                            return res[0].CpName
                        });
                        let reset_pass_link = process.env.STUDENT_PANEL_LINK + 'set-password?Session=' + Session;
                        EmailData['TemplateBody'] = EmailData['TemplateBody']
                            .replace('{First Name}', fullName)
                            .replace('{cpname}', CpName)
                            .replace('{link}', reset_pass_link);
                        await Send_Mail.Ocxee_SMTP_Mail_Multiple(EmailData, '', (err, res) => { });
                    }
                    let UpdateOrderData = {
                        'ReferID': res.insertId,
                        'OrderNote': "New Student Verification No " + res.insertId,
                    }
                    await sqlhelper.update('User_Order', UpdateOrderData, { 'OrderID': OrderID }, (err, res) => {
                        if (err) console.log(err);
                        else console.log("Stundent Update For Commission");
                    });
                    studentID = res.insertId
                    response = {
                        "status": 1,
                        "message": "Data submitted successfully",
                        "Data": [],
                        isSuccess: true
                    }
                }
            })
        }

    }
    let buf
    if (error == 1) {
        buf = JSON.stringify(copyData);
    }
    callback(null, {
        'status': '1',
        'message': "Excel file imported successfully",
        'Data': { buf: error == 1 ? buf : '', FileName: req.files.recfile[0].originalname }
    });
}
Service.NearByDataAddByXls = async (TableName, Data, req, callback) => {
    let request = req.body
    let error = 0
    let copyData = Data

    for (let [Index, Obj] of Data.entries()) {
        let errormsg = ''
        console.log(Index + " " + Obj.Title);
       
        if (!Obj.Title || !Obj.Type || !Obj.Page_URL || !Obj.Sequence) {
            error = 1
            if (!Obj.Type) {
                errormsg += "Type required, "
            }
            if (!Obj.Title) {
                errormsg += "Title required, "
            }
            if (!Obj.Page_URL) {
                errormsg += "Page URL required, "
            }
            if (!Obj.Sequence) {
                errormsg += "Sequence required, "
            }
          
            copyData[Index].Error = errormsg
            continue

        }
        if(Obj.Type!=='University' || Obj.Type!=='Area' || Obj.Type!=='City'){
            error = 1
            errormsg += "Wrong Type entered, "
            copyData[Index].Error = errormsg
            continue
        }
        // return false; 
        let query = "select NearBySearchID from Student where Title='" + Obj.Title + "' and Type="+Obj.Type;
        var NearBySearchID = await sqlhelper.select(query, [], (err, res) => {
            if (err) {
                return 0;
            } else if (_.isEmpty(res)) {
                return 0;
            } else {
                return res.NearBySearchID;
            }
        });
        if (NearBySearchID != 0) {
            error = 1
            errormsg += "Title already exist, "
            copyData[Index].Error = errormsg
            continue
        }

        
        if (NearBySearchID == 0) {
            let type='';
            if(Obj.Type!=='University'){
                type='1';
            }
            if(Obj.Type!=='Area'){
                type='2';
            }
            if(Obj.Type!=='City'){
                type='3';
            }
           
            let insert_data = {
                "AccSeoID": request.AccSeoID,
                'Type': type,
                'CountryID': request.CountryID,
                'CityID': request.CityID,
                'Title': Obj.Title,
                'Url': Obj.Page_URL,
                'Sequence': Obj.Sequence,
                'Active': '1',
                'EntryBy': request.UserID,
                'EntryDate': moment().format('YYYY-MM-DD HH:mm:ss'),
            }
            await sqlhelper.insert('Mst_NearBySearch', insert_data, async (err, res) => {
                if (err) {
                    callback(err, new Array());
                }
                else {
                    response = {
                        "status": 1,
                        "message": "Data submitted successfully",
                        "Data": [],
                        isSuccess: true
                    }
                }
            })
        }

    }
    let buf
    let status='1';
    let message='Excel file imported successfully';
    if (error == 1) {
        buf = JSON.stringify(copyData);
        status='0';
        message='Error in imported file.'
    }
    callback(null, {
        'status':status,
        'message': message,
        'Data': { buf: error == 1 ? buf : '', FileName: req.files.recfile[0].originalname }
    });
}

module.exports = Service;