const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();
const PORT = 3000;

// Email setup - USE ENVIRONMENT VARIABLES IN PRODUCTION!
const EMAIL = 'tutelpagebot@gmail.com';
const PASS = 'qwac kvpu orxw vkzu';
const RECEIVER = 'jhonmarkmartinez305@gmail.com';

// Serve static files from public directory
app.use(express.static('public'));
app.use(express.json());

// Nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL,
    pass: PASS
  }
});

// Send server online notification
async function sendServerOnlineEmail() {
  try {
    await transporter.sendMail({
      from: `"Server Monitor" <${EMAIL}>`,
      to: RECEIVER,
      subject: 'Server is Online',
      text: `Your server is now running and accessible at http://localhost:${PORT}`,
      html: `
        <h1>Server Online Notification</h1>
        <p>Your server is now running and accessible at:</p>
        <p><a href="http://localhost:${PORT}">http://localhost:${PORT}</a></p>
        <p>Start time: ${new Date().toString()}</p>
      `
    });
    console.log('Server online notification sent!');
  } catch (err) {
    console.error('Failed to send server online email:', err.message);
  }
}

// Send visitor details via email
async function sendVisitorEmail(visitorData) {
  try {
    const { ip, city, region, country_name } = visitorData;
    
    await transporter.sendMail({
      from: `"Website Visitor Tracker" <${EMAIL}>`,
      to: RECEIVER,
      subject: 'New Website Visitor',
      text: `New visitor details:
IP: ${ip}
Location: ${[city, region, country_name].filter(Boolean).join(', ')}
Time: ${new Date().toISOString()}`,
      html: `<h1>New Visitor</h1>
      <p><strong>IP:</strong> ${ip}</p>
      <p><strong>Location:</strong> ${[city, region, country_name].filter(Boolean).join(', ')}</p>
      <p><strong>Time:</strong> ${new Date().toString()}</p>`
    });
    
    console.log('Visitor email sent!');
  } catch (err) {
    console.error('Failed to send visitor email:', err.message);
  }
}

// Track visitor endpoint
app.post('/track', (req, res) => {
  const visitorData = req.body;
  console.log('Visitor data:', visitorData);
  sendVisitorEmail(visitorData);
  res.status(200).send('OK');
});

// Start server and send online notification
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  sendServerOnlineEmail();
});
