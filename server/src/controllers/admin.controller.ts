import { admin } from "@/models/admin.model";
import { donor } from "@/models/donor.model";
import { badge } from "@/models/badge.model";
import { user } from "@/models/user.model";
import logger from "@/configs/logger";
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
} from "@/utils/status.utils";
import { deviceDonation } from "@/models/donation.model";

export const markDreamBoard = async (
  req: GlobalRequest,
  res: GlobalResponse,
) => {
  try {
  } catch (error: any) {
    logger.error(error);
    res
      .status(INTERNAL_SERVER_ERROR)
      .json({ error: "error marking dream board" });
  }
};

export const markDevice = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const {
      id,
      action,
      recipientId,
    }: { id: string; recipientId?: string; action: "reject" | "accepted" } =
      req.body;
    const device = await deviceDonation.findById(id);
    if (!device) {
      res.status(NOT_FOUND).json({ error: "device not found" });
      return;
    }

    let recipient;

    if (recipientId) {
      const recipientExists = await user.findById(recipientId).lean();
      if (!recipientExists) {
        res.status(NOT_FOUND).json({ error: "recipient not found" });
        return;
      }

      recipient = recipientExists;
      device.recipient = recipientExists.fullName;
      device.user = recipientExists._id;
    }

    if (action === "accepted") {
      device.status = "accepted";
      // await sendDeviceSelectionEmail(device.recipient);
      await badge.create({ mintedBy: recipient?.fullName, fundingType: "physical", career: recipient?.career, blockchain: "Avalanche", deviceType: device.deviceType });
    } else if (action === "reject") {
      device.status = "rejected";
      // await rejectionEmailToDonor()
    } else {
      res.status(BAD_REQUEST).json({ error: "invalid action" });
      return;
    }

    await device.save();

    res.status(OK).json({ message: "device marked successfully" });
  } catch (error: any) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error marking device" });
  }
};
