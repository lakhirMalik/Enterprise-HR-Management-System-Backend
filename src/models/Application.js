import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coverLetter: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    portfolioUrl: {
      type: String,
      default: "",
    },
    resumeUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["submitted", "reviewing", "rejected", "accepted"],
      default: "submitted",
    },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);

export default Application;