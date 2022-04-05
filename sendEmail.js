const AWS = require('aws-sdk');
const awsKey = require('../config/responseMsg');
const MailConfig = require('../config/responseMsg');
const { config } = require('../config/read.db');
const nodemailer = require('nodemailer');
const Commom = require("../CommonMethod/CommonFunction");
const dotenv = require('dotenv');
dotenv.config();
let AllowMail = process.env.AllowMail;



// https://attacomsian.com/blog/amazon-ses-integration-nodejs#
AWS.config.update({
    region: 'ap-south-1',
    accessKeyId: 'AKIAWSFWKOWRVQWMFWII',
    secretAccessKey: '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'
});
const Send_Mail = function (Send_Mail) {
    this.Device_Name = Send_Mail.Device_Name;
};
// (toemail,ccemail,bccemail,subject,body,senderemail)
Send_Mail.sendemail = async() => {
    //  console.log('in fn');
    var params = {
        Destination: {
            CcAddresses: ['hasmukh@dnktechnologies.com'],
            ToAddresses: ['hasmukh@dnktechnologies.com']
        },

        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: "<p>header test</p>"
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: "Test Email"
            }
        },
        Source: "info@meditag.in",
        ReplyToAddresses: [
            "info@meditag.in"
        ]
    }

    // Create the promise and SES service object
    var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
    //  console.log('in pro');
    // Handle promise's fulfilled/rejected states
    sendPromise.then(
        function(data) {
            console.log(data.MessageId);
        }).catch(
        function(err) {
            console.error(err, err.stack);
        });
}

Send_Mail.sendemail = async(subject, to, body) => {
    //  console.log('in fn');
    let toemail = "info@meditag.in";
    var params = {
        Destination: {
            CcAddresses: [MailConfig.EmailConfig.CcAddresses],
            ToAddresses: [toemail]
        },

        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: body
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: subject
            }
        },
        Source: "info@meditag.in",
        ReplyToAddresses: [
            to
            //MailConfig.EmailConfig.CcAddresses
        ]
    }
    if(AllowMail == "true")
    {
        return new Promise(resolve => {
            // Create the promise and SES service object
            var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
            //  console.log('in pro');
            // Handle promise's fulfilled/rejected states
            sendPromise.then(
                function(data) {
                    console.log(data.MessageId);
                    resolve(data)
                }).catch(
                function(err) {
                    console.error(err, err.stack);
                    resolve(err)
                });
        });
    }
    else
    {
        return 
    }
}


