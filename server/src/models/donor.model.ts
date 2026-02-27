import mongoose from "mongoose";

const donorSchema = new mongoose.Schema({
  career: {
    type: String,
    required: true,
    default: "Entreprenuer"
  },
  donorType: {
    type: String,
    enum: ["individual", "organization"],
  },
  country: {
    type: String,
  },
  city: {
    type: String
  },
  profilePic: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  dateJoined: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });

export const donor = mongoose.model("donors", donorSchema);
