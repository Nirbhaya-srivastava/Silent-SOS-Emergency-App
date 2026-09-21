import mongoose, { Schema } from 'mongoose';

const AlertSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ['Sent', 'Acknowledged', 'Resolved'],
      default: 'Sent',
      index: true,
    },

    triggerTime: {
      type: Date,
      default: Date.now,
    },

    resolvedTime: {
      type: Date,
      default: null,
    },

    liveLocation: {
      latitude: {
        type: Number,
        required: true,
      },

      longitude: {
        type: Number,
        required: true,
      },

      accuracy: {
        type: Number,
        default: 10,
      },

      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },

    contactsNotified: [
      {
        contactId: {
          type: String,
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        phone: {
          type: String,
          required: true,
        },

        email: {
          type: String,
          required: true,
        },

        channels: [String],

        status: {
          type: String,
          enum: ['Delivered', 'Failed'],
          default: 'Delivered',
        },

        sentAt: {
          type: Date,
          default: Date.now,
        },

        details: String,
      },
    ],

    acknowledgementDetails: {
      acknowledgedBy: String,
      acknowledgedAt: Date,
      note: String,
    },

    activityLogs: [
      {
        action: {
          type: String,
          required: true,
        },

        actorId: String,
        actorRole: String,

        timestamp: {
          type: Date,
          default: Date.now,
        },

        details: String,
      },
    ],

    responseTimeSeconds: {
      type: Number,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

export const AlertModel =
  mongoose.models.Alert ||
  mongoose.model('Alert', AlertSchema);