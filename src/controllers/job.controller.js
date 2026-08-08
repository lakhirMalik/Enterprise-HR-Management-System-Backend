import Job from "../models/Job.js";
import Application from "../models/Application.js";

// CREATE JOB (HR/admin)
export const createJob = async (req, res) => {
  try {
    const { title, description, department, location, employmentType } = req.body;

    const job = await Job.create({
      title,
      description,
      department,
      location,
      employmentType,
      postedBy: req.user.id,
    });

    res.status(201).json({ message: "Job posted", job });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET ALL OPEN JOBS (public)
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "open" }).sort({ createdAt: -1 });
    res.status(200).json({ jobs });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET ONE JOB (public)
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json({ job });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// CLOSE JOB (HR/admin)
export const closeJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, { status: "closed" }, { new: true });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json({ message: "Job closed", job });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// APPLY TO JOB (candidate, must be authenticated)
export const applyToJob = async (req, res) => {
  try {
    const { coverLetter, phone, portfolioUrl } = req.body;
    const jobId = req.params.id;

    const job = await Job.findById(jobId);
    if (!job || job.status !== "open") {
      return res.status(400).json({ message: "This job is not open for applications" });
    }

    const existing = await Application.findOne({ job: jobId, candidate: req.user.id });
    if (existing) {
      return res.status(400).json({ message: "You already applied to this job" });
    }

    const resumeUrl = req.file ? `/uploads/resumes/${req.file.filename}` : null;

    const application = await Application.create({
      job: jobId,
      candidate: req.user.id,
      coverLetter,
      phone,
      portfolioUrl,
      resumeUrl,
    });

    res.status(201).json({ message: "Application submitted", application });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET MY APPLICATIONS (candidate)
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate("job", "title department location status")
      .sort({ createdAt: -1 });
    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET ALL APPLICATIONS FOR A JOB (HR/admin)
export const getJobApplications = async (req, res) => {
  try {
    const applications = await Application.find({ job: req.params.id })
      .populate("candidate", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// UPDATE APPLICATION STATUS (HR/admin)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["reviewing", "rejected", "accepted"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({ message: `Application ${status}`, application });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

