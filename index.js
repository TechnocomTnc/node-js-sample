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
    let gid = req.body.events[0].source.groupId
    // reply(reply_token, msg)
    if(gid != null)
        groupMs(reply_token,gid,msg)
    res.sendStatus(200)
})
app.listen(port)
function reply(reply_token, msg) {
    var conn = new sql.ConnectionPool(dbConfig);
    conn.connect().then(function () {
        var req = new sql.Request(conn);
            req.query('SELECT * FROM Question', function(err, rows) {
                if (err) {
                    throw err;
                    console.error(err);
                    conn.close();  
                }else{                  
                        // for (var i=0;i<rows.rowsAffected;i++){
                        //     if(rows.recordset[i].q_topic == msg){
                        //         QID = rows.recordset[i].q_Id
                        //         break                          
                        //     }else {
                                arrName = 'num = '+ rows.rowsAffected
                                QID = null
                        //     }
                        // }
                        if(QID!=null){
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
                        }else{
                            let headers = {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer {7YR60AJ855Zu1Etxsc7aCdFqhip1o8yAKj7PzLe90ClE9Po0fz5o81BeghtpCki4+zFZ7FrYjjbrFvQw84+Axi+P1zWPnxSCTl/lF5gVTDaDqdC5IHk30qnjo7GQ1hHKizexgGNpBPn/Fwz3slJqkQdB04t89/1O/w1cDnyilFU=}'
                            }
                            let body = JSON.stringify({
                                replyToken: reply_token,
                                messages: [{
                                        type: 'text',
                                        text: arrName
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
                    
                }
            });


    })

}


function groupMs(reply_token, gid,msg){
    var flag,grid;
    var conn = new sql.ConnectionPool(dbConfig);
    conn.connect().then(function () {
        var req = new sql.Request(conn);
            req.query('SELECT * FROM groupName', function(err, rows) {
                if (err) {
                    throw err;
                    console.error(err);
                    conn.close();  
                }else{
                    for(var i=0;i<rows.rowsAffected;i++){
                        if(rows.recordset[i].groupID == gid){
                            grid = rows.recordset[i].g_Id
                           flag = 1
                            break
                        }else flag = 0
                    }

                    if(flag == 0){
                        var Ngroup = 'Group_' + gid
                        var conn = new sql.ConnectionPool(dbConfig);
                            conn.connect().then(function () {
                                var req = new sql.Request(conn);
                                // req.query("INSERT INTO [dbo].[groupName] ([groupID],[Gname]) VALUES ('" + gid + "','" + Ngroup + "')")
                                
                                req.query("CREATE TABLE [dbo].["+ Ngroup +"]([m_Id] [int] IDENTITY(1,1) NOT NULL,[UID] [varchar](500) NULL,[Mesg] [varchar](500) NULL)")
                                
                                req.query("INSERT INTO [dbo].["+ Ngroup +"] ([UID],[Mesg]) VALUES ('" + gid + "','" + msg + "')")

                        });
                        let headers = {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer {7YR60AJ855Zu1Etxsc7aCdFqhip1o8yAKj7PzLe90ClE9Po0fz5o81BeghtpCki4+zFZ7FrYjjbrFvQw84+Axi+P1zWPnxSCTl/lF5gVTDaDqdC5IHk30qnjo7GQ1hHKizexgGNpBPn/Fwz3slJqkQdB04t89/1O/w1cDnyilFU=}'
                        }
                        let body = JSON.stringify({
                            replyToken: reply_token,
                            messages: [{
                                    type: 'text',
                                    text: Ngroup
                                }]
                        })
                        request.post({
                            url: 'https://api.line.me/v2/bot/message/reply',
                            headers: headers,
                            body: body
                        }, (err, res, body) => {
                            console.log('status = ' + res.statusCode);
                        });
                        // flag = 1
                        conn.close(); 
                    }
                    if(flag == 1){
                        var Ngroup = 'Group_' + gid
                        var conn = new sql.ConnectionPool(dbConfig);
                        conn.connect().then(function () {
                            var req = new sql.Request(conn);
                            //req.query("CREATE TABLE [dbo].[Boardgame_"+ gid +"]([m_Id] [int] IDENTITY(1,1) NOT NULL,[UID] [varchar](500) NULL,[Mesg] [varchar](500) NULL,CONSTRAINT [m_Id] PRIMARY KEY CLUSTERED([m_Id] ASC)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]) ON [PRIMARY]")
                            req.query("INSERT INTO [dbo].["+ Ngroup +"] ([UID],[Mesg]) VALUES ('" + gid + "','" + msg + "')")
                            
                            let headers = {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer {7YR60AJ855Zu1Etxsc7aCdFqhip1o8yAKj7PzLe90ClE9Po0fz5o81BeghtpCki4+zFZ7FrYjjbrFvQw84+Axi+P1zWPnxSCTl/lF5gVTDaDqdC5IHk30qnjo7GQ1hHKizexgGNpBPn/Fwz3slJqkQdB04t89/1O/w1cDnyilFU=}'
                            }
                            let body = JSON.stringify({
                                replyToken: reply_token,
                                messages: [{
                                        type: 'text',
                                        text: msg
                                    }]
                            })
                            request.post({
                                url: 'https://api.line.me/v2/bot/message/reply',
                                headers: headers,
                                body: body
                            }, (err, res, body) => {
                                console.log('status = ' + res.statusCode);
                            });
                    }) 
                    conn.close();   
                }
            }
            })
        })


}
