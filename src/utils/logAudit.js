import AuditLog from "../models/AuditLog.js";

export const logAudit = async (actorId, action, targetType, targetId, details = {}) => {
    try {
        await AuditLog.create({ actor: actorId, action, targetType, targetId, details });
    } catch (error) {
        console.error("Failed to write audit log:", error.message);
    }
};