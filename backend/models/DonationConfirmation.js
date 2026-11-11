
import mongoose from "mongoose";

const donationConfirmationSchema = new mongoose.Schema(
  {
    donorNotification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DonorNotification",
      required: true,
      unique: true,
    },

    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },

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

    donorConfirmation: {
      type: String,
      enum: ["pending", "yes", "no"],
      default: "pending",
    },

    requesterConfirmation: {
      type: String,
      enum: ["pending", "yes", "no"],
      default: "pending",
    },

    donorConfirmedAt: {
      type: Date,
      default: null,
    },

    requesterConfirmedAt: {
      type: Date,
      default: null,
    },

    deadline: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "declined", "expired"],
      default: "pending",
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

donationConfirmationSchema.index({
  status: 1,
  deadline: 1,
});

const DonationConfirmation = mongoose.model(
  "DonationConfirmation",
  donationConfirmationSchema
);

export default DonationConfirmation;
