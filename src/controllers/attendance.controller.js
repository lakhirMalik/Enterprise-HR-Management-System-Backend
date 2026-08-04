import Attendance from "../models/Attendance.js";

//CHECK IN (creates today's attendance record)
export const checkIn = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existing = await Attendance.findOne({ employee: req.user.id, date: today });
        if (existing) {
            return res.status(400).json({ message: "Already checked in today" });
        }

        const attendance = await Attendance.create({
            employee: req.user.id,
            date: today,
            checkIn: new Date(),
            status: "present",
        });

        res.status(201).json({ message: "Checked in", attendance });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Check Out
export const checkOut = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({ employee: req.user.id, date: today});
     if (!attendance) {
        return res.status(400).json({ message: "No check-in found for today" });
        }
        
        attendance.checkOut = new Date();
        await attendance.save();
        res.status(200).json({ message: "Checked Out", attendance }); 
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
// Get my attendance history
export const getMyAttendance = async (req, res) => {
    try{
        const records = await Attendance.find({ employee: req.user.id }).sort({ date: -1 });
        res.status(200).json({ records });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


//Get all attendance (HR/MANAGER/ADMIN)
export const getAllAttendance = async (req, res) => {
    try{
        const records = await Attendance.find()
        .populate("employee", "name email role")
        .sort({ date: -1 });
        res.status(200).json({ records });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};