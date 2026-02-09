import logger from "@/configs/logger";
import { cashDonation, deviceDonation } from "@/models/donation.model";
import { donor } from "@/models/donor.model";
import { dreamBoard } from "@/models/dreamBoard.model";
import { user } from "@/models/user.model";
import { INTERNAL_SERVER_ERROR, BAD_REQUEST, OK, CREATED } from "@/utils/status.utils";
import { validateDeviceDonationData } from "@/utils/utils";
import { uploadImg } from "@/utils/img.utils";

export const donorDashboard = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const userFound = await donor.findById(req.id).lean();

    const cashDonated = await cashDonation.find({ user: req.id }).lean().select("amount status date allocation");

    const devicesDonated = await deviceDonation.find({ user: req.id }).lean();

    const recipientsHelped = await dreamBoard.countDocuments({ donor: req.id });

    res.status(OK).json({ message: "dashboard fetched!", userFound, cashDonated, devicesDonated, recipientsHelped });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching dashboard" });
  }
}

export const donorPublicProfile = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const id = req.params.id as string;

    const donorFound = await donor.findById(id).lean();

    const cashDonated = await cashDonation.find({ donor: id }).lean().select("amount status date allocation");

    const devicesDonated = await deviceDonation.find({ donor: id }).lean().select("deviceType dateDonated status recipient user");

    const recipientsHelped = await dreamBoard.countDocuments({ donor: id });

    res.status(OK).json({ message: "dashboard fetched!", donorFound, cashDonated, devicesDonated, recipientsHelped, badges: [] });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching donor public profile data" });
  }
}

export const updateDonor = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const profileBuffer = req.file?.buffer;
    
    if (profileBuffer) {
      const profile = await uploadImg({ filename: req.file?.originalname, file: profileBuffer, folder: "donor-profiles" });
      req.body.profilePic = profile;
    }

    await donor.findOneAndUpdate({ _id: req.id }, req.body, { new: true });

    res.status(OK).json({ message: "donor updated!" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error updating donor" });
  }
}

export const createDonation = async (req: GlobalRequest, res: GlobalResponse) => {
  try {

    const pictureFiles = req.files as {
      frontImage: Express.Multer.File[];
      backImage: Express.Multer.File[];
    };

    const frontImageFile = pictureFiles?.frontImage?.[0];
    const backImageFile = pictureFiles?.backImage?.[0];
    
    const { section, user } = req.body;

    if (section === "device") {
      const { success } = validateDeviceDonationData(req.body);
      if (!success) {
        res.status(BAD_REQUEST).json({ error: "send the data required to create a donation" });
        return;
      }

      if (user) {
        const recipientExists = await user.findById(user);
        if (!recipientExists) {
          res.status(BAD_REQUEST).json({ error: "recipient does not exist" });
          return;
        }
      }

      // if (frontImageFile && backImageFile) {
      //   const frontImage = await uploadImg({ filename: frontImageFile.originalname, file: frontImageFile.buffer, folder: "donation-images" });
      //   const backImage = await uploadImg({ filename: backImageFile.originalname, file: backImageFile.buffer, folder: "donation-images" });
  
      //   req.body.frontImage = frontImage;
    
      //   req.body.backImage = backImage;
      // } else {
      //   res.status(BAD_REQUEST).json({ error: "the images (front and back) for the device is required" });
      //   return;
      // }

      await deviceDonation.create(req.body);
    } else if (section === "cash") {
      await cashDonation.create(req.body);
    }

    res.status(CREATED).json({ message: "donation created!" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error donating device" });
 }
}