Send_Mail.InquiryBody = (Name, Email, Subject, Message) => {
    return '<table cellspacing="0" cellpadding="0" border="0" style="width:750px;margin:0 auto; background: #f5f5f5;font-family: "Rubik", sans-serif;font-weight: 300;margin: 0;padding: 0;background: #fff;height: 100%;width: 100%;"> <tr> <td style="background-image: url(https://meditag.s3.ap-south-1.amazonaws.com/Appicon/email_bg_logo.png);background-repeat: no-repeat;background-size: 100%; width: 100%;"> <div> <table cellspacing="0" cellpadding="0" border="0" style="width:570px; margin: 0 auto; padding: 20px 0px;"> <tr> <td> <a href="#"><img src="https://meditag.s3.ap-south-1.amazonaws.com/Appicon/meditag_white_logo.png" style="padding: 5px 0px; width: 200px;"></a> </td><td> <p style="color: #fff; font-size: 14px; text-align: right;">info@meditag.in</p></td></tr></table> </div><table cellspacing="0" cellpadding="0" border="0" style="width: 570px; margin: 0 auto; background-color: #fff;"> <tr> <td><table cellspacing="0" cellpadding="0" border="0" style="padding: 30px 30px;"> <tr> <td> <span style="font-weight: 500; font-size: 16px; letter-spacing: 0.5px;">Dear User,</span><p style="color: #787878; font-weight: 400; font-size: 14px; letter-spacing: 0.5px;">Subject : ' + Subject + '</p> <p style="color: #787878; font-weight: 400; font-size: 14px; letter-spacing: 0.5px;">Name : ' + Name + '</p><p style="color: #787878; font-weight: 400; font-size: 14px; letter-spacing: 0.5px;">Email ID : ' + Email + '</p><p style="color: #787878; font-weight: 300; font-size: 14px; letter-spacing: 0.5px;">' + Message + '</p></td></tr><tr> <td style="padding:20px 0px;"> <p style="border-top: 1px solid #44444417; margin: 0px;"> </p></td></tr><tr> <td> <p style="color: #787878; font-weight: 500; font-size: 14px;">Have a great day,</p><p style="font-weight: 500; font-size: 14px;">The meditag staff</p></td></tr></table> <table width="100%" border="0" cellpadding="10" cellspacing="0" style="background-color: rgba(210, 19, 29, 0.1)"> <tr align="center"> <td style="border-bottom: 1px solid #ddd;"> <a> <img src="https://meditag.s3.ap-south-1.amazonaws.com/Appicon/meditag_logo.png" alt="" style="padding: 0px 0px 10px 0px; width: 200px;"> </a> </td></tr><tr> <td> <table width="100%" border="0" cellpadding="4" cellspacing="0"> <tr> <td> <img src="https://meditag.s3.ap-south-1.amazonaws.com/Appicon/location_icon.png" alt="" style="width: 18px;"> </td><td> <span style="font-size:14px;color:#000;">C-202,Diamond World, Near MiniBazar, Opp. Varachha Road, Surat - 395006</span> </td></tr><tr> <td> <img src="https://meditag.s3.ap-south-1.amazonaws.com/Appicon/web_icon.png" alt="" style="width: 18px;"> </td><td style="font-size:14px;color:#000;"> <a href="" style="color:#000;text-decoration:none" target="_blank">www.meditag.in</a> </td></tr><tr> <td> <img src="https://meditag.s3.ap-south-1.amazonaws.com/Appicon/mail_icon.png" alt="" style="width: 18px;"> </td><td style="color:#000;"> <a style="font-size:14px; color:#000;text-decoration:none">info@meditag.in</a> </td></tr><tr> <td> <img src="https://meditag.s3.ap-south-1.amazonaws.com/Appicon/call_icon.png" alt="" style="width: 18px;"> </td><td style="font-size:14px;color:#000;">+91 8000141414 (FOR INDIA) </td></tr></table> </td></tr></table> </td></tr></table>'
}



