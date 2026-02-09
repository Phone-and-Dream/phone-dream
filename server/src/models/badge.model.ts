import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
  minters: [{
    type: String,
    required: true
  }],
  ipfsImage: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
}, { timestamps: true });

export const badge = mongoose.model("badges", badgeSchema);