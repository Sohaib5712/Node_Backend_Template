import mongoose from "mongoose";

const AdminUserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // never exposed by default
    },
    role: {
      type: String,
      enum: ["superadmin", "admin", "moderator"],
      default: "admin",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    lastLogin: { type: Date },
    loginHistory: [{ type: Date }],

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    meta: { type: Object, default: {} },

    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorCode: { type: String },
    twoFactorCodeExpiresAt: { type: Date },
    twoFactorCodeUsed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

AdminUserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.AdminUser || mongoose.model("AdminUser", AdminUserSchema);
