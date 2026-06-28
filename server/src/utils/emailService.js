/**
 * Email Service
 * Sends emails using Nodemailer + Gmail SMTP (free)
 */

const nodemailer = require('nodemailer');

// Create Gmail transporter using App Password
const createTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error("Missing Gmail environment variables. Please check your .env file.");
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    connectionTimeout: 5000, // Fail fast if can't connect (5 seconds)
    greetingTimeout: 5000,
    socketTimeout: 10000,
  });
};

/**
 * Send Password Reset Email
 * @param {string} toEmail - Recipient email
 * @param {string} resetToken - Plain text token (not hashed)
 * @param {string} userName - Recipient's name
 */
const sendPasswordResetEmail = async (toEmail, resetToken, userName) => {
  const transporter = createTransporter();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"AlgoVerse" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: '🔐 Reset Your AlgoVerse Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #0a0c10; margin: 0; padding: 0; }
          .container { max-width: 560px; margin: 40px auto; background: #161b22; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
          .header { background: linear-gradient(135deg, #0891b2, #6366f1); padding: 36px 40px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
          .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
          .body { padding: 40px; }
          .body p { color: #c9d1d9; font-size: 15px; line-height: 1.6; margin: 0 0 20px; }
          .btn { display: block; width: fit-content; margin: 28px auto; background: linear-gradient(135deg, #0891b2, #6366f1); color: white !important; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-weight: 600; font-size: 15px; text-align: center; }
          .warning { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245,158,11,0.3); border-radius: 8px; padding: 14px 18px; margin-top: 20px; }
          .warning p { color: #f59e0b; font-size: 13px; margin: 0; }
          .footer { padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; }
          .footer p { color: #6e7681; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AlgoVerse</h1>
            <p>Algorithmic Interview Practice Platform</p>
          </div>
          <div class="body">
            <p>Hi <strong style="color:#22d3ee">${userName}</strong>,</p>
            <p>We received a request to reset your AlgoVerse password. Click the button below to set a new password:</p>
            <a href="${resetUrl}" class="btn">🔐 Reset My Password</a>
            <div class="warning">
              <p>⚠️ This link expires in <strong>1 hour</strong>. If you did not request this, please ignore this email — your account is safe.</p>
            </div>
            <p style="margin-top:24px; font-size:13px; color:#6e7681;">Or copy this link into your browser:<br>
              <span style="color:#22d3ee; word-break:break-all;">${resetUrl}</span>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} AlgoVerse. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail };
