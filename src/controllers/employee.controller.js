import Employee from "../models/Employee.js";

// CREATE
export const createEmployee = async (req, res) => {
  try {
    const { user, department, position, salary, manager } = req.body;

    const existing = await Employee.findOne({ user });
    if (existing) {
      return res.status(400).json({ message: "Employee record already exists for this user" });
    }

    const employee = await Employee.create({ user, department, position, salary, manager });
    res.status(201).json({ message: "Employee created", employee });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// READ ALL
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate("user", "name email role").populate("manager", "name email");
    res.status(200).json({ employees });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// READ ONE
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate("user", "name email role").populate("manager", "name email");
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json({ employee });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// UPDATE
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json({ message: "Employee updated", employee });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json({ message: "Employee deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};