export const isOwner = (paramName = "id") => {
    return (req, res, next) => {
        const resourceId = req.params[paramName];
        const userId = req.user?.id;
        
        if (req.user?.role === "super_admin" || req.user?.role === "hr") {
            return next();
        }

        if (resourceId !== userId) {
            return res.status(403).json({
                message: "Access denied: you can only access your own resource",
            }); 
        }
        next();
    };
};