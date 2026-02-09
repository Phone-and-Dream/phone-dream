import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
}, { timestamps: true });

export const recommendation = mongoose.model("recommendations", recommendationSchema);