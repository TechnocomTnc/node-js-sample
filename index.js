const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const port = process.env.PORT || 4000
var quest = "ดี"
var ans


var app2 = require('express')();
var sql = require('mssql');
var sqlInstance = require("mssql");
var bodyParser2 = require('body-parser');
var nodemailer = require('nodemailer');


// parse application/json
app2.use(bodyParser2.json());
app2.use(bodyParser2.urlencoded({
    extended: true
}));

var dbConfig = {
        user: 'sa',
        password: 'p@ssw0rd',
        server: 'localhost', 
        database: 'DB1',
        port:1433,
        options: {
            encrypt: false // Use this if you're on Windows Azure
        }
};

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.post('/webhook', (req, res) => {
    let reply_token = req.body.events[0].replyToken
    //let msg = req.body.events[0].message.text


    var conn = new sql.ConnectionPool(dbConfig);
    conn.connect().then(function () {
                  var reqs = new sql.Request(conn);
                  reqs.query('SELECT * FROM Customer').then(function (rows) {
                    //   ans = "A " + rows.recordset[0].Name
                    ans = "asasassdasds"
                        conn.close();                    
                  })
                 
    })
     reply(reply_token,ans)  
    // reply(reply_token)
    res.sendStatus(200)
})

// function ansdb (req, res){
//     var conn = new sql.ConnectionPool(dbConfig);
//     conn.connect().then(function () {
//                   var req = new sql.Request(conn);
//                   req.query('SELECT * FROM Customer').then(function (rows) {
//                       ans = "A " + rows.recordset[0].Name
//                         reply(reply_token)
//                         conn.close();                    
//                   })  
//     })
// }

// app.get('/users', function (req, res) {
//     var conn = new sql.ConnectionPool(dbConfig);
//     conn.connect().then(function () {
//                   var req = new sql.Request(conn);
//                   req.query('SELECT * FROM Customer').then(function (rows) {
//                         res.send(rows);
//                           conn.close();                    
//                   })  
//     })
// });







app.listen(port)
function reply(reply_token,ans) {        
    // ans = msg;
    // if (msg == quest){
    //         ans = "ดีครับ";
    // }
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {7YR60AJ855Zu1Etxsc7aCdFqhip1o8yAKj7PzLe90ClE9Po0fz5o81BeghtpCki4+zFZ7FrYjjbrFvQw84+Axi+P1zWPnxSCTl/lF5gVTDaDqdC5IHk30qnjo7GQ1hHKizexgGNpBPn/Fwz3slJqkQdB04t89/1O/w1cDnyilFU=}'
    }
    let body = JSON.stringify({

        replyToken: reply_token,
        messages: [{
            type: 'text',
            text: ans
        }]
        
    })
    request.post({
        url: 'https://api.line.me/v2/bot/message/reply',
        headers: headers,
        body: body
    }, (err, res, body) => {
        console.log('status = ' + res.statusCode);
    });
}
