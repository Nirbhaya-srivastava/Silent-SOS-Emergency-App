import dns from 'dns';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { AlertModel } from '../models/Alert.js';
import { UserModel } from '../models/User.js';
import { EmergencyContactModel } from '../models/EmergencyContact.js';


class DatabaseService {
  constructor() {
    this.isConnectedToMongo = false;
    this.memoryUsers = new Map();
    this.memoryContacts = new Map();
    this.memoryAlerts = new Map();
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    this.initialized = true;

    dns.setServers(['8.8.8.8', '8.8.4.4']);

    try {
      if (config.mongoUri) {
        mongoose.set('strictQuery', false);

        await mongoose.connect(config.mongoUri, {
          serverSelectionTimeoutMS: 10000,
        });

        this.isConnectedToMongo = true;

        console.log(
          '\x1b[32m[DATABASE]\x1b[0m Connected to MongoDB successfully.'
        );
      }
    } catch (err) {
      console.error(
        '\x1b[31m[DATABASE]\x1b[0m MongoDB connection failed:',
        err
      );

      this.isConnectedToMongo = false;
    }

    await this.seedInitialData();
  }

  async seedInitialData() {
    const salt = await bcrypt.genSalt(10);
    const commonPasswordHash = await bcrypt.hash(
      'password123',
      salt
    );

    const defaultUser = {
      id: 'usr_user_demo_101',
      name: 'Jane Doe',
      email: 'user@example.com',
      phone: '+1 (555) 234-5678',
      passwordHash: commonPasswordHash,
      role: 'user',
      emergencyContacts: [
        'cnt_demo_001',
        'cnt_demo_002',
      ],
      createdAt: new Date('2026-09-01T10:00:00.000Z'),
    };

    const defaultAdmin = {
      id: 'usr_admin_demo_202',
      name: 'Safety Admin',
      email: 'admin@example.com',
      phone: '+1 (555) 999-0000',
      passwordHash: commonPasswordHash,
      role: 'admin',
      emergencyContacts: [],
      createdAt: new Date('2026-09-01T10:00:00.000Z'),
    };

    const contact1 = {
      id: 'cnt_demo_001',
      userId: defaultUser.id,
      name: 'Sarah Connor',
      phone: '+1 (555) 432-1098',
      email: 'sarah.connor@example.com',
      relationship: 'Sister',
      notificationChannels: [
        'SMS',
        'Email',
        'In-App',
      ],
      isActive: true,
      createdAt: new Date('2026-09-01T10:05:00.000Z'),
    };

    const contact2 = {
      id: 'cnt_demo_002',
      userId: defaultUser.id,
      name: 'David Vance',
      phone: '+1 (555) 876-5432',
      email: 'david.vance@example.com',
      relationship: 'Partner',
      notificationChannels: [
        'SMS',
        'In-App',
      ],
      isActive: true,
      createdAt: new Date('2026-09-01T10:07:00.000Z'),
    };

    const pastAlert = {
      id: 'alt_demo_sample_901',
      userId: defaultUser.id,
      userName: defaultUser.name,
      userPhone: defaultUser.phone,
      userEmail: defaultUser.email,
      status: 'Resolved',

      triggerTime: new Date(
        Date.now() - 3600000 * 4
      ),

      resolvedTime: new Date(
        Date.now() - 3600000 * 4 + 180000
      ),

      liveLocation: {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 9.5,
        updatedAt: new Date(
          Date.now() - 3600000 * 4 + 60000
        ),
      },

      contactsNotified: [
        {
          contactId: contact1.id,
          name: contact1.name,
          phone: contact1.phone,
          email: contact1.email,
          channels: [
            'SMS',
            'Email',
            'In-App',
          ],
          status: 'Delivered',
          sentAt: new Date(
            Date.now() - 3600000 * 4 + 1000
          ),
          details:
            'Delivered via SMS, Email, In-App',
        },

        {
          contactId: contact2.id,
          name: contact2.name,
          phone: contact2.phone,
          email: contact2.email,
          channels: [
            'SMS',
            'In-App',
          ],
          status: 'Delivered',
          sentAt: new Date(
            Date.now() - 3600000 * 4 + 1000
          ),
          details:
            'Delivered via SMS, In-App',
        },
      ],

      acknowledgementDetails: {
        acknowledgedBy: 'Safety Admin',
        acknowledgedAt: new Date(
          Date.now() - 3600000 * 4 + 75000
        ),
        note:
          'Operator confirmed user safe and checked in.',
      },

      activityLogs: [
        {
          action: 'ALERT_TRIGGERED',
          actorId: defaultUser.id,
          actorRole: 'user',
          timestamp: new Date(
            Date.now() - 3600000 * 4
          ),
          details:
            'Silent SOS initiated with initial GPS coords (37.7749, -122.4194).',
        },

        {
          action: 'CONTACTS_NOTIFIED',
          timestamp: new Date(
            Date.now() - 3600000 * 4 + 1000
          ),
          details:
            'Dispatched emergency alerts to 2 trusted contacts.',
        },

        {
          action: 'ALERT_ACKNOWLEDGED',
          actorId: defaultAdmin.id,
          actorRole: 'admin',
          timestamp: new Date(
            Date.now() - 3600000 * 4 + 75000
          ),
          details:
            'Safety Admin acknowledged emergency dispatch.',
        },

        {
          action: 'ALERT_RESOLVED',
          actorId: defaultUser.id,
          actorRole: 'user',
          timestamp: new Date(
            Date.now() - 3600000 * 4 + 180000
          ),
          details:
            'Emergency marked resolved by user after reaching safety.',
        },
      ],

      responseTimeSeconds: 180,

      createdAt: new Date(
        Date.now() - 3600000 * 4
      ),
    };

    // Populate memory store
    this.memoryUsers.set(
      defaultUser.id,
      defaultUser
    );

    this.memoryUsers.set(
      defaultAdmin.id,
      defaultAdmin
    );

    this.memoryContacts.set(
      contact1.id,
      contact1
    );

    this.memoryContacts.set(
      contact2.id,
      contact2
    );

    this.memoryAlerts.set(
      pastAlert.id,
      pastAlert
    );

    // Seed MongoDB if connected
    if (this.isConnectedToMongo) {
      try {
        const userCount =
          await UserModel.countDocuments();

        if (userCount === 0) {
          const uDoc =
            await UserModel.create({
              _id: new mongoose.Types.ObjectId(),
              name: defaultUser.name,
              email: defaultUser.email,
              phone: defaultUser.phone,
              passwordHash:
                defaultUser.passwordHash,
              role: defaultUser.role,
            });

          await UserModel.create({
            _id: new mongoose.Types.ObjectId(),
            name: defaultAdmin.name,
            email: defaultAdmin.email,
            phone: defaultAdmin.phone,
            passwordHash:
              defaultAdmin.passwordHash,
            role: defaultAdmin.role,
          });

          const c1 =
            await EmergencyContactModel.create({
              userId: uDoc._id,
              name: contact1.name,
              phone: contact1.phone,
              email: contact1.email,
              relationship:
                contact1.relationship,
              notificationChannels:
                contact1.notificationChannels,
              isActive: true,
            });

          const c2 =
            await EmergencyContactModel.create({
              userId: uDoc._id,
              name: contact2.name,
              phone: contact2.phone,
              email: contact2.email,
              relationship:
                contact2.relationship,
              notificationChannels:
                contact2.notificationChannels,
              isActive: true,
            });

          uDoc.emergencyContacts = [
            c1._id,
            c2._id,
          ];

          await uDoc.save();

          console.log(
            '\x1b[32m[DATABASE]\x1b[0m Seeded MongoDB with default accounts and contacts.'
          );
        }
      } catch (seedErr) {
        console.warn(
          '[DATABASE] Mongo seed check failed, proceeding with in-memory persistence:',
          seedErr
        );
      }
    }
  }

