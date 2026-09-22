import { Router } from 'express';
import { google } from 'googleapis';

import { config } from '../config/index.js';

export const gmailRouter = Router();

const oauth2Client = new google.auth.OAuth2(
  config.gmail.clientId,
  config.gmail.clientSecret,
  'https://silent-sos-backend-7pm9.onrender.com/api/gmail/callback'
);

// Start Gmail authorization
gmailRouter.get('/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/gmail.send',
    ],
  });

  res.redirect(authUrl);
});

// Google OAuth callback
gmailRouter.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send('Authorization code is missing.');
    }

    const { tokens } = await oauth2Client.getToken(code);

    console.log('========================================');
    console.log('[GMAIL OAUTH] Authorization successful');
    console.log('[GMAIL OAUTH] Refresh Token:');
    console.log(tokens.refresh_token);
    console.log('========================================');

    res.send(`
      <h2>Gmail authorization successful!</h2>
      <p>You can close this page.</p>
      <p>The refresh token has been printed in the Render logs.</p>
    `);
  } catch (error) {
    console.error('[GMAIL OAUTH ERROR]', error);

    res.status(500).send(
      `Gmail authorization failed: ${error.message}`
    );
  }
});