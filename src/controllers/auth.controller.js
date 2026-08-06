import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import { sendEmail } from "../utils/sendEmail.js";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import Session from "../models/Session.js";

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      verificationToken,
      verificationTokenExpires,
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    await sendEmail(
      user.email,
      "Verify your email",
      `<p>Hi ${user.name},</p><p>Please verify your email by clicking the link below:</p><a href="${verifyUrl}">${verifyUrl}</a>`
    );

    res.status(201).json({
      message: "User registered successfully. Please check your email to verify your account.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.twoFactorEnabled) {
      return res.status(200).json({
        message: "2FA required",
        twoFactorRequired: true,
        userId: user._id,
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await Session.create({
      user: user._id,
      refreshToken,
      userAgent: req.headers["user-agent"] || "Unknown device",
      ip: req.ip || "Unknown",
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// REFRESH ACCESS TOKEN
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "No refresh token, please log in" });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    const newAccessToken = generateAccessToken(user);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ message: "Access token refreshed" });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

// LOGOUT
export const logoutUser = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await Session.deleteOne({ refreshToken: token });
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether the email exists, for security
      return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail(
      user.email,
      "Reset your password",
      `<p>Hi ${user.name},</p><p>Click the link below to reset your password. This link expires in 1 hour.</p><a href="${resetUrl}">${resetUrl}</a>`
    );

    res.status(200).json({ message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful. Please log in." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// SETUP 2FA (generates secret + QR code)
export const setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const secret = speakeasy.generateSecret({
      name: `HR/OS (${user.email})`,
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.status(200).json({ message: "Scan this QR code with your authenticator app", qrCode: qrCodeUrl });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// VERIFY AND ENABLE 2FA
export const verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: "2FA setup not started" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid 2FA code" });
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.status(200).json({ message: "2FA enabled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DISABLE 2FA
export const disable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    await user.save();

    res.status(200).json({ message: "2FA disabled" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// VERIFY 2FA DURING LOGIN
export const verify2FALogin = async (req, res) => {
  try {
    const { userId, token } = req.body;

    const user = await User.findById(userId);
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ message: "2FA not enabled for this account" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid 2FA code" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// UPDATE OWN PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
      user.isVerified = false; // re-verify if email changes
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET MY ACTIVE SESSIONS
export const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user.id }).sort({ lastActive: -1 });
    res.status(200).json({ sessions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// REVOKE ONE SESSION
export const revokeSession = async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.status(200).json({ message: "Session revoked" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// REVOKE ALL SESSIONS (force logout everywhere)
export const revokeAllSessions = async (req, res) => {
  try {
    await Session.deleteMany({ user: req.user.id });
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out from all devices" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};