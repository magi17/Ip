const express = require('express');
const nodemailer = require('nodemailer');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Hardcoded email config
const EMAIL_USER = 'tutelpagebot@gmail.com';
const EMAIL_PASS = 'qwac kvpu orxw vkzu';
const EMAIL_RECEIVERS = ['tutelpagebot@gmail.com', 'jhonmarkmartinez305@gmail.com'];

// Serve static HTML
app.use(express.static(path.join(__dirname, 'public')));

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Send email when server starts
let startupEmailSent = false;
async function sendStartupEmail(domainUrl) {
  if (startupEmailSent) return;
  startupEmailSent = true;

  try {
    await transporter.sendMail({
      from: `"Website Monitor" <${EMAIL_USER}>`,
      to: EMAIL_RECEIVERS,
      subject: 'Server is UP',
      html: `<h2>Website is live</h2><p>The server has started at <b>${domainUrl}</b></p>`
    });
    console.log('Startup email sent.');
  } catch (err) {
    console.error('Error sending startup email:', err.message);
  }
}

// Send email when someone visits the site
async function sendVisitorEmail(ip) {
  try {
    if (ip.startsWith('::1') || ip.startsWith('127.0.0.1') || ip.startsWith('::ffff:127.0.0.1')) return;

    const cleanIP = ip.includes(',') ? ip.split(',')[0].trim() : ip;
    const { data: location } = await axios.get(`https://ipapi.co/${cleanIP}/json/`);

    const html = `
      <h2>New Website Visitor</h2>
      <p><strong>IP Address:</strong> ${cleanIP}</p>
      <p><strong>City:</strong> ${location.city}</p>
      <p><strong>Region:</strong> ${location.region}</p>
      <p><strong>Country:</strong> ${location.country_name}</p>
      <p><strong>ISP:</strong> ${location.org}</p>
      <p><strong>Timezone:</strong> ${location.timezone}</p>
    `;

    await transporter.sendMail({
      from: `"Website Visitor" <${EMAIL_USER}>`,
      to: EMAIL_RECEIVERS,
      subject: 'Website Visit Detected',
      html
    });

    console.log(`Visit email sent for IP: ${cleanIP}`);
  } catch (err) {
    console.error('Error sending visit email:', err.message);
  }
}

// Route to handle visits
app.get('/', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const domainUrl = `${req.protocol}://${req.headers.host}`;
  sendVisitorEmail(ip);
  sendStartupEmail(domainUrl); // will only send once
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
