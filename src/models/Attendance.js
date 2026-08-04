import mongoose, { MongooseError } from "mongoose";

const attendanceSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        checkIn: {
            type: Date,
        },
        checkOut: {
            type: Date,
        },
        status: {
            type: String,
            enum: ["present", "absent", "half_day", "on_leave"],
            default: "present",
        },
    },
    { timestamps: true }
);

//prevent Duplicate attendance entries for the same employee on the same day
const Attendance = mongoose.model("Attendance",attendanceSchema);

export default Attendance; 