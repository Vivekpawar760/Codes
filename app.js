var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser = require("body-parser");
const busboy = require('connect-busboy');
const busboyBodyParser = require('busboy-body-parser');
var cors = require('cors')
//var cookieParser = require('cookie-parser');
//var logger = require('morgan');
 var multer = require('multer');
 var upload = multer({
    limits: { fileSize: 25 * 1024 * 1024 * 1024 }
});
//var fs = require('fs');



var app = express();
// app.use(busboy());

//json allow
app.use(bodyParser.json({limit: '50mb'})); 

// Body Parser Middleware
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));
// app.use(busboyBodyParser());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// for parsing multipart/form-data
// upload.single('recfile');

// app.use(upload.array('recfile')); 
app.use(upload.fields([{ name: 'recfile', maxCount: 1 }, { name: 'recfile2', maxCount: 8 },{ name: 'recfile3[]', maxCount: 300 },{ name: 'file', maxCount: 8 }])); 

//app.use(logger('dev'));
//app.use(express.json());
//app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});
//app.use(cors());
app.use(cors({ origin: true }));

app.use('/api', require('./api'));
// set port, listen for requests
// app.listen(process.env.port,function(){
//     console.log('Server Running at port:' + this.address().port);
// });

// app.listen(62234,function(){
//     console.log('Server Running at port:' + this.address().port);
// });

// 
// app.get("/", (req, res) => {
//     res.json({ message: "Welcome to bezkoder application." });
//   });

var server = app.listen(62234, function() {
    server.timeout = 0;
    console.log('Server started port : '+this.address().port);
});

module.exports = app;