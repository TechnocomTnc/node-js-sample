const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

var app = require('express')();
var sql = require('mssql');
var sqlInstance = require("mssql");
// var nodemailer = require('nodemailer');
const port = process.env.PORT || 4000

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
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

app.get('/users', function (req, res) {
    var conn = new sql.ConnectionPool(dbConfig);
    conn.connect().then(function () {
                  var req = new sql.Request(conn);
                  req.query('SELECT * FROM Customer').then(function (rows) {
                        res.send(rows);
                          conn.close();                    
                  })
                  .catch(function (err) {
                      conn.close();
                      res.send(err);
                  });        
    })
    .catch(function (err) {
        res.send(err);
    });
});




var quest = "ดี"
var ans




app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.post('/webhook', function (req, res) => {
   
    let reply_token = req.body.events[0].replyToken
    let msg = req.body.events[0].message.text
    

    var conn = new sql.ConnectionPool(dbConfig);
        conn.connect().then(function () {
                    var req = new sql.Request(conn);
                    req.query('SELECT * FROM Customer').then(function (rows) {
                           ans = rows.recordset[0].Name;
                            conn.close();                    
                    })
                    .catch(function (err) {
                        conn.close();
                        res.send(err);
                    });        
        })
        .catch(function (err) {
            res.send(err);
        });


    reply(reply_token, msg,ans)

    res.sendStatus(200)



})
app.listen(port)
function reply(reply_token, msg,ans) {        
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
