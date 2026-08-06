import User from "../models/User.js";

export const requireEmailVerified = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email to access this feature" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};