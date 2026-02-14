import { Router } from "express";
import { signIn, signUp } from "@/controllers/auth.controller";

const router = Router();

router
  .post("/sign-in", signIn)
  .post("/sign-up", signUp);

export default router;