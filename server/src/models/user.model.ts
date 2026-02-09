import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  career: {
    type: String,
    default: "Student"
  },
  urls: {
    x: {
      type: String
    },
    linkedin: {
      type: String
    },
    portfolio: {
      type: String
    }
  },
  schoolOrOrganisation: {
    type: String,
  },
  bio: {
    type: String,
  },
  city: {
    type: String,
  },
  country: {
    type: String
  },
  tagline: {
    type: String
  },
  profileImage: {
    type: String
  },
  dateJoined: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  xp: {
    type: Number,
    required: true
  },
  fullName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true
  },
  badgesMinted: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "badges"
  }],
  awards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "awards"
  }],
  skills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "skills"
  }],
  recommendations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "recommendations"
  }],
  employmentHistories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "employment-histories"
  }],
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "courses"
  }],
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "projects"
  }],
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "events"
  }],
}, { timestamps: true });

export const user = mongoose.model("users", userSchema);
