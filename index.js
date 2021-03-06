'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const bodyParser = require('body-parser')
const request = require('request')
var sql = require('mssql');
var sqlInstance = require("mssql");


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




// create LINE SDK config from env variables
const config = {
  channelAccessToken: '7YR60AJ855Zu1Etxsc7aCdFqhip1o8yAKj7PzLe90ClE9Po0fz5o81BeghtpCki4+zFZ7FrYjjbrFvQw84+Axi+P1zWPnxSCTl/lF5gVTDaDqdC5IHk30qnjo7GQ1hHKizexgGNpBPn/Fwz3slJqkQdB04t89/1O/w1cDnyilFU=',
  channelSecret: 'c3aa02ca5442a7640d2c577f936da0d4',
};

// base URL for webhook server
const baseURL = 'https://nodejs-bot12.herokuapp.com';

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// serve static and downloaded files
app.use('/static', express.static('static'));
app.use('/downloaded', express.static('downloaded'));

// app.use(bodyParser.urlencoded({ extended: true }))
// app.use(bodyParser.json())

// webhook callback
app.post('/callback', line.middleware(config), (req, res) => {
  // req.body.events should be an array of events
  if (!Array.isArray(req.body.events)) {
    return res.status(500).end();
  }

  // handle events separately
  Promise.all(req.body.events.map(handleEvent))
    .then(() => res.end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// simple reply function
const replyText = (token, texts) => {
  texts = Array.isArray(texts) ? texts : [texts];
  return client.replyMessage(
    token,
    texts.map((text) => ({ type: 'text', text }))
  );
};

// callback function to handle a single event
function handleEvent(event) {
  switch (event.type) {
    case 'message':
      const message = event.message;
      switch (message.type) {
        case 'text':
          return handleText(message, event.replyToken, event.source);
        case 'image':
          return handleImage(message, event.replyToken, event.source);
        case 'video':
          return handleText(message, event.replyToken, event.source);
          //return handleVideo(message, event.replyToken);
        case 'audio':
          return handleAudio(message, event.replyToken);
        case 'location':
          return handleLocation(message, event.replyToken);
        case 'sticker':
          return handleSticker(message, event.replyToken);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }

    case 'follow':
      return replyText(event.replyToken, 'Got followed event');

    case 'unfollow':
      return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);

    case 'join':
      return replyText(event.replyToken, `Joined ${event.source.type}`);

    case 'leave':
      return console.log(`Left: ${JSON.stringify(event)}`);

    case 'postback':
      let data = event.postback.data;
      if (data === 'DATE' || data === 'TIME' || data === 'DATETIME') {
        data += `(${JSON.stringify(event.postback.params)})`;
      }
      return replyText(event.replyToken, `Got postback: ${data}`);

    case 'beacon':
      return replyText(event.replyToken, `Got beacon: ${event.beacon.hwid}`);

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

function handleText(message, replyToken, source) {
  const buttonsImageURL = `${baseURL}/static/buttons/1040.jpg`;
  return replyText(replyToken, {
                    type: 'text',
                    text: 'ssd'
                    });


  // switch (message.text) {
  //   case 'profile':
  //     if (source.userId) {
  //       return client.getProfile(source.userId)
  //         .then((profile) => replyText(
  //           replyToken,
  //           [
  //             `Display name: ${profile.displayName}`,
  //             `Status message: ${profile.statusMessage}`,
  //           ]
  //         ));
  //     } else {
  //       return replyText(replyToken, 'Bot can\'t use profile API without user ID');
  //     }
  //   case 'buttons':
  //     return client.replyMessage(
  //       replyToken,
  //       {
  //         type: 'template',
  //         altText: 'Buttons alt text',
  //         template: {
  //           type: 'buttons',
  //           thumbnailImageUrl: buttonsImageURL,
  //           title: 'My button sample',
  //           text: 'Hello, my button',
  //           actions: [
  //             { label: 'Go to line.me', type: 'uri', uri: 'https://line.me' },
  //             { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
  //             { label: '言 hello2', type: 'postback', data: 'hello こんにちは', text: 'hello こんにちは' },
  //             { label: 'Say message', type: 'message', text: 'Rice=米' },
  //           ],
  //         },
  //       }
  //     );
  //   case 'confirm':
  //     return client.replyMessage(
  //       replyToken,
  //       {
  //         type: 'template',
  //         altText: 'Confirm alt text',
  //         template: {
  //           type: 'confirm',
  //           text: 'Do it?',
  //           actions: [
  //             { label: 'Yes', type: 'message', text: 'Yes!' },
  //             { label: 'No', type: 'message', text: 'No!' },
  //           ],
  //         },
  //       }
  //     )
  //   case 'carousel':
  //     return client.replyMessage(
  //       replyToken,
  //       {
  //         type: 'template',
  //         altText: 'Carousel alt text',
  //         template: {
  //           type: 'carousel',
  //           columns: [
  //             {
  //               thumbnailImageUrl: buttonsImageURL,
  //               title: 'hoge',
  //               text: 'fuga',
  //               actions: [
  //                 { label: 'Go to line.me', type: 'uri', uri: 'https://line.me' },
  //                 { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
  //               ],
  //             },
  //             {
  //               thumbnailImageUrl: buttonsImageURL,
  //               title: 'hoge',
  //               text: 'fuga',
  //               actions: [
  //                 { label: '言 hello2', type: 'postback', data: 'hello こんにちは', text: 'hello こんにちは' },
  //                 { label: 'Say message', type: 'message', text: 'Rice=米' },
  //               ],
  //             },
  //           ],
  //         },
  //       }
  //     );
  //   case 'image carousel':
  //     return client.replyMessage(
  //       replyToken,
  //       {
  //         type: 'template',
  //         altText: 'Image carousel alt text',
  //         template: {
  //           type: 'image_carousel',
  //           columns: [
  //             {
  //               imageUrl: buttonsImageURL,
  //               action: { label: 'Go to LINE', type: 'uri', uri: 'https://line.me' },
  //             },
  //             {
  //               imageUrl: buttonsImageURL,
  //               action: { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
  //             },
  //             {
  //               imageUrl: buttonsImageURL,
  //               action: { label: 'Say message', type: 'message', text: 'Rice=米' },
  //             },
  //             {
  //               imageUrl: buttonsImageURL,
  //               action: {
  //                 label: 'datetime',
  //                 type: 'datetimepicker',
  //                 data: 'DATETIME',
  //                 mode: 'datetime',
  //               },
  //             },
  //           ]
  //         },
  //       }
  //     );
  //   case 'datetime':
  //     return client.replyMessage(
  //       replyToken,
  //       {
  //         type: 'template',
  //         altText: 'Datetime pickers alt text',
  //         template: {
  //           type: 'buttons',
  //           text: 'Select date / time !',
  //           actions: [
  //             { type: 'datetimepicker', label: 'date', data: 'DATE', mode: 'date' },
  //             { type: 'datetimepicker', label: 'time', data: 'TIME', mode: 'time' },
  //             { type: 'datetimepicker', label: 'datetime', data: 'DATETIME', mode: 'datetime' },
  //           ],
  //         },
  //       }
  //     );
  //   case 'imagemap':
  //     return client.replyMessage(
  //       replyToken,
  //       {
  //         type: 'imagemap',
  //         baseUrl: `${baseURL}/static/rich`,
  //         altText: 'Imagemap alt text',
  //         baseSize: { width: 1040, height: 1040 },
  //         actions: [
  //           { area: { x: 0, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/manga/en' },
  //           { area: { x: 520, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/music/en' },
  //           { area: { x: 0, y: 520, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/play/en' },
  //           { area: { x: 520, y: 520, width: 520, height: 520 }, type: 'message', text: 'URANAI!' },
  //         ],
  //       }
  //     );
  //   case 'bye':
  //     switch (source.type) {
  //       case 'user':
  //         return replyText(replyToken, 'Bot can\'t leave from 1:1 chat');
  //       case 'group':
  //         return replyText(replyToken, 'Leaving group')
  //           .then(() => client.leaveGroup(source.groupId));
  //       case 'room':
  //         return replyText(replyToken, 'Leaving room')
  //           .then(() => client.leaveRoom(source.roomId));
  //     }
  //   default:
  //     //console.log(`Echo message to ${replyToken}: ${message.text}`);
  //     return replyText(replyToken, {
  //         type: 'text',
  //         text: 'ssd'
  //       });
  // }
}

function handleImage(message, replyToken, source) {
  const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.jpg`);
  const previewPath = path.join(__dirname, 'downloaded', `${message.id}-preview.jpg`);

  // const downloadPath = path.join('/app/downloaded/8257390405541.jpg')
  // const previewPath = path.join('/app/downloaded/8257390405541-preview.jpg')


  return downloadContent(message.id, downloadPath)
    .then((downloadPath) => {
      // ImageMagick is needed here to run 'convert'
      // Please consider about security and performance by yourself
      cp.execSync(`convert -resize 240x jpeg:${downloadPath} jpeg:${previewPath}`);
      var  originalContentUrlT = baseURL + '/downloaded/' + path.basename(downloadPath)
      var  previewImageUrlT = baseURL + '/downloaded/' + path.basename(previewPath)
      var  UsID = source.userId
      var AdownloadPath 
      var ApreviewPath
      var name
      var conn = new sql.ConnectionPool(dbConfig);
      conn.connect().then(function () {
                    var req = new sql.Request(conn);
                    req.query("INSERT INTO [dbo].[Image] ([Image_id],[oridinal],[preview],[user_id]) VALUES ('" + message.id + "','" + originalContentUrlT + "','" + previewImageUrlT + "','" + UsID + "')")
                    //req.query("INSERT INTO [dbo].["+ gid +"] ([UID],[Mesg]) VALUES ('" + uid + "','" + msg + "')")
                    req.query('SELECT * FROM Image').then(function (rows) 
                    {
                    for(var i=0;i<rows.rowsAffected;i++){
                      if(rows.recordset[i].Image_id == message.id)
                      {
                        AdownloadPath = rows.recordset[i].oridinal;
                        ApreviewPath = rows.recordset[i].preview;
                      }
                    }
                     
                      //name = rows.recordset[1].Image_id;
                     return client.replyMessage(
                      replyToken,
                      {
                        // type: 'text',
                        // text: AdownloadPath + '\n' + ApreviewPath
        
                        type: 'image',
                        originalContentUrl: AdownloadPath,
                        previewImageUrl: ApreviewPath
                        
                         
                        
                      }
                    );

                    }) 
                  });

      
    });
}

function handleVideo(message, replyToken) {
  const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.mp4`);
  const previewPath = path.join(__dirname, 'downloaded', `${message.id}-preview.jpg`);

  return downloadContent(message.id, downloadPath)
    .then((downloadPath) => {
      // FFmpeg and ImageMagick is needed here to run 'convert'
      // Please consider about security and performance by yourself
      cp.execSync(`convert mp4:${downloadPath}[0] jpeg:${previewPath}`);

      return client.replyMessage(
        replyToken,
        {
          type: 'video',
          originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
          previewImageUrl: baseURL + '/downloaded/' + path.basename(previewPath),
        }
      );
    });
}

function handleAudio(message, replyToken) {
  const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.m4a`);

  return downloadContent(message.id, downloadPath)
    .then((downloadPath) => {
      var getDuration = require('get-audio-duration');
      var audioDuration;
      getDuration(downloadPath)
        .then((duration) => { audioDuration = duration; })
        .catch((error) => { audioDuration = 1; })
        .finally(() => {
          return client.replyMessage(
            replyToken,
            {
              type: 'audio',
              originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
              duration: audioDuration * 1000,
            }
          );
        });
    });
}

function downloadContent(messageId, downloadPath) {
  return client.getMessageContent(messageId)
    .then((stream) => new Promise((resolve, reject) => {
      const writable = fs.createWriteStream(downloadPath);
      stream.pipe(writable);
      stream.on('end', () => resolve(downloadPath));
      stream.on('error', reject);
    }));
}

function handleLocation(message, replyToken) {
  return client.replyMessage(
    replyToken,
    {
      type: 'location',
      title: message.title,
      address: message.address,
      latitude: message.latitude,
      longitude: message.longitude,
    }
  );
}

function handleSticker(message, replyToken) {
  return client.replyMessage(
    replyToken,
    {
      type: 'sticker',
      packageId: message.packageId,
      stickerId: message.stickerId,
    }
  );
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
