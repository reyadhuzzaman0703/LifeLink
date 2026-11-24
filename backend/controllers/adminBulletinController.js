
import mongoose from "mongoose";
import EmergencyBulletin from "../models/EmergencyBulletin.js";
import { sendEmergencyBulletinNotifications } from "../services/emergencyBulletinNotificationService.js";

const ONE_HOUR = 60 * 60 * 1000;

export const createEmergencyBulletin = async (req, res) => {
  try {
    const { title, description, injuredCount, hospitals } = req.body;

    const bulletin = await EmergencyBulletin.create({
      title,
      description,
      injuredCount,
      hospitals,
      createdBy: req.user._id,
      notificationRoundsSent: 0,
      nextNotificationAt: new Date(),
    });

    let notificationResult = null;
    let notificationError = null;

    try {
      notificationResult =
        await sendEmergencyBulletinNotifications(bulletin);
    } catch (error) {
      notificationError = error.message;
      console.error("Initial Emergency Bulletin notification failed:", error.message);
    }

    bulletin.notificationRoundsSent = 1;
    bulletin.lastNotificationAt = new Date();
    bulletin.nextNotificationAt = new Date(Date.now() + ONE_HOUR);

    await bulletin.save();

    return res.status(201).json({
      success: true,
      message: "Emergency Bulletin created successfully",
      bulletin,
      notificationResult,
      notificationError,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateEmergencyBulletin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Bulletin ID",
      });
    }

    const bulletin = await EmergencyBulletin.findById(id);

    if (!bulletin) {
      return res.status(404).json({
        success: false,
        message: "Emergency Bulletin not found",
      });
    }

    if (bulletin.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Only active Bulletins can be updated",
      });
    }

    const { title, description, injuredCount, hospitals } = req.body;

    if (title !== undefined) bulletin.title = title;
    if (description !== undefined) bulletin.description = description;
    if (injuredCount !== undefined) bulletin.injuredCount = injuredCount;

    if (hospitals !== undefined) {
      if (!Array.isArray(hospitals) || hospitals.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one hospital is required",
        });
      }

      const existingHospitalIds = new Set(
        bulletin.hospitals.map((hospital) => hospital._id.toString())
      );

      for (const hospital of hospitals) {
        if (
          hospital._id &&
          !existingHospitalIds.has(hospital._id.toString())
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid hospital ID in update request",
          });
        }
      }

      bulletin.hospitals = hospitals.map((hospital) => {
        if (hospital._id) {
          return {
            ...hospital,
            _id: hospital._id,
          };
        }

        return hospital;
      });
    }

    bulletin.updatedBy = req.user._id;

    await bulletin.save();

    return res.status(200).json({
      success: true,
      message: "Emergency Bulletin updated successfully",
      bulletin,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const closeEmergencyBulletin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Bulletin ID",
      });
    }

    const bulletin = await EmergencyBulletin.findById(id);

    if (!bulletin) {
      return res.status(404).json({
        success: false,
        message: "Emergency Bulletin not found",
      });
    }

    if (bulletin.status === "closed") {
      return res.status(400).json({
        success: false,
        message: "Bulletin is already closed",
      });
    }

    bulletin.status = "closed";
    bulletin.nextNotificationAt = null;
    bulletin.updatedBy = req.user._id;

    await bulletin.save();

    return res.status(200).json({
      success: true,
      message: "Emergency Bulletin closed successfully",
      bulletin,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getActiveEmergencyBulletins = async (req, res) => {
  try {
    const bulletins = await EmergencyBulletin.find({
      status: "active",
    })
      .populate("createdBy", "name")
      .populate("updatedBy", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bulletins.length,
      bulletins,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEmergencyBulletinDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Bulletin ID",
      });
    }

    const bulletin = await EmergencyBulletin.findById(id)
      .populate("createdBy", "name")
      .populate("updatedBy", "name");

    if (!bulletin) {
      return res.status(404).json({
        success: false,
        message: "Emergency Bulletin not found",
      });
    }

    return res.status(200).json({
      success: true,
      bulletin,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
