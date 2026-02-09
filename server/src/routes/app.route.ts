import { Router } from "express";
import { fetchRecipients, getBoards, getTasks, home, leaderboard } from "../controllers/app.controller";

const router = Router();

router
  .get("/", home)
  .get("/get-leaderboard", leaderboard)
  .get("/get-dream-boards", getBoards)
  .get("/get-recipients", fetchRecipients)
  .get("/get-tasks", getTasks)

export default router;