import Task from "../models/Task.js";

//Assign Task 
export const assignTask = async (req, res) => {
    try {
        const { title, description, assignedTo, dueDate } = req.body;

        const task = await Task.create({
            title,
            description,
            assignedTo,
            assignedBy: req.user.id,
            dueDate,
        });

        res.status(201).json({ message: "Task assigned", task });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET MY TASKS
export const getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user.id })
        .populate("assignedBy", "name email role")
        .sort({ createdAt: -1 });
        res.status(200).json({ tasks });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get ALL TASKS (manager/hr/admin)
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email role")
      .populate("assignedBy", "name email role")
      .sort({ createdAt: -1 });
    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
 
// UPDATE TASKS STATUS (assign updates their own tasks)
export const upadteTaskStatus = async (req, res) => {
    try{
        const { status } = req.body;

        if (!["pending", "in_progress", "completed"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found "});
        }

        //Only the assign, or hr/superadmin, can update status
        const isAssignee = task.assignedTo.toString() === req.user.id;
        const isAdmin = req.user.role === "hr" || req.user.role === "super_admin";

        if ( !isAssignee && !isAdmin) {
            return res.status(403).json({ message: "Access denied: not your task" });
        }

        task.status = status;
        await task.save();

        res.status(200).json({ message: "Task Updated", task });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};