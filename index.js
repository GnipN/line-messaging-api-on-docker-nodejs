const express = require('express');
const axios = require('axios');
const https = require('https');
const app = express();
const port = 3000;

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Test endpoint
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// LINE webhook endpoint
app.post("/webhook", function (req, res) {
  console.log("Received webhook data:", req.body);
  console.log("Received webhook source:", req.body.events[0].source);
  res.send("HTTP POST request sent to the webhook URL!");
  // If the user sends a message to your bot, send a reply message
  if (req.body.events[0].type === "message") {
    // You must stringify reply token and message data to send to the API server
    const dataString = JSON.stringify({
      // Define reply token
      replyToken: req.body.events[0].replyToken,
      // Define reply messages
      messages: [
        {
          type: "text",
          text: "Hello, user",
        },
        {
          type: "text",
          text: "May I help you?",
        },
      ],
    });

    // Request header. See Messaging API reference for specification
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + LINE_ACCESS_TOKEN,
    };

    // Options to pass into the request, as defined in the http.request method in the Node.js documentation
    const webhookOptions = {
      hostname: "api.line.me",
      path: "/v2/bot/message/reply",
      method: "POST",
      headers: headers,
      body: dataString,
    };

    // When an HTTP POST request of message type is sent to the /webhook endpoint,
    // we send an HTTP POST request to https://api.line.me/v2/bot/message/reply
    // that is defined in the webhookOptions variable.

    // Define our request
    const request = https.request(webhookOptions, (res) => {
      res.on("data", (d) => {
        process.stdout.write(d);
      });
    });

    // Handle error
    // request.on() is a function that is called back if an error occurs
    // while sending a request to the API server.
    request.on("error", (err) => {
      console.error(err);
    });

    // Finally send the request and the data we defined
    // request.write(dataString);
    request.end();
  }
});

// Endpoint to send a message to LINE
app.post('/send-line-message', async (req, res) => {
  // Example request body:
  // {
  //   "message": "test message to LINE",
  //   "LINE_USER_ID": "C8xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  //   "LINE_ACCESS_TOKEN": "qFxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  // }
  const { message, LINE_USER_ID, LINE_ACCESS_TOKEN } = req.body;
  try {
    const response = await axios.post(
      'https://api.line.me/v2/bot/message/push',
      {
        to: LINE_USER_ID, // User ID หรือ Group ID ที่ต้องการส่งข้อความไป
        messages: [{ type: 'text', text: message }], // ✅ ต้องใช้ `messages: [...]`
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_ACCESS_TOKEN}`, // ✅ ต้องมี `Bearer `
        },
      }
    );
    console.log('✅ ส่งข้อความไปที่ LINE สำเร็จ:', response.data);
    res.send(response.data);
  } catch (error) {
    console.error('❌ ไม่สามารถส่งข้อความไปที่ LINE:', error.response ? error.response.data : error.message);
    res.status(500).send(error.response ? error.response.data : error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
