import AuditLog from "../models/AuditLog.js";

export const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find()
        .populate("actor", "name email role")
        .sort({ createdAt: -1 })
        .limit(100);
        res.status(200).json({ logs });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};