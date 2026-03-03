import { Router } from "express";
import { createDonation, donorDashboard, mintBadge, updateDonor } from "@/controllers/donor.controller";
import { upload } from "@/configs/multer";

const router = Router();

router
  .get("/dashboard", donorDashboard)
  .put("/update-donor", upload.single("profilePic"), updateDonor)
  .post("/mint-badge", mintBadge)
  .post("/create-donation", upload.fields([{ name: "frontImage", maxCount: 1 }, { name: "backImage", maxCount: 1 }]), createDonation);

export default router;