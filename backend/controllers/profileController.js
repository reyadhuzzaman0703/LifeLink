
import DonationConfirmation from "../models/DonationConfirmation.js";
import BloodRequest from "../models/BloodRequest.js";
import User from "../models/User.js";

export const getDonationHistory = async (req, res) => {
  try {
    const donations = await DonationConfirmation.find({
      donor: req.user._id,
      status: "confirmed",
    })
      .populate("requester", "name bloodGroup")
      .populate(
        "bloodRequest",
        "bloodGroup hospital location units"
      )
      .sort({ confirmedAt: -1 });

    return res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    console.error("Get donation history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching donation history",
    });
  }
};

export const getRequestHistory = async (req, res) => {
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
    console.error("Get request history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching request history",
    });
  }
};

export const updateMyLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid latitude and longitude",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        locationPoint: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("location locationPoint");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Your location has been saved",
      locationPoint: user.locationPoint,
    });
  } catch (error) {
    console.error("Update user location error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while saving your location",
    });
  }
};
