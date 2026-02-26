// models/AdminUser.js
import mongoose from 'mongoose';

const AdminUserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'moderator'],
      default: 'admin',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    permissions: {
      type: [String],
      default: [],
    },
    lastLogin: {
      type: Date,
    },
    loginHistory: [
      {
        type: Date,
      },
    ],

    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    meta: {
      type: Object,
      default: {},
    },

    // 🔐 2FA-related fields
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorCode: {
      type: String,
    },
    twoFactorCodeExpiresAt: {
      type: Date,
    },
    twoFactorCodeUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.AdminUser ||
  mongoose.model('AdminUser', AdminUserSchema);
