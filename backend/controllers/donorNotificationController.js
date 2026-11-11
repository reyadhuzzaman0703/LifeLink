
import DonorNotification from "../models/DonorNotification.js";

export const getMyDonorNotifications = async (req, res) => {
  try {
    const notifications = await DonorNotification.find({
      $or: [
        { donor: req.user._id },
        { requester: req.user._id },
      ],
    })
      .populate("bloodRequest", "bloodGroup units confirmedUnits hospital location neededAt urgency status")
      .populate("donor", "name bloodGroup")
      .populate("requester", "name bloodGroup")
      .sort({ notifiedAt: -1 });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get donor notifications error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching notifications",
    });
  }
};

export const getDonorNotificationDetails = async (req, res) => {
  try {
    const notification = await DonorNotification.findOne({
      _id: req.params.id,
      $or: [
        { donor: req.user._id },
        { requester: req.user._id },
      ],
    })
      .populate("bloodRequest", "bloodGroup units confirmedUnits hospital location neededAt urgency status")
      .populate("donor", "name bloodGroup")
      .populate("requester", "name bloodGroup");

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    console.error("Get notification details error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching notification details",
    });
  }
};
