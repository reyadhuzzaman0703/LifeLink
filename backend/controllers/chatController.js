
import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import BloodRequest from "../models/BloodRequest.js";
import DonorNotification from "../models/DonorNotification.js";

export const startChat = async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    // Only the notified donor can start the chat
    const notification = await DonorNotification.findOne({
      _id: notificationId,
      donor: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Return existing chat if already started
    if (notification.status === "chat_started") {
      const existingChat = await Chat.findOne({
        donorNotification: notification._id,
      }).populate("participants", "name bloodGroup");

      if (existingChat) {
        return res.status(200).json({
          success: true,
          message: "Chat already exists",
          chat: existingChat,
        });
      }

      return res.status(409).json({
        success: false,
        message: "Chat state is inconsistent. Please contact support.",
      });
    }

    if (notification.status !== "notified") {
      return res.status(400).json({
        success: false,
        message: "This notification cannot start a chat",
      });
    }

    const bloodRequest = await BloodRequest.findOne({
      _id: notification.bloodRequest,
      status: "active",
      neededAt: { $gt: new Date() },
      $expr: {
        $lt: ["$confirmedUnits", "$units"],
      },
    });

    if (!bloodRequest) {
      return res.status(400).json({
        success: false,
        message: "This blood request is no longer active",
      });
    }

    // Create chat with both participants
    const chat = await Chat.create({
      donorNotification: notification._id,
      bloodRequest: notification.bloodRequest,
      participants: [
        notification.donor,
        notification.requester,
      ],
    });

    // Update notification status atomically
    const updatedNotification =
      await DonorNotification.findOneAndUpdate(
        {
          _id: notification._id,
          donor: req.user._id,
          status: "notified",
        },
        {
          $set: {
            status: "chat_started",
            chatStartedAt: new Date(),
          },
        },
        { new: true }
      );

    if (!updatedNotification) {
      await Chat.deleteOne({ _id: chat._id });

      return res.status(409).json({
        success: false,
        message: "Notification has already been processed",
      });
    }

    const populatedChat = await Chat.findById(chat._id)
      .populate("participants", "name bloodGroup")
      .populate("bloodRequest", "bloodGroup units hospital location");

    return res.status(201).json({
      success: true,
      message: "Chat started successfully",
      chat: populatedChat,
    });
  } catch (error) {
    if (error.code === 11000) {
      const existingChat = await Chat.findOne({
        donorNotification: req.params.notificationId,
      });

      if (existingChat) {
        return res.status(409).json({
          success: false,
          message: "Chat has already been created",
        });
      }
    }

    console.error("Start chat error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while starting chat",
    });
  }
};
