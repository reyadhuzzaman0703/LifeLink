import BloodRequest from "../models/BloodRequest.js";
import User from "../models/User.js";
import { getRouteMatrix } from "../services/openRouteService.js";

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

    const bloodRequest = await BloodRequest.create({
      requester: req.user._id,
      bloodGroup,
      units,
      hospital,
      location,
      neededAt: requestDate,
      reason,
      urgency: urgency || "normal",
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

    // Get requester's coordinates
    const requester = await User.findById(req.user._id)
      .select("coordinates");

    if (
      !requester?.coordinates ||
      typeof requester.coordinates.latitude !== "number" ||
      typeof requester.coordinates.longitude !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message: "Please update your location coordinates first",
      });
    }

    // Compatible donor blood groups
    const compatibleGroups = {
      "O-": ["O-"],
      "O+": ["O-", "O+"],
      "A-": ["O-", "A-"],
      "A+": ["O-", "O+", "A-", "A+"],
      "B-": ["O-", "B-"],
      "B+": ["O-", "O+", "B-", "B+"],
      "AB-": ["O-", "A-", "B-", "AB-"],
      "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    };

    // 90-day donation eligibility
    const eligibilityDate = new Date();
    eligibilityDate.setDate(eligibilityDate.getDate() - 90);

    // Find eligible donors with valid coordinates
    const donors = await User.find({
      _id: { $ne: req.user._id },
      role: "user",
      isActive: true,
      isAvailable: true,

      bloodGroup: {
        $in: compatibleGroups[bloodRequest.bloodGroup],
      },

      $or: [
        { lastDonationDate: null },
        { lastDonationDate: { $lte: eligibilityDate } },
      ],

      "coordinates.latitude": { $type: "number" },
      "coordinates.longitude": { $type: "number" },

    }).select(
      "name bloodGroup location coordinates lastDonationDate"
    );

    if (donors.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        donors: [],
        message: "No eligible donors with location coordinates found",
      });
    }

    // Requester's location comes first
    const coordinates = [
      requester.coordinates,
      ...donors.map((donor) => donor.coordinates),
    ];

    // Get road distance and duration from ORS
    const routeData = await getRouteMatrix(coordinates);

    // Attach road distance and travel time to each donor
    const matchedDonors = donors.map((donor, index) => {
      const distance = routeData.distances[index];
      const duration = routeData.durations[index];

      return {
        ...donor.toObject(),

        roadDistanceKm:
          distance !== null ? Number(distance.toFixed(2)) : null,

        estimatedTravelMinutes:
          duration !== null
            ? Number((duration / 60).toFixed(1))
            : null,
      };
    });

    // Sort nearest donors first
    matchedDonors.sort((a, b) => {
      if (a.roadDistanceKm === null) return 1;
      if (b.roadDistanceKm === null) return -1;

      return a.roadDistanceKm - b.roadDistanceKm;
    });

    return res.status(200).json({
      success: true,
      count: matchedDonors.length,
      donors: matchedDonors,
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
