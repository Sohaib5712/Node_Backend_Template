import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
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
      minlength: 6,
      select: false, // IMPORTANT: prevent leaking password by default
    },
    role: {
      type: String,
      enum: ["user", "premium", "banned", "admin"], // include admin if you use it in authorize("admin")
      default: "user",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true,
    },

    lastLogin: { type: Date },
    loginHistory: [{ type: Date }],

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    meta: {
      type: Object,
      default: {},
    },

    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorCode: { type: String },
    twoFactorCodeExpiresAt: { type: Date },
    twoFactorCodeUsed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Optional: ensure consistent JSON output
UserSchema.set("toJSON", {
  transform: function (_doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
