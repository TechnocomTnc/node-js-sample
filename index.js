const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const port = process.env.PORT || 4000
var quest = "ดี"
var ans = "ครับ"


var sql = require('mssql');
var sqlInstance = require("mssql");
var nodemailer = require('nodemailer');


var dbConfig = {
        user: 'sa',
        password: 'P@ssw0rd1234',
        server: 'demomagic2.southeastasia.cloudapp.azure.com', 
        database: 'LinebotDB',
        port:1433,
        options: {
            encrypt: true // Use this if you're on Windows Azure
        }
};

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.post('/webhook', (req, res) => {
    let reply_token = req.body.events[0].replyToken
    let msg = req.body.events[0].message.text
    let sender = req.body.events[0].source.groupId
    reply(reply_token, msg, sender)
    res.sendStatus(200)
})
app.listen(port)
function reply(reply_token, msg, sender) {
    var conn = new sql.ConnectionPool(dbConfig);
    conn.connect().then(function () {
        var req = new sql.Request(conn);
            req.query('SELECT * FROM Question WHERE q_topic = msg', function(rows) {
                if (err) {
                    throw err;
                    console.error(err);
                    conn.close();  
                }else{                  
                        // for (var i=0;i<rows.rowsAffected;i++){
                            // if(rows.recordset[0].q_topic == msg){
                                QID = rows.recordset[0].q_Id
                                // break                          
                            // }else {
                                // arrName = '\nNOT FOUND'
                                // QID = null
                            // }
                        // }
                        req.query('SELECT * FROM Answer WHERE a_Id ='+ QID, function(err, row) {
                            if (err) {
                                throw err;
                                console.error(err);
                                conn.close();  
                            }else{
                                arrName = row.recordset[0].a_topic 

                                let headers = {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer {7YR60AJ855Zu1Etxsc7aCdFqhip1o8yAKj7PzLe90ClE9Po0fz5o81BeghtpCki4+zFZ7FrYjjbrFvQw84+Axi+P1zWPnxSCTl/lF5gVTDaDqdC5IHk30qnjo7GQ1hHKizexgGNpBPn/Fwz3slJqkQdB04t89/1O/w1cDnyilFU=}'
                                }
                                let body = JSON.stringify({
                                    replyToken: reply_token,
                                    messages: [{
                                            type: 'text',
                                            text: arrName
                                        },
                                        {
                                            type: 'text',
                                            text: 'UserId '+ sender
                                        }]
                                })
                                request.post({
                                    url: 'https://api.line.me/v2/bot/message/reply',
                                    headers: headers,
                                    body: body
                                }, (err, res, body) => {
                                    console.log('status = ' + res.statusCode);
                                });
                                conn.close(); 
                            }
                        })
                    
                }
            });


    })

}
