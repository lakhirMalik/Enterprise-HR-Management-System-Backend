import Notification from "../models/Notification.js";

export const sendNotification = async (req, recipientId, message, type = "general") => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      message,
      type,
    });

    const io = req.app.get("io");
    const connectedUsers = req.app.get("connectedUsers");
    const socketId = connectedUsers.get(recipientId.toString());

    if (socketId) {
      io.to(socketId).emit("notification", notification);
    }

    return notification;
  } catch (error) {
    console.error("Failed to send notification:", error.message);
  }
};