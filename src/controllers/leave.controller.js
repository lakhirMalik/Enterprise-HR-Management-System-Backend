import Leave from "../models/Leave.js";
import { sendNotification } from "../utils/sendNotification.js"
// REQUEST LEAVE (any authenticated employee)
export const requestLeave = async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;

    const leave = await Leave.create({
      employee: req.user.id,
      startDate,
      endDate,
      reason,
    });

    res.status(201).json({ message: "Leave request submitted", leave });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET MY LEAVE REQUESTS
export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ leaves });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET ALL LEAVE REQUESTS (HR/Manager/Admin)
export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employee", "name email role")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ leaves });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// APPROVE / REJECT LEAVE
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body; // "approved" or "rejected"

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
    }

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status, approvedBy: req.user.id },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    await sendNotification(
      req,
      leave.employee,
      `Your leave request has been ${status}`,
    "leave"
    )

    res.status(200).json({ message: `Leave ${status}`, leave });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};