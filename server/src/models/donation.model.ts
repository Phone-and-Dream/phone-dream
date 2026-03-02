import mongoose from "mongoose";

const cashDonationSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "donors"
  },
}, { timestamps: true });

export const cashDonation = mongoose.model("cash-donations", cashDonationSchema);

const deviceDonationSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  deviceType: {
    type: String,
    enum: ["smartphone", "tablet", "desktop pc", "other", "laptop", "monitor", "keyboard", "external drive", "printer"],
    required: true
  },
  condition: {
    type: String,
    enum: ["new", "good condition", "refurbished"],
    required: true
  },
  specifications: {
    type: String
  },
  frontImage: {
    type: String,
    required: true
  },
  deviceVideo: {
    type: String,
    required: true
  },
  backImage: {
    type: String,
    required: true
  },
  imeiNumber: {
    type: String
  },
  willPayForRefurbish: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ["in review", "accepted", "rejected", "delivered"],
    default: "in review"
  },
  owner: {
    type: String,
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "donors",
    required: true
  },
}, { timestamps: true });

export const deviceDonation = mongoose.model("device-donations", deviceDonationSchema);

