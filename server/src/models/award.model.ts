import mongoose from "mongoose";

const awardSchema = new mongoose.Schema({
  awardName: {
    type: String,
    requred: true
  },
  issuingOrganisation: {
    type: String,
    requred: true
  },
  dateReceived: {
    type: String,
    requred: true
  },
  description: {
    type: String,
    requred: true
  },
  awardLink: {
    type: String,
    requred: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
}, { timestamps: true });

export const award = mongoose.model("awards", awardSchema);