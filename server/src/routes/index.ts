import { Router } from "express";
import { home } from "@/controllers/app.controller";
import { userPublicProfile } from "@/controllers/user.controller";
import { donorPublicProfile } from "@/controllers/donor.controller";
import adminRoutes from "./admin.route";
import appRoutes from "./app.route";
import authRoutes from "./auth.route";
import donorRoutes from "./donor.route";
import userRoutes from "./user.route";
import { authenticateDonor, authenticateAdmin, authenticateUser } from "@/middlewares/auth.middleware";

const router = Router();

router
  .use("/", appRoutes)
  .use("/auth", authRoutes)
  .get("/donor/profile/:id", donorPublicProfile)
  .get("/profile/:id", userPublicProfile)
  .use("/admin", authenticateAdmin, adminRoutes)
  .use("/donor", authenticateDonor, donorRoutes)
  .use("/recipient", authenticateUser, userRoutes);

export default router;