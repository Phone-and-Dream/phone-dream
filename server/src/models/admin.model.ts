import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({

}, { timestamps: true });

export const admin = mongoose.model("admins", adminSchema);