import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  xp: {
    type: Number,
    required: true
  },
  tag: {
    type: String,
    enum: ["follow", "repost", "tagline", "bio", "event", "project", "course", "skill", "location"],
    required: true
  },
  link: {
    type: String,
  },
  section: {
    type: String,
    enum: ["social", "platform", "profile"],
    required: true
  },
}, { timestamps: true });

export const task = mongoose.model("tasks", taskSchema);

const taskCompletedSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tasks"
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
}, { timestamps: true });

export const taskCompleted = mongoose.model("tasks-completed", taskCompletedSchema);