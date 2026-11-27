import BloodRequest from "../models/BloodRequest.js";
import User from "../models/User.js";
import { findMatchingDonors } from "../services/donorMatchingService.js";
import { notifyNextDonor } from "../services/donorNotificationService.js";
import { getHospitalCoordinates,getRoadRoute, } from "../services/openRouteService.js";



export const createBloodRequest = async (req, res) => {
  try {
    const {
      bloodGroup,
      units,
      hospital,
      location,
      neededAt,
      reason,
      urgency,
    } = req.body;

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

    const requestUrgency = urgency || "normal";
    const isAdmin = req.user.role === "admin";

    if (requestUrgency === "emergency" && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can create emergency blood requests",
      });
    }

    const requestedUnits = Number(units);
    const maxUnits =
      isAdmin && requestUrgency === "emergency" ? 1000 : 20;

    if (
      !Number.isFinite(requestedUnits) ||
      requestedUnits < 1 ||
      requestedUnits > maxUnits
    ) {
      return res.status(400).json({
        success: false,
        message: `Units must be between 1 and ${maxUnits}`,
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

    const now = new Date();

    const radiusExpansionInterval =
      requestUrgency === "emergency"
        ? 5 * 60 * 1000
        : 60 * 60 * 1000;

    const nextRadiusExpansionAt = new Date(
      now.getTime() + radiusExpansionInterval
    );

    const bloodRequest = await BloodRequest.create({
      requester: req.user._id,
      bloodGroup,
      units: requestedUnits,
      confirmedUnits: 0,
      hospital,
      location,
      neededAt: requestDate,
      reason,
      urgency: requestUrgency,
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

    const isAdmin = req.user.role === "admin";
    const effectiveUrgency = updates.urgency ?? request.urgency;

    if (effectiveUrgency === "emergency" && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can manage emergency blood requests",
      });
    }

    const maxUnits =
      isAdmin && effectiveUrgency === "emergency" ? 1000 : 20;

    const requestedUnits =
      updates.units !== undefined
        ? Number(updates.units)
        : request.units;

    if (
      !Number.isFinite(requestedUnits) ||
      requestedUnits < 1 ||
      requestedUnits > maxUnits
    ) {
      return res.status(400).json({
        success: false,
        message: `Units must be between 1 and ${maxUnits}`,
      });
    }

    if (requestedUnits < request.confirmedUnits) {
      return res.status(400).json({
        success: false,
        message: `Units cannot be less than already confirmed units (${request.confirmedUnits})`,
      });
    }

    if (updates.units !== undefined) {
      updates.units = requestedUnits;
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

export const getBloodRequestRoute = async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id);

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: "Blood request not found",
      });
    }

    const user = await User.findById(req.user._id).select(
      "locationPoint"
    );

    if (
      !user?.locationPoint ||
      user.locationPoint.type !== "Point" ||
      !Array.isArray(user.locationPoint.coordinates) ||
      user.locationPoint.coordinates.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Please update your location first",
      });
    }

    const [startLongitude, startLatitude] =
      user.locationPoint.coordinates;

    const hospitalCoordinates = await getHospitalCoordinates(
      bloodRequest.hospital,
      bloodRequest.location
    );

    const route = await getRoadRoute(
      {
        latitude: startLatitude,
        longitude: startLongitude,
      },
      {
        latitude: hospitalCoordinates.latitude,
        longitude: hospitalCoordinates.longitude,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Hospital route generated successfully",
      route: {
        start: {
          latitude: startLatitude,
          longitude: startLongitude,
        },
        destination: hospitalCoordinates,
        distanceKm: route.distanceKm,
        durationMinutes: route.durationMinutes,
        coordinates: route.coordinates,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid blood request ID",
      });
    }

    console.error("Get blood request route error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message || "Server error while generating route",
    });
  }
};