import BloodRequest from "../models/BloodRequest.js";
import User from "../models/User.js";
import { findMatchingDonors } from "../services/donorMatchingService.js";
import { notifyNextDonor } from "../services/donorNotificationService.js";


export const createBloodRequest = async (req, res) => {
  try {
    const { bloodGroup, units, hospital, location, neededAt, reason, urgency, } = req.body;
    if (
      !bloodGroup ||
      units === undefined ||
      !hospital?.trim() ||
      !location?.trim() ||
      !neededAt ||
      !reason?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required blood request details",
      });
    }

    const requestDate = new Date(neededAt);

    if (Number.isNaN(requestDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid neededAt date",
      });
    }

    if (requestDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Needed date and time must be in the future",
      });
    }

    const requestUrgency = urgency || "normal";

    // Emergency hole 5 minute, baki request hole 1 hour por radius barbe
    const now = new Date();

    const radiusExpansionInterval =
      requestUrgency === "emergency"
        ? 5 * 60 * 1000
        : 60 * 60 * 1000;

    // Initial radius expansion er time calculate korbo
    const nextRadiusExpansionAt = new Date(
      now.getTime() + radiusExpansionInterval
    );

    const bloodRequest = await BloodRequest.create({
      requester: req.user._id,
      bloodGroup,
      units,
      confirmedUnits: 0,
      hospital,
      location,
      neededAt: requestDate,
      reason,
      urgency: requestUrgency,

      // Automatic donor search initialize korbo
      currentRadiusKm: 5,
      maxRadiusKm: 20,
      searchStartedAt: now,
      nextRadiusExpansionAt,
      nextDonorNotificationAt: now,
      searchStatus: "running",
    });

    return res.status(201).json({
      success: true,
      message: "Blood request created successfully",
      request: bloodRequest,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create blood request error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while creating blood request",
    });
  }
};

export const getMyBloodRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({
      requester: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get my blood requests error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching blood requests",
    });
  }
};

export const getActiveBloodRequests = async (req, res) => {
  try {
    const { bloodGroup, location, urgency } = req.query;

    const filter = {
      status: "active",
      neededAt: { $gt: new Date() },
    };

    if (bloodGroup) {
      filter.bloodGroup = bloodGroup;
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (urgency) {
      filter.urgency = urgency;
    }

    const requests = await BloodRequest.find(filter)
      .populate("requester", "name bloodGroup")
      .sort({ createdAt: -1 });

    const urgencyOrder = {
      emergency: 3,
      urgent: 2,
      normal: 1,
    };

    requests.sort(
      (a, b) =>
        urgencyOrder[b.urgency] - urgencyOrder[a.urgency] ||
        b.createdAt - a.createdAt
    );

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get active blood requests error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching active blood requests",
    });
  }
};


export const cancelBloodRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findOne({
      _id: req.params.id,
      requester: req.user._id,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Blood request not found",
      });
    }

    if (request.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Only active requests can be cancelled",
      });
    }

    request.status = "cancelled";
    request.searchStatus = "stopped";
    request.searchStopReason = "request_cancelled";
    request.nextRadiusExpansionAt = null;
    request.nextDonorNotificationAt = null;

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Blood request cancelled successfully",
      request,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid blood request ID",
      });
    }

    console.error("Cancel blood request error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while cancelling blood request",
    });
  }
};


export const updateBloodRequest = async (req, res) => {
  try {
    const allowedFields = [
      "bloodGroup",
      "units",
      "hospital",
      "location",
      "neededAt",
      "reason",
      "urgency",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    if (updates.neededAt !== undefined) {
      const requestDate = new Date(updates.neededAt);

      if (
        Number.isNaN(requestDate.getTime()) ||
        requestDate <= new Date()
      ) {
        return res.status(400).json({
          success: false,
          message: "Needed date and time must be in the future",
        });
      }

      updates.neededAt = requestDate;
    }

    const request = await BloodRequest.findOne({
      _id: req.params.id,
      requester: req.user._id,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Blood request not found",
      });
    }

    if (request.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Only active requests can be updated",
      });
    }

    Object.assign(request, updates);
    await request.save();

    return res.status(200).json({
      success: true,
      message: "Blood request updated successfully",
      request,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid blood request ID",
      });
    }

    console.error("Update blood request error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while updating blood request",
    });
  }
};


export const getMatchingDonors = async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findOne({
      _id: req.params.id,
      requester: req.user._id,
      status: "active",
      neededAt: { $gt: new Date() },
    });

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: "Active blood request not found",
      });
    }

    const requester = await User.findById(req.user._id)
      .select("locationPoint");

    if (
      !requester?.locationPoint ||
      requester.locationPoint.type !== "Point" ||
      !Array.isArray(requester.locationPoint.coordinates) ||
      requester.locationPoint.coordinates.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Please update your location first",
      });
    }

    const matchedDonors = await findMatchingDonors({
      bloodGroup: bloodRequest.bloodGroup,
      requesterId: req.user._id,
      requesterLocationPoint: requester.locationPoint,
    });

    return res.status(200).json({
      success: true,
      count: matchedDonors.length,
      donors: matchedDonors,
      message:
        matchedDonors.length === 0
          ? "No eligible donors with location found"
          : undefined,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid blood request ID",
      });
    }

    console.error("Get matching donors error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while finding matching donors",
    });
  }
};


export const sendNextDonorNotification = async (req, res) => {
  try {
    const request = await BloodRequest.findOne({
      _id: req.params.id,
      requester: req.user._id,
      status: "active",
      searchStatus: "running",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Active blood request not found",
      });
    }

    const result = await notifyNextDonor(request._id);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid blood request ID",
      });
    }

    console.error("Send donor notification error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while notifying donor",
    });
  }
};
