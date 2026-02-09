import { Router } from "express";
import { home } from "@/controllers/app.controller";
import adminRoutes from "./admin.route";
import appRoutes from "./app.route";
import donorRoutes from "./donor.route";
import userRoutes from "./user.route";
import { authenticateDonor, authenticateAdmin, authenticateUser } from "@/middlewares/auth.middleware";

const router = Router();

router
  .use("/", appRoutes)
  .use("/admin", authenticateAdmin, adminRoutes)
  .use("/donor", authenticateDonor, donorRoutes)
  .use("/recipient", authenticateUser, userRoutes);

export default router;