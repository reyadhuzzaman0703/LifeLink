import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import BloodRequest from "../models/BloodRequest.js";
import DonorNotification from "../models/DonorNotification.js";
import DonationConfirmation from "../models/DonationConfirmation.js";


export const startChat = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { notificationId } = req.params;
    let result;
    let statusCode = 201;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    await session.withTransaction(async () => {
      const notification = await DonorNotification.findOne({
        _id: notificationId,
        donor: req.user._id,
      }).session(session);

      if (!notification) {
        throw Object.assign(new Error("Notification not found"), {
          statusCode: 404,
        });
      }

      if (notification.status === "chat_started") {
        const existingChat = await Chat.findOne({
          donorNotification: notification._id,
        }).session(session);

        if (existingChat) {
          result = existingChat;
          statusCode = 200;
          return;
        }

        throw Object.assign(
          new Error("Chat state is inconsistent. Please contact support."),
          { statusCode: 409 }
        );
      }

      if (notification.status !== "notified") {
        throw Object.assign(
          new Error("This notification cannot start a chat"),
          { statusCode: 400 }
        );
      }

      const bloodRequest = await BloodRequest.findOne({
        _id: notification.bloodRequest,
        status: "active",
        neededAt: { $gt: new Date() },
        $expr: {
          $lt: ["$confirmedUnits", "$units"],
        },
      }).session(session);

      if (!bloodRequest) {
        throw Object.assign(
          new Error("This blood request is no longer active"),
          { statusCode: 400 }
        );
      }

      const [chat] = await Chat.create(
        [
          {
            donorNotification: notification._id,
            bloodRequest: notification.bloodRequest,
            participants: [
              notification.donor,
              notification.requester,
            ],
          },
        ],
        { session }
      );

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
          {
            new: true,
            session,
          }
        );

      if (!updatedNotification) {
        throw Object.assign(
          new Error("Notification has already been processed"),
          { statusCode: 409 }
        );
      }

      await DonationConfirmation.create(
        [
          {
            donorNotification: notification._id,
            chat: chat._id,
            bloodRequest: notification.bloodRequest,
            donor: notification.donor,
            requester: notification.requester,
            deadline: new Date(Date.now() + 30 * 60 * 1000),
          },
        ],
        { session }
      );

      result = chat;
    });

    const populatedChat = await Chat.findById(result._id)
      .populate("participants", "name bloodGroup")
      .populate("bloodRequest", "bloodGroup units hospital location");

    return res.status(statusCode).json({
      success: true,
      message:
        statusCode === 200
          ? "Chat already exists"
          : "Chat started successfully",
      chat: populatedChat,
    });
  } catch (error) {
    console.error("Start chat error:", error.message);

    if (error.code === 11000) {
      const existingChat = await Chat.findOne({
        donorNotification: req.params.notificationId,
      }).populate("participants", "name bloodGroup");

      if (existingChat) {
        return res.status(200).json({
          success: true,
          message: "Chat already exists",
          chat: existingChat,
        });
      }
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode
          ? error.message
          : "Server error while starting chat",
    });
  } finally {
    await session.endSession();
  }
};

// Get messages of a chat
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat ID",
      });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name bloodGroup")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Get chat messages error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching messages",
    });
  }
};

// Send a message

export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat ID",
      });
    }

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    if (content.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 2000 characters",
      });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (chat.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This chat is no longer active",
      });
    }

    const message = await Message.create({
      chat: chat._id,
      sender: req.user._id,
      content: content.trim(),
    });

    chat.lastMessageAt = message.createdAt;
    await chat.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name bloodGroup");

    // Send real-time message to everyone in this chat room
    const io = req.app.get("io");

    io.to(`chat:${chatId}`).emit("message:new", {
      success: true,
      message: populatedMessage,
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Send message error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while sending message",
    });
  }
};

