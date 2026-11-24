import mongoose from "mongoose";
import User from "../models/User.js";
import EmergencyBulletin from "../models/EmergencyBulletin.js";
import EmergencyBulletinResponse from "../models/EmergencyBulletinResponse.js";

export const respondToEmergencyBulletin = async (req, res) => {
  try {
    const { id, hospitalId } = req.params;
    const { bloodGroup } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(hospitalId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Bulletin or Hospital ID",
      });
    }

    if (!bloodGroup) {
      return res.status(400).json({
        success: false,
        message: "Blood group is required",
      });
    }

    const bulletin = await EmergencyBulletin.findOne({
      _id: id,
      status: "active",
    });

    if (!bulletin) {
      return res.status(404).json({
        success: false,
        message: "Active Emergency Bulletin not found",
      });
    }

    const hospital = bulletin.hospitals.id(hospitalId);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found in this Bulletin",
      });
    }

    const requirement = hospital.bloodRequirements.find(
      (item) => item.bloodGroup === bloodGroup
    );

    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: "This blood group is not required at this hospital",
      });
    }

    const donor = await User.findById(req.user._id);

    if (!donor || donor.role !== "user" || !donor.isActive) {
      return res.status(403).json({
        success: false,
        message: "Only active donor accounts can respond",
      });
    }

    if (!donor.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "You must be available to respond",
      });
    }

    if (donor.bloodGroup !== bloodGroup) {
      return res.status(400).json({
        success: false,
        message: "Your blood group does not match this requirement",
      });
    }

    const eligibilityDate = new Date();
    eligibilityDate.setDate(eligibilityDate.getDate() - 90);

    if (
      donor.lastDonationDate &&
      donor.lastDonationDate > eligibilityDate
    ) {
      return res.status(400).json({
        success: false,
        message: "You are not eligible to donate yet. The minimum interval is 90 days.",
      });
    }

    const existingResponse = await EmergencyBulletinResponse.findOne({
      bulletin: id,
      hospitalId,
      donor: donor._id,
      bloodGroup,
    });

    if (existingResponse) {
      return res.status(409).json({
        success: false,
        message: "You have already responded to this hospital and blood group",
        response: existingResponse,
      });
    }

    const goingCount = await EmergencyBulletinResponse.countDocuments({
      bulletin: id,
      hospitalId,
      bloodGroup,
    });

    if (goingCount >= requirement.requiredUnits) {
      return res.status(400).json({
        success: false,
        message: "Required donor responses have already been reached",
        requiredUnits: requirement.requiredUnits,
        goingCount,
        remainingUnits: 0,
      });
    }

    const response = await EmergencyBulletinResponse.create({
      bulletin: id,
      hospitalId,
      donor: donor._id,
      bloodGroup,
      status: "going_to_hospital",
    });

    const updatedGoingCount = goingCount + 1;
    const arrivedCount = await EmergencyBulletinResponse.countDocuments({
      bulletin: id,
      hospitalId,
      bloodGroup,
      status: "arrived",
    });

    return res.status(201).json({
      success: true,
      message: "Your hospital commitment has been recorded",
      response,
      summary: {
        requiredUnits: requirement.requiredUnits,
        goingCount: updatedGoingCount,
        arrivedCount,
        remainingUnits: Math.max(
          0,
          requirement.requiredUnits - updatedGoingCount
        ),
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already responded to this hospital and blood group",
      });
    }

    console.error("Emergency Bulletin response error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to record your response",
    });
  }
};
