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
            default: 'employee',
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
    },
    { timestamps: true } 
);

const User = mongoose.model("User", userSchema);

export default User;