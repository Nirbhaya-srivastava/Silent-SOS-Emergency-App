import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: config.gmail.user,
    pass: config.gmail.appPassword,
  },
});

export async function sendEmergencyEmail({
  to,
  subject,
  message,
}) {
  try {
    if (!config.gmail.user) {
      console.error(
        '[GMAIL EMAIL FAILED] GMAIL_USER is missing.'
      );

      return {
        success: false,
        provider: 'gmail',
        error: 'GMAIL_USER is not configured.',
      };
    }

    if (!config.gmail.appPassword) {
      console.error(
        '[GMAIL EMAIL FAILED] GMAIL_APP_PASSWORD is missing.'
      );

      return {
        success: false,
        provider: 'gmail',
        error: 'GMAIL_APP_PASSWORD is not configured.',
      };
    }

    if (!to || typeof to !== 'string') {
      return {
        success: false,
        provider: 'gmail',
        error: 'Recipient email address is missing or invalid.',
      };
    }

    if (!subject || typeof subject !== 'string') {
      return {
        success: false,
        provider: 'gmail',
        error: 'Email subject is missing or invalid.',
      };
    }

    if (!message || typeof message !== 'string') {
      return {
        success: false,
        provider: 'gmail',
        error: 'Email message is missing or invalid.',
      };
    }

    console.log(
      `\x1b[36m[GMAIL EMAIL]\x1b[0m Sending email to ${to}`
    );

    const info = await transporter.sendMail({
      from: `"${config.gmail.fromName}" <${config.gmail.user}>`,
      to,
      subject,
      text: message,
      html: createEmergencyEmailHtml(message),
    });

    console.log(
      `\x1b[32m[GMAIL EMAIL SUCCESS]\x1b[0m Email ID: ${info.messageId}`
    );

    return {
      success: true,
      provider: 'gmail',
      messageId: info.messageId,
    };

  } catch (error) {
    console.error(
      `\x1b[31m[GMAIL EMAIL FAILED]\x1b[0m`,
      error
    );

    return {
      success: false,
      provider: 'gmail',
      error:
        error?.message ||
        'Unknown Gmail email error.',
    };
  }
}

function createEmergencyEmailHtml(message) {
  const escapedBody = escapeHtml(message);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Silent SOS Alert</title>
      </head>

      <body style="
        margin: 0;
        padding: 20px;
        background: #f5f5f5;
        font-family: Arial, Helvetica, sans-serif;
      ">

        <div style="
          max-width: 650px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #dddddd;
          border-radius: 8px;
          padding: 25px;
        ">

          <h2 style="
            margin-top: 0;
            color: #333333;
          ">
            🚨 Silent SOS Emergency Alert
          </h2>

          <p style="
            color: #555555;
            font-size: 15px;
          ">
            A Silent SOS alert has been triggered.
          </p>

          <div style="
            background: #f8f8f8;
            border-left: 4px solid #d32f2f;
            padding: 15px;
            margin: 20px 0;
          ">
            <pre style="
              white-space: pre-wrap;
              font-family: Arial, Helvetica, sans-serif;
              line-height: 1.6;
              font-size: 14px;
              margin: 0;
              color: #333333;
            ">${escapedBody}</pre>
          </div>

          <p style="
            color: #555555;
            font-size: 14px;
          ">
            Please check on the person if assistance is required.
          </p>

          <hr style="
            border: 0;
            border-top: 1px solid #eeeeee;
            margin: 25px 0;
          " />

          <p style="
            color: #888888;
            font-size: 12px;
            margin-bottom: 0;
          ">
            This notification was sent by Silent SOS.
          </p>

        </div>

      </body>
    </html>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}