
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    donorNotification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DonorNotification",
      required: true,
      unique: true,
    },

    bloodRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodRequest",
      required: true,
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    status: {
      type: String,
      enum: ["active", "ended", "closed"],
      default: "active",
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    endedAt: {
      type: Date,
      default: null,
    },

    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

chatSchema.index({ participants: 1, status: 1 });

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
