import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ quiet: true });

export const port = process.env.PORT || "5600";
export const DB_URI = process.env.DB_URI as string;
export const environment = process.env.ENVIRONMENT as "development" | "production";
export const network = process.env.NETWORK as "testnet" | "mainnet" | undefined;

export const JWT_SECRET = process.env.JWT_SECRET as string;
export const REFRESH_SECRET = process.env.REFRESH_SECRET as string;

export const COOLIFY_REDIS = process.env.COOLIFY_REDIS as string;

export const REDIS_URI = process.env.REDIS_URI as string;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD as string;
export const REDIS_PORT = process.env.REDIS_PORT as string;
export const REDIS_USERNAME = process.env.REDIS_USERNAME as string;

export const SERVER_ENV = z
  .object({
    ALLOWED_ORIGINS: z
      .string()
      .transform((value) => value.split(",").map((origin) => origin.trim()))
      .refine(
        (urls) =>
          urls.every((url) => {
            try {
              new URL(url);
              return true;
            } catch {
              return false;
            }
          }),
        { message: "One or more ALLOWED_ORIGINS are invalid URLs" },
      ),
  })
  .parse(process.env);

export const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;

export const AWS_REGION = process.env.AWS_REGION as string;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY as string;
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID as string;
export const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET as string;

export const EMAIL_USER = process.env.EMAIL_USER as string;
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD as string;