  // =========================
  // USER OPERATIONS
  // =========================

  async findUserByEmail(email) {
    const normalized =
      email.toLowerCase().trim();

    if (this.isConnectedToMongo) {
      try {
        const doc =
          await UserModel.findOne({
            email: normalized,
          });

        if (doc) {
          return {
            id: String(doc._id),
            name: doc.name,
            email: doc.email,
            phone: doc.phone,
            passwordHash: doc.passwordHash,
            role: doc.role,
            emergencyContacts:
              (doc.emergencyContacts || []).map(
                (c) => c.toString()
              ),
            createdAt: doc.createdAt,
          };
        }
      } catch (err) {
        // fallback
      }
    }

    for (const user of this.memoryUsers.values()) {
      if (
        user.email.toLowerCase() === normalized
      ) {
        return { ...user };
      }
    }

    return null;
  }

  async findUserById(id) {
    if (
      this.isConnectedToMongo &&
      mongoose.Types.ObjectId.isValid(id)
    ) {
      try {
        const doc =
          await UserModel.findById(id);

        if (doc) {
          return {
            id: String(doc._id),
            name: doc.name,
            email: doc.email,
            phone: doc.phone,
            passwordHash: doc.passwordHash,
            role: doc.role,
            emergencyContacts:
              (doc.emergencyContacts || []).map(
                (c) => c.toString()
              ),
            createdAt: doc.createdAt,
          };
        }
      } catch (err) {
        // fallback
      }
    }

    const user =
      this.memoryUsers.get(id);

    return user ? { ...user } : null;
  }

