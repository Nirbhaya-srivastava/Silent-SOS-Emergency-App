import { sendEmergencyEmail } from './emailService.js';

function getNotificationService() {
  return new MockNotificationService();
}

export class MockNotificationService {
  async sendSms(to, message) {
    console.log('');
    console.log('========================================');
    console.log('[MOCK SMS] SMS SIMULATION');
    console.log('========================================');
    console.log(`[MOCK SMS] To: ${to}`);
    console.log(`[MOCK SMS] Message: ${message}`);
    console.log('========================================');
    console.log('');

    return {
      success: true,
      provider: 'mock',
      channel: 'SMS',
      to,
      messageId: `mock_sms_${Date.now()}`,
    };
  }

  async sendCall(to, message) {
    console.log('');
    console.log('========================================');
    console.log('[MOCK CALL] CALL SIMULATION');
    console.log('========================================');
    console.log(`[MOCK CALL] To: ${to}`);
    console.log(`[MOCK CALL] Message: ${message}`);
    console.log('========================================');
    console.log('');

    return {
      success: true,
      provider: 'mock',
      channel: 'Call',
      to,
      messageId: `mock_call_${Date.now()}`,
    };
  }

  async sendEmail(to, subject, message) {
    try {
      console.log(`[EMAIL] Sending emergency email to ${to}`);

      const result = await sendEmergencyEmail({
        to,
        subject,
        message
      });

      return {
        success: result?.success ?? true,
        provider: result?.provider || 'gmail',
        channel: 'Email',
        to,
        messageId: result?.messageId,
        error: result?.error,
      };
    } catch (error) {
      console.error(`[EMAIL] Failed to send email to ${to}`);
      console.error(error);

      return {
        success: false,
        provider: 'gmail',
        channel: 'Email',
        to,
        error: error?.message || 'Email sending failed',
      };
    }
  }
}

function createNotificationMessage(alert, user) {
  const userName = user?.name || 'User';

  const triggerTime = alert?.triggerTime
    ? new Date(alert.triggerTime).toLocaleString()
    : new Date().toLocaleString();

  const location = alert?.liveLocation;

  let locationText = 'Location unavailable';

  if (
    location?.latitude != null &&
    location?.longitude != null
  ) {
    locationText =
      `Latitude: ${location.latitude}, ` +
      `Longitude: ${location.longitude}`;

    if (location.accuracy != null) {
      locationText += `, Accuracy: ${location.accuracy}m`;
    }
  }

  return {
    subject: `🚨 Silent SOS Alert - ${userName}`,

    message:
      `EMERGENCY: ${userName} has activated Silent SOS.\n\n` +
      `Time: ${triggerTime}\n` +
      `Location: ${locationText}\n\n` +
      `Please check on them immediately.`,
  };
}

async function dispatchUsingProvider(
  provider,
  alert,
  contacts,
  user
) {
  const results = [];

  const notification = createNotificationMessage(
    alert,
    user
  );

  for (const contact of contacts || []) {
    if (!contact?.isActive) {
      continue;
    }

    const channels = Array.isArray(
      contact.notificationChannels
    )
      ? contact.notificationChannels
      : [];

    for (const channel of channels) {
      let result;

      try {
        if (channel === 'SMS') {
          result = await provider.sendSms(
            contact.phone,
            notification.message
          );
        } else if (channel === 'Email') {
          result = await provider.sendEmail(
            contact.email,
            notification.subject,
            notification.message
          );
        } else if (channel === 'Call') {
          result = await provider.sendCall(
            contact.phone,
            notification.message
          );
        } else if (channel === 'In-App') {
          console.log(
            `[IN-APP] Notification prepared for ${contact.name}`
          );

          result = {
            success: true,
            provider: 'internal',
            channel: 'In-App',
            to:
              contact.email ||
              contact.phone ||
              contact.name,
            messageId: `inapp_${Date.now()}`,
          };
        } else {
          console.warn(
            `[NOTIFICATION] Unsupported channel: ${channel}`
          );

          result = {
            success: false,
            provider: 'internal',
            channel,
            to:
              contact.email ||
              contact.phone ||
              contact.name,
            error:
              `Unsupported notification channel: ${channel}`,
          };
        }
      } catch (error) {
        console.error(
          `[NOTIFICATION] Error sending ${channel} ` +
          `notification to ${contact.name}`
        );

        console.error(error);

        result = {
          success: false,
          provider: 'internal',
          channel,
          to:
            contact.email ||
            contact.phone ||
            contact.name,
          error:
            error?.message ||
            'Notification failed',
        };
      }

      results.push({
        contactId: contact.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        channel,
        success: result.success,
        provider: result.provider,
        messageId: result.messageId,
        error: result.error,
        sentAt: new Date().toISOString(),
      });
    }
  }

  return results;
}

export async function dispatchNotifications(
  alert,
  contacts,
  user
) {
  const provider = getNotificationService();

  return dispatchUsingProvider(
    provider,
    alert,
    contacts,
    user
  );
}

export { createNotificationMessage };