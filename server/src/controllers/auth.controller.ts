import logger from "@/configs/logger";
import { donor } from "@/models/donor.model";
import { user } from "@/models/user.model";
import { BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR, OK } from "@/utils/status.utils";
import { getRefreshToken, JWT, validateUserSignUpData } from "@/utils/utils";
import { formatDate } from "date-fns";
import bcrypt from "bcrypt";

export const signUp = async (req: GlobalRequest, res: GlobalResponse) => {
  const { email, password, fullName, page } = req.body;

  try {
    const { success } = validateUserSignUpData(req.body);
    if (!success) {
      res.status(BAD_REQUEST).json({ error: "invalid user sign up data" });
      return;
    }

    let created;

    const salt = bcrypt.genSaltSync(12);

    const hashedPassword = await bcrypt.hash(password, salt);

    const dateJoined = formatDate(new Date(), "MMM, y");

    if (page === "user") {
      const userExists = await user.findOne({ email }).lean();
      if (userExists) {
        res.status(BAD_REQUEST).json({ error: "user already exists, kindly login" });
        return;
      }

      created = await user.create({ dateJoined, password: hashedPassword, email, fullName });
    } else {
      const donorExists = await donor.findOne({ email }).lean();
      if (donorExists) {
        res.status(BAD_REQUEST).json({ error: "donor already exists, kindly login" });
        return;
      }

      created = await donor.create({ dateJoined, password: hashedPassword, email, fullName });
    }

    const id = created._id as unknown as string;

    const accessToken = JWT.sign(id);

    const refreshToken = getRefreshToken(id);

    req.id = id;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 30 * 24 * 60 * 60,
    });

    res.status(CREATED).json({ message: `${page} created!`, accessToken });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: `error signing up ${page}` });
  }
}

export const signIn = async (req: GlobalRequest, res: GlobalResponse) => {
  const { email, password, page } = req.body;

  try {
    if (!email || !password || !page) {
      res.status(BAD_REQUEST).json({ error: "send page, email and password" });
      return;
    }

    let exists;

    if (page === "user") {
      exists = await user.findOne({ email }).lean();
      if (!exists) {
        res.status(BAD_REQUEST).json({ error: "invalid credentials" });
        return;
      }

      const comparePassword = await bcrypt.compare(password, exists.password);
      if (!comparePassword) {
        res.status(BAD_REQUEST).json({ error: "invalid credentials" });
        return;
      }
    } else if (page === "donor") {
      exists = await donor.findOne({ email }).lean();
      if (!exists) {
        res.status(BAD_REQUEST).json({ error: "invalid credentials" });
        return;
      }

      const comparePassword = await bcrypt.compare(password, exists.password);
      if (!comparePassword) {
        res.status(BAD_REQUEST).json({ error: "invalid credentials" });
        return;
      }
    }

    const id = exists?._id as unknown as string;

    const accessToken = JWT.sign(id);

    const refreshToken = getRefreshToken(id);

    req.id = id;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 30 * 24 * 60 * 60,
    });

    res.status(OK).json({ message: `${page} signed in!`, accessToken });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: `error signing in ${page}` });
  }
}
