import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["in progress", "completed", "on hold", "planning"],
    required: true
  },
  techStack: {
    type: String,
    required: true
  },
  urls: {
    github: {
      type: String
    },
    liveUrl: {
      type: String
    }
  },
  wasDeviceDonated: {
    type: Boolean,
    required: true
  },
  projectFeatured: {
    type: Boolean,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
}, { timestamps: true });

export const project = mongoose.model("projects", projectSchema);