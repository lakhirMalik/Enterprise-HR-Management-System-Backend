import User from "../models/User.js"

export const checkAccountStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        if (user.status !== "active") {
            return res.status(403).json({
                message: `Account is ${user.status}. Access denied`,
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({message: "Server error", error: error.message});
    }
};