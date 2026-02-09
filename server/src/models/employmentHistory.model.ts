import mongoose from "mongoose";

const employmentHistorySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  currentlyWorkThere: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
}, { timestamps: true });

export const employmentHistory = mongoose.model("employment-historys", employmentHistorySchema);