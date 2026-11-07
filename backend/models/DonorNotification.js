
import mongoose from "mongoose";

const donorNotificationSchema = new mongoose.Schema(
  {
    bloodRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodRequest",
      required: true,
    },

    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "notified",
        "chat_started",
        "awaiting_confirmation",
        "confirmed",
        "declined",
        "expired",
      ],
      default: "notified",
    },

    notifiedAt: {
      type: Date,
      default: Date.now,
    },

    chatStartedAt: {
      type: Date,
      default: null,
    },

    chatEndedAt: {
      type: Date,
      default: null,
    },

    // Donor er confirmation track 
    donorConfirmation: {
      type: String,
      enum: ["pending", "yes", "no"],
      default: "pending",
    },

    donorConfirmedAt: {
      type: Date,
      default: null,
    },

    // Requester er confirmation track
    requesterConfirmation: {
      type: String,
      enum: ["pending", "yes", "no"],
      default: "pending",
    },

    requesterConfirmedAt: {
      type: Date,
      default: null,
    },

    confirmationDeadline: {
      type: Date,
      default: null,
    },

    confirmedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Ek request-e ek donor-ke duplicate notification off
donorNotificationSchema.index(
  { bloodRequest: 1, donor: 1 },
  { unique: true }
);

// Scheduler er jonno active notification 
donorNotificationSchema.index({
  bloodRequest: 1,
  status: 1,
  notifiedAt: 1,
});

const DonorNotification = mongoose.model(
  "DonorNotification",
  donorNotificationSchema
);

export default DonorNotification;
