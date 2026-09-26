const { BrevoClient } = require('@getbrevo/brevo');

const sendEmail = async (options) => {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL;
  const fromName = process.env.BREVO_FROM_NAME || 'SoftraTees';

  if (!apiKey || !fromEmail) {
    console.error('[Forgot Password] Missing required Brevo environment variables. BREVO_API_KEY configured:', !!apiKey, 'BREVO_FROM_EMAIL configured:', !!fromEmail);
    throw new Error('Email configuration missing.');
  }

  const client = new BrevoClient({ apiKey: apiKey });

  console.log(`[Forgot Password] Brevo configuration detected for: ${fromEmail}`);

  const emailData = {
    subject: options.subject,
    htmlContent: options.html,
    sender: { name: fromName, email: fromEmail },
    to: [{ email: options.email }]
  };

  if (options.message) {
    emailData.textContent = options.message;
  }

  console.log('[Forgot Password] Sending OTP email via Brevo API');
  
  try {
    const data = await client.transactionalEmails.sendTransacEmail(emailData);
    console.log('[Forgot Password] OTP email sent successfully. Message ID:', data.messageId);
    console.log('[Forgot Password] Email sent successfully');
  } catch (error) {
    // Log backend error safely without exposing keys
    const statusCode = error.response ? error.response.status : 'Unknown';
    console.error(`[Forgot Password] Email sending failed via Brevo. Status:`, statusCode, `Error:`, error.message);
    throw new Error('Email could not be sent. Please try again later.');
  }
};

module.exports = sendEmail;