  async createUser(data) {
    const {
      name,
      email,
      phone,
      passwordHash,
      role,
    } = data;

    const id =
      `usr_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 7)}`;

    const user = {
      id,
      name,
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      passwordHash,
      role: role || 'user',
      emergencyContacts: [],
      createdAt: new Date(),
    };

    if (this.isConnectedToMongo) {
      try {
        const doc =
          await UserModel.create({
            name: user.name,
            email: user.email,
            phone: user.phone,
            passwordHash:
              user.passwordHash,
            role: user.role,
            emergencyContacts: [],
          });

        user.id = String(doc._id);
      } catch (err) {
        // fallback to memory
      }
    }

    this.memoryUsers.set(
      user.id,
      user
    );

    return user;
  }

  // =========================
  // EMERGENCY CONTACTS
  // =========================

  async getContactsByUserId(userId) {
    if (
      this.isConnectedToMongo &&
      mongoose.Types.ObjectId.isValid(userId)
    ) {
      try {
        const docs =
          await EmergencyContactModel
            .find({ userId })
            .sort({ createdAt: -1 });

        return docs.map((d) => ({
          id: d._id.toString(),
          userId: d.userId.toString(),
          name: d.name,
          phone: d.phone,
          email: d.email,
          relationship: d.relationship,
          notificationChannels:
            d.notificationChannels,
          isActive: d.isActive,
          createdAt: d.createdAt,
        }));
      } catch (err) {
        // fallback
      }
    }

    const contacts = [];

    for (
      const contact of this.memoryContacts.values()
    ) {
      if (contact.userId === userId) {
        contacts.push({ ...contact });
      }
    }

    return contacts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
  }

  async getContactById(id) {
    if (
      this.isConnectedToMongo &&
      mongoose.Types.ObjectId.isValid(id)
    ) {
      try {
        const doc =
          await EmergencyContactModel.findById(id);

        if (doc) {
          return {
            id: String(doc._id),
            userId: doc.userId.toString(),
            name: doc.name,
            phone: doc.phone,
            email: doc.email,
            relationship:
              doc.relationship,
            notificationChannels:
              doc.notificationChannels,
            isActive: doc.isActive,
            createdAt: doc.createdAt,
          };
        }
      } catch (err) {
        // fallback
      }
    }

    const contact =
      this.memoryContacts.get(id);

    return contact
      ? { ...contact }
      : null;
  }

  async createContact(userId, data) {
    const id =
      `cnt_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 7)}`;

    const contact = {
      id,
      userId,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email
        .toLowerCase()
        .trim(),

      relationship:
        data.relationship.trim(),

      notificationChannels:
        data.notificationChannels &&
        data.notificationChannels.length > 0
          ? data.notificationChannels
          : ['SMS', 'In-App'],

      isActive:
        data.isActive !== undefined
          ? data.isActive
          : true,

      createdAt: new Date(),
    };

    if (
      this.isConnectedToMongo &&
      mongoose.Types.ObjectId.isValid(userId)
    ) {
      try {
        const doc =
          await EmergencyContactModel.create({
            userId:
              new mongoose.Types.ObjectId(
                userId
              ),
            name: contact.name,
            phone: contact.phone,
            email: contact.email,
            relationship:
              contact.relationship,
            notificationChannels:
              contact.notificationChannels,
            isActive:
              contact.isActive,
          });

        contact.id = String(doc._id);

        await UserModel.findByIdAndUpdate(
          userId,
          {
            $push: {
              emergencyContacts:
                doc._id,
            },
          }
        );
      } catch (err) {
        // fallback
      }
    }

    this.memoryContacts.set(
      contact.id,
      contact
    );

    const user =
      this.memoryUsers.get(userId);

    if (
      user &&
      !user.emergencyContacts.includes(
        contact.id
      )
    ) {
      user.emergencyContacts.push(
        contact.id
      );
    }

    return contact;
  }

