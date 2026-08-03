import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type: String,
            required: true,   
        },
        type: {
            type: String,
            enum: ["leave", "salary", "employee", "general"],
            default: "general",
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const notification = mongoose.model("Notification", notificationSchema);

export default notification;