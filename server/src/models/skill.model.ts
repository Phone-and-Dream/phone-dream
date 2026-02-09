import mongoose from "mongoose";

const skillSchema = new mongoose.Schema({
  skillName: {
    type: String,
    required: true
  },
  catogory: {
    type: String,
    enum: ["technical", "creative", "business", "language", "other"],
    required: true
  },
  proficiencyLevel: {
    type: String,
    enum: ["beginner", "intermediate", "advanced", "expert"],
    required: true
  },
  progress: {
    type: Number,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
}, { timestamps: true });

export const skill = mongoose.model("skills", skillSchema);
