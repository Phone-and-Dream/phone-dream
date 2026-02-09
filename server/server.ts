import express from "express";
import cors from "cors";
import helmet from "helmet";
import { port, SERVER_ENV } from "@/utils/env.utils";
import DB from "@/configs/db";
import logger from "@/configs/logger";
import appRoutes from "@/routes";

const server = express();

// server.use(cors({ origin: SERVER_ENV.ALLOWED_ORIGINS }));
server.use(helmet());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use("/api", appRoutes);

server.listen(port, async () => {
  logger.info(`Server is running on port ${port}`);
  await DB();
});