import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'silent_sos_jwt_secret_change_in_production_key_123',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/silent-sos',
  frontendUrl: process.env.FRONTEND_URL || ' ',
  notificationService: process.env.NOTIFICATION_SERVICE || 'mock',
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },
  gmail: {
    user: process.env.GMAIL_USER || '',
    appPassword: process.env.GMAIL_APP_PASSWORD || '',
    fromName: process.env.GMAIL_FROM_NAME || 'Silent SOS',
  },
};
