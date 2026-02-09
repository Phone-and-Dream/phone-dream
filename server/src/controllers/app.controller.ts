import logger from "@/configs/logger";
import { dreamBoard } from "@/models/dreamBoard.model"
import { user } from "@/models/user.model"
import { task, taskCompleted } from "@/models/task.model";
import { INTERNAL_SERVER_ERROR, BAD_REQUEST, OK, NOT_FOUND } from "@/utils/status.utils";
import { validateTaskCreateData } from "@/utils/utils";
import { badge } from "@/models/badge.model";

export const home = async (req: GlobalRequest, res: GlobalResponse) => {
  res.send("hi")
}

export const getBoards = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const dreamBoards = await dreamBoard.find().sort({ createdAt: 1 }).lean();

    res.status(OK).json({ message: "dream board data fetched!", dreamBoards });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error getting dream board info" });
  }
}

export const createTask = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { success } = validateTaskCreateData(req.body);
    if (!success) {
      res.status(BAD_REQUEST).json({ error: "invalid dream board data" });
      return;
    }

    let xp: number;

    const { section } = req.body;

    if (section === "social") {
      xp = 50;
    } else if (section === "platform") {
      xp = 20;
    } else {
      xp = 10;
    }

    req.body.xp = xp;

    await task.create(req.body);

    res.status(OK).json({ message: "task created!" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error creating task" });
  }
}

export const getTasks = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const tasksInDB = await task.find().lean().sort({ createdAt: 1 });

    const tasksCompleted = await taskCompleted.find({ user: req.id }).lean();

    const tasks: any[] = [];

    for (const t of tasksInDB) {
      const taskCompletedFound = tasksCompleted.find(t_c => t_c.task === t._id);
      
      const mergedTask: Record<any, unknown> = t;

      mergedTask.done = taskCompletedFound ? true : false;

      tasks.push(mergedTask);
    }

    res.status(OK).json({ message: "tasks fetched!", tasks });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error getting tasks" });
  }
};

export const fetchRecipients = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const deviceType = req.query.deviceType as string;

    const filteredRecipients = await dreamBoard.find({ needs: deviceType }).lean();

    res.status(OK).json({ message: "recipients fetched", filteredRecipients });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching recipients" });
  }
}

export const leaderboard = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const users = await user.find().limit(100).lean().select("xp career _id fullName country").sort({ xp: -1 });

    res.status(OK).json({ message: "leaderboard info fetched", users });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching leaderboard data" });
  }
}