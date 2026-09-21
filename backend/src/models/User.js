import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    emergencyContacts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'EmergencyContact',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const UserModel =
  mongoose.models.User ||
  mongoose.model('User', UserSchema);