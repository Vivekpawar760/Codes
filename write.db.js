
let dbConfig = {};
const dotenv = require('dotenv');
dotenv.config();
let isLive = process.env.ISONLINE;

if(isLive == "true"){
    dbConfig = {
        host: 'ocxee.cxcfdm32cdkz.eu-west-2.rds.amazonaws.com',
        user: 'admin',
        password: 'ndZdLvqqfWsxmS8q',
        database: 'Ocxee',
        port: 3306
    };
}else{
    dbConfig = {
        host: 'ocxee.cxcfdm32cdkz.eu-west-2.rds.amazonaws.com',
        user: 'testocxee',
        password: 'OvijFBHWqkQgJlAK',
        database: 'testocxee',
        port: 3306
    };
}


const mysql = require("mysql");
//const dbConfig = require("../config/db.config.js");

// Create a connection to the database
const connection = mysql.createConnection(dbConfig);

// open the MySQL connection
connection.connect(error => {
    if (error) throw error;
    var status = isLive=="true" ? "live" : "test";
    console.log("Successfully connected to the "+status+" database.");
});

module.exports = connection;
module.exports.dbConfig = dbConfig;