import { formatDate } from "date-fns";
import logger from "@/configs/logger";
import { award } from "@/models/award.model";
import { badge } from "@/models/badge.model";
import { course } from "@/models/course.model";
import { dreamBoard } from "@/models/dreamBoard.model";
import { employmentHistory } from "@/models/employmentHistory.model";
import { event } from "@/models/event.model";
import { project } from "@/models/project.model";
import { recommendation } from "@/models/recommendation.model";
import { skill } from "@/models/skill.model";
import { task, taskCompleted } from "@/models/task.model";
import { user } from "@/models/user.model";
import { uploadImg } from "@/utils/img.utils";
import { BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR, FORBIDDEN, NOT_FOUND, OK } from "@/utils/status.utils";
import {
  validateAwardData,
  validateCourseData,
  validateDreamBoardCreateData,
  validateProjectData,
  validateEmploymentHistoryData,
  validateEventData,
  validateRecommendationData,
  validateSkillData
} from "@/utils/utils";

export const userDashboard = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const userId = req.id;

    const userFound = await user.findById(req.id).lean();

    const projects = await project.find({ user: userId }).lean();

    const awards = await award.find({ user: userId }).lean();

    const courses = await course.find({ user: userId }).lean();

    const employmentHistories = await employmentHistory.find({ user: userId }).lean();

    const events = await event.find({ user: userId }).lean();

    const recommendations = await recommendation.find({ user: userId }).lean();

    const skills = await skill.find({ user: userId }).lean();

    res.status(OK).json({ message: "profile fetched!", userFound, projects, awards, courses, employmentHistories, events, recommendations, skills });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching user dashboard" });
  }
}

export const userPublicProfile = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { id } = req.params as { id: string };

    const userFound = await user.findById(id).lean();
    if (!userFound) {
      res.status(NOT_FOUND).json({ error: "no user found with sent id" });
      return;
    }

    const badges = await badge.find({ user: userFound._id }).select("recipientDateMinted recipientMinted recipientTokenId career blockExplorer blockchain deviceType donor donatedBy fundingType mintedBy").lean();

    const publicProfileData: Record<string, any | any[]> = {
      _id: userFound._id,
      tagline: userFound.tagline,
      courses: userFound.courses.length,
      projects: userFound.projects.length,
      skills: userFound.skills.length,
      xp: userFound.xp,
      badges
    }

    res.status(OK).json({ message: "public profile fetched!", user: publicProfileData });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching public profile" })
  }
}

export const mintBadge = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { badgeId, tokenId } = req.body;

    const badgeFound = await badge.findById(badgeId);
    if (!badgeFound) {
      res.status(NOT_FOUND).json({ error: "badge not found" });
      return;
    }

    const userFound = await user.findById(req.id);
    if (!userFound) {
      res.status(NOT_FOUND).json({ error: "user not found" });
      return;
    }

    if (badgeFound.recipientMinted) {
      res.status(FORBIDDEN).json({ error: "error cannot mint twice" });
      return;
    }

    badgeFound.recipientTokenId = tokenId;
    badgeFound.recipientMinted = true;
    badgeFound.recipientDateMinted = formatDate(new Date(), "MMM, y");

    userFound.badgesMinted.push(badgeId);

    await badgeFound.save();
    await userFound.save();

    res.status(OK).json({ message: "badge minted!" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error minting badge" });
  }
}

export const createDreamBoard = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
      const { success } = validateDreamBoardCreateData(req.body);
      if (!success) {
        res.status(BAD_REQUEST).json({ error: "invalid dream board data" });
        return;
      }
  
      await dreamBoard.create(req.body);

      res.status(OK).json({ message: "dream board created!" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error creating dream board" });
  }
}

export const updateProfile = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    // const profilePicBuffer = req.file?.buffer;

    // if (profilePicBuffer) {
    //   const profilePic = await uploadImg({ filename: req.file?.originalname, file: profilePicBuffer, folder: "user-profiles" });
    //   req.body.profilePic = profilePic;
    // }

    await user.findByIdAndUpdate(req.id, req.body);

    res.status(OK).json({ message: "user updated" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error updating profile" });
  }
}

export const addProject = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
      const { success } = validateProjectData(req.body);
      if (!success) {
        res.status(BAD_REQUEST).json({ error: "send the required data" });
        return;
      }

    const userFound = await user.findById(req.id);

    req.body.user = userFound!._id;

      const newProject = await project.create(req.body);

      userFound!.projects.push(newProject._id);

      await userFound!.save();

      res.status(CREATED).json({ message: "project added!" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error adding project" });
  }
}

export const addCourse = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { success } = validateCourseData(req.body);
    if (!success) {
      res.status(BAD_REQUEST).json({ error: "send the required data" });
      return;
    }

    const userFound = await user.findById(req.id);

    req.body.user = userFound!._id;

    const newCourse = await course.create(req.body);

    userFound!.courses.push(newCourse._id);

    await userFound!.save();

    res.status(CREATED).json({ message: "course added!" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error adding certification" });
  }
}

export const performTask = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { taskId } = req.query as { taskId: string };

    const taskFound = await task.findById(taskId).lean();
    if (!taskFound) {
      res.status(NOT_FOUND).json({ error: "no task found with sent id" });
      return;
    }

    const isTaskCompleted = await taskCompleted.findOne({ user: req.id, task: taskId }).lean();
    if (isTaskCompleted) {
      res.status(BAD_REQUEST).json({ error: "task already completed" });
      return;
    }

    await taskCompleted.create({ task: taskId, user: req.id });

    res.status(OK).json({ message: "task performed!" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error performing task" });
  }
};

export const addEvent = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { success } = validateEventData(req.body);
    if (!success) {
      res.status(BAD_REQUEST).json({ error: "send the required data" });
      return;
    }

    const eventPicBuffer = req.file?.buffer;

    if (eventPicBuffer) {
      const eventPic = await uploadImg({ filename: req.file?.originalname, file: eventPicBuffer, folder: "user-events" });
      req.body.eventPic = eventPic;
    }

    const userFound = await user.findById(req.id);

    req.body.user = userFound!._id;

    const newEvent = await event.create(req.body);

    userFound!.events.push(newEvent._id);

    await userFound!.save();

    res.status(CREATED).json({ message: "event added!" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error adding events" });
  }
}

export const addSkill = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { success } = validateSkillData(req.body);
    if (!success) {
      res.status(BAD_REQUEST).json({ error: "send the required data" });
      return;
    }

    const userFound = await user.findById(req.id);

    req.body.user = userFound!._id;

    const newSkill = await skill.create(req.body);

    userFound!.skills.push(newSkill._id);

    await userFound!.save();

    res.status(CREATED).json({ message: "skill added!" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error adding skills" });
  }
}

export const addAward = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { success } = validateAwardData(req.body);
    if (!success) {
      res.status(BAD_REQUEST).json({ error: "send the required data" });
      return;
    }

    const userFound = await user.findById(req.id);

    req.body.user = userFound!._id;

    const newAward = await award.create(req.body);

    userFound!.awards.push(newAward._id);

    await userFound!.save();

    res.status(CREATED).json({ message: "award added!" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error adding awards or achievements" });
  }
}

export const addEmploymentHistory = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { success } = validateEmploymentHistoryData(req.body);
    if (!success) {
      res.status(BAD_REQUEST).json({ error: "send the required data" });
      return;
    }

    const userFound = await user.findById(req.id);

    req.body.user = userFound!._id;

    const newEmploymentHistory = await employmentHistory.create(req.body);

    userFound!.employmentHistories.push(newEmploymentHistory._id);

    await userFound!.save();

    res.status(CREATED).json({ message: "employment history added!" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error adding employment history" });
  }
}

export const addRecommendation = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { success } = validateRecommendationData(req.body);
    if (!success) {
      res.status(BAD_REQUEST).json({ error: "send the required data" });
      return;
    }

    const userFound = await user.findById(req.id);

    req.body.user = userFound!._id;

    const newRecommendation = await recommendation.create(req.body);

    userFound!.recommendations.push(newRecommendation._id);

    await userFound!.save();

    res.status(CREATED).json({ message: "recommendation added!" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error adding employment history" });
  }
}

export const deleteProfile = async (req: GlobalRequest, res: GlobalResponse) => {
  try {

    await user.findByIdAndDelete(req.id);

    res.status(OK).json({ message: "user deleted" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error deleting profile" });
  }
}

