import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["completed", "in progress"],
    required: true
  },
  progress: {
    type: Number,
    required: true
  },
  certificateUrl: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
}, { timestamps: true });

export const course = mongoose.model("courses", courseSchema);