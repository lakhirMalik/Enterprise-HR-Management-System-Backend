import { ROLE_PERMISSIONS } from "../constants/permissions.js";

export const hasPermission = (requiredPermission) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const permissions = ROLE_PERMISSIONS[userRole] || [];

    if (!permissions.includes(requiredPermission)) {
      return res.status(403).json({
        message: `Access denied: missing permission '${requiredPermission}'`,
      });
    }
    next();
  };
};