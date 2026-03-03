import logger from "@/configs/logger";
import { admin } from "@/models/admin.model";
import { donor } from "@/models/donor.model";
import { user } from "@/models/user.model";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED } from "@/utils/status.utils";
import { JWT } from "@/utils/utils";
import multer from "multer";

const fileSize = 5 * (1024 ** 2); // 5 MB

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize }
});

export const authenticateUser = async (req: GlobalRequest, res: GlobalResponse, next: GlobalNextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(UNAUTHORIZED).json({
        error: "Bearer auth header not set",
      });
      return;
    }

    const bearerToken = authHeader.split(" ")[1];
    if (!bearerToken) {
      res.status(UNAUTHORIZED).json({ error: "authorization token is missing or invalid" });
      return;
    }

    const { id } = await JWT.verify(bearerToken) as { id: string };

    const userExists = await user.findById(id);
    if (!userExists) {
      res.status(BAD_REQUEST).json({ error: "id associated with user is invalid" });
      return;
    }

    req.id = id;

    next();
  } catch (error: any) {
    logger.error(error);
    if (error.trim() === "jwt expired") {
      res.status(BAD_REQUEST).json({ error: "Token has expired, kindly re-login, kindly login again" });
      return
    }

    res.status(INTERNAL_SERVER_ERROR).json({ error: "Invalid authentication token, kindly re-login." });
  }
}

export const authenticateDonor = async (req: GlobalRequest, res: GlobalResponse, next: GlobalNextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(UNAUTHORIZED).json({
        error: "Bearer auth header not set",
      });
      return;
    }

    const bearerToken = authHeader.split(" ")[1];
    if (!bearerToken) {
      res.status(UNAUTHORIZED).json({ error: "authorization token is missing or invalid" });
      return;
    }

    const { id } = await JWT.verify(bearerToken) as { id: string };

    const isDonor = await donor.findById(id);
    if (!isDonor) {
      res.status(UNAUTHORIZED).json({ error: "only donors can use this route" });
      return;
    }

    req.id = id;
    req.owner = isDonor.fullName;

    next();
  } catch (error: any) {
    logger.error(error);
    if (error.trim() === "jwt expired") {
      res.status(BAD_REQUEST).json({ error: "Token has expired, kindly re-login, kindly login again" });
      return
    }

    res.status(INTERNAL_SERVER_ERROR).json({ error: "Invalid authentication token, kindly re-login." });
  }
}

export const authenticateAdmin = async (req: GlobalRequest, res: GlobalResponse, next: GlobalNextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(UNAUTHORIZED).json({
        error: "Bearer auth header not set",
      });
      return;
    }

    const bearerToken = authHeader.split(" ")[1];
    if (!bearerToken) {
      res.status(UNAUTHORIZED).json({ error: "authorization token is missing or invalid" });
      return;
    }

    const { id } = await JWT.verify(bearerToken) as { id: string };

    const isAdmin = await admin.findById(id);
    if (!isAdmin) {
      res.status(UNAUTHORIZED).json({ error: "only admins can use this route" });
      return;
    }

    req.id = id;

    next();
  } catch (error: any) {
    logger.error(error);
    if (error.trim() === "jwt expired") {
      res.status(BAD_REQUEST).json({ error: "Token has expired, kindly re-login, kindly login again" });
      return
    }

    res.status(INTERNAL_SERVER_ERROR).json({ error: "Invalid authentication token, kindly re-login." });
  }
}