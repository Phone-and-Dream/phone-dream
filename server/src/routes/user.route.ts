import { Router } from "express";
import { addAward, performTask, addCourse, addEmploymentHistory, addEvent, addProject, addRecommendation, addSkill, createDreamBoard, deleteProfile, updateProfile, userDashboard, userPublicProfile } from "@/controllers/user.controller";
import { upload } from "@/configs/multer";

const router = Router();

router
  .get("/dashboard", userDashboard)
  .get("/profile/:id", userPublicProfile)
  .post("/perform-task", performTask)
  .post("/create-dream-board", createDreamBoard)
  .post("/add-project", addProject)
  .post("/add-skill", addSkill)
  .post("/add-course", addCourse)
  .post("/add-event", upload.single("eventPic"), addEvent)
  .post("/add-recommendation", addRecommendation)
  .post("/add-employment-history", addEmploymentHistory)
  .post("/add-award", addAward)
  .delete("/delete-profile", deleteProfile)
  .post("/update-user", upload.single("profilePic"), updateProfile);

export default router;