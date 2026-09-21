import { dbService } from '../services/databaseService.js';
import { dispatchNotifications } from '../services/notificationService.js';
import {
  acknowledgeAlertSchema,
  createAlertSchema,
  resolveAlertSchema,
  updateLocationSchema,
} from '../validators/index.js';

export async function createAlert(req, res, next) {
  try {
    const user = req.user;
    const validated = createAlertSchema.parse(req.body);

    // Fetch user's active emergency contacts
    const allContacts = await dbService.getContactsByUserId(user.id);
    const activeContacts = allContacts.filter((c) => c.isActive);

    // Create a provisional alert structure for dispatch
    const provisionalAlert = {
      id: `alt_${Date.now()}`,
      triggerTime: new Date(),
      liveLocation: {
        latitude: validated.latitude,
        longitude: validated.longitude,
        accuracy: validated.accuracy || 10,
      },
    };

    // Dispatch notifications
    const contactsNotified = await dispatchNotifications(
  provisionalAlert,
  activeContacts,
  {
    name: user.name,
    phone: user.phone,
    email: user.email,
  }
);

    // Save alert to database
    const alert = await dbService.createAlert({
      userId: user.id,
      latitude: validated.latitude,
      longitude: validated.longitude,
      accuracy: validated.accuracy || 10,
      contactsNotified,
    });

    res.status(201).json({
      success: true,
      data: alert,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAlerts(req, res, next) {
  try {
    const user = req.user;

    const page =
      parseInt(req.query.page, 10) || 1;

    const limit =
      parseInt(req.query.limit, 10) || 10;

    const status = req.query.status;

    const result =
      await dbService.getAlertsByUserId(
        user.id,
        {
          page,
          limit,
          status,
        }
      );

    res.json({
      success: true,
      data: result.alerts,
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getAlertById(req, res, next) {
  try {
    const user = req.user;
    const alertId = req.params.id;

    const alert =
      await dbService.getAlertById(alertId);

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found',
      });
    }

    // User can only view their own alerts unless admin
    if (
      alert.userId !== user.id &&
      user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this alert record',
      });
    }

    res.json({
      success: true,
      data: alert,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAlertLocation(req, res, next) {
  try {
    const user = req.user;
    const alertId = req.params.id;

    const validated =
      updateLocationSchema.parse(req.body);

    const alert =
      await dbService.getAlertById(alertId);

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found',
      });
    }

    if (
      alert.userId !== user.id &&
      user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const updated =
      await dbService.updateAlertLocation(
        alertId,
        validated
      );

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAlertStatus(req, res, next) {
  try {
    const user = req.user;
    const alertId = req.params.id;
    const { status, note } = req.body;

    if (
      !['Sent', 'Acknowledged', 'Resolved'].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        error:
          'Invalid status. Must be Sent, Acknowledged, or Resolved.',
      });
    }

    const alert =
      await dbService.getAlertById(alertId);

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found',
      });
    }

    if (
      alert.userId !== user.id &&
      user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    let updated;

    if (status === 'Acknowledged') {
      updated = await dbService.acknowledgeAlert(
        alertId,
        {
          id: user.id,
          name: user.name,
          role: user.role,
          note,
        }
      );
    } else if (status === 'Resolved') {
      updated = await dbService.resolveAlert(
        alertId,
        {
          id: user.id,
          name: user.name,
          role: user.role,
          note,
        }
      );
    } else {
      // Sent
      alert.status = 'Sent';
      updated = alert;
    }

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function acknowledgeAlert(req, res, next) {
  try {
    const user = req.user;
    const alertId = req.params.id;

    const validated =
      acknowledgeAlertSchema.parse(req.body);

    const alert =
      await dbService.getAlertById(alertId);

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found',
      });
    }

    const updated =
      await dbService.acknowledgeAlert(
        alertId,
        {
          id: user.id,
          name: user.name,
          role: user.role,
          note: validated.note,
        }
      );

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function resolveAlert(req, res, next) {
  try {
    const user = req.user;
    const alertId = req.params.id;

    const validated =
      resolveAlertSchema.parse(req.body);

    const alert =
      await dbService.getAlertById(alertId);

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found',
      });
    }

    if (
      alert.userId !== user.id &&
      user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const updated =
      await dbService.resolveAlert(
        alertId,
        {
          id: user.id,
          name: user.name,
          role: user.role,
          note: validated.note,
        }
      );

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}