  async updateContact(
    id,
    userId,
    data
  ) {
    const contact =
      await this.getContactById(id);

    if (
      !contact ||
      contact.userId !== userId
    ) {
      return null;
    }

    if (
      this.isConnectedToMongo &&
      mongoose.Types.ObjectId.isValid(id)
    ) {
      try {
        await EmergencyContactModel
          .findByIdAndUpdate(id, data);
      } catch (err) {
        // fallback
      }
    }

    const updated = {
      ...contact,
      ...data,

      name:
        data.name !== undefined
          ? data.name.trim()
          : contact.name,

      phone:
        data.phone !== undefined
          ? data.phone.trim()
          : contact.phone,

      email:
        data.email !== undefined
          ? data.email
              .toLowerCase()
              .trim()
          : contact.email,

      relationship:
        data.relationship !== undefined
          ? data.relationship.trim()
          : contact.relationship,
    };

    this.memoryContacts.set(
      id,
      updated
    );

    return updated;
  }

  async deleteContact(id, userId) {
    const contact =
      await this.getContactById(id);

    if (
      !contact ||
      contact.userId !== userId
    ) {
      return false;
    }

    if (
      this.isConnectedToMongo &&
      mongoose.Types.ObjectId.isValid(id)
    ) {
      try {
        await EmergencyContactModel
          .findByIdAndDelete(id);

        await UserModel.findByIdAndUpdate(
          userId,
          {
            $pull: {
              emergencyContacts:
                new mongoose.Types.ObjectId(id),
            },
          }
        );
      } catch (err) {
        // fallback
      }
    }

    this.memoryContacts.delete(id);

    const user =
      this.memoryUsers.get(userId);

    if (user) {
      user.emergencyContacts =
        user.emergencyContacts.filter(
          (contactId) =>
            contactId !== id
        );
    }

    return true;
  }

  // =========================
  // ALERTS
  // =========================

  async createAlert(data) {
    const user =
      await this.findUserById(
        data.userId
      );

    const id =
      `alt_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 7)}`;

    const now = new Date();

    const alert = {
      id,
      userId: data.userId,

      userName:
        user
          ? user.name
          : 'Unknown User',

      userPhone:
        user
          ? user.phone
          : 'Unknown',

      userEmail:
        user
          ? user.email
          : 'Unknown',

      status: 'Sent',

      triggerTime: now,

      resolvedTime: null,

      liveLocation: {
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy:
          data.accuracy || 10,
        updatedAt: now,
      },

      contactsNotified:
        data.contactsNotified,

      activityLogs: [
        {
          action:
            'ALERT_TRIGGERED',

          actorId:
            data.userId,

          actorRole:
            'user',

          timestamp:
            now,

          details:
            `Silent SOS triggered. Initial GPS: ${data.latitude.toFixed(
              5
            )}, ${data.longitude.toFixed(
              5
            )} (±${(
              data.accuracy || 10
            ).toFixed(1)}m)`,
        },

        {
          action:
            'CONTACTS_NOTIFIED',

          timestamp:
            now,

          details:
            `Dispatched notifications to ${data.contactsNotified.length} emergency contact(s).`,
        },
      ],

      responseTimeSeconds:
        null,

      createdAt:
        now,
    };

    if (
      this.isConnectedToMongo &&
      mongoose.Types.ObjectId.isValid(
        data.userId
      )
    ) {
      try {
        const doc =
          await AlertModel.create({
            userId:
              new mongoose.Types.ObjectId(
                data.userId
              ),

            status: 'Sent',

            triggerTime:
              alert.triggerTime,

            liveLocation:
              alert.liveLocation,

            contactsNotified:
              alert.contactsNotified,

            activityLogs:
              alert.activityLogs,
          });

        alert.id =
          String(doc._id);
      } catch (err) {
        // fallback
      }
    }

    this.memoryAlerts.set(
      alert.id,
      alert
    );

    return alert;
  }

  async getAlertById(id) {
    if (
      this.isConnectedToMongo &&
      mongoose.Types.ObjectId.isValid(id)
    ) {
      try {
        const doc =
          await AlertModel.findById(id)
            .populate(
              'userId',
              'name phone email'
            );

        if (doc) {
          const user =
            doc.userId;

          return {
            id: String(doc._id),

            userId:
              user?._id
                ? user._id.toString()
                : doc.userId.toString(),

            userName:
              user?.name ||
              'Unknown User',

            userPhone:
              user?.phone || '',

            userEmail:
              user?.email || '',

            status:
              doc.status,

            triggerTime:
              doc.triggerTime,

            resolvedTime:
              doc.resolvedTime,

            liveLocation:
              doc.liveLocation,

            contactsNotified:
              doc.contactsNotified,

            acknowledgementDetails:
              doc.acknowledgementDetails,

            activityLogs:
              doc.activityLogs,

            responseTimeSeconds:
              doc.responseTimeSeconds,

            createdAt:
              doc.createdAt,
          };
        }
      } catch (err) {
        // fallback
      }
    }

    const alert =
      this.memoryAlerts.get(id);

    return alert
      ? { ...alert }
      : null;
  }

  async getAlertsByUserId(
    userId,
    options = {}
  ) {
    const page = Math.max(
      1,
      options.page || 1
    );

    const limit = Math.max(
      1,
      options.limit || 10
    );

    const status =
      options.status;

    const all = [];

    for (
      const alert of this.memoryAlerts.values()
    ) {
      if (
        alert.userId === userId
      ) {
        if (
          !status ||
          alert.status === status
        ) {
          all.push({
            ...alert,
          });
        }
      }
    }

    all.sort(
      (a, b) =>
        new Date(b.triggerTime).getTime() -
        new Date(a.triggerTime).getTime()
    );

    const total =
      all.length;

    const startIndex =
      (page - 1) * limit;

    const alerts =
      all.slice(
        startIndex,
        startIndex + limit
      );

    return {
      alerts,
      total,
      page,
      totalPages:
        Math.ceil(
          total / limit
        ) || 1,
    };
  }

  async getAllAlerts(
    options = {}
  ) {
    const page = Math.max(
      1,
      options.page || 1
    );

    const limit = Math.max(
      1,
      options.limit || 20
    );

    const status =
      options.status;

    const all = [];

    for (
      const alert of this.memoryAlerts.values()
    ) {
      if (
        !status ||
        alert.status === status
      ) {
        const user =
          this.memoryUsers.get(
            alert.userId
          );

        all.push({
          ...alert,

          userName:
            alert.userName ||
            user?.name ||
            'Unknown User',

          userPhone:
            alert.userPhone ||
            user?.phone ||
            '',

          userEmail:
            alert.userEmail ||
            user?.email ||
            '',
        });
      }
    }

    all.sort(
      (a, b) =>
        new Date(b.triggerTime).getTime() -
        new Date(a.triggerTime).getTime()
    );

    const total =
      all.length;

    const startIndex =
      (page - 1) * limit;

    const alerts =
      all.slice(
        startIndex,
        startIndex + limit
      );

    return {
      alerts,
      total,
      page,
      totalPages:
        Math.ceil(
          total / limit
        ) || 1,
    };
  }

  async updateAlertLocation(
    id,
    location
  ) {
    const alert =
      await this.getAlertById(id);

    if (!alert) {
      return null;
    }

    if (
      alert.status === 'Resolved'
    ) {
      return alert;
    }

    const now =
      new Date();

    alert.liveLocation = {
      latitude:
        location.latitude,

      longitude:
        location.longitude,

      accuracy:
        location.accuracy,

      updatedAt:
        now,
    };

    const log = {
      action:
        'LOCATION_UPDATED',

      timestamp:
        now,

      details:
        `Coordinates streamed: (${location.latitude.toFixed(
          5
        )}, ${location.longitude.toFixed(
          5
        )}) ±${location.accuracy.toFixed(
          1
        )}m`,
    };

    alert.activityLogs.push(
      log
    );

    if (
      this.isConnectedToMongo &&
      mongoose.Types.ObjectId.isValid(id)
    ) {
      try {
        await AlertModel.findByIdAndUpdate(
          id,
          {
            liveLocation:
              alert.liveLocation,

            $push: {
              activityLogs:
                log,
            },
          }
        );
      } catch (err) {
        // fallback
      }
    }

    this.memoryAlerts.set(
      id,
      alert
    );

    return alert;
  }

