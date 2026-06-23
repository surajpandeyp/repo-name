const mysql = require("mysql");


const conn = mysql.createConnection({
    host:"192.168.86.138",
    user:"suraj",
    password:"password123",
    database:"hackinglabs"
})

conn.connect(function(err){
    if(err) throw err;
    console.log("data base connected");
    
})


module.exports = conn;