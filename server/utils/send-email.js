const nodemailer = require('nodemailer');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const sendEmail = async (options) => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const fromEmail = process.env.SMTP_FROM_EMAIL;
  const fromName = process.env.SMTP_FROM_NAME || 'SoftraTees';

  if (!host || !port || !user || !pass || !fromEmail) {
    console.error('[Forgot Password] Missing required SMTP environment variables.');
    throw new Error('SMTP configuration missing.');
  }

  const transporter = nodemailer.createTransport({
    host: host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: {
      user: user,
      pass: pass,
    },
  });

  try {
    console.log('[Forgot Password] Attempting SMTP connection');
    await transporter.verify();
  } catch (err) {
    console.error('[Forgot Password] SMTP Authentication failed:', err.message);
    throw new Error('Email could not be sent due to configuration error.');
  }

  const message = {
    from: `${fromName} <${fromEmail}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  if (options.message) {
    message.text = options.message;
  }

  console.log('[Forgot Password] Sending OTP email');
  try {
    const info = await transporter.sendMail(message);
    console.log('[Forgot Password] OTP email sent successfully. Message ID:', info.messageId);
  } catch (error) {
    console.error('[Forgot Password] Email sending failed:', error.message);
    throw new Error('Email could not be sent. Please try again later.');
  }
};

module.exports = sendEmail;
