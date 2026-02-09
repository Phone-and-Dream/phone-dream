import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ["conference", "workshop", "hackathon", "meetup", "training"],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  skillsGained: {
    type: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
}, { timestamps: true });

export const event = mongoose.model("events", eventSchema);