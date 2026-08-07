import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["super_admin", "hr", "manager", "employee", "candidate"],
      default: "employee",
    },
    status: {
      type: String,
      enum: ["active", "suspended", "blocked", "inactive"],
      default: "active",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    twoFactorSecret: {
      type: String,
      default: null,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorMethod: {
  type: String,
  enum: ["app", "email"],
  default: "app",
},
twoFactorEmailCode: {
  type: String,
  default: null,
},
twoFactorEmailCodeExpires: {
  type: Date,
  default: null,
},
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;