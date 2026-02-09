import mongoose from "mongoose";

const dreamBoardSchema = new mongoose.Schema({
  profilePic: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  recommendationLetter: {
    type: String,
    required: true
  },
  career: {
    type: String,
    required: true
  },
  state: {
    type: String,
    requried: true
  },
  country: {
    type: String,
    enum: ["nigeria", "ghana", "kenya", "south africa", "egypt", "morocco", "tanzania", "senegal", "other"],
    required: true
  },
  careerStatus: {
    type: String,
    enum: ["unemployed", "employed", "student", "graduate", "freelancer", "entreprenuer", "seeking opportunities"],
    required: true
  },
  instituitionOrCompany: {
    type: String
  },
  backgroundStory: {
    type: String,
    required: true
  },
  goals: [{
    type: String,
    required: true
  }],
  needs: {
    type: String,
    enum: ["smartphone", "tablet", "desktop pc", "other", "laptop", "monitor", "keyboard", "external drive", "printer"],
    required: true
  },
  refurbished: {
    type: Boolean,
    default: false
  },
  dateCreated: {
    type: String,
    required: true
  },
  references: [{
    name: {
      type: String,
      required: true
    },
    contact: {
      type: String,
      required: true
    },
    relationship: {
      type: String,
      required: true
    }
  }],
  status: {
    type: String,
    enum: ["pending", "accepted", "closed"],
    default: "pending"
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  }
}, { timestamps: true });

export const dreamBoard = mongoose.model("dream-boards", dreamBoardSchema);