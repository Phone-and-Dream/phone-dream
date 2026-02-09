import jwt from "jsonwebtoken";
import { z } from "zod";
import { JWT_SECRET, REFRESH_SECRET } from "./env.utils";

export const validateTaskCreateData = (reqData: any) => {
  const taskSchema = z.object({
    title: z.string().trim(),
    description: z.string().trim(),
    tag: z.enum(["follow", "repost", "tagline", "bio", "event", "project", "course", "skill", "location"]),
    link: z.string().trim().optional(),
    section: z.enum(["social", "platform", "profile"]),
  });

  const parseData = taskSchema.safeParse(reqData);

  return parseData;
};

export const validateDreamBoardCreateData = (reqData: any) => {
  const dreamBoardSchema = z.object({
    fullName: z.string().trim(),
    state: z.string().trim(),
    country: z.enum([
      "nigeria", "ghana", "kenya", "south africa", "egypt", "morocco", "tanzania", "senegal", "other"
    ]),
    career: z.string().trim(),
    backgroundStory: z.string().trim(),
    recommendationLetter: z.string().trim(),
    careerStatus: z.enum([
      "unemployed",
      "student",
      "graduate",
      "freelancer",
      "employed",
      "entreprenuer",
      "seeking opportunities",
    ]),
    references: z
      .array(
        z.object({
          name: z.string().trim(),
          contact: z.string().trim(), // use string for phone/contact
          relationship: z.string().trim(),
        })
      )
      .min(2, { message: "At least 2 references required" }),
    institutionOrCompany: z.string().trim().optional(),
    // array of objects for goals
    goals: z.array(
      z.string()
    ).min(3, { message: "At least 3 goals required" }),
    needs: z.enum(["smartphone", "tablet", "desktop pc", "other", "laptop", "monitor", "keyboard", "external drive", "printer"]),
    refurbished: z.boolean().optional(),
  });

  const parseData = dreamBoardSchema.safeParse(reqData);

  return parseData;
};

export const validateDeviceDonationData = (reqData: any) => {
  const deviceSchema = z.object({
    amount: z.number(),
    user: z.string().trim().optional(),
    frontImage: z.string(),
    backImage: z.string(),
    deviceVideo: z.string().trim(),
    imeiNumber: z.string().trim().optional(),
    willPayForRefurbish: z.boolean(),
    condition: z.enum(["smartphone", "tablet", "desktop pc", "other", "laptop", "monitor", "keyboard", "external drive", "printer"]),
    deviceType: z.enum(["new", "good condition", "refurbished"]),
    status: z.enum(["in review", "accepted", "rejected"]),
    specifications: z.string().optional()
  });

  const parseData = deviceSchema.safeParse(reqData);

  return parseData;
};

export const validateCashDonationData = (reqData: any) => {
  const deviceSchema = z.object({
    amount: z.number(),
    user: z.string().trim().optional(),
    imeiNumber: z.string().trim().optional(),
    willPayForRefurbish: z.boolean(),
    condition: z.enum(["smartphone", "tablet", "desktop pc", "other", "laptop", "monitor", "keyboard", "external drive", "printer"]),
    deviceType: z.enum(["new", "good condition", "refurbished"]),
    status: z.enum(["in review", "accepted", "rejected"]),
    specifications: z.string().optional()
  });

  const parseData = deviceSchema.safeParse(reqData);

  return parseData;
};

export const validateProjectData = (reqData: any) => {
  const projectSchema = z.object({
    projectName: z.string().trim(),
    description: z.string().trim(),
    techStack: z.string().trim(),
    wasDeviceDonated: z.boolean(),
    projectFeatured: z.boolean(),
    status: z.enum(["in progress", "completed", "on hold", "planning"]),
    urls: z.object({
      github: z.string().trim().optional(),
      liveUrl: z.string().trim().optional()
    })
  });

  const parseData = projectSchema.safeParse(reqData);

  return parseData;
};

export const validateAwardData = (reqData: any) => {
  const awardSchema = z.object({
    awardName: z.string().trim(),
    issuingOrganization: z.string().trim(),
    dateReceived: z.string().trim(),
    description: z.string().trim(),
    awardLink: z.string().trim(),
  });

  const parseData = awardSchema.safeParse(reqData);

  return parseData;
};

export const validateCourseData = (reqData: any) => {
  const courseSchema = z.object({
    courseName: z.string().trim(),
    provider: z.string().trim(),
    certificateUrl: z.string().trim(),
    status: z.enum(["completed", "in progress"]),
    progress: z.number(),
  });

  const parseData = courseSchema.safeParse(reqData);

  return parseData;
};

export const validateEmploymentHistoryData = (reqData: any) => {
  const employmentHistorySchema = z.object({
    companyName: z.string().trim(),
    jobTitle: z.string().trim(),
    startDate: z.string().trim(),
    endDate: z.string().trim(),
    description: z.string().trim(),
    currentlyWorkThere: z.boolean(),
  });

  const parseData = employmentHistorySchema.safeParse(reqData);

  return parseData;
};

export const validateEventData = (reqData: any) => {
  const eventSchema = z.object({
    eventName: z.string().trim(),
    date: z.string().trim(),
    location: z.string().trim(),
    category: z.enum(["conference", "workshop", "hackathon", "meetup", "training"]),
    description: z.string().trim(),
    skillsGained: z.string().trim().optional(),
  });

  const parseData = eventSchema.safeParse(reqData);

  return parseData;
};

export const validateRecommendationData = (reqData: any) => {
  const recommendationSchema = z.object({
    text: z.string().trim(),
    quest: z.string().trim(),
    link: z.string().trim().optional(),
  });

  const parseData = recommendationSchema.safeParse(reqData);

  return parseData;
};

export const validateSkillData = (reqData: any) => {
  const skillSchema = z.object({
    skillName: z.string().trim(),
    progress: z.number(),
    category: z.enum(["technical", "creative", "business", "language", "other"]),
    proficiencyLevel: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  });

  const parseData = skillSchema.safeParse(reqData);

  return parseData;
};

export const validateUserSignUpData = (reqData: any) => {
  const userSchema = z.object({
    fullName: z.string().trim(),
    email: z.email().trim(),
    password: z.string().trim(),
    page: z.string().trim()
  });

  const parseData = userSchema.safeParse(reqData);

  return parseData;
};

export const JWT = {
  sign: (id: string) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
  },

  verify: (jwtToken: string) => {
    return new Promise((resolve, reject) => {
      jwt.verify(jwtToken, JWT_SECRET, (error, decodedText) => {
        if (error) reject(error.message);
        else if (typeof decodedText === "object") {
          resolve(decodedText);
        } else {
          reject("Invalid JWT payload");
        }
      });
    });
  },
};

export const getRefreshToken = (id: string) => {
  return jwt.sign({ id }, REFRESH_SECRET, { expiresIn: "30d" });
};
