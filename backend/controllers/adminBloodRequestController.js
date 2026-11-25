
import mongoose from "mongoose";
import BloodRequest from "../models/BloodRequest.js";
import User from "../models/User.js";

const allowedStatuses = [
  "active",
  "fulfilled",
  "cancelled",
  "expired",
];

const allowedUrgencies = [
  "normal",
  "urgent",
  "emergency",
];

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Admin: Get all blood requests with search, filters and pagination
export const getAllBloodRequests = async (req, res) => {
  try {
    const {
      search,
      bloodGroup,
      urgency,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(Number(page) || 1, 1);
    const pageLimit = Math.min(
      Math.max(Number(limit) || 10, 1),
      100
    );

    const filter = {};

    // Blood group filter
    if (bloodGroup) {
      filter.bloodGroup = bloodGroup;
    }

    // Urgency filter
    if (urgency) {
      if (!allowedUrgencies.includes(urgency)) {
        return res.status(400).json({
          success: false,
          message: "Invalid urgency filter",
        });
      }

      filter.urgency = urgency;
    }

    // Request status filter
    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status filter",
        });
      }

      filter.status = status;
    }

    // Search by hospital, location, reason or requester
    if (search?.trim()) {
      const searchRegex = new RegExp(
        escapeRegex(search.trim()),
        "i"
      );

      const matchingUsers = await User.find({
        role: "user",
        $or: [
          { name: searchRegex },
          { email: searchRegex },
        ],
      }).select("_id");

      const searchConditions = [
        { hospital: searchRegex },
        { location: searchRegex },
        { reason: searchRegex },
      ];

      if (matchingUsers.length > 0) {
        searchConditions.push({
          requester: {
            $in: matchingUsers.map((user) => user._id),
          },
        });
      }

      filter.$or = searchConditions;
    }

    const skip = (currentPage - 1) * pageLimit;

    const [requests, totalRequests] = await Promise.all([
      BloodRequest.find(filter)
        .populate(
          "requester",
          "name email phone bloodGroup"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit),

      BloodRequest.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Blood requests retrieved successfully",
      requests,
      pagination: {
        totalRequests,
        currentPage,
        totalPages: Math.ceil(
          totalRequests / pageLimit
        ),
        limit: pageLimit,
      },
    });
  } catch (error) {
    console.error(
      "Admin get blood requests error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error while fetching blood requests",
    });
  }
};

// Admin: Get details of a specific blood request
export const getAdminBloodRequestDetails = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blood request ID",
      });
    }

    const request = await BloodRequest.findById(id).populate(
      "requester",
      "name email phone bloodGroup location"
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Blood request not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blood request details retrieved successfully",
      request,
    });
  } catch (error) {
    console.error(
      "Admin get blood request details error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error while fetching blood request details",
    });
  }
};