  async acknowledgeAlert(
    id,
    actor
  ) {
    const alert =
      await this.getAlertById(id);

    if (!alert) {
      return null;
    }

    const now =
      new Date();

    alert.status =
      'Acknowledged';

    alert.acknowledgementDetails = {
      acknowledgedBy:
        actor.name,

      acknowledgedAt:
        now,

      note:
        actor.note ||
        'Emergency acknowledged by safety personnel',
    };

    const log = {
      action:
        'ALERT_ACKNOWLEDGED',

      actorId:
        actor.id,

      actorRole:
        actor.role,

      timestamp:
        now,

      details:
        `${actor.name} (${actor.role}) acknowledged alert.${
          actor.note
            ? ' Note: ' + actor.note
            : ''
        }`,
    };

    alert.activityLogs.push(
      log
    );

    if (
      this.isConnectedToMongo &&
      mongoose.Types.ObjectId.isValid(id)
    ) {
      try {
        await AlertModel.findByIdAndUpdate(
          id,
          {
            status:
              'Acknowledged',

            acknowledgementDetails:
              alert.acknowledgementDetails,

            $push: {
              activityLogs:
                log,
            },
          }
        );
      } catch (err) {
        // fallback
      }
    }

    this.memoryAlerts.set(
      id,
      alert
    );

    return alert;
  }

  async resolveAlert(
    id,
    actor
  ) {
    const alert =
      await this.getAlertById(id);

    if (!alert) {
      return null;
    }

    const now =
      new Date();

    alert.status =
      'Resolved';

    alert.resolvedTime =
      now;

    const diffSeconds =
      Math.max(
        1,
        Math.round(
          (
            now.getTime() -
            new Date(
              alert.triggerTime
            ).getTime()
          ) / 1000
        )
      );

    alert.responseTimeSeconds =
      diffSeconds;

    const log = {
      action:
        'ALERT_RESOLVED',

      actorId:
        actor.id,

      actorRole:
        actor.role,

      timestamp:
        now,

      details:
        `Alert resolved by ${actor.name} (${actor.role}). Total active duration: ${diffSeconds}s.${
          actor.note
            ? ' Note: ' + actor.note
            : ''
        }`,
    };

    alert.activityLogs.push(
      log
    );

    if (
      this.isConnectedToMongo &&
      mongoose.Types.ObjectId.isValid(id)
    ) {
      try {
        await AlertModel.findByIdAndUpdate(
          id,
          {
            status:
              'Resolved',

            resolvedTime:
              now,

            responseTimeSeconds:
              diffSeconds,

            $push: {
              activityLogs:
                log,
            },
          }
        );
      } catch (err) {
        // fallback
      }
    }

    this.memoryAlerts.set(
      id,
      alert
    );

    return alert;
  }

  async getAdminMetrics() {
    let totalAlerts = 0;
    let activeAlerts = 0;
    let acknowledgedOrResolved = 0;
    let totalResolvedResponseTime = 0;
    let resolvedCount = 0;
    let successfulNotificationCount = 0;

    for (
      const alert of this.memoryAlerts.values()
    ) {
      totalAlerts++;

      if (
        alert.status === 'Sent' ||
        alert.status === 'Acknowledged'
      ) {
        activeAlerts++;
      }

      if (
        alert.status === 'Acknowledged' ||
        alert.status === 'Resolved'
      ) {
        acknowledgedOrResolved++;
      }

      if (
        alert.status === 'Resolved' &&
        alert.responseTimeSeconds
      ) {
        totalResolvedResponseTime +=
          alert.responseTimeSeconds;

        resolvedCount++;
      }

      if (
        alert.contactsNotified
      ) {
        for (
          const contactNotification
            of alert.contactsNotified
        ) {
          if (
            contactNotification.status ===
            'Delivered'
          ) {
            successfulNotificationCount +=
              contactNotification.channels
                ? contactNotification.channels.length
                : 1;
          }
        }
      }
    }

    const acknowledgementRate =
      totalAlerts > 0
        ? Number(
            (
              (acknowledgedOrResolved /
                totalAlerts) *
              100
            ).toFixed(1)
          )
        : 0;

    const averageResponseTimeSeconds =
      resolvedCount > 0
        ? Math.round(
            totalResolvedResponseTime /
              resolvedCount
          )
        : 0;

    return {
      totalAlerts,
      activeAlerts,
      acknowledgementRate,
      averageResponseTimeSeconds,
      successfulNotificationCount,
    };
  }
}

export const dbService =
  new DatabaseService();