// nainesh send email
Send_Mail.Ocxee_MailNotification = (ToMail,CCMail, Subject, Contant) => {
    var mailImage='https://admin.ocxee.com/assets/images/mail';
    var Header='<!DOCTYPE html>'+
    '<html lang="en">'+
    '<head>'+
        '<title>Email</title>'+
        '<meta charset="utf-8">'+
        '<meta name="viewport" content="width=device-width, initial-scale=1">'+
        '<link rel="preconnect" href="https://fonts.gstatic.com">'+
        '<link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">'+
        '<style>body {font-family: "Montserrat", sans-serif;margin: 0;padding: 0;background: #f9f9f9;height: 100%;width: 100%;}table.client-logo tr td {text-align: center;}table.client-logo tr td img {background-color: #fff;border-radius: 5px;width: 90%;box-shadow: 0px 0px 2px 0px #ccc;margin: 4px auto;}</style>'+
    '</head>'+
    '<body>'+
        '<table cellspacing="0" cellpadding="0" border="0" style="width: 750px; margin: 0 auto; background: #f5f5f5;">'+
            '<tr>'+
                '<td style="background-image: url('+mailImage+'/top_bg.png); background-repeat: no-repeat; background-size: 100%; width: 100%;">'+
                    '<table cellspacing="0" cellpadding="0" border="0" style="width: 570px; margin: 0 auto; padding: 20px 0px;">'+
                        '<tr>'+
                            '<td style="width: 70%;">'+
                                '<a href="https://www.ocxee.com/" target="_blank">'+
                                    '<img src="'+mailImage+'/logo.png"></a>'+
                            '</td>'+
                            '<td style="padding: 5px 5px; background-color: #09518b; border: 1px solid #09518b; border-radius: 5px; margin: 0;">'+
                                '<a href="" target="_blank" style="text-decoration: none;">'+
                                    '<img src="'+mailImage+'/icon.png" style="float: left; margin-right: 10px; margin-left: 10px;">'+
                                    '<p style="color: #fff; font-size: 12px; font-weight: 700; margin: 4px 0px;">+91 98765 43210</p>'+
                                '</a>'+
                            '</td>'+
                        '</tr>'+
                    '</table>';
    var Footer='<table cellspacing="0" cellpadding="0" border="0" style="width: 570px; margin: 0 auto 15px auto; background-color: #09518b;">'+
                '<tr>'+
                    '<td>'+
                        '<table cellspacing="0" cellpadding="0" border="0" style="padding: 30px 30px; width: 100%; text-align: center;">'+
                            '<tr>'+
                                '<td>'+
                                    '<h4 style="color: #fff; font-weight: 600; margin-top: 0px; margin-bottom: 10px;">CONTACT-DETAILS</h4>'+
                                '</td>'+
                            '</tr>'+
                            '<tr>'+
                                '<td style="padding: 10px 30px;">'+
                                    '<p style="border-bottom: 1px solid #0d60a2; margin: 0px;"></p>'+
                                '</td>'+
                            '</tr>'+
                            '<tr>'+
                                '<td>'+
                                    '<p style="color: #ebebeb; font-weight: 500; font-size: 14px; padding: 0px 30px;">5 Pearmain House, 16 Apple Grove, Harrow HA2 0FJ, England.</p>'+
                                    '<p style="color: #ebebeb; font-weight: 500; font-size: 14px;">Email : info@ocxee.com</p>'+
                                    '<p style="color: #ebebeb; font-weight: 500; font-size: 14px; margin-bottom: 0px;">Mo. : +44 7450 488 811</p>'+
                                '</td>'+
                            '</tr>'+
                        '</table>'+
                    '</td>'+
                '</tr>'+
            '</table>'+

            '</td>'+
            '</tr>'+
            '</table>'+

            '</body>'+
            '</html>';
    var body = Header+''+Contant+''+Footer;

    var respo = exports.Ocxee_SMTP_Mail(ToMail,CCMail,Subject,body);
    console.log(respo);
}

Send_Mail.Ocxee_SMTP_Mail = async(ToMail,CCMail='',Subject, body,IsProperty=false, result) => {
    let GmailData={};
    if(IsProperty)
    {
        GmailData={
            'mail':process.env.ACCOMMODATION_MAIL_ACCOUNT,
            'pass':process.env.ACCOMMODATION_MAIL_PASSWORD
        }
    }
    else
    {
        GmailData={
            'mail':process.env.GMAIL_ACCOUNT,
            'pass':process.env.GMAIL_PASSWORD
        }
    }
    // console.log(GmailData);
    const transporter = nodemailer.createTransport({
        // host: "smtp.gmail.com",
        secure: false,
        // port: 25, 
        service: 'gmail',
        auth: {
            user: GmailData.mail,
            pass: GmailData.pass
        },
        tls: {
            rejectUnauthorized: false
        },
        // debug: true, // show debug output
        // logger: true 
    });

    var mailOptions = {
        from: GmailData.mail,
        to: ToMail,
        cc: CCMail,
        subject: Subject,
        html: body
    };

    if(AllowMail == "true")
    {
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
                result(error);
            }else{
                // console.log(info);
                result(null, info);
                return;
            }
        });
    }
    else
    {
        result(null, '');
        return
    }
       
}


Send_Mail.Ocxee_SMTP_Mail_Multiple = async(EmailData,CCMail='',callback) => {
    const transporter = nodemailer.createTransport({
        // host: "smtp.gmail.com",
        // secure: false,
        // port: 25, 
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_ACCOUNT,
            pass: process.env.GMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        },
        // debug: true, // show debug output
        // logger: true 
    });
    let status = 0;
    if(AllowMail == "true"){
        if(Array.isArray(EmailData.ToMail)){
            for (const [key, value] of Object.entries(EmailData.ToMail)) {
                // var body = EmailData.TemplateBody.replace('{First Name}', value.split("@")[0])
                var body = EmailData.TemplateBody.replace('{First Name}', "Student")
                .replace('{unsubscribelink}','https://www.ocxee.com/unsubscribemail?email='+Commom.Encode(value.trim()));
                var mailOptions = {
                    from: process.env.GMAIL_ACCOUNT,
                    to: value.trim(),
                    cc: CCMail,
                    subject: EmailData.TemplateSubject,
                    html: body
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if(error){
                        callback(error);
                    }else{
                        callback(null, info);
                        return;
                    }
                });
            }
        }else{
            var mailOptions = {
                from: process.env.GMAIL_ACCOUNT,
                to: EmailData.ToMail.trim(),
                cc: CCMail,
                subject: EmailData.TemplateSubject,
                html: EmailData.TemplateBody
            };
            return new Promise(resolve =>{
                transporter.sendMail(mailOptions, (error, info) => {
                    if(error){
                        resolve(callback('','0'));
                    }else{
                        resolve(callback(null, '1'));
                    }
                });        
            })
        }
    }else{
        return new Promise(resolve =>{
            resolve(callback(null, '0'))
        }); 
    }
}
// without call back function
Send_Mail.Ocxee_SMTP_Mail_Multiple2 = async(EmailData,CCMail='') => {

    const transporter = nodemailer.createTransport({
        // host: "smtp.gmail.com",
        // secure: false,
        // port: 25, 
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_ACCOUNT,
            pass: process.env.GMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        },
        // debug: true, // show debug output
        // logger: true 
    });
    if(AllowMail == "true"){
        console.log(EmailData.ToMail);
        if(Array.isArray(EmailData.ToMail)){
            for (const [key, value] of Object.entries(EmailData.ToMail)) {
                // var body = EmailData.TemplateBody.replace('{First Name}', value.split("@")[0])
                var body = EmailData.TemplateBody.replace('{First Name}', "Student")
                .replace('{unsubscribelink}','https://www.ocxee.com/unsubscribemail?email='+Commom.Encode(value.trim()));
                var mailOptions = {
                    from: process.env.GMAIL_ACCOUNT,
                    from: process.env.GMAIL_ACCOUNT,
                    to: value.trim(),
                    cc: CCMail,
                    subject: EmailData.TemplateSubject,
                    html: body
                };
                transporter.sendMail(mailOptions, (error, info) => {});
            }
            return new Promise(resolve =>{
                resolve('1')
            }); 
        }else{
            var mailOptions = {
                from: process.env.GMAIL_ACCOUNT,
                to: EmailData.ToMail.trim(),
                // to: 'vivekp.dnk@gmail.com',
                cc: CCMail,
                subject: EmailData.TemplateSubject,
                html: EmailData.TemplateBody,
                attachments : EmailData.attachments||[]
            };
            return new Promise(resolve =>{
                transporter.sendMail(mailOptions, (error, info) => {
                    if(error){
                        console.log(error);
                        resolve('0');
                    }else{
                        resolve('1');
                    }
                });        
            })
        }
    }else{
        return new Promise(resolve =>{
            resolve('0')
        }); 
    }
}

module.exports = Send_Mail;