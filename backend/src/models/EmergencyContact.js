import mongoose, { Schema } from 'mongoose';

const EmergencyContactSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    relationship: {
      type: String,
      required: true,
      trim: true,
    },

    notificationChannels: {
      type: [String],
      enum: ['SMS', 'Email', 'In-App'],
      default: ['SMS', 'In-App'],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const EmergencyContactModel =
  mongoose.models.EmergencyContact ||
  mongoose.model(
    'EmergencyContact',
    EmergencyContactSchema
  );