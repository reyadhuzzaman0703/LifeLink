
import User from "../models/User.js";

export const registerFCMToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (typeof token !== "string" || !token.trim()) {
      return res.status(400).json({
        success: false,
        message: "Valid FCM token is required",
      });
    }

    const result = await User.updateOne(
      { _id: req.user._id },
      {
        $addToSet: {
          fcmTokens: token.trim(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "FCM token registered successfully",
    });
  } catch (error) {
    console.error("FCM token registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while registering FCM token",
    });
  }
};

export const removeFCMToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (typeof token !== "string" || !token.trim()) {
      return res.status(400).json({
        success: false,
        message: "Valid FCM token is required",
      });
    }

    const result = await User.updateOne(
      { _id: req.user._id },
      {
        $pull: {
          fcmTokens: token.trim(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "FCM token removed successfully",
    });
  } catch (error) {
    console.error("FCM token removal error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while removing FCM token",
    });
  }
};
