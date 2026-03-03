import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
  donatedBy: {
    type: String,
  },
  mintedBy: {
    type: String,
    required: true
  },
  fundingType: {
    type: String,
    enum: ["physical", "impact-pool"],
  },
  recipientDateMinted: {
    type: String,
  },
  donorDateMinted: {
    type: String,
  },
  donorMinted: {
    type: Boolean,
    default: false,
  },
  recipientMinted: {
    type: Boolean,
    default: false,
  },
  recipientTokenId: {
    type: String,
    unique: true
  },
  donorTokenId: {
    type: String,
    unique: true
  },
  career: {
    type: String,
    required: true
  },
  blockExplorer: {
    type: String,
    unique: true
  },
  blockchain: {
    type: String,
    required: true,
  },
  deviceType: {
    type: String,
    enum: ["phone", "tablet", "laptop", "desktop"],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "donors",
    required: true
  }
}, { timestamps: true });

export const badge = mongoose.model("physical-badges", badgeSchema);

const poolBadgeSchema = new mongoose.Schema({
  communityMembers: [{
    name: {
      type: String,
      required: true
    },
    _id: {
      type: String,
      required: true
    }
  }],
  recipient: {
    type: String,
    required: true
  },
  blockExplorer: {
    type: String,
    required: true
  },
  tokenId: {
    type: String,
    required: true,
    unique: true
  },
  blockchain: {
    type: String,
    required: true,
  },
  deviceType: {
    type: String,
    enum: ["phone", "tablet", "laptop", "desktop"],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
}, { timestamps: true });

export const poolBadge = mongoose.model("pool-badges", poolBadgeSchema);
