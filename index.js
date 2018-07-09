const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const port = process.env.PORT || 4000


var quest = "ดี"
var ans




app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.post('/webhook', (req, res) => {
    let reply_token = req.body.events[0].replyToken
    let msg = req.body.events[0].message.text
    reply(reply_token, msg)
    res.sendStatus(200)
})
app.listen(port)
function reply(reply_token, msg) {        
    
    if (msg == quest){
            ans = "ดีครับ";
        }
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
