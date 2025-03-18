const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.json());

// Line messaging API credentials
const LINE_USER_ID = "U4..."; 
const LINE_ACCESS_TOKEN = "qF...";

// Test endpoint
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/send-line-message', async (req, res) => {
  const { message } = req.body;
